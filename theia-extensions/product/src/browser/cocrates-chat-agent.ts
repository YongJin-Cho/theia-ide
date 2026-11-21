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
    LanguageModelMessage,
    LanguageModelResponse,
} from '@theia/ai-core/lib/common/language-model.js';
import { ChatModel, MarkdownChatResponseContentImpl, MutableChatRequestModel } from '@theia/ai-chat/lib/common/chat-model.js';
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

    protected override async getMessages(model: ChatModel): Promise<LanguageModelMessage[]> {
        const compaction = model.getRequests()
            .flatMap(request => request.response.response.content)
            .filter(isCocratesCompactionContent)
            .slice(-1)[0];
        if (!compaction) {
            return super.getMessages(model);
        }

        const requests = model.getRequests();
        const currentRequest = requests[requests.length - 1];
        const currentInput = currentRequest?.message.parts.map(part => part.promptText).join('') ?? '';
        const messages: LanguageModelMessage[] = compaction.toLanguageModelMessage();
        if (currentInput) {
            messages.push({ actor: 'user', type: 'text', text: currentInput });
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
        let text = '';
        let completeTextBuffer = '';
        let startIndex = request.response.response.content.length;
        let hasNonTextContent = false;

        for await (const token of response.stream) {
            if (!isLanguageModelStreamResponsePart(token)) {
                this.logger.debug(`Unknown token: '${JSON.stringify(token)}'. Skipping`);
                continue;
            }

            if (isTextResponsePart(token)) {
                text += token.content;
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

            hasNonTextContent = true;
            const parsedContent = this.parse(token, request);
            if (Array.isArray(parsedContent)) {
                request.response.response.addContents(parsedContent);
            } else {
                request.response.response.addContent(parsedContent);
            }
            startIndex = request.response.response.content.length;
            completeTextBuffer = '';
        }

        // A response containing tool calls must retain the normal ChatAgent content. Only
        // replace a pure text stream with the product's structured-response presentation.
        if (!hasNonTextContent) {
            const contentBeforeMarker = startIndex > 0
                ? request.response.response.content.slice(0, startIndex)
                : [];
            request.response.response.clearContent();
            request.response.response.addContents(contentBeforeMarker);
            if (await this.addStructuredResponse(text, request)) {
                return;
            }
            request.response.response.addContents(this.parseContents(text, request));
        }
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

