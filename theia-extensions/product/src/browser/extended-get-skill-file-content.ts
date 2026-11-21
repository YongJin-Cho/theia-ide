/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ToolProvider, ToolRequest } from '@theia/ai-core';
import { SkillService } from '@theia/ai-core/lib/browser/skill-service.js';
import { SKILL_FILE_NAME, parseSkillFile } from '@theia/ai-core/lib/common/skill.js';
import { Path, URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { FileService } from '@theia/filesystem/lib/browser/file-service.js';
import {
    GET_SKILL_FILE_CONTENT_FUNCTION_ID,
    LIST_SKILLS_FUNCTION_ID,
} from '@theia/ai-ide/lib/common/workspace-functions.js';

@injectable()
export class ExtendedGetSkillFileContent implements ToolProvider {
    static readonly ID = GET_SKILL_FILE_CONTENT_FUNCTION_ID;

    @inject(SkillService)
    protected readonly skillService: SkillService;

    @inject(FileService)
    protected readonly fileService: FileService;

    getTool(): ToolRequest {
        return {
            id: ExtendedGetSkillFileContent.ID,
            name: ExtendedGetSkillFileContent.ID,
            description: 'Returns the content of a file inside a skill directory. ' +
                `List skills with ${LIST_SKILLS_FUNCTION_ID}. ` +
                'Pass skillName without a leading slash. Optional path is relative to the skill root; ' +
                `omit it or pass ${SKILL_FILE_NAME} for the skill body, or pass a sibling file such as workflow/01-prd.md. ` +
                'A path may not escape the skill directory.',
            parameters: {
                type: 'object',
                properties: {
                    skillName: {
                        type: 'string',
                        description: 'The exact skill name or qualified name, without a leading slash',
                    },
                    path: {
                        type: 'string',
                        description: `Optional path relative to the skill root (default: ${SKILL_FILE_NAME})`,
                    },
                },
                required: ['skillName'],
            },
            handler: (argString: string) => this.handle(argString),
        };
    }

    protected async handle(argString: string): Promise<string> {
        let args: { skillName?: unknown; path?: unknown };
        try {
            args = argString ? JSON.parse(argString) : {};
        } catch (error) {
            return JSON.stringify({ error: `Invalid arguments: ${String(error)}` });
        }

        const skillName = typeof args.skillName === 'string' ? args.skillName : '';
        const skill = this.skillService.getSkill(skillName);
        if (!skill) {
            return JSON.stringify({ error: `Skill not found: ${skillName}` });
        }

        const requestedPath = typeof args.path === 'string' ? args.path : undefined;
        let relativePath: string;
        try {
            relativePath = this.normalizeSkillRelativePath(requestedPath);
        } catch (error) {
            return JSON.stringify({ error: String(error).replace(/^Error: /, '') });
        }

        const skillFileUri = URI.fromFilePath(skill.location);
        const skillRoot = skillFileUri.parent;
        const targetUri = relativePath === SKILL_FILE_NAME
            ? skillFileUri
            : skillRoot.resolve(relativePath);

        if (!skillRoot.isEqualOrParent(targetUri)) {
            return JSON.stringify({ error: `Path escapes skill directory: ${requestedPath}` });
        }

        try {
            if (!await this.fileService.exists(targetUri)) {
                return JSON.stringify({ error: `File not found: ${requestedPath ?? SKILL_FILE_NAME}` });
            }
            const stat = await this.fileService.resolve(targetUri);
            if (stat.isDirectory) {
                return JSON.stringify({ error: `File not found: ${requestedPath ?? SKILL_FILE_NAME}` });
            }
            const fileContent = await this.fileService.read(targetUri);
            return relativePath === SKILL_FILE_NAME
                ? parseSkillFile(fileContent.value).content
                : fileContent.value;
        } catch (error) {
            return JSON.stringify({ error: `File not found: ${requestedPath ?? SKILL_FILE_NAME}` });
        }
    }

    protected normalizeSkillRelativePath(input: string | undefined): string {
        if (!input || !input.trim()) {
            return SKILL_FILE_NAME;
        }

        const value = input.trim();
        const normalized = new Path(Path.normalizePathSeparator(value)).normalize().toString();
        if (value.startsWith('/') || normalized.startsWith('/') || /^[a-zA-Z]:/.test(value) || /^[a-zA-Z]:/.test(normalized)) {
            throw new Error(`Absolute paths are not allowed: ${input}`);
        }
        return normalized === '.' || normalized === './' ? SKILL_FILE_NAME : normalized.replace(/^\.\//, '');
    }
}
