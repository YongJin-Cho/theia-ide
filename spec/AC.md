# Architectural Concerns

Theia IDE Product Template의 제품 Spec 작성을 위해 설계가 필요한 구조적 관심사 등록부다.

## Summary

| ID | Title | Category | Status | Related ADRs | ASR (after ④) |
|----|-------|----------|--------|--------------|---------------|
| AC-001 | 애플리케이션 타깃의 역할과 공통 경계 | Structure & organization | designed | — | ASR-002 |
| AC-002 | 제품 확장의 구성 및 의존성 경계 | Integration & dependencies | designed | — | ASR-003 |
| AC-003 | 채택자 커스터마이징 표면의 지원 범위 | Deliverable form | designed | — | ASR-004 |
| AC-004 | 제품 Spec-구현 일치 검증의 증거 수준 | Quality bar (architectural) | designed | — | ASR-007 |
| AC-005 | Cocrates 타깃 식별자 체계 | Constraints (structural) | designed | adr/cocrates-target-identifiers.md | ASR-010 |
| AC-006 | 제품 브랜드와 Theia 업스트림 명칭의 경계 | Structure & organization | designed | — | ASR-011 |
| AC-007 | 업데이트·배포 메타데이터의 제품 소유 범위 | Integration & dependencies | designed | — | ASR-012 |
| AC-008 | Cocrates ChatAgent 등록 및 기본 Agent 선택 | Integration & dependencies | designed | adr/cocrates-chat-agent-registration.md | ASR-013 |
| AC-009 | 내장 Skills의 배치·발견·패키징 전략 | Structure & organization | designed | `adr/cocrates-skills-packaging.md` | ASR-014 |
| AC-010 | Cocrates 시스템 프롬프트의 소스 연결 방식 | Integration & dependencies | designed | — | ASR-015 |
| AC-011 | `getSkillFileContent` 보조 파일 API 및 경로 안전성 | Quality bar (architectural) | designed | — | ASR-016 |

## Dependency Order (recommended review path)

1. AC-001 → AC-005 → AC-006 → AC-007
2. 기존 결정: AC-001 → AC-002 → AC-003 → AC-004
3. 신규 결정: AC-008 → AC-009 → AC-010 → AC-011

## AC Detail

### AC-001 — 애플리케이션 타깃의 역할과 공통 경계

- **Category:** Structure & organization
- **Status:** designed
- **Statement:** `applications/browser`, `applications/electron`, `applications/electron-next`를 하나의 Product Template 안에서 어떤 역할과 공통 계약으로 정의할 것인가? Electron과 Electron Next의 차이를 별도 제품 변형으로 볼지, 동일 제품의 릴리스 채널로 볼지 정해야 한다.
- **Why it matters:** 애플리케이션별 요구사항과 공통 요구사항을 구분하지 않으면 Spec과 제품 백로그가 중복되거나, 한 타깃의 동작을 다른 타깃의 보장으로 잘못 해석할 수 있다.
- **Depends on:** —
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** `applications/browser`, `applications/electron`, `applications/electron-next`는 하나의 Eclipse Theia IDE Product Template이 제공하는 배포 타깃으로 정의한다. `electron-next`는 별도 제품 계약이 아니라 Next 릴리스 채널/제품 변형으로 정의하며, 공통 IDE·확장·플러그인 계약을 공유하고 branding variant, 업데이트 채널, URI scheme, configuration folder, 앱 식별자 같은 타깃별 설정만 다르게 가진다.
- **Notes:** 직접 입력으로 결정했다. PRD와 구현이 이미 공통 제품 구조와 Next 변형을 명확히 보여 주므로 ADR은 작성하지 않는다.

### AC-002 — 제품 확장의 구성 및 의존성 경계

