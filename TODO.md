# TODO: Cocrates AI Agent·Skills 구현 및 검증

> **Project root:** `theia-ide`
> **Current sprint:** sprint-04 — [Cocrates AI Agent·Skills 구현 및 검증](./scrum/sprint-04.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 1    | 6    | 0       | 0       |

**Sprint goal:** 승인된 PB-007 Spec을 구현하고 Browser·Stable Electron·Electron Next에서 Cocrates Agent·Skills·도구 계약을 검증한다.
**Current focus:** T-002
**Recommended next:** T-002 — Skills 런타임 경로 시드 채널 결정

## Tasks

- [x] **T-001** — 기존 AI Agent·Skills API와 제품 확장 구현 경계 조사
  - Phase: implementation discovery
  - Artifact: `docs/cocrates/agent-skills-implementation-notes.md`
  - Depends: —
  - Notes: 승인된 Spec과 저장소의 기존 API/DI/package 구조를 대조해 구현 위치와 검증 진입점을 기록했다.
- [ ] **T-002** — Skills 런타임 경로 시드 채널 결정
  - Phase: design decision
  - Artifact: `adr/cocrates-skills-runtime-path-channel.md`
  - Depends: T-001
  - Notes: 구현 전 사용자 결정 게이트. 제품 번들 경로를 backend/main에서 frontend discovery tier로 전달하는 채널의 대안을 비교하고 승인받는다.
- [ ] **T-003** — Cocrates ChatAgent 및 생성 시스템 프롬프트 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/`
  - Depends: T-002
  - Notes: `AbstractStreamParsingChatAgent`, Agent·ChatAgent 등록, default preference, `agent1.md` 빌드 생성 소스를 구현한다.
- [ ] **T-004** — Skills 번들·발견·타깃 패키징 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/`, `applications/`
  - Depends: T-002, T-003
  - Notes: 실제 사용자 제공 전까지 `adr`, `todo`, `sdd` 본문은 만들거나 복사하지 않는다. 제품 Skills 경로·contribution·asar 외부 리소스 계약을 구현한다.
- [ ] **T-005** — `getSkillFileContent` 확장 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/`
  - Depends: T-001, T-002
  - Notes: 기존 tool ID와 `SKILL.md` 호환성을 유지하며 path, 보조 파일 원문, 경로 가드, 오류 JSON, DI rebind를 구현한다.
- [ ] **T-006** — PB-007 구현·패키징·검증 기록
  - Phase: verification
  - Artifact: `verification/cocrates-ai-agent-skills.md`
  - Depends: T-003, T-004, T-005
  - Notes: Browser·Stable Electron·Electron Next 및 가능한 lint/build/package/E2E 증거를 Spec 요구사항과 대조한다.
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
