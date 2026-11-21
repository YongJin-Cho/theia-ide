/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import '../../src/browser/style/index.css';

import { AIRegistryConfiguration } from '@theia/ai-registry/lib/common/ai-registry-configuration';
import { GetSkillFileContent } from '@theia/ai-ide/lib/browser/skill-file-functions.js';
import { SkillDirectoryContribution } from '@theia/ai-core/lib/browser/skill-service.js';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser/messaging/ws-connection-provider';
import { ChatAgent } from '@theia/ai-chat/lib/common/chat-agents.js';
import { Agent } from '@theia/ai-core/lib/common/agent.js';
import { PreferenceContribution } from '@theia/core/lib/common';
import { WidgetFactory } from '@theia/core/lib/browser';
import { AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { applyBranding } from './theia-ide-config.js';
import { CommandContribution } from '@theia/core/lib/common/command';
import { ContainerModule } from '@theia/core/shared/inversify';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { MenuContribution } from '@theia/core/lib/common/menu';
import { TheiaIDEAboutDialog } from './theia-ide-about-dialog.js';
import { TheiaIDEAIRegistryConfiguration } from './theia-ide-ai-registry-configuration.js';
import { TheiaIDEContribution } from './theia-ide-contribution.js';
import { TheiaIDEGettingStartedWidget } from './theia-ide-getting-started-widget.js';
import { CocratesChatAgent } from './cocrates-chat-agent.js';
import { CocratesSkillDirectoryContribution } from './cocrates-skill-directory-contribution.js';
import { ExtendedGetSkillFileContent } from './extended-get-skill-file-content.js';
import {
    CocratesSkillsPathService,
    CocratesSkillsPathServicePath,
} from '../common/cocrates-skills-path-service.js';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    applyBranding();

    if (isBound(GetSkillFileContent)) {
        rebind(GetSkillFileContent).to(ExtendedGetSkillFileContent as unknown as typeof GetSkillFileContent).inSingletonScope();
    }

    bind(CocratesSkillsPathService).toDynamicValue(context =>
        WebSocketConnectionProvider.createProxy<CocratesSkillsPathService>(
            context.container,
            CocratesSkillsPathServicePath,
        )
    ).inSingletonScope();
    bind(CocratesSkillDirectoryContribution).toSelf().inSingletonScope();
    bind(SkillDirectoryContribution).toService(CocratesSkillDirectoryContribution);

    bind(CocratesChatAgent).toSelf().inSingletonScope();
    bind(Agent).toService(CocratesChatAgent);
    bind(ChatAgent).toService(CocratesChatAgent);
    bind(PreferenceContribution).toConstantValue({
        schema: {
            properties: {
                'ai-features.chat.defaultChatAgent': {
                    type: 'string',
                    default: 'Cocrates',
                    description: 'Default chat agent for Cocrates products.',
                },
            },
        },
    });

    bind(TheiaIDEGettingStartedWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: GettingStartedWidget.ID,
        createWidget: () => context.container.get<TheiaIDEGettingStartedWidget>(TheiaIDEGettingStartedWidget),
    })).inSingletonScope();
    if (isBound(AboutDialog)) {
        rebind(AboutDialog).to(TheiaIDEAboutDialog).inSingletonScope();
    } else {
        bind(AboutDialog).to(TheiaIDEAboutDialog).inSingletonScope();
    }

    bind(TheiaIDEContribution).toSelf().inSingletonScope();
    [CommandContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(TheiaIDEContribution)
    );

    if (isBound(AIRegistryConfiguration)) {
        rebind(AIRegistryConfiguration).to(TheiaIDEAIRegistryConfiguration).inSingletonScope();
    } else {
        bind(AIRegistryConfiguration).to(TheiaIDEAIRegistryConfiguration).inSingletonScope();
    }
});
