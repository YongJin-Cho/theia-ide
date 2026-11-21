/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { LanguageModelMessage, TextMessage } from '@theia/ai-core';
import { ChatResponseContent } from '@theia/ai-chat/lib/common/chat-model.js';

export const COCRATES_COMPACTION_CONTENT_KIND = 'cocratesCompaction';

export interface CocratesCompactionContentData {
    readonly compaction: string;
    readonly answer: string;
}

export class CocratesCompactionChatResponseContentImpl implements ChatResponseContent {
    readonly kind = COCRATES_COMPACTION_CONTENT_KIND;

    constructor(
        readonly compaction: string,
        readonly answer: string,
    ) { }

    asString(): string | undefined {
        return undefined;
    }

    asDisplayString(): string | undefined {
        return undefined;
    }

    toLanguageModelMessage(): LanguageModelMessage[] {
        const compactionMessage: TextMessage = {
            actor: 'user',
            type: 'text',
            text: `<compaction>${this.compaction}</compaction>`,
        };
        const answerMessage: TextMessage = {
            actor: 'ai',
            type: 'text',
            text: `<last-response>${this.answer}</last-response>`,
        };
        return [compactionMessage, answerMessage];
    }

    toSerializable(): { kind: string; data: CocratesCompactionContentData } {
        return {
            kind: this.kind,
            data: {
                compaction: this.compaction,
                answer: this.answer,
            },
        };
    }
}

export function isCocratesCompactionContent(content: ChatResponseContent): content is CocratesCompactionChatResponseContentImpl {
    return content.kind === COCRATES_COMPACTION_CONTENT_KIND
        && content instanceof CocratesCompactionChatResponseContentImpl;
}
