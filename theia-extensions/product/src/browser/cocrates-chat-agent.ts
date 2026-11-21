/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { AbstractStreamParsingChatAgent, ChatAgentLocation } from '@theia/ai-chat/lib/common/chat-agents.js';
import { LanguageModelResponse } from '@theia/ai-core/lib/common/language-model.js';
import { getTextOfResponse } from '@theia/ai-core/lib/common/language-model-util.js';
import { MarkdownChatResponseContentImpl, MutableChatRequestModel } from '@theia/ai-chat/lib/common/chat-model.js';
import { LanguageModelRequirement } from '@theia/ai-core/lib/common';
import { ILogger } from '@theia/core';
import { inject, injectable, named } from '@theia/core/shared/inversify';
import { COCRATES_SYSTEM_PROMPT_ID, cocratesSystemPrompt } from './cocrates-chat-agent-prompt.js';
import { parseCocratesStructuredResponse } from './cocrates-structured-response.js';

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

    protected override async addContentsToResponse(response: LanguageModelResponse, request: MutableChatRequestModel): Promise<void> {
        const text = await getTextOfResponse(response);
        const structured = parseCocratesStructuredResponse(text);
        if (structured) {
            request.response.response.addContent(new MarkdownChatResponseContentImpl(structured.answer));
            return;
        }

        await super.addContentsToResponse(response, request);
    }
}

