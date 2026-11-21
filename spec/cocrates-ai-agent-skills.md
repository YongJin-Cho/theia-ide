# Cocrates AI Agent·Skills 구현 및 검증 Spec

Cocrates를 Browser, Stable Electron, Electron Next의 Default Chat Agent로 제공하고, 제품 소유 Skills와 시스템 프롬프트를 배포 가능한 형태로 통합한다. 이 문서는 구현·검증 단계의 SSOT이며, PRD와 승인된 ASR의 결정 내용을 독립적으로 기술한다.

## Context

- Cocrates 제품은 `theia-extensions/product`를 중심으로 Theia 애플리케이션과 제품 기능을 통합한다.
- 사용자가 제공할 `adr`, `todo`, `sdd` Skills의 실제 본문은 이번 범위에서 만들거나 복사하지 않는다. 다만 제공 후 발견·배포할 디렉터리 계약은 확정한다.
- `docs/cocrates/agent1.md`는 사용자 소유 시스템 프롬프트의 단일 원본이며, 런타임 파일이 아니라 빌드 생성 소스로 연결한다.
- 관련 조사 문서와 승인 근거는 `spec/ASR.md`, `docs/theia/adding-ai-agents.md`, `docs/theia/shipping-ai-skills.md`, `docs/theia/extending-get-skill-file-content.md`에 있다.

## Requirements

