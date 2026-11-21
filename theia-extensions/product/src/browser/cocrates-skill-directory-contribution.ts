/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { SkillDirectoryContribution } from '@theia/ai-core/lib/browser/skill-service.js';
import { SkillDirectoryEntry } from '@theia/ai-core/lib/common/skill.js';
import { ILogger } from '@theia/core';
import { inject, injectable, named } from '@theia/core/shared/inversify';
import { CocratesSkillsPathService } from '../common/cocrates-skills-path-service.js';

@injectable()
export class CocratesSkillDirectoryContribution implements SkillDirectoryContribution {
    @inject(CocratesSkillsPathService)
    protected readonly skillsPathService: CocratesSkillsPathService;

    @inject(ILogger)
    @named('theia-ide:CocratesSkillDirectoryContribution')
    protected readonly logger: ILogger;

    async getSkillDirectories(): Promise<SkillDirectoryEntry[]> {
        try {
            const path = await this.skillsPathService.getBundledSkillsPath();
            return path ? [{ path, tier: 'plugin', qualifier: 'cocrates' }] : [];
        } catch (error) {
            this.logger.warn(`Unable to resolve bundled Cocrates Skills path: ${String(error)}`);
            return [];
        }
    }
}
