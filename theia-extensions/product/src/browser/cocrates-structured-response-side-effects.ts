/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ChatService } from '@theia/ai-chat/lib/common/chat-service.js';
import { MutableChatRequestModel } from '@theia/ai-chat/lib/common/chat-model.js';
import { CommandService } from '@theia/core/lib/common/command';
import { ILogger } from '@theia/core';
import { ScmService } from '@theia/scm/lib/browser/scm-service.js';
import { CocratesStructuredResponse } from './cocrates-structured-response.js';

const MAX_SESSION_TITLE_LENGTH = 120;
const MAX_COMMIT_MESSAGE_LENGTH = 2000;

export interface CocratesSideEffectResult {
    readonly errors: readonly string[];
}

export class CocratesStructuredResponseSideEffects {
    protected static readonly processedCommits = new Set<string>();
    constructor(
        protected readonly chatService: ChatService,
        protected readonly scmService: ScmService,
        protected readonly commandService: CommandService,
        protected readonly logger: ILogger,
    ) { }

    async apply(
        response: CocratesStructuredResponse,
        request: MutableChatRequestModel,
    ): Promise<CocratesSideEffectResult> {
        const errors: string[] = [];

        if (response.session !== undefined) {
            const sessionError = await this.renameSession(response.session, request);
            if (sessionError) {
                errors.push(sessionError);
            }
        }

        if (response.commit !== undefined) {
            const commitError = await this.commit(response.commit, request);
            if (commitError) {
                errors.push(commitError);
            }
        }

        return { errors };
    }

    protected async renameSession(title: string, request: MutableChatRequestModel): Promise<string | undefined> {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) {
            return 'Session title was rejected because it is empty.';
        }
        if (normalizedTitle.length > MAX_SESSION_TITLE_LENGTH) {
            return `Session title was rejected because it exceeds ${MAX_SESSION_TITLE_LENGTH} characters.`;
        }

        try {
            await this.chatService.renameSession(request.session.id, normalizedTitle);
            return undefined;
        } catch (error) {
            this.logger.error('Cocrates session rename failed', error);
            return 'Session title could not be updated.';
        }
    }

    protected async commit(message: string, request: MutableChatRequestModel): Promise<string | undefined> {
        const normalizedMessage = message.trim();
        if (!normalizedMessage) {
            return 'Commit was rejected because the commit message is empty.';
        }
        if (normalizedMessage.length > MAX_COMMIT_MESSAGE_LENGTH) {
            return `Commit was rejected because the commit message exceeds ${MAX_COMMIT_MESSAGE_LENGTH} characters.`;
        }

        const commitKey = `${request.id}:${normalizedMessage}`;
        if (CocratesStructuredResponseSideEffects.processedCommits.has(commitKey)) {
            return 'Commit was skipped because this response was already processed.';
        }

        const repository = this.scmService.selectedRepository;
        if (!repository) {
            return 'Commit was rejected because no SCM repository is selected.';
        }

        const command = repository.provider.acceptInputCommand;
        if (!command?.command) {
            return 'Commit was rejected because the selected SCM provider does not expose a commit command.';
        }

        const hasChanges = repository.provider.groups.some(group => group.resources.length > 0);
        if (!hasChanges) {
            return 'Commit was rejected because the selected repository has no pending changes.';
        }

        CocratesStructuredResponseSideEffects.processedCommits.add(commitKey);
        repository.input.value = normalizedMessage;

        try {
            await this.commandService.executeCommand(command.command, ...(command.arguments ?? []));
            return undefined;
        } catch (error) {
            this.logger.error('Cocrates commit failed', error);
            return 'Commit failed in the selected SCM provider.';
        }
    }
}
