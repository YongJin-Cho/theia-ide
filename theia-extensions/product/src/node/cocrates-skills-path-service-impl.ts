/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { injectable } from '@theia/core/shared/inversify';
import { CocratesSkillsPathService } from '../common/cocrates-skills-path-service.js';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { realpath } from 'node:fs/promises';

@injectable()
export class CocratesSkillsPathServiceImpl implements CocratesSkillsPathService {
    async getBundledSkillsPath(): Promise<string | undefined> {
        const configuredPath = process.env.COCRATES_BUNDLED_SKILLS_PATH;
        if (configuredPath) {
            return configuredPath;
        }

        const electronResourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
        if (electronResourcesPath) {
            return resolve(electronResourcesPath, 'app', 'skills');
        }

        return resolve(dirname(import.meta.dirname), '..', 'skills');
    }

    async isPathWithinRealPath(rootPath: string, targetPath: string): Promise<boolean> {
        try {
            const [realRootPath, realTargetPath] = await Promise.all([
                realpath(rootPath),
                realpath(targetPath),
            ]);
            const relativeTargetPath = relative(realRootPath, realTargetPath);
            return relativeTargetPath === ''
                || (!relativeTargetPath.startsWith('..')
                    && !isAbsolute(relativeTargetPath));
        } catch {
            return false;
        }
    }
}
