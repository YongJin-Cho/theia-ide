# getSkillFileContent 확장 (스킬 보조 파일 + 제품 rebind)

조사 기준: 형제 저장소 `../theia/` (`@theia/ai-ide` / `@theia/ai-core` **1.77.0**).  
관련: [shipping-ai-skills.md](./shipping-ai-skills.md), [adding-ai-agents.md](./adding-ai-agents.md) §5 Tools/Skills.  
스펙: [Agent Skills — Specification](https://agentskills.io/specification) (progressive disclosure, skill-root 상대 경로).

**목표:** Theia 플랫폼(`../theia`)을 수정하지 않고, 제품 확장에서 tool을 **rebind**해 `getSkillFileContent`가 `SKILL.md`뿐 아니라 스킬 디렉터리 안의 다른 파일도 읽게 한다.

---

## 한눈에 보기

| 항목 | 내용 |
|------|------|
| 현재 upstream | `skillName`만 받아 `Skill.location`(=`…/SKILL.md`)을 읽고, `parseSkillFile`로 frontmatter를 뺀 **본문**만 반환 |
| 스펙 갭 | Skill은 `scripts/`·`references/`·`assets/` 등 보조 파일을 skill root 상대 경로로 참조할 수 있음. 지금 tool은 그걸 못 읽음 |
| 권장 확장 API | 선택 인자 `path`(skill-root 상대). 생략/`SKILL.md`/`./SKILL.md` → 기존과 동일(본문). 그 외 → 해당 파일 **원문** |
| 플랫폼 변경 | **하지 않음** |
| 제품 쪽 | `bindToolProvider`가 묶은 `GetSkillFileContent` 식별자를 `rebind`로 교체. **tool id는 그대로** `getSkillFileContent` |

호출 예 (모델이 보내는 JSON; 위치 인자가 아님):

| 호출 | 결과 |
|------|------|
| `getSkillFileContent` `{ "skillName": "sdd" }` | `…/sdd/SKILL.md` 본문 (frontmatter 제거, 기존과 동일) |
| `{ "skillName": "sdd", "path": "SKILL.md" }` / `"./SKILL.md"` | 동일 |
| `{ "skillName": "sdd", "path": "workflow/01-prd.md" }` | `…/sdd/workflow/01-prd.md` **원문** |

---

## 1. Upstream 동작 (변경하지 않는 기준선)

### 등록

`packages/ai-ide/src/browser/frontend-module.ts`:

```typescript
bindToolProvider(GetSkillFileContent, bind);
bindToolProvider(ListSkills, bind);
```

`bindToolProvider` (`@theia/ai-core` `tool-invocation-registry.ts`):

```typescript
bind(identifier).toSelf().inSingletonScope();
bind(ToolProvider).toService(identifier);
```

`ToolInvocationRegistryImpl`은 `@postConstruct`에서 `ToolProvider` contribution마다 `getTool()`을 한 번 호출해 **id 기준 Map**에 등록한다. **같은 id가 이미 있으면 warn만 하고 덮어쓰지 않는다.**

→ “두 번째 `ToolProvider`를 추가로 bind”하는 방식은 `getSkillFileContent` 교체에 **쓸 수 없다**. 반드시 **같은 클래스 식별자를 rebind**해야 한다.

### 현재 handler

`packages/ai-ide/src/browser/skill-file-functions.ts` — `GetSkillFileContent`:

1. `JSON.parse(arg_string).skillName`
2. `skillService.getSkill(skillName)` (`qualifiedName` 우선, 없으면 plain `name`)
3. `URI.fromFilePath(skill.location)` 읽기 — `location`은 **SKILL.md 절대 경로**
4. `parseSkillFile(…).content` 반환 (YAML frontmatter 제거)

파라미터 스키마에 `path`/`file` 없음. description도 “skill 본문”만 안내.

### Skill 루트와의 관계

| 개념 | 값 |
|------|----|
| `Skill.location` | `<skill-dir>/SKILL.md`의 fs 절대 경로 |
| skill root | `dirname(Skill.location)` (= SKILL.md의 부모 디렉터리) |
| 스펙상 상대 경로 | skill root 기준 (`references/FOO.md`, `workflow/01-prd.md`, …) |

상수: `SKILL_FILE_NAME = 'SKILL.md'` (`ai-core` `skill.ts`).

### 프롬프트·agent 쪽

- Explore 등: `~{getSkillFileContent}` + `{{skills}}` / `listSkills`
- skill slash command fragment: `Load the skill … using ~{getSkillFileContent}.` (`skill-prompt-coordinator.ts`)
- **id를 바꾸면** 위 참조·Capabilities가 깨진다 → 확장 시 **id/name은 `getSkillFileContent` 유지**.

---

## 2. 목표 API (제품 확장에서 구현)

### 파라미터

| 필드 | 필수 | 의미 |
|------|------|------|
| `skillName` | ✓ | 기존과 동일. leading `/` 없이. `qualifiedName` 또는 plain name |
| `path` | | skill root 상대 경로. 생략 시 `SKILL.md` |

별칭을 받고 싶다면 handler에서 `path ?? filePath ?? file` 정도로 흡수해도 되나, **스키마에 노출하는 이름은 하나(`path`)로 고정**하는 편이 모델에 덜 헷갈린다.

### 반환 규칙

| `path` | 반환 |
|--------|------|
| 없음 / `SKILL.md` / `./SKILL.md` (정규화 후 `SKILL.md`) | **기존 호환:** `parseSkillFile` 본문 |
| 그 외 (예: `workflow/01-prd.md`) | **파일 원문** (frontmatter 파싱하지 않음) |

오류는 기존처럼 JSON 문자열로 통일하는 것이 안전하다.

```json
{ "error": "Skill not found: …" }
{ "error": "File not found: …" }
{ "error": "Path escapes skill directory: …" }
```

### 경로 해석·가드 (필수)

1. `skillRoot = URI.fromFilePath(skill.location).parent` (또는 path의 dirname)
2. 입력 `path`를 `Path.normalizePathSeparator` + `normalize()` (`.` / `..` 정리)
3. `target = skillRoot.resolve(normalizedRelative)` (또는 `skillRoot.path.join(…)`)
4. **탈출 금지:** `skillRoot.isEqualOrParent(target)`가 false이면 거부  
   (`..`, 절대경로, 심볼릭 링크로 skill 밖을 가리키는 경우 포함 — 가능하면 `FileService.resolve` 후 real path로도 한 번 더 검사)
5. 디렉터리면 거부(또는 “디렉터리 listing은 별도 tool”로 명시). 텍스트 읽기만.

워크스페이스 `getFileContent`의 root 가드(`isEqualOrParent`)와 같은 패턴을 **스킬 디렉터리 단위**로 적용하면 된다. 스킬은 workspace 밖(`~/.agents/skills`, 번들 `extraResources` 등)에 있을 수 있으므로 **워크스페이스 root 가드를 그대로 쓰면 안 된다**.

### tool description 갱신

모델이 보조 파일을 쓰려면 description에 다음을 넣는다.

- `path`는 skill root 상대; `SKILL.md`가 가리키는 `references/…`, `workflow/…` 등을 이어서 로드
- 다른 **스킬** 참조(`/other-skill`)는 기존처럼 `skillName`만으로 재호출
- 한 단계 깊이 권장(스펙: deeply nested reference chain 지양)

프롬프트의 `~{getSkillFileContent}` 문자열은 **그대로** 두면 된다(id 불변). description만 바뀌면 registry에 등록된 ToolRequest가 갱신된다.

---

## 3. 제품 확장에서 rebind하는 방법

### 왜 rebind인가

| 방식 | 결과 |
|------|------|
| `bindToolProvider(MyGetSkill…)` 추가 | 동일 id → registry가 **무시** (warn). 기존 upstream 구현이 남음 |
| `GetSkillFileContent` **rebind** | `ToolProvider.toService(GetSkillFileContent)`가 교체 구현을 resolve → `getTool()`이 확장 API를 등록 |
| id를 바꾼 새 tool | Explore/`~{…}`/slash fragment와 불일치. 이중 유지보수 |

제품 모듈에는 이미 rebind 선례가 있다 (`theia-extensions/product` → `AboutDialog`, `AIRegistryConfiguration`).

### 모듈 코드 스케치

파일 예: `theia-extensions/product/src/browser/extended-get-skill-file-content.ts`

```typescript
import { ToolProvider, ToolRequest } from '@theia/ai-core';
import { SkillService } from '@theia/ai-core/lib/browser/skill-service';
import { parseSkillFile, SKILL_FILE_NAME } from '@theia/ai-core/lib/common/skill';
import { GET_SKILL_FILE_CONTENT_FUNCTION_ID, LIST_SKILLS_FUNCTION_ID } from '@theia/ai-ide/lib/common/workspace-functions';
import { GetSkillFileContent } from '@theia/ai-ide/lib/browser/skill-file-functions';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { Path, URI } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';

@injectable()
export class ExtendedGetSkillFileContent implements ToolProvider {
    /** registry id — upstream과 동일해야 ~{getSkillFileContent}가 이 구현을 씀 */
    static ID = GET_SKILL_FILE_CONTENT_FUNCTION_ID;

    @inject(SkillService)
    protected readonly skillService: SkillService;

    @inject(FileService)
    protected readonly fileService: FileService;

    getTool(): ToolRequest {
        return {
            id: ExtendedGetSkillFileContent.ID,
            name: ExtendedGetSkillFileContent.ID,
            description:
                'Returns the content of a file inside a skill directory. ' +
                `List skills with ${LIST_SKILLS_FUNCTION_ID}. ` +
                'Pass skillName (no leading slash). Optional path is relative to the skill root ' +
                `(omit or pass SKILL.md for the skill body; e.g. workflow/01-prd.md for a sibling file). ` +
                'If SKILL.md references another skill by name or /<skill-name>, call this tool again with that skillName.',
            parameters: {
                type: 'object',
                properties: {
                    skillName: {
                        type: 'string',
                        description: 'Exact skill name or qualifiedName, without a leading slash'
                    },
                    path: {
                        type: 'string',
                        description: 'Optional path relative to the skill root (default: SKILL.md)'
                    }
                },
                required: ['skillName']
            },
            handler: (arg_string: string) => this.handle(arg_string)
        };
    }

    protected async handle(arg_string: string): Promise<string> {
        const args = arg_string ? JSON.parse(arg_string) : {};
        const skillName: string = args.skillName;
        const relativeInput: string | undefined =
            typeof args.path === 'string' ? args.path : undefined;

        const skill = this.skillService.getSkill(skillName);
        if (!skill) {
            return JSON.stringify({ error: `Skill not found: ${skillName}` });
        }

        let relative: string;
        try {
            relative = this.normalizeSkillRelativePath(relativeInput);
        } catch (error) {
            return JSON.stringify({ error: String(error) });
        }

        const skillMdUri = URI.fromFilePath(skill.location);
        const skillRoot = skillMdUri.parent;
        const targetUri = relative === SKILL_FILE_NAME
            ? skillMdUri
            : skillRoot.resolve(relative);

        if (!skillRoot.isEqualOrParent(targetUri)) {
            return JSON.stringify({ error: `Path escapes skill directory: ${relativeInput}` });
        }

        try {
            const fileContent = await this.fileService.read(targetUri);
            if (relative === SKILL_FILE_NAME) {
                return parseSkillFile(fileContent.value).content;
            }
            return fileContent.value;
        } catch (error) {
            return JSON.stringify({ error: `Failed to load skill file: ${error}` });
        }
    }

    protected normalizeSkillRelativePath(path: string | undefined): string {
        if (!path || !path.trim()) {
            return SKILL_FILE_NAME;
        }
        let normalized = new Path(Path.normalizePathSeparator(path.trim())).normalize().toString();
        if (normalized.startsWith('./')) {
            normalized = normalized.slice(2);
        }
        // 절대경로·드라이브 문자 거부 (`..` 정규화 후 루트 탈출은 isEqualOrParent로 차단)
        if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
            throw new Error(`Absolute paths are not allowed: ${path}`);
        }
        return normalized || SKILL_FILE_NAME;
    }
}

// frontend-module — ContainerModule의 rebind 사용
// import { GetSkillFileContent } from '@theia/ai-ide/lib/browser/skill-file-functions';
//
// if (isBound(GetSkillFileContent)) {
//     rebind(GetSkillFileContent).to(ExtendedGetSkillFileContent).inSingletonScope();
// }
```

`theia-ide-frontend-module.ts`에 넣을 때:

```typescript
import { GetSkillFileContent } from '@theia/ai-ide/lib/browser/skill-file-functions';
import { ExtendedGetSkillFileContent } from './extended-get-skill-file-content';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    // …기존 branding / AboutDialog / AIRegistryConfiguration …

    if (isBound(GetSkillFileContent)) {
        rebind(GetSkillFileContent).to(ExtendedGetSkillFileContent).inSingletonScope();
    }
});
```

### 구현 시 주의

1. **`GetSkillFileContent`를 subclass만 하고 `getTool`을 안 바꾸는 경우**  
   upstream handler가 `private`라 override가 안 된다. **`getTool()` 전체를 새 스키마·handler로 제공하는 교체 클래스**가 맞다. `implements ToolProvider`로 `GetSkillFileContent` 식별자에만 묶으면 충분하다 (상속 불필요).

2. **`bindToolProvider(Extended…)`를 함께 호출하지 말 것**  
   contribution이 두 개가 되고, 둘 다 같은 id를 내면 두 번째가 버려지거나(등록 순서에 따라) 혼란만 생긴다. **rebind만**.

3. **모듈 로드 순서**  
   제품 frontend 확장은 `@theia/ai-ide` 이후에 로드되어야 `isBound(GetSkillFileContent)`가 true다. theia-ide application dependency 구성이 이미 그 전제다. 새 확장으로 분리할 때도 application `package.json`에서 ai-ide **뒤**에 두거나, `isBound` 가드를 유지한다.

4. **import 경로**  
   `@theia/ai-ide`는 `./lib/*.js` export가 있어  
   `@theia/ai-ide/lib/browser/skill-file-functions` / `…/common/workspace-functions` deep import가 가능하다. package `dependencies`에 `@theia/ai-ide`가 있어야 한다 (`theia-extensions/product`에 없으면 추가).

5. **테스트**  
   - `skillName`만 → 기존 SKILL.md 본문  
   - `path: "SKILL.md"` / `"./SKILL.md"` → 동일  
   - `path: "workflow/01-prd.md"` → 원문  
   - `path: "../other/SKILL.md"` / 절대경로 → error  
   - 없는 스킬·없는 파일 → error JSON  
   - Explore 채팅에서 `~{getSkillFileContent}` 호출이 확장 description/파라미터를 쓰는지

---

## 4. 하지 말아야 할 대안

| 대안 | 이유 |
|------|------|
| `../theia/packages/ai-ide/.../skill-file-functions.ts` 직접 수정 | 플랫폼 fork 비용; 이 문서의 전제와 반대 |
| 새 tool id (`getSkillRelatedFile` 등)만 추가 | 스펙 progressive disclosure·기존 프롬프트와 어긋남. 쓰려면 agent 프롬프트/`listSkills` description까지 전부 고쳐야 함 |
| 워크스페이스 `getFileContent`에 skill 절대경로를 맡김 | 스킬이 workspace 밖이면 거부되거나, 허용 시 스킬 루트 탈출 가드가 없음 |
| Registry에 런타임 `unregister` 후 `registerTool` | `@postConstruct` 타이밍·다른 contribution과 경쟁. DI rebind가 Theia 관례 |

Upstream에 동일 API를 기여할 계획이 있다면, 제품 rebind로 먼저 검증한 뒤 `GetSkillFileContent` 패치를 PR하는 경로가 자연스럽다. 그 전까지는 **확장 rebind만**으로 갭을 메운다.

---

## 5. 이 제품에서의 배치

| 위치 | 역할 |
|------|------|
| `theia-extensions/product/src/browser/extended-get-skill-file-content.ts` | 교체 `ToolProvider` 구현 (신규) |
| `theia-extensions/product/src/browser/theia-ide-frontend-module.ts` | `rebind(GetSkillFileContent)…` |
| `theia-extensions/product/package.json` | `@theia/ai-ide` dependency (필요 시) |
| 스킬 트리 (예: `.agents/skills/sdd/`) | `SKILL.md` + `workflow/…` 등 — [shipping-ai-skills.md](./shipping-ai-skills.md) 배포 경로와 독립 |

배포·발견(스캔 티어, `SkillDirectoryContribution`, extraResources)은 기존 문서 그대로다. 이 확장은 **이미 발견된 스킬의 파일 읽기 surface**만 넓힌다.

---

## 핵심 파일 맵

| 경로 (`../theia/`) | 역할 |
|--------------------|------|
| `packages/ai-ide/src/browser/skill-file-functions.ts` | upstream `GetSkillFileContent` / `ListSkills` |
| `packages/ai-ide/src/browser/frontend-module.ts` | `bindToolProvider(GetSkillFileContent, …)` |
| `packages/ai-ide/src/common/workspace-functions.ts` | `GET_SKILL_FILE_CONTENT_FUNCTION_ID` |
| `packages/ai-core/src/common/tool-invocation-registry.ts` | `bindToolProvider`, id 중복 시 미교체 |
| `packages/ai-core/src/common/skill.ts` | `SKILL_FILE_NAME`, `parseSkillFile`, `Skill.location` |
| `packages/ai-core/src/browser/skill-service.ts` | `getSkill` / 스캔 |
| `packages/ai-core/src/browser/skill-prompt-coordinator.ts` | slash → `~{getSkillFileContent}` |

| 경로 (theia-ide) | 역할 |
|------------------|------|
| `theia-extensions/product/.../theia-ide-frontend-module.ts` | 제품 DI rebind 진입점 |
| `docs/theia/shipping-ai-skills.md` | 스킬 발견·배포 |
| `docs/theia/adding-ai-agents.md` | ToolProvider / `~{toolId}` 개요 |
