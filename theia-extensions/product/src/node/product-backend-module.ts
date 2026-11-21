/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ContainerModule } from '@theia/core/shared/inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core/lib/common/messaging';
import {
    CocratesSkillsPathService,
    CocratesSkillsPathServicePath,
} from '../common/cocrates-skills-path-service.js';
import { CocratesSkillsPathServiceImpl } from './cocrates-skills-path-service-impl.js';

export default new ContainerModule(bind => {
    bind(CocratesSkillsPathServiceImpl).toSelf().inSingletonScope();
    bind(CocratesSkillsPathService).toService(CocratesSkillsPathServiceImpl);
    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler(CocratesSkillsPathServicePath, () =>
            context.container.get<CocratesSkillsPathService>(CocratesSkillsPathService)
        )
    ).inSingletonScope();
});
