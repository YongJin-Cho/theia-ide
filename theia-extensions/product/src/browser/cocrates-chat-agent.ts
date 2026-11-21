/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { AbstractStreamParsingChatAgent, ChatAgentLocation } from '@theia/ai-chat/lib/common/chat-agents.js';
import { ChatService } from '@theia/ai-chat/lib/common/chat-service.js';
import {
    isLanguageModelStreamResponse,
    isLanguageModelStreamResponsePart,
    isTextResponsePart,
    isUsageResponsePart,
    LanguageModelMessage,
    LanguageModelResponse,
} from '@theia/ai-core/lib/common/language-model.js';
import {
    ChatModel,
    ChatRequestModel,
    ChatResponseContent,
    ErrorChatResponseContent,
    InformationalChatResponseContent,
    MarkdownChatResponseContentImpl,
    MutableChatRequestModel,
    ThinkingChatResponseContent,
} from '@theia/ai-chat/lib/common/chat-model.js';
import { ImageContextVariable } from '@theia/ai-chat/lib/common/image-context-variable.js';
import { LanguageModelRequirement } from '@theia/ai-core/lib/common';
import { CommandService } from '@theia/core/lib/common/command';
import { ILogger } from '@theia/core';
import { StorageService } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service.js';
import { ScmService } from '@theia/scm/lib/browser/scm-service.js';
import { inject, injectable, named } from '@theia/core/shared/inversify';
import { COCRATES_SYSTEM_PROMPT_ID, cocratesSystemPrompt } from './cocrates-chat-agent-prompt.js';
import { parseCocratesStructuredResponse } from './cocrates-structured-response.js';
import { CocratesStructuredResponseSideEffects } from './cocrates-structured-response-side-effects.js';
import {
    CocratesCompactionChatResponseContentImpl,
    isCocratesCompactionContent,
} from './cocrates-compaction-content.js';

export const CocratesChatAgentId = 'Cocrates';

@injectable()
export class CocratesChatAgent extends AbstractStreamParsingChatAgent {
    readonly id = CocratesChatAgentId;
    readonly name = CocratesChatAgentId;
    readonly languageModelRequirements: LanguageModelRequirement[] = [{
        purpose: 'chat',
        identifier: 'default/universal',
    }];
    protected readonly defaultLanguageModelPurpose = 'chat';
    readonly description = 'Cocrates is the default product assistant for examining and changing the workspace with the user.';
    readonly locations = ChatAgentLocation.ALL;
    readonly prompts = [{
        id: COCRATES_SYSTEM_PROMPT_ID,
        defaultVariant: cocratesSystemPrompt,
        variants: [],
    }];
    readonly variables = ['contextFiles', 'productName', 'skills'];
    readonly functions = ['getSkillFileContent'];
    protected readonly systemPromptId = COCRATES_SYSTEM_PROMPT_ID;
    readonly iconClass = 'codicon codicon-sparkle';

    @inject(ILogger)
    @named('theia-ide:CocratesChatAgent')
    protected readonly logger: ILogger;

    @inject(ChatService)
    protected readonly chatService: ChatService;

    @inject(ScmService)
    protected readonly scmService: ScmService;

    @inject(CommandService)
    protected readonly commandService: CommandService;

    @inject(StorageService)
    protected readonly storageService: StorageService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    protected override async getMessages(
        model: ChatModel,
        includeResponseInProgress = false,
    ): Promise<LanguageModelMessage[]> {
        const requests = model.getRequests();
        let compactionIndex = -1;
        let compaction: CocratesCompactionChatResponseContentImpl | undefined;
        for (let i = 0; i < requests.length; i++) {
            const found = requests[i].response.response.content.find(isCocratesCompactionContent);
            if (found) {
                compactionIndex = i;
                compaction = found;
            }
        }
        if (!compaction) {
            // No product compaction yet: keep the full accumulated transcript.
            return super.getMessages(model, includeResponseInProgress);
        }

        // Prefix replaces all turns up to and including the compacting turn.
        // Later turns (without a newer compaction) stay verbatim and keep accumulating.
        const messages: LanguageModelMessage[] = [...compaction.toLanguageModelMessage()];
        for (const request of requests.slice(compactionIndex + 1)) {
            messages.push(...this.serializeRequestMessages(request, includeResponseInProgress));
        }
        return messages;
    }