- R-001: `applications/browser`, `applications/electron`, `applications/electron-next`는 하나의 Eclipse Theia IDE Product Template의 배포 타깃으로 동작해야 하며, Electron Next는 별도 제품 계약이 아닌 공유 IDE·확장·플러그인 계약을 사용하는 릴리스 채널/제품 변형이어야 한다. 타깃별 branding variant, 업데이트 채널, URI scheme, configuration folder, 앱 식별자는 설정으로 분리한다. ← ASR-001; ASR-002; AC-001
- R-002: `theia-extensions/product`는 이 저장소의 Browser/Electron 제품 타깃이 공유하는 제품 고유 Theia 확장으로 branding, Getting Started, About Dialog, Help 메뉴, AI Registry 설정 및 Electron icon contribution을 제공해야 한다. 애플리케이션의 일반적인 내부 서비스 override를 제품 계약으로 보장하지 않으며, 타깃별 기능 차이는 설정 또는 별도 Theia 확장으로 분리한다. ← ASR-003; AC-002
- R-003: Updater 기능은 Electron 제품 타깃에 적용되는 타깃 특화 확장으로 제공하고 Browser의 필수 계약으로 만들지 않아야 한다. ← ASR-004; AC-002
- R-004: Launcher 기능은 AppImage 배포의 Electron/Linux 타깃에 적용되는 확장으로 제공하고 Browser의 필수 계약으로 만들지 않아야 한다. ← ASR-005; AC-002
- R-005: 채택자에게 앱 이름, 아이콘, URI scheme, configuration folder, Electron app ID, splash screen, 제품별 package 설정 및 플러그인/확장 조합을 공식 커스터마이징 표면으로 제공해야 한다. 제품 기능을 바꾸기 위한 임의의 application DI rebind는 공식 채택 계약이 아니다. ← ASR-006; AC-003
- R-006: 저장소는 Yarn/Lerna 루트 작업으로 개발·프로덕션 빌드, 플러그인 다운로드, Browser 실행, Electron 패키징 및 preview, lint와 test 흐름을 재현할 수 있어야 한다. ← ASR-007
- R-007: Spec과 구현의 일치는 파일·설정·스크립트 정적 대조를 기본 증거로 남기고, 가능한 경우 `yarn lint`, `yarn test`, 대상 build, Browser 기동, Electron preview package 및 Electron E2E 결과를 추가해야 한다. 실행 불가 항목은 통과로 처리하지 않고 실행 불가 사유와 정적 대조 근거를 별도로 기록해야 한다. ← ASR-009; AC-004
- R-008: Stable 타깃은 앱 식별자 `com.cocrates.ide`, URI scheme `cocrates`, configuration folder `.cocrates`를 사용하고 Electron Next는 `com.cocrates.ide.next`, `cocrates-next`, `.cocrates-next`를 사용해야 한다. 기존 `.theia-ide` 사용자 데이터는 새 디렉터리로 자동 마이그레이션하지 않는다. ← ASR-010; AC-005
- R-009: 사용자에게 보이는 UI, 패키징, CLI, 문서, 배포 메타데이터의 Theia 제품 문자열은 Cocrates 또는 `Cocrates Next`로 제공해야 한다. `@theia/*` 패키지명, Theia API, 업스트림 빌더·도구명 등 호환성에 필요한 내부 식별자는 유지하되 사용자 표면이나 제품 배포 식별자로 노출하지 않는다. ← ASR-011; AC-006
- R-010: 제품 배포 저장소는 `https://github.com/cocrates/theia-ide`, Electron Next updater release 경로는 해당 저장소의 `/releases/download/next`, Docker image tag는 `cocrates-ide`를 사용해야 한다. 제공되지 않은 CDN·registry 호스트는 추정하지 않는다. ← ASR-012; AC-007
- R-011: 제품 확장은 `AbstractStreamParsingChatAgent` 기반 Cocrates ChatAgent를 구현하고 `Agent`와 `ChatAgent`를 모두 등록해야 한다. `ai-features.chat.defaultChatAgent` preference는 Cocrates Agent ID를 가리켜 mention 없는 채팅에서도 Cocrates가 기본 Agent로 선택되게 해야 하며, 별도 Agent mode는 추가하지 않는다. ← ASR-013; AC-008; `adr/cocrates-chat-agent-registration.md`
- R-012: 제품 소유 `adr`, `todo`, `sdd` Skills는 각각 표준 skill root 아래에 제공될 수 있어야 하며, root에는 `SKILL.md`와 사용자가 제공하는 `workflow/`, `references/`, `scripts/`, `assets/` 등의 보조 파일을 둘 수 있어야 한다. 각 `SKILL.md`는 유효한 frontmatter와 Skills discovery 계약을 따른다. 실제 세 Skills 본문은 사용자 제공 전 생성·복사하지 않는다. ← ASR-014; AC-009
- R-013: 제품은 번들 Skills 디렉터리를 제품 리소스로 포함하고, backend/main이 타깃별 런타임 경로를 시드하며, frontend의 `SkillDirectoryContribution`이 해당 경로를 plugin discovery tier에 제공해야 한다. 제품 번들, 사용자 Skills, workspace Skills는 서로 다른 discovery tier/경로로 유지한다. ← ASR-014; AC-009; `adr/cocrates-skills-packaging.md`
- R-014: Electron 배포물은 Skills 번들을 asar 외부의 읽을 수 있는 리소스로 제공해야 하며, Browser·Stable Electron·Electron Next 개발 실행과 패키지 실행에서 동일한 Skills discovery 계약을 검증할 수 있어야 한다. ← ASR-014; ASR-008; AC-009
- R-015: 빌드 단계는 `docs/cocrates/agent1.md`를 Markdown 의미를 변경하지 않은 생성 TypeScript 또는 동등한 번들 소스로 변환해야 하며, 원본 변경은 다음 빌드에서 생성 결과에 반영되어야 한다. ChatAgent는 생성된 결과만 system prompt로 사용하고 workspace·설치 경로의 원본 파일이나 수동 복사본을 런타임에 읽지 않아야 한다. ← ASR-015; AC-010
- R-016: 제품 확장은 새 tool을 추가하거나 upstream을 수정하지 않고 기존 `getSkillFileContent` tool ID를 유지한 채 `GetSkillFileContent`를 DI rebind해야 한다. `bindToolProvider`로 동일 ID의 두 번째 provider를 추가하지 않는다. ← ASR-016; AC-011; `docs/theia/extending-get-skill-file-content.md`
- R-017: `getSkillFileContent`는 필수 문자열 `skillName`과 선택 문자열 `path`를 받으며 `skillName`은 기존처럼 qualified name 또는 plain name으로 스킬을 찾는다. `path`는 skill root 상대 경로이고 생략, `SKILL.md`, `./SKILL.md`는 기존처럼 YAML frontmatter를 제거한 `SKILL.md` 본문을 반환한다. ← ASR-016; AC-011
- R-018: `path`가 `SKILL.md` 이외의 유효한 skill-root 상대 파일을 가리키면 frontmatter를 파싱하지 않은 원문을 반환해야 한다. `workflow/01-prd.md`, `references/…`, `scripts/…`, `assets/…`와 같은 보조 파일을 읽을 수 있어야 하며 디렉터리 자체는 읽지 않아야 한다. ← ASR-016; AC-011
- R-019: 파일 경로 처리는 path separator 정규화와 `.`/`..` 정규화를 적용한 뒤 skill root를 기준으로 해석해야 한다. 절대 경로, 드라이브 문자, 정규화 후 skill root 밖으로 나가는 경로 및 심볼릭 링크를 통한 root 탈출은 거부해야 한다. 대상이 skill root 내부인지 `isEqualOrParent`와 가능한 real-path 확인으로 검증한다. ← ASR-016; AC-011
- R-020: 오류는 기존 tool 호출 형식에 맞는 JSON 문자열로 반환해야 한다. 스킬 미존재는 `{ "error": "Skill not found: …" }`, 파일 미존재는 `{ "error": "File not found: …" }`, skill root 탈출은 `{ "error": "Path escapes skill directory: …" }` 의미를 사용한다. 디렉터리, 절대 경로 및 기타 읽기 실패도 성공 파일 본문으로 반환하지 않는다. ← ASR-016; AC-011

