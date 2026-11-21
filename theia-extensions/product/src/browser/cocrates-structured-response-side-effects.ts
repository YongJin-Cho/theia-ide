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
import { StorageService } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service.js';
import { ScmService } from '@theia/scm/lib/browser/scm-service.js';
import { CocratesStructuredResponse } from './cocrates-structured-response.js';

const MAX_SESSION_TITLE_LENGTH = 120;
const MAX_COMMIT_MESSAGE_LENGTH = 2000;
const COMMIT_STATE_STORAGE_KEY = 'cocrates.structured-response.commit-states';

type CommitState = 'in-flight' | 'succeeded' | 'failed';

interface PersistedCommitState {
    readonly repositoryRoot: string;
    readonly message: string;
    readonly state: CommitState;
    readonly updatedAt: number;
}

type PersistedCommitStates = Record<string, PersistedCommitState>;

export interface CocratesSideEffectResult {
    readonly errors: readonly string[];
}

export class CocratesStructuredResponseSideEffects {
    protected static commitLock: Promise<void> = Promise.resolve();

    constructor(
        protected readonly chatService: ChatService,
        protected readonly scmService: ScmService,
        protected readonly commandService: CommandService,
        protected readonly storageService: StorageService,
        protected readonly workspaceService: WorkspaceService,
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
        return this.withCommitLock(async () => {
            const normalizedMessage = message.trim();
            if (!normalizedMessage) {
                return 'Commit was rejected because the commit message is empty.';
            }
            if (normalizedMessage.length > MAX_COMMIT_MESSAGE_LENGTH) {
                return `Commit was rejected because the commit message exceeds ${MAX_COMMIT_MESSAGE_LENGTH} characters.`;
            }

            const repository = this.scmService.selectedRepository;
            if (!repository) {
                return 'Commit was rejected because no SCM repository is selected.';
            }

            const repositoryRoot = repository.provider.rootUri;
            if (!repositoryRoot || !this.isRepositoryInWorkspace(repositoryRoot)) {
                return 'Commit was rejected because the selected repository is outside the current workspace.';
            }

            const command = repository.provider.acceptInputCommand;
            if (!command?.command) {
                return 'Commit was rejected because the selected SCM provider does not expose a commit command.';
            }

            const hasChanges = repository.provider.groups.some(group => group.resources.length > 0);
            if (!hasChanges) {
                return 'Commit was rejected because the selected repository has no commit-target changes.';
            }

            const commitKey = `${request.id}:${repositoryRoot}:${normalizedMessage}`;
            const states = await this.readCommitStates();
            const previousState = states[commitKey];
            if (previousState?.state === 'succeeded') {
                return 'Commit was skipped because this response was already processed.';
            }
            if (previousState?.state === 'in-flight') {
                states[commitKey] = { ...previousState, state: 'failed', updatedAt: Date.now() };
            }

            states[commitKey] = {
                repositoryRoot,
                message: normalizedMessage,
                state: 'in-flight',
                updatedAt: Date.now(),
            };
            await this.writeCommitStates(states);
            repository.input.value = normalizedMessage;

            try {
                await this.commandService.executeCommand(command.command, ...(command.arguments ?? []));
                states[commitKey] = {
                    repositoryRoot,
                    message: normalizedMessage,
                    state: 'succeeded',
                    updatedAt: Date.now(),
                };
                await this.writeCommitStates(states);
                return undefined;
            } catch (error) {
                this.logger.error('Cocrates commit failed', error);
                states[commitKey] = {
                    repositoryRoot,
                    message: normalizedMessage,
                    state: 'failed',
                    updatedAt: Date.now(),
                };
                await this.writeCommitStates(states);
                return 'Commit failed in the selected SCM provider.';
            }
        });
    }

    protected isRepositoryInWorkspace(repositoryRoot: string): boolean {
        const repositoryUri = new URI(repositoryRoot);
        return this.workspaceService.tryGetRoots().some(root => repositoryUri.isEqualOrParent(root.resource));
    }

    protected readCommitStates(): Promise<PersistedCommitStates> {
        return this.storageService.getData<PersistedCommitStates>(COMMIT_STATE_STORAGE_KEY, {});
    }

    protected async writeCommitStates(states: PersistedCommitStates): Promise<void> {
        await this.storageService.setData(COMMIT_STATE_STORAGE_KEY, states);
    }

    protected async withCommitLock<T>(operation: () => Promise<T>): Promise<T> {
        const previous = CocratesStructuredResponseSideEffects.commitLock;
        let release!: () => void;
        CocratesStructuredResponseSideEffects.commitLock = new Promise<void>(resolve => release = resolve);
        await previous;
        try {
            return await operation();
        } finally {
            release();
        }
    }
}
