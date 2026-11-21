# TODO: Cocrates AI Agent·Skills 구현 및 검증

> **Project root:** `theia-ide`
> **Current sprint:** sprint-04 — [Cocrates AI Agent·Skills 구현 및 검증](./scrum/sprint-04.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 6    | 1    | 0       | 0       |

**Sprint goal:** 승인된 PB-007 Spec을 구현하고 Browser·Stable Electron·Electron Next에서 Cocrates Agent·Skills·도구 계약을 검증한다.
**Current focus:** T-007
**Recommended next:** T-007 — Sprint Boundary → sprint-05

## Tasks

- [x] **T-001** — 기존 AI Agent·Skills API와 제품 확장 구현 경계 조사
  - Phase: implementation discovery
  - Artifact: `docs/cocrates/agent-skills-implementation-notes.md`
  - Depends: —
  - Notes: 승인된 Spec과 저장소의 기존 API/DI/package 구조를 대조해 구현 위치와 검증 진입점을 기록했다.
- [x] **T-002** — Skills 런타임 경로 시드 채널 결정
  - Phase: design decision
  - Artifact: `adr/cocrates-skills-runtime-path-channel.md`
  - Depends: T-001
  - Notes: Option B(전용 backend RPC)를 사용해 `CocratesSkillsPathService`가 번들 Skills 경로를 반환하도록 결정·승인했다.
  - [x] **T-003** — Cocrates ChatAgent 및 생성 시스템 프롬프트 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/`
  - Depends: T-002
  - Notes: `AbstractStreamParsingChatAgent` 기반 Agent를 이중 등록하고 Cocrates default preference를 추가했다. `agent1.md`를 빌드 시 TypeScript prompt fragment로 생성한다. product extension build와 lint를 통과했다.
  - [x] **T-004** — Skills 번들·발견·타깃 패키징 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/`, `applications/`
  - Depends: T-002, T-003
  - Notes: backend RPC `CocratesSkillsPathService`와 frontend `SkillDirectoryContribution`을 연결했다. 개발 경로와 Electron `resources/app/skills` 경로를 지원하고 Stable/Next electron-builder에 asar 외부 리소스를 추가했다. product extension build와 lint를 통과했다.
- [x] **T-005** — `getSkillFileContent` 확장 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/`
  - Depends: T-001, T-002
  - Notes: 기존 `getSkillFileContent` ID를 유지한 DI rebind를 추가했다. `path`로 skill-root 상대 보조 파일을 읽고 `SKILL.md` frontmatter 제거 호환성, 파일/디렉터리 오류, 절대경로·root 탈출 가드를 구현했다. product extension build와 lint를 통과했다.
- [x] **T-006** — PB-007 구현·패키징·검증 기록
  - Phase: verification
  - Artifact: `verification/cocrates-ai-agent-skills.md`
  - Depends: T-003, T-004, T-005
  - Notes: 제품 확장 build/lint와 저장소 lint, Browser production build, Stable/Next Electron 공식 build/package, 양 Electron E2E를 검증 기록에 반영했다. 초기 개별 `tsc -b` 작업의 TS5101 결과와 package 전 9 passing/1 failing 결과는 공식 파이프라인 결과가 아니므로 정정했으며, 최종 공식 E2E는 양 타깃 모두 10 passing이다. 사용자 제공 `adr`·`todo`·`sdd` Skills와 Electron 패키지의 `resources/app/skills` 포함도 확인했다. Browser UI smoke는 launch configuration의 debug adapter 제약으로 보류했다.
- [ ] **T-007** — Sprint Boundary → sprint-05
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-04.md`, `scrum/PROMPTS-04.md`
  - Depends: T-001, T-002, T-003, T-004, T-005, T-006
  - Notes: end-of-sprint gate (review + go-ahead) → board와 prompts archive, backlog update, 다음 계획

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|--------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |
| 01 | Cocrates 전체 타깃 리브랜딩 요구사항 확정 | 현재 세션 | [`TODO-01.md`](./scrum/TODO-01.md), [`PROMPTS-01.md`](./scrum/PROMPTS-01.md) |
| 02 | Cocrates 브랜딩 구현·검증 | 2026-11-21 | [`TODO-02.md`](./scrum/TODO-02.md), [`PROMPTS-02.md`](./scrum/PROMPTS-02.md) |
| 03 | Cocrates AI Agent·Skills 패키징 요구사항 확정 | 2026-11-21 | [`TODO-03.md`](./scrum/TODO-03.md), [`PROMPTS-03.md`](./scrum/PROMPTS-03.md) |

## Notes

- sprint-04 계획을 사용자가 승인했으며 Backlog→Implementation 실행 보드를 시드했다.
- T-002는 Skills 런타임 경로 시드 채널을 구현 전에 확정하는 사용자 결정 게이트다.
- 실제 `adr`, `todo`, `sdd` 스킬 명세 본문은 사용자 제공 전까지 작성·복사하지 않는다.
