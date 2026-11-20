# Theia AI: IDE에 Skill 포함·배포하기

조사 기준: 형제 저장소 `../theia/` (`@theia/ai-core` **1.77.0**, `@theia/ai-registry`) 및 Electron/browser 제품 조립 패턴.  
관련: [adding-ai-agents.md](./adding-ai-agents.md) §5 Skills, [frontend-backend.md](./frontend-backend.md).  
Upstream: [#17869](https://github.com/eclipse-theia/theia/issues/17869) (builtin skills — **open**).

---

## 한눈에 보기

| 질문 | 플랫폼 사실 / 설계 시 기억할 점 |
|------|--------------------------------|
| Skill이란 | `SKILL.md`(+ YAML frontmatter)가 있는 **디렉터리**. Theia가 디렉터리를 스캔해 발견 |
| 공식 builtin 번들 API | **없음** (#17869 open). 지금은 FS 루트 기여로 우회 |
| Discovery SSOT | product `manifest.json`이 **아님**. frontmatter + 폴더 구조 |
| 제품에 “내장”하려면 | 파일을 두는 것 + **런타임이 스캔할 절대 경로를 알게 하는 것** — 둘 다 설계해야 함 |
| 개발만이면 | 워크스페이스 `.agents/skills/` 또는 preference로 충분한 경우가 많음 |
| 1.77 | 소비 tool에 `listSkills` 추가. 티어·배포 우회는 1.76과 동일 |

---

## 설계 전 결정 체크리스트

구현에 들어가기 전에 아래를 **문서화·합의**하는 것을 권한다. 각 항목은 이어지는 절의 옵션과 기준을 본다.

| # | 결정할 것 | 고를 때 볼 기준 |
|---|-----------|----------------|
| D1 | 스킬을 **제품에 번들**할 것인가, 사용자/워크스페이스에만 둘 것인가 | 오프라인·첫 실행 UX vs 패키지 크기·업데이트 복잡도 |
| D2 | 번들한다면 **어느 배포 옵션**(§3 A–E)인가 | Electron 필수 여부, Browser/Docker 동시 지원, 사용자 편집과의 분리 |
| D3 | 스킬 **소스 트리 위치·소유 package** | first-party extension vs `applications/*/resources` vs 공용 resource package |
| D4 | 런타임에 절대 경로를 **누가·어떻게** 알릴 것인가 | frontend는 Node/`resourcesPath`를 가정하면 안 됨(§2). main env / backend seed / preference 중 택일 |
| D5 | `qualifier`를 줄 것인가 | 이름 충돌 회피 vs UI에 `qualifier:name` 노출 |
| D6 | AppImage 등 **읽기 전용** 배포를 지원하는가 | 번들 경로 직접 스캔 vs 사용자 dir 복사(plugins 패턴) |
| D7 | 어느 **agent**가 스킬을 소비하는가 | Coder는 기본에 `{{skills}}` 없음 → 프롬프트/Capabilities를 설계에 포함 |
| D8 | 보조 파일(`workflow/` 등)을 tool로 열 것인가 | upstream `getSkillFileContent`는 `SKILL.md`만 → 필요 시 별도 확장 설계 |

합의가 안 된 채로 “파일만 넣으면 된다”고 가정하면, 패키지에는 파일이 있어도 Skills 목록이 비는 설계 결함이 난다.

---

## 1. 플랫폼 사실 — Skill이 어디서 발견되는가

`DefaultSkillService` (`packages/ai-core/src/browser/skill-service.ts`)가 아래 순서로 디렉터리를 합친다. **같은 이름(또는 qualifiedName)이면 먼저 나온 쪽이 이긴다.**

| 우선순위 | 티어 | 경로 |
|----------|------|------|
| 1 (높음) | `workspace` | `<workspace>/.prompts/skills/`, `<workspace>/.agents/skills/` |
| 2 | `configured` | preference `ai-features.skills.skillDirectories` (틸드 `~` 확장) |
| 3 | `default` | `<productConfigDir>/skills/`, `~/.agents/skills/` |
| 4 (낮음) | `plugin` | `SkillDirectoryContribution`이 반환한 루트 |

**config dir:** `applications/*/package.json`의 `theia.configurationFolder`(예: `.theia`).  
`~/.theia/skills`는 upstream README의 **예시**일 뿐, 제품마다 다르다. 설계 시 **해당 제품의** `configurationFolder`를 확인한다.

Registry **Install** → 항상 `~/.agents/skills/<name>/`.  
Agent Plugin → `~/.agents/plugins/<id>/skills/` (`PluginSkillDirectoryContribution`, 보통 qualifier 부여).

### 폴더·파일 규칙 (플랫폼)

```text
<skills-root>/          ← contribution/preference가 가리키는 것 (부모)
├── my-skill/
│   ├── SKILL.md        # 필수. frontmatter name === 디렉터리명 (kebab-case), description 필수
│   └── (선택) 보조 파일
└── another-skill/
    └── SKILL.md
```

Theia는 product-level skill manifest를 요구·해석하지 않는다. 스캔 단위는 위 트리뿐이다.

### 소비 (플랫폼)

- `{{skills}}` — 이름·설명 XML
- `listSkills` / `getSkillFileContent` (1.77; 후자는 기본 `SKILL.md`만)
- `{{skill:name}}` — 특정 스킬 인라인

에이전트마다 프롬프트에 skills/tool이 들어 있지 않을 수 있다(예: Coder). **번들해도 agent가 안 쓰면 운영상 안 보이는 것과 같다** — D7.

---

## 2. 설계 제약 — 왜 “경로”가 어려운가

프론트/백 분리: [frontend-backend.md](./frontend-backend.md).

| 제약 | 설계에 미치는 영향 |
|------|-------------------|
| Skill은 **절대 FS 경로**로 등록 (`Skill.location`) | 번들 위치와 discovery 경로를 런타임에 맞춰야 함 |
| `SkillDirectoryContribution`은 **frontend**에서 실행 | contribution 안에서 `node:fs`, Electron `process.resourcesPath`, 패키지 `cwd`를 **가정하면 안 됨** |
| Electron `asar: true` | skills를 asar 안에만 두면 FileService 스캔이 불안정 → 보통 **extraResources(asar 밖)** |
| Electron main이 backend를 fork할 때 `process.env`를 넘김 | main에서 env를 시드하면 backend `EnvVariablesServer` 스냅샷 → frontend RPC로 읽을 수 있음 |
| Application frontend는 webpack 번들 | extension `tsc`만으로는 패키지 UI에 새 contribution이 안 들어갈 수 있음 → **application 번들 재생성**을 검증 계획에 넣음 |
| Upstream builtin tier 없음 (#17869) | “공식 내장 API”를 기다리지 말고 우회 전략을 고른다 |

### 설계 시 피해야 할 가정

구현 전에 아래를 “되는 줄 알고” 설계에 넣지 않는다.

| 위험한 가정 | 실제 |
|-------------|------|
| 패키지에 파일만 넣으면 Skills UI에 자동 표시 | **파일 존재 ≠ discovery**. 스캔 루트를 런타임에 기여해야 함 |
| frontend에서 `process.resourcesPath`로 패키지 경로를 알 수 있다 | renderer/webpack에는 없음. **main(또는 backend Node)** 에서만 안전 |
| product `manifest.json`이 Theia discovery 계약이다 | Theia는 디렉터리 + `SKILL.md` frontmatter만 봄 |
| extension build = 패키지 반영 | Electron은 application frontend/backend 번들까지 갱신해야 패키지 실행본에 코드가 들어감 |
| frontmatter 없이 `SKILL.md`만 있으면 된다 | validation 실패 시 스킵되어 목록에 안 나옴 |

---

## 3. 배포 전략 — 옵션과 고르는 기준

목표(D1)가 “제품 내장”이 아니면 E 또는 워크스페이스만으로 끝낼 수 있다.

### 옵션 비교

| 옵션 | 요약 | 이런 때 유리 | 이런 때 불리 |
|------|------|--------------|--------------|
| **A** Contribution + 번들 디렉터리 | asar 밖 배치 + frontend가 절대 경로 기여 | Electron 제품 내장, 사용자 dir과 분리 | 경로 시드·Browser/AppImage를 제품이 설계해야 함 |
| **B** preference `skillDirectories` | 설정된 경로만 추가 스캔 | 기업 공유 폴더, 개발 중 모노레포 경로 | 설치 경로가 머신마다 다름 → default에 절대경로 넣기 어려움 |
| **C** 기동 시 config dir에 복사 | `default` 티어에 자동 포함 | PoC, contribution 최소화 | 제품 콘텐츠와 사용자 편집 혼재, 업데이트 정책 필요 |
| **D** Agent Plugin | 플러그인 `skills/` | 레지스트리·선택 설치 | “IDE 기본 동봉” 체감과 다름 |
| **E** Registry Install만 | 패키지에 스킬 파일 없음 | 최소 패키지, 사용자가 고름 | 오프라인·첫 실행에 스킬 없음 |

### 옵션 A를 고를 때 — 설계해야 할 세 층

A는 “한 클래스”가 아니라 **배치 · 경로 시드 · 기여**를 나눠 설계한다.

```text
[배치]     빌드/패키지가 skills 트리를 런타임이 읽을 수 있는 디스크에 둔다
[시드]     Node 쪽(main 또는 backend)이 그 절대 경로를 frontend가 알 수 있게 만든다
[기여]     frontend SkillDirectoryContribution이 그 경로를 plugin 티어로 반환한다
              → DefaultSkillService + FileService가 SKILL.md 스캔
```

**배치 (설계 질문)**  
- Electron: `extraResources`(또는 동등)로 asar 밖인가? 대상 상대 경로 이름은?  
- Browser/Docker: 이미지/서버 디스크의 어느 경로인가? extension package 안 `skills/`로 충분한가?

**시드 (설계 질문)**  
- Electron: main 스크립트에서 `resourcesPath` 기반으로 env(또는 동등 채널)를 심을 것인가? (plugins의 `THEIA_DEFAULT_PLUGINS`와 같은 **프로세스 역할**)  
- Browser: backend 기동 전/초기에 패키지 상대 경로를 같은 채널로 심을 것인가?  
- frontend가 `EnvVariablesServer` / 전용 RPC / preference 중 무엇으로 읽는가? (모두 “frontend가 Node path API를 쓰지 않음”을 만족하면 됨)

**기여 (설계 질문)**  
- 어느 extension이 `SkillDirectoryContribution`을 bind하는가?  
- `qualifier` 문자열은? (충돌 회피 vs UI 표기)  
- contribution은 존재 여부를 `fs`로 선검사하지 않고 경로만 반환하는가? (존재·파싱은 SkillService 책임)

스케치 (이름은 예시일 뿐; 제품이 env 키·qualifier를 정함):

```typescript
// frontend — 경로는 주입/RPC/env 스냅샷에서만 온다
async getSkillDirectories() {
    const path = /* EnvVariablesServer 또는 제품이 정한 채널 */;
    if (!path) return [];
    return [{ path, tier: 'plugin', qualifier: /* D5 */ }];
}
```

```javascript
// Electron main (Node) — resourcesPath 사용이 허용되는 쪽
process.env.<PRODUCT_BUNDLED_SKILLS> = isPackaged
    ? path.join(process.resourcesPath, 'app', 'skills')
    : /* unpackaged/dev 절대 경로 */;
```

### 옵션 B–E 선택 가이드

- **B:** “내장”보다 **추가 루트**가 목표면. 번들 경로 default를 preference에 박기 어렵면 A의의 시드와 조합하거나 A로 이동.  
- **C:** 데모·내부 PoC. 정식 제품이면 업데이트 시 덮어쓰기/보존 정책을 D6과 함께 명시.  
- **D/E:** 제품이 스킬을 “기본 동봉”하지 않아도 되면 패키징·경로 시드 비용을 피할 수 있음.

### AppImage / 읽기 전용 (D6)

읽기만 하면 번들 경로 스캔으로도 목록은 나올 수 있다. **쓰기·안정적 watch**가 필요하거나 plugins와 정책을 맞추려면, 버전 메타 기반 **사용자 디렉터리 복사**를 설계에 넣을지 따로 결정한다.

---

## 4. Preference·contribution API (플랫폼)

- Preference: `ai-features.skills.skillDirectories` (`string[]`) — 추가 루트만; workspace·config·`~/.agents/skills`는 항상 포함.
- `SkillDirectoryContribution`: `getSkillDirectories()`, 선택 `onDidChange`, `tier: 'plugin'`, 선택 `qualifier`.
- 등록: `bind(SkillDirectoryContribution).toService(...)`.

워크스페이스에 같은 `name`이 있으면 제품 번들(`plugin`)은 가려진다 — 의도된 우선순위.

---

## 5. 개발 중 검증 vs 패키지 검증 (계획에 넣을 것)

### 개발만 (번들 전)

| 방법 | 용도 |
|------|------|
| `<workspace>/.agents/skills/` | 설정 없이 스킬 내용·agent 소비부터 검증 |
| preference로 모노레포 `skills/` 절대경로 | 제품 트리와 동일 파일을 스캔 |
| `yarn browser|electron start` | contribution·시드 초안 검증 (패키지와 경로가 다를 수 있음) |

체크: AI enable → Skills UI → agent 프롬프트/tools → `getSkillFileContent`.

### 패키지 검증 (번들을 선택한 경우 설계에 명시)

구현 완료 조건으로 미리 적어 둔다.

1. 산출물에 skills 트리가 **의도한 배치**(예: asar 밖)로 존재하는가.  
2. 런타임 시드(main/backend)가 그 절대 경로를 frontend에 전달하는가.  
3. **패키지에 들어간 frontend 번들**이 최신 contribution을 포함하는가 (extension만 빌드하고 application 번들을 안 돌리면 실패하기 쉬움).  
4. AI enable 후 Skills 목록에 기대 스킬이 보이는가 (`qualifier:name`일 수 있음).  
5. (선택) AppImage/읽기 전용 시나리오.

---

## 6. 권장 결정 순서 (요약)

1. D1: 번들 여부. 아니면 워크스페이스 / B / E로 단순화.  
2. 번들이면 D2: 대개 Electron 제품은 **A**, “설정만”이면 B, PoC면 C.  
3. D3–D5: 소유 package, 시드 채널, qualifier.  
4. D7–D8: agent 프롬프트·보조 파일 tool.  
5. D6: 읽기 전용 배포 정책.  
6. §5 검증 항목을 Spec/테스트 계획에 옮긴 뒤 구현.

Upstream #17869가 들어오면 A의 contribution/시드를 공식 builtin API로 이전할지 재평가한다.

---

## 핵심 파일 맵 (조사·구현 시)

| 경로 (`../theia/`) | 역할 |
|--------------------|------|
| `packages/ai-core/README.md` | Skills 개요 |
| `packages/ai-core/src/common/skill.ts` | 파싱, qualifier, frontmatter 검증 |
| `packages/ai-core/src/browser/skill-service.ts` | 스캔, `SkillDirectoryContribution` |
| `packages/ai-core/src/common/ai-core-preferences.ts` | `skillDirectories` preference |
| `packages/ai-ide/src/browser/skill-file-functions.ts` | `listSkills` / `getSkillFileContent` |
| `packages/core/src/node/env-variables/env-variables-server.ts` | backend env 스냅샷 → frontend |
| `packages/core/src/electron-main/electron-main-application.ts` | backend fork + env 상속 |
| `packages/ai-registry/.../plugin-skill-directory-contribution.ts` | Agent Plugin skills 루트 |
| issue #17869 | 공식 builtin 제안 (open) |

제품 쪽에서는 `applications/*/electron-builder.yml`, Electron main 진입 스크립트, first-party extension의 frontend(/backend) 모듈 지점을 **설계 결과로** 채운다. 구체 경로는 이 문서가 아니라 제품 Spec·소스의 SSOT다.
