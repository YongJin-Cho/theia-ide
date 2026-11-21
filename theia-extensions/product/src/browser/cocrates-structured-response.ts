/********************************************************************************
 * Copyright (C) 2026 Cocrates and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

export interface CocratesStructuredResponse {
    readonly answer: string;
    readonly session?: string;
    readonly commit?: string;
    readonly compaction?: string;
    readonly [key: string]: unknown;
}

export function parseCocratesStructuredResponse(text: string): CocratesStructuredResponse | undefined {
    let value: unknown;
    try {
        value = parseJsonCandidate(text);
    } catch {
        return undefined;
    }

    if (!isRecord(value) || typeof value.answer !== 'string') {
        return undefined;
    }

    return value as CocratesStructuredResponse;
}

function parseJsonCandidate(text: string): unknown {
    const trimmed = text.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenced) {
        return JSON.parse(fenced[1]);
    }

    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) {
        throw new SyntaxError('No JSON object found');
    }

    return JSON.parse(trimmed.slice(start, end + 1));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