- **Category:** Integration & dependencies
- **Status:** designed
- **Statement:** `theia-extensions/product`, `theia-extensions/updater`, `theia-extensions/launcher`를 Eclipse Theia IDE 제품에 필요한 확장으로 어떻게 정의하고, application 설정과 기능 확장의 경계를 어디에 둘 것인가? 각 확장의 적용 대상과 Theia 애플리케이션과의 의존성 방향을 어디까지 보장할 것인가?
- **Why it matters:** 확장을 하나의 묶음으로만 기술하면 채택자가 선택적으로 재사용할 수 있는 경계와 Electron 전용 기능의 제약을 알 수 없다.
- **Depends on:** AC-001
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** `theia-extensions/*`는 Eclipse Theia IDE 제품에 필요한 기능 확장을 제공하고, `applications/*`는 타깃별 Theia 의존성 조합·확장 포함 여부·실행 및 패키징 설정을 제공한다. `product`는 모든 채택 애플리케이션의 공통 계약이 아니라 이 저장소의 Browser/Electron 제품 타깃들이 공유하는 Eclipse Theia IDE 제품 고유의 Theia 확장이다. 애플리케이션별 기능 차이는 application에서 동일 서비스 계약을 rebind하는 방식이 아니라 별도의 Theia 확장으로 분리한다. `product`가 `rebind`하는 `AboutDialog`와 `AIRegistryConfiguration`은 application의 일반적인 override 지점으로 보장하지 않는다.
- **Notes:** 직접 입력으로 결정했다. 후보 해석은 `product`를 모든 채택 애플리케이션의 공통 확장이 아니라, Eclipse Theia IDE 제품에 필요한 제품 수준의 Theia 확장으로 정의하는 것이다. `theia-extensions/product`는 이 저장소의 browser/Electron 애플리케이션들이 함께 사용하는 제품 확장이지만, application이 자유롭게 대체해야 하는 공통 계약으로 보지 않는다. 기능 확장은 `theia-extensions/*`에 두고, application에는 타깃별 설정·의존성·실행/패키징 구성을 둔다. 현재 `product` 패키지는 frontend와 Electron main entrypoint를 export하며 branding, Getting Started, About dialog, Help 메뉴, AI registry configuration, Electron icon contribution을 제공한다. 또한 product frontend module은 `AboutDialog`와 `AIRegistryConfiguration`을 명시적으로 `rebind`하므로 동일 계약을 application에서 재정의해도 모듈 순서에 따라 product 구현이 다시 선택될 수 있다. 따라서 application에서의 동일 계약 rebind는 권장 확장 방식이 아니며, application별 차이는 설정으로 노출하거나 별도 타깃 확장으로 분리하는 것이 경계에 맞는다. 애플리케이션 `package.json`의 실행 설정은 DI rebind와 별도 계층이다.

### AC-003 — 채택자 커스터마이징 표면의 지원 범위

- **Category:** Deliverable form
- **Status:** designed
- **Statement:** Product Template이 채택자에게 보장하는 커스터마이징 표면을 앱 이름·아이콘·URI scheme·configuration folder·패키지 설정으로 한정할 것인가, 아니면 확장/플러그인 구성 변경까지 제품 계약에 포함할 것인가?
- **Why it matters:** README와 ADOPTER 문서가 안내하는 재사용 범위와 최종 Spec의 제품 계약이 어긋나면 채택자가 지원되지 않는 내부 구조에 의존할 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** Product Template이 공식적으로 보장하는 채택자 커스터마이징 표면은 애플리케이션 설정과 리소스 교체를 중심으로 한다. 여기에는 앱 이름, 아이콘, URI scheme, configuration folder, Electron app ID, splash screen, 제품별 package 설정이 포함된다. 채택자가 제품 기능의 동작을 변경해야 하는 경우 application에서 기존 서비스를 임의로 `rebind`하는 대신 별도의 Theia 확장으로 분리한다. 플러그인과 확장 조합은 애플리케이션 의존성과 플러그인 설정을 통해 조정할 수 있지만, 각 내부 서비스의 override는 기본 채택 계약으로 보장하지 않는다.
- **Notes:** 직접 입력으로 결정했다. `ADOPTER.md`, `docs/rebranding.md`, 애플리케이션 설정을 기준으로 범위를 정한다.