    /**
     * Serializes one chat request the same way {@link AbstractChatAgent.getMessages} does,
     * so post-compaction turns keep tool calls, images, and answers in order.
     */
    protected serializeRequestMessages(
        request: ChatRequestModel,
        includeResponseInProgress: boolean,
    ): LanguageModelMessage[] {
        const messages: LanguageModelMessage[] = [];
        const text = request.message.parts.map(part => part.promptText).join('');
        if (text.length > 0) {
            messages.push({
                actor: 'user',
                type: 'text',
                text,
            });
        }

        const imageMessages = request.context.variables
            .filter(variable => ImageContextVariable.isResolvedImageContext(variable))
            .map(variable => ImageContextVariable.parseResolved(variable))
            .filter((content): content is NonNullable<typeof content> => content !== undefined)
            .map(content => ({
                actor: 'user' as const,
                type: 'image' as const,
                image: {
                    base64data: content.data,
                    mimeType: content.mimeType,
                },
            }));
        messages.push(...imageMessages);

        const contextImageData = new Set(imageMessages.map(msg => msg.image.base64data));
        const inlineImageMessages = ImageContextVariable.extractInlineImages(request.message.parts)
            .filter(content => !contextImageData.has(content.data))
            .map(content => ({
                actor: 'user' as const,
                type: 'image' as const,
                image: {
                    base64data: content.data,
                    mimeType: content.mimeType,
                },
            }));
        messages.push(...inlineImageMessages);

        if (request.response.isComplete || includeResponseInProgress) {
            const responseMessages = request.response.response.content
                .filter(c => {
                    if (ErrorChatResponseContent.is(c) || InformationalChatResponseContent.is(c)) {
                        return false;
                    }
                    if (ThinkingChatResponseContent.is(c) && !c.signature) {
                        return false;
                    }
                    // Product compaction is only used as the history prefix, never replayed
                    // from a later turn's content list.
                    if (isCocratesCompactionContent(c)) {
                        return false;
                    }
                    if (ChatResponseContent.hasToLanguageModelMessage(c)) {
                        return true;
                    }
                    if (ChatResponseContent.hasAsString(c) && c.asString() === undefined) {
                        return false;
                    }
                    return true;
                })
                .flatMap(c => {
                    if (ChatResponseContent.hasToLanguageModelMessage(c)) {
                        return c.toLanguageModelMessage();
                    }
                    return {
                        actor: 'ai' as const,
                        type: 'text' as const,
                        text: c.asString?.() || c.asDisplayString?.() || '',
                    };
                });
            messages.push(...responseMessages);
        }
        return messages;
    }

    protected override async addContentsToResponse(response: LanguageModelResponse, request: MutableChatRequestModel): Promise<void> {
        if (isLanguageModelStreamResponse(response)) {
            await this.addStreamResponsePreservingToolCalls(response, request);
            return;
        }

        const text = 'text' in response && typeof response.text === 'string'
            ? response.text
            : 'content' in response && typeof response.content === 'string'
                ? response.content
                : undefined;
        if (text !== undefined && await this.addStructuredResponse(text, request)) {
            return;
        }

        await super.addContentsToResponse(response, request);
    }

    protected async addStreamResponsePreservingToolCalls(
        response: Extract<LanguageModelResponse, { stream: AsyncIterable<unknown> }>,
        request: MutableChatRequestModel,
    ): Promise<void> {
        // Only the trailing text segment after the last content-bearing non-text token is a
        // candidate for structured-response parsing. Intermediate tool-call content is kept
        // as normal ChatAgent content. Usage tokens must not clear the text buffer — providers
        // often emit them after the final JSON and would otherwise skip structured handling.
        let completeTextBuffer = '';
        let startIndex = request.response.response.content.length;

        for await (const token of response.stream) {
            if (!isLanguageModelStreamResponsePart(token)) {
                this.logger.debug(`Unknown token: '${JSON.stringify(token)}'. Skipping`);
                continue;
            }

            if (isTextResponsePart(token)) {
                completeTextBuffer += token.content;
                const parsedContents = this.parseContents(completeTextBuffer, request);
                const contentBeforeMarker = startIndex > 0
                    ? request.response.response.content.slice(0, startIndex)
                    : [];
                request.response.response.clearContent();
                request.response.response.addContents(contentBeforeMarker);
                request.response.response.addContents(parsedContents);
                continue;
            }

            if (isUsageResponsePart(token)) {
                this.parse(token, request);
                continue;
            }

            const parsedContent = this.parse(token, request);
            if (Array.isArray(parsedContent)) {
                if (parsedContent.length === 0) {
                    continue;
                }
                request.response.response.addContents(parsedContent);
            } else {
                request.response.response.addContent(parsedContent);
            }
            startIndex = request.response.response.content.length;
            completeTextBuffer = '';
        }

        if (!completeTextBuffer) {
            return;
        }

        const contentBeforeMarker = startIndex > 0
            ? request.response.response.content.slice(0, startIndex)
            : [];
        request.response.response.clearContent();
        request.response.response.addContents(contentBeforeMarker);
        if (await this.addStructuredResponse(completeTextBuffer, request)) {
            return;
        }
        request.response.response.addContents(this.parseContents(completeTextBuffer, request));
    }

    protected async addStructuredResponse(text: string, request: MutableChatRequestModel): Promise<boolean> {
        const structured = parseCocratesStructuredResponse(text);
        if (!structured) {
            return false;
        }

        const sideEffects = new CocratesStructuredResponseSideEffects(
            this.chatService,
            this.scmService,
            this.commandService,
            this.storageService,
            this.workspaceService,
            this.logger,
        );
        const result = await sideEffects.apply(structured, request);
        const answer = result.errors.length > 0
            ? `${structured.answer}\n\n${result.errors.map(error => `> ${error}`).join('\n')}`
            : structured.answer;
        request.response.response.addContent(new MarkdownChatResponseContentImpl(answer));
        if (structured.compaction !== undefined) {
            request.response.response.addContent(new CocratesCompactionChatResponseContentImpl(
                structured.compaction,
                structured.answer,
            ));
        }
        return true;
    }
}