## Constraints

- C-001: Theia upstream 자체의 소스는 수정하지 않고 제품 확장 rebind와 애플리케이션 통합으로 구현해야 한다. ← PRD; ASR-003; ASR-016
- C-002: Yarn 1.x/Lerna workspace, 저장소가 참조하는 Theia/Node.js 버전 및 `postinstall`의 `theia-patch` 흐름을 유지해야 한다. ← ASR-008
- C-003: Electron asar의 읽기 전용 특성과 native binary/resource unpacking 제약을 준수하며, Skills 보조 파일이 필요한 번들 리소스는 asar 외부 읽기 경로에 둔다. ← ASR-008; ASR-014
- C-004: 제품 확장은 `@theia/*` API와 tool ID 호환성을 보존해야 하며 `~{getSkillFileContent}`를 사용하는 기존 Agent 프롬프트·Capabilities와 연결이 끊기지 않아야 한다. ← ASR-016; AC-011
- C-005: 사용자가 제공하기 전 `adr`, `todo`, `sdd`의 실제 SKILL.md, workflow, references 및 기타 보조 파일을 임의로 생성하거나 복사하지 않는다. ← ASR-014; AC-009
- C-006: 구체적으로 제공되지 않은 CDN·registry 호스트, Skills 런타임 경로 시드 채널, 새로운 Agent mode는 이번 Spec에서 추정하거나 확정하지 않는다. 경로 시드 채널은 구현 전 별도 설계 대상으로 남긴다. ← ASR-014; ASR-012
- C-007: 검증은 Browser, Stable Electron, Electron Next 및 Electron 패키지 경로별로 수행하며, 실행할 수 없는 검증은 성공으로 표시하지 않고 증거·사유를 기록한다. ← ASR-009; PRD

## Out of Scope

- `adr`, `todo`, `sdd` 스킬의 실제 명세 본문 작성·복사
- Theia upstream 직접 수정 또는 upstream에 새 tool ID 추가
- Cocrates Agent의 별도 Agent mode 설계
- 제공되지 않은 CDN·registry 호스트나 Skills 런타임 경로 시드 채널의 임의 확정
- 새로운 AI 모델, 외부 배포 인프라 또는 제품 기능의 범위 확장

## Open Questions

- Skills 번들 절대 경로를 Browser/backend와 Electron main에서 frontend로 전달하는 구체 채널은 구현 전에 확정해야 한다. 이는 AC-009 ADR에서 의도적으로 후속 관심사로 남겼으며 현재 Spec의 나머지 요구사항을 막지 않지만, 구현 착수 전 설계 결정이 필요하다.

## Related

- `spec/PRD.md`
- `spec/AC.md`
- `spec/ASR.md`
- `adr/cocrates-chat-agent-registration.md`
- `adr/cocrates-skills-packaging.md`
- `docs/theia/adding-ai-agents.md`
- `docs/theia/shipping-ai-skills.md`
- `docs/theia/extending-get-skill-file-content.md`
