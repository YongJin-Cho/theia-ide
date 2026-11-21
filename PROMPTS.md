# sprint-03 대화 로그

> **스프린트 계획:** [`scrum/sprint-03.md`](./scrum/sprint-03.md)
> **실행 보드:** [`TODO.md`](./TODO.md)

## TURN-001

### User Request
> Default Chat Agent로 Cocrates를 추가하고, 패키지에 adr/todo/sdd 스킬을 포함해서 배포하도록 해줘. 다음 sprint로 진행해줘.
> docs/theia/adding-ai-agents.md, docs/theia/shipping-ai-skills.md의 내용을 참고하고, docs/cocrates/agent1.md를 시스템 프롬프트로 사용하며, docs/theia/extending-get-skill-file-content.md를 참고해 getSkillFileContent 도구를 확장한다. 3개 스킬 명세는 폴더가 만들어지면 나중에 복사한다.

### Cocrates Response
- sprint-03을 새 AI Agent·Skills 기능의 **Spec→backlog 스프린트**로 계획했다.
- `PB-007`을 제품 백로그에 추가하고, 요구사항 확정·아키텍처 결정·Spec 작성·구현 DoD 기록을 스프린트 범위로 설정했다.
- 실제 `adr`, `todo`, `sdd` 스킬 명세 본문은 사용자가 나중에 제공한다는 제약을 계획과 백로그에 기록했다.
- `sprint-03.md`를 작성했지만 Sprint plan approval 전이므로 `TODO.md` 실행 보드는 아직 시드하지 않았다.
- **Asked user:** sprint-03 계획을 승인하고 Spec→backlog 실행을 시작할지 결정해 달라.

## TURN-002

### User Request
> sprint-03 계획을 승인하고 Spec→backlog 실행을 시작해줘.

### Cocrates Response
- sprint-03 계획 승인을 기록했다.
- `TODO.md`를 T-001부터 T-008까지의 Spec→backlog 실행 보드로 시드했다.
- 기존 `spec/PRD.md`에 PB-007의 AI Agent·Skills 변경 범위와 성공 기준을 추가했다.
- 현재 T-001 PRD 검토 및 승인 단계로 이동했다.
- **Asked user:** `spec/PRD.md`의 AI Agent·Skills 변경 범위를 검토하고 다음 AC 식별 단계로 진행할지 결정해 달라.

## TURN-003

### User Request
> `spec/PRD.md`를 승인하고 다음 AC 식별 단계로 진행해줘.

### Cocrates Response
- PRD 승인 상태를 기록하고 T-001을 완료 처리했다.
- 기존 AC registry를 보존한 채 신규 blocking AC를 append했다.
- 신규 AC는 Cocrates ChatAgent 등록·기본 Agent 선택(AC-008), 내장 Skills 배치·발견·패키징(AC-009), 시스템 프롬프트 소스 연결(AC-010), `getSkillFileContent` 보조 파일 API·경로 안전성(AC-011)이다.
- Dependency Order에 신규 AC 검토 순서를 추가하고 현재 T-002로 이동했다.
- **Asked user:** `spec/AC.md`의 신규 AC 목록과 Dependency Order를 검토하고 AC 목록을 승인할지 결정해 달라.

## TURN-004

### User Request
> AC 목록과 Dependency Order를 승인하고 다음 단계로 진행해줘.

### Cocrates Response
- AC 목록 승인 상태를 기록하고 T-002를 완료 처리했다.
- AC-008을 `reviewing`으로 전환하고 `adr/cocrates-chat-agent-registration.md`를 `proposed`로 작성했다.
- Option A(제품 확장 코드 기반 ChatAgent + 기본 Agent preference)와 Option B(파일 기반 Custom Agent)를 비교했으며 Option A를 권장한다.
- **Asked user:** AC-008 ADR에서 Option A를 선택하고 승인할지 결정해 달라. 승인하면 AC-008을 설계 완료하고 AC-009 Skills 패키징 전략 검토로 진행한다.

## TURN-005

### User Request
> AC-008에 대해 Option A를 선택한다.

### Cocrates Response
- `adr/cocrates-chat-agent-registration.md`를 approved로 기록하고 Option A를 Decision으로 확정했다.
- AC-008을 designed로 전환했다. Cocrates는 제품 확장 코드 기반 ChatAgent로 등록하고 `ai-features.chat.defaultChatAgent`로 기본 Agent가 된다.
- Agent mode는 별도 추가하지 않는 것으로 직접 해결했다.
- 다음 AC-009를 reviewing으로 전환하고 `adr/cocrates-skills-packaging.md`를 proposed로 작성했다.
- Option A(번들 디렉터리 + SkillDirectoryContribution + 런타임 경로 시드), Option B(config dir 복사), Option C(preference 절대 경로)를 비교했으며 Option A를 권장한다.
- **Asked user:** AC-009 ADR에서 Option A를 선택하고 승인할지 결정해 달라.