### AC-005 — Cocrates 타깃 식별자 체계

- **Category:** Constraints (structural)
- **Status:** designed
- **Statement:** Browser, Stable Electron, Electron Next(`Cocrates Next`)에 사용할 `name`, `productName`, `applicationName`, `appId`, `appUserModelId`, URI scheme, configuration folder, executable·artifact 이름을 어떤 일관된 식별자 체계로 정할 것인가?
- **Why it matters:** 앱 식별자와 사용자 데이터·딥링크·패키징 산출물은 설치·업데이트·동시 사용·기존 데이터와의 충돌에 영향을 주며, 임의의 값은 되돌리기 어려운 배포 계약이 된다.
- **Depends on:** AC-001
- **Related ADRs:**
  - `adr/cocrates-target-identifiers.md` — approved
- **ASR:** ASR-010
- **Resolution path:** adr
- **Resolution:** Option A를 채택한다. Stable은 `com.cocrates.ide`, `cocrates`, `.cocrates`를 사용하고 Electron Next는 `com.cocrates.ide.next`, `cocrates-next`, `.cocrates-next`를 사용해 앱 식별자·URI scheme·사용자 설정 디렉터리를 분리한다.
- **Notes:** `docs/rebranding.md`는 예시 값만 제공했으나 `com.cocrates`를 공식 reverse-domain으로 확정했다. 기존 `.theia-ide` 사용자 데이터는 새 `.cocrates` 계열로 자동 마이그레이션하지 않는다.

### AC-006 — 제품 브랜드와 Theia 업스트림 명칭의 경계

- **Category:** Structure & organization
- **Status:** designed
- **Statement:** 소스 코드 식별자·내부 패키지명·업스트림 도구명에 남아 있는 `theia`/`theia-ide` 문자열 중 어떤 것을 Cocrates 제품 표면에서 반드시 제거하고, 어떤 내부 호환 명칭을 유지할 것인가?
- **Why it matters:** 모든 문자열을 기계적으로 바꾸면 업스트림 API·패키지 계약을 깨뜨릴 수 있고, 반대로 경계를 정의하지 않으면 사용자에게 Theia 브랜드가 남는다.
- **Depends on:** AC-005
- **Related ADRs:**
  - —
- **ASR:** ASR-011
- **Resolution path:** direct-input
- **Resolution:** 사용자에게 보이는 UI·패키징·CLI·문서·배포 메타데이터의 Theia 제품 문자열은 Cocrates 또는 `Cocrates Next`로 변경한다. `@theia/*` 패키지명, Theia API, 업스트림 빌더·도구명처럼 호환성에 필요한 내부 식별자는 유지한다. 유지되는 내부 명칭은 제품 사용자 표면이나 제품 배포 식별자로 노출하지 않는다.
- **Notes:** PRD의 사용자 표면 브랜드 제거 원칙을 직접 입력으로 구체화했다. 내부 호환 식별자를 기계적으로 변경해 Theia 의존성 계약을 깨뜨리지 않는다.

### AC-007 — 업데이트·배포 메타데이터의 제품 소유 범위

- **Category:** Integration & dependencies
- **Status:** designed
- **Statement:** updater URL, electron-builder publish 설정, CI release artifact/image 이름, Docker registry 경로와 문서 링크를 Cocrates 배포 인프라로 확정할 것인가, 아니면 템플릿 변수·자리표시자로 남길 것인가?
- **Why it matters:** 잘못된 updater·publish URL은 설치된 사용자를 잘못된 릴리스로 연결할 수 있고, 실제 Cocrates 배포 인프라 정보가 없는 상태에서 임의 URL을 넣으면 구현 후 재작업이 발생한다.
- **Depends on:** AC-005
- **Related ADRs:**
  - —
