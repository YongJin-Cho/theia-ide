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
import { LanguageModelMessage, LanguageModelResponse } from '@theia/ai-core/lib/common/language-model.js';
import { getTextOfResponse } from '@theia/ai-core/lib/common/language-model-util.js';
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
        const text = await getTextOfResponse(response);
        const structured = parseCocratesStructuredResponse(text);
        if (structured) {
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
            return;
        }

        await super.addContentsToResponse(response, request);
    }
}

