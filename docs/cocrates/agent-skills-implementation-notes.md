# Cocrates Agent·Skills 구현 조사 노트

## 조사 목적

승인된 `spec/cocrates-ai-agent-skills.md`의 PB-007 구현을 시작하기 전에 현재 제품 확장 구조와 Theia AI API의 연결 지점을 확인한다. 실제 `adr`, `todo`, `sdd` 스킬 본문은 조사·구현 대상에 포함하지 않는다.

## 확인된 구현 경계

### Cocrates ChatAgent

- 제품 고유 확장은 `theia-extensions/product`에 있으며 현재 frontend `ContainerModule`이 branding, About, Getting Started, AI Registry 설정을 등록한다.
- `docs/theia/adding-ai-agents.md`는 제품 전용 Agent를 제품 확장에 두고 `AbstractStreamParsingChatAgent`를 상속하며 `Agent`와 `ChatAgent`를 모두 `toService`로 등록하는 패턴을 정의한다.
- sprint-03 승인 결정에 따라 별도 Agent mode를 만들지 않고 `ai-features.chat.defaultChatAgent` preference가 Cocrates Agent ID를 가리키도록 구현한다.
- 현재 `theia-extensions/product/package.json`에는 `@theia/ai-registry`가 있으나 Agent 구현에 필요한 AI Core/Chat/IDE 의존성은 아직 명시되어 있지 않다. 실제 버전과 export는 대상 Theia 설치 및 애플리케이션 package 조립과 함께 확인해야 한다.

### 시스템 프롬프트

- `docs/cocrates/agent1.md`는 단일 원본으로 유지해야 한다.
- `docs/theia/adding-ai-agents.md`의 코드 기반 Agent 패턴은 prompt variant set을 Agent에 등록하고 생성된 문자열을 built-in prompt fragment로 사용하는 방향을 지원한다.
- 런타임에서 `docs/cocrates/agent1.md`를 직접 읽거나 설치 경로에 수동 복사하지 않는다. 빌드 단계 생성 파일의 위치·생성 스크립트는 구현 시 package build 흐름에 맞춰 정한다.

### Skills discovery와 런타임 경로

- `docs/theia/shipping-ai-skills.md`에 따르면 `SkillDirectoryContribution`은 frontend에서 실행되며 Node `fs`, Electron `process.resourcesPath`, `cwd`를 직접 가정하지 않아야 한다.
- 승인된 AC-009 방향은 제품 Skills 번들을 제품 리소스에 배치하고 backend/main이 절대 경로를 시드한 뒤 frontend contribution이 `tier: 'plugin'`으로 반환하는 3층 구조다.
- Electron은 `extraResources` 또는 동등한 패키징 설정으로 asar 외부 읽기 리소스를 만들어야 한다. Browser는 backend/서버 디스크의 번들 경로를 사용한다.
- 구현 전 미확정인 핵심은 backend/main 경로를 frontend에 전달하는 채널이다. 후보는 `EnvVariablesServer` 기반 환경 변수, 전용 backend RPC, preference/config 경로다. 이 선택은 `adr/cocrates-skills-runtime-path-channel.md`에서 별도 승인받는다.

### `getSkillFileContent`

- `docs/theia/extending-get-skill-file-content.md`는 upstream `GetSkillFileContent` 식별자를 제품 확장에서 `rebind`하고 새 provider의 `getTool()` 전체를 제공하도록 요구한다.
- tool ID는 `getSkillFileContent`로 유지해야 기존 `~{getSkillFileContent}` 프롬프트와 연결된다.
- 제품 확장은 `SkillService`와 `FileService`를 사용해 `SKILL.md`에는 `parseSkillFile`을 적용하고 보조 파일에는 원문을 반환한다.
- path는 skill root 상대 경로로 정규화하고 절대 경로·드라이브 문자·root 탈출·디렉터리 읽기를 거부해야 한다. 오류는 기존 호출 계약에 맞는 JSON 문자열로 반환한다.
- `@theia/ai-ide` deep import와 실제 `GetSkillFileContent` 바인딩 여부는 구현 package 의존성과 모듈 로드 순서에서 검증해야 한다.

## 초기 구현 순서

1. 런타임 경로 채널을 결정하고 ADR을 승인한다.
2. 필요한 Theia AI 의존성과 Agent/Skill API import를 실제 설치 구조에 맞춘다.
3. 생성 prompt와 Cocrates ChatAgent를 제품 extension에 추가한다.
4. Skill contribution 및 Browser/Electron 경로 시드를 추가한다.
5. 기존 tool provider를 rebind하고 단위·통합 검증을 추가한다.

## 근거

- `spec/cocrates-ai-agent-skills.md` — R-011~R-020, C-001~C-007
- `docs/theia/adding-ai-agents.md`
- `docs/theia/shipping-ai-skills.md`
- `docs/theia/extending-get-skill-file-content.md`
- `theia-extensions/product/package.json`
- `theia-extensions/product/src/browser/theia-ide-frontend-module.ts`