- **ASR:** ASR-012
- **Resolution path:** direct-input
- **Resolution:** Cocrates의 실제 GitHub 배포 저장소는 `https://github.com/cocrates/theia-ide`로 사용한다. Electron Next updater의 release URL과 관련 문서 링크는 이 저장소를 기준으로 갱신하고, Docker 이미지 태그는 `cocrates-ide`로 변경한다. 제품 artifact·CI 이름도 Cocrates 식별자 체계에 맞추되, 별도로 제공되지 않은 CDN·registry 호스트는 새로 추정하지 않는다.
- **Notes:** 사용자가 실제 GitHub 저장소와 Docker image tag를 직접 결정했다. updater URL은 기존 `/releases/download/next` 채널 경로를 새 저장소에 적용한다.

### AC-004 — 제품 Spec-구현 일치 검증의 증거 수준

- **Category:** Quality bar (architectural)
- **Status:** designed
- **Statement:** 이미 구현된 Product Template의 Spec 일치 여부를 문서·설정·스크립트 정적 대조만으로 판정할 것인가, 아니면 실제 lint/build/test/package/runtime 실행을 필수 증거로 요구할 것인가?
- **Why it matters:** 실행 검증은 높은 신뢰도를 주지만 환경·시간·외부 플러그인에 의존한다. 정적 대조만 허용하면 실행 경로의 결함을 놓칠 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** 제품 Spec-구현 일치 검증은 정적 대조를 기본 증거로 하고, 가능한 범위에서 `yarn lint`, `yarn test`, `yarn build:dev` 또는 대상별 build, Browser 기동, Electron preview package 및 Electron E2E를 추가 실행한다. 환경·시간·외부 플러그인·native module 때문에 실행할 수 없는 항목은 검증을 통과한 것으로 간주하지 않고, 실행 불가 사유와 정적 대조 근거를 검증 기록에 분리해 남긴다.
- **Notes:** 직접 입력으로 결정했다. 실행 검증을 원칙으로 하되, 환경 제약을 숨기지 않고 증거 수준을 항목별로 기록한다.

### AC-008 — Cocrates ChatAgent 등록 및 기본 Agent 선택

- **Category:** Integration & dependencies
- **Status:** designed
- **Statement:** Cocrates ChatAgent를 어느 제품 확장 모듈에 등록하고, `ai-features.chat.defaultChatAgent` preference 또는 DI fallback 중 어떤 Theia 계약으로 Default Chat Agent를 보장할 것인가?
- **Why it matters:** Agent 등록 위치와 기본 Agent 선택 경로가 분리되면 mention을 사용하지 않은 채팅에서 Cocrates가 선택되지 않거나 Browser/Electron 타깃별 동작이 달라질 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - `theia-ide/adr/cocrates-chat-agent-registration.md` — approved
- **Resolution path:** adr
- **Resolution:** Option A를 선택한다. 제품 확장에 `AbstractStreamParsingChatAgent` 기반 Cocrates ChatAgent를 구현하고 `Agent`와 `ChatAgent`를 모두 등록한다. `ai-features.chat.defaultChatAgent` preference에 Cocrates Agent ID를 제공해 mention 없는 채팅에서도 Cocrates를 기본 Agent로 선택한다. 별도 Agent mode는 추가하지 않는다.
- **Notes:** 사용자가 Option A를 선택했다. Agent mode는 직접 입력으로 resolved되었고, system prompt와 Skill packaging은 각각 AC-010과 AC-009에서 후속 검토한다.

### AC-009 — 내장 Skills의 배치·발견·패키징 전략

- **Category:** Structure & organization
- **Status:** designed
- **Statement:** 사용자가 나중에 제공할 `adr`, `todo`, `sdd` 스킬 트리를 Browser·Stable Electron·Electron Next에서 어떻게 배치하고 런타임 discovery root를 제공할 것인가?
- **Why it matters:** 스킬 파일을 패키지에 복사하는 것만으로는 `DefaultSkillService`가 발견하지 못할 수 있다. Electron asar·AppImage 읽기 전용 경로와 Browser/Docker 경로까지 함께 결정하지 않으면 배포물에서 Skills 목록이 비게 된다.
- **Depends on:** AC-008
- **Related ADRs:**
  - `theia-ide/adr/cocrates-skills-packaging.md` — approved
