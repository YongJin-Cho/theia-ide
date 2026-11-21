/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

export const CocratesSkillsPathService = Symbol('CocratesSkillsPathService');
export const CocratesSkillsPathServicePath = '/services/cocrates-skills-path';

export interface CocratesSkillsPathService {
    getBundledSkillsPath(): Promise<string | undefined>;
    isPathWithinRealPath(rootPath: string, targetPath: string): Promise<boolean>;
}
