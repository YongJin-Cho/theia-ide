# TODO: Cocrates 구조화 최종 응답 및 메시지 압축

> **Project root:** `theia-ide`
> **Current sprint:** sprint-06 — [Cocrates 구조화 최종 응답 구현 및 검증](./scrum/sprint-06.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 1    | 6    | 0       | 0       |

**Sprint goal:** 승인된 구조화 최종 응답 Spec을 구현하고 제품 확장 경계에서 검증한다.
**Current focus:** T-002
**Recommended next:** T-002 — prompt-only JSON 계약 포함 및 완료 응답 파서 구현

## Tasks

- [x] **T-001** — Cocrates Agent와 Theia Chat/SCM adapter 경계 조사 및 구현 설계
  - Phase: implementation
  - Artifact: `docs/theia/structured-output-side-effects.md`, `docs/theia/message-compaction.md`, `theia-extensions/product/src/`
  - Depends: —
  - Notes: PB-008; Theia 1.77에는 제품 JSON 자동 라우팅 훅이 없고, `AbstractStreamParsingChatAgent.addContentsToResponse`가 제품 확장 경계다. 세션 제목은 `ChatService.renameSession`, provider compaction은 제품 local state와 분리해야 한다. 조사 결과는 기존 `docs/theia/` 문서와 이 보드에 반영했다.

- [ ] **T-002** — prompt-only JSON 계약 포함 및 완료 응답 파서 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/src/`
  - Depends: T-001
  - Notes: PB-008; R-001~R-005, C-001~C-002. fenced/object JSON 추출, answer-only 표시, malformed fallback, 완료 전 side effect 금지를 구현하고 테스트한다.

- [ ] **T-003** — session·commit side effect adapter 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/src/`
  - Depends: T-002
  - Notes: PB-008; R-006~R-009, C-003. 세션 제목 검증, 저장소·staged 상태·message 검증, 성공/실패/거부·idempotency·revert 경계를 구현하고 테스트한다.

- [ ] **T-004** — compaction 저장·복원 및 메시지 순서 구현
  - Phase: implementation
  - Artifact: `theia-extensions/product/src/`
  - Depends: T-002
  - Notes: PB-008; R-010~R-013, C-004~C-005. provider marker와 분리된 제품 상태를 저장하고 user→assistant→user 순서를 재구성하며 UI에는 노출하지 않는다.

- [ ] **T-005** — 기존 Agent·Skills·도구 계약 회귀 점검
  - Phase: demo
  - Artifact: `theia-extensions/product/`, `applications/browser/`, `applications/electron/`, `applications/electron-next/`
  - Depends: T-003, T-004
  - Notes: PB-008; R-014. 기존 기본 Agent, Skills discovery, getSkillFileContent, 일반 도구 및 세 타깃 조립 계약을 확인한다.

- [ ] **T-006** — build/lint 및 가능한 제품 경로 검증
  - Phase: demo
  - Artifact: `verification/cocrates-structured-final-response.md`
  - Depends: T-005
  - Notes: PB-008; C-006. 대상 build/lint/test와 가능한 Browser/Electron 검증을 실행하고 실행 불가 사유를 기록한다.

- [ ] **T-007** — Sprint Boundary → sprint-07
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-06.md`, `scrum/PROMPTS-06.md`
  - Depends: T-001, T-002, T-003, T-004, T-005, T-006
  - Notes: end-of-sprint gate (review + go-ahead) → archive board + prompts, update backlog, load next sprint

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|---------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |
| 01 | Cocrates 전체 타깃 리브랜딩 요구사항 확정 | 현재 세션 | [`TODO-01.md`](./scrum/TODO-01.md), [`PROMPTS-01.md`](./scrum/PROMPTS-01.md) |
| 02 | Cocrates 브랜딩 구현·검증 | 2026-11-21 | [`TODO-02.md`](./scrum/TODO-02.md), [`PROMPTS-02.md`](./scrum/PROMPTS-02.md) |
| 03 | Cocrates AI Agent·Skills 패키징 요구사항 확정 | 2026-11-21 | [`TODO-03.md`](./scrum/TODO-03.md), [`PROMPTS-03.md`](./scrum/PROMPTS-03.md) |
| 04 | Cocrates AI Agent·Skills 구현 및 검증 | 2026-11-21 | [`TODO-04.md`](./scrum/TODO-04.md), [`PROMPTS-04.md`](./scrum/PROMPTS-04.md) |
| 05 | Cocrates 구조화 최종 응답 및 메시지 압축 Spec→backlog | 2026-11-21 | [`TODO-05.md`](./scrum/TODO-05.md), [`PROMPTS-05.md`](./scrum/PROMPTS-05.md) |

## Notes

- sprint-05 Boundary를 승인받아 `scrum/TODO-05.md`, `scrum/PROMPTS-05.md`로 아카이브했다.
- PB-008은 승인된 Spec을 구현하는 sprint-06 범위로 이동했다.
- `agent2.md`의 원본 경로는 사용자 요청의 `~/docs` 대신 저장소에 보관된 `docs/cocrates/agent2.md`를 기준으로 한다.