- **Resolution path:** adr
- **Resolution:** Option A를 선택한다. 제품 소유 스킬 트리를 번들 디렉터리에 포함하고, backend/main이 타깃별 런타임 경로를 시드하며, frontend의 `SkillDirectoryContribution`이 해당 경로를 plugin discovery tier에 제공한다. Electron에서는 스킬 트리를 asar 외부의 읽기 가능한 배포 리소스로 두고, 사용자·workspace 스킬과 제품 번들을 분리한다. 실제 `adr`, `todo`, `sdd` 스킬 본문은 사용자가 제공하기 전까지 생성하지 않는다.
- **Notes:** 사용자가 Option A를 선택했다. 런타임 경로 시드 채널은 구현 전 후속 관심사로 남긴다.

### AC-010 — Cocrates 시스템 프롬프트의 소스 연결 방식

- **Category:** Integration & dependencies
- **Status:** designed
- **Statement:** `docs/cocrates/agent1.md`의 내용을 제품 ChatAgent system prompt에 어떤 시점과 형식으로 연결하고, 이후 문서 변경이 Agent 번들에 반영되는 단일 소스를 어떻게 유지할 것인가?
- **Why it matters:** 프롬프트를 수동 복사하면 `agent1.md`와 실행 프롬프트가 달라질 수 있고, 런타임 파일 로드는 패키징·보안·Browser/Electron 차이를 만든다.
- **Depends on:** AC-008
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** Option C를 선택한다. 빌드 단계에서 `docs/cocrates/agent1.md`를 생성된 TypeScript 소스 또는 동등한 번들 소스로 변환하고, 제품 ChatAgent는 생성된 결과만 system prompt로 사용한다. 생성 과정은 Markdown 내용을 의미 변경 없이 보존하고, 원본이 변경되면 다음 빌드에서 결과를 재생성한다. 런타임에 workspace·설치 경로의 `agent1.md`를 읽거나 수동 복사본을 별도 소스로 사용하지 않는다.
- **Notes:** 사용자가 Option C를 선택했다. 생성 소스가 `docs/cocrates/agent1.md`와 어긋나지 않도록 빌드·검증 단계에서 동기화 여부를 확인한다.

### AC-011 — `getSkillFileContent` 보조 파일 API 및 경로 안전성

- **Category:** Quality bar (architectural)
- **Status:** designed
- **Statement:** 기존 tool id와 `SKILL.md` 본문 호환성을 유지하면서 skill-root 상대 `path`를 지원하는 rebind 구현의 입력·반환·경로 탈출 방지 계약을 어디까지 보장할 것인가?
- **Why it matters:** 새 tool id를 만들면 기존 Agent 프롬프트와 연결이 끊기고, 경로 가드가 부족하면 스킬 디렉터리 밖의 파일을 읽는 보안 문제가 생긴다.
- **Depends on:** AC-009
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** 기존 tool ID `getSkillFileContent`를 유지하고 제품 확장에서 `GetSkillFileContent`를 rebind한다. 필수 `skillName`과 선택 `path`를 받으며 `path`는 skill root 상대 경로로 제한한다. `path` 생략·`SKILL.md`·`./SKILL.md`는 기존처럼 frontmatter를 제거한 `SKILL.md` 본문을 반환하고, 그 외 파일은 원문을 반환한다. 절대 경로·드라이브 문자·정규화 후 skill root 밖 경로·심볼릭 링크를 통한 탈출과 디렉터리 읽기는 거부한다. 오류는 JSON 문자열로 반환하며 `Skill not found`, `File not found`, `Path escapes skill directory` 오류를 포함한다.
- **ASR:** ASR-016
- **Notes:** `extending-get-skill-file-content.md`의 `path` 규칙, `SKILL.md` 본문 호환, skill root 탈출 차단, 오류 JSON 계약을 구현 Spec에 반영한다. 사용자가 제시된 Direct Input 계약을 승인해 설계 완료했다.
