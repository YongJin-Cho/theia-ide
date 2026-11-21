# TODO: Cocrates 구조화 최종 응답 및 메시지 압축

> **Project root:** `theia-ide`
> **Current sprint:** sprint-05 — [Cocrates 구조화 최종 응답 및 메시지 압축](./scrum/sprint-05.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 1    | 9    | 0       | 0       |

**Sprint goal:** Cocrates Agent의 구조화 JSON 최종 응답과 `answer` 표시, `session`·`commit`·`compaction` side effect를 구현·검증한다.
**Current focus:** T-002
**Recommended next:** T-002 — PRD 승인 게이트

## Tasks

- [x] **T-001** — PB-008 delta PRD 작성
  - Phase: PRD
  - Artifact: `spec/PRD.md`
  - Depends: —
  - Notes: `agent2.md` 기반 구조화 최종 응답, side effect, compaction 이력 요구사항을 기존 PRD에 추가했다.
- [ ] **T-002** — PRD 승인 게이트
  - Phase: PRD gate
  - Artifact: `spec/PRD.md`
  - Depends: T-001
  - Notes: 사용자 go-ahead 후 AC 식별을 같은 턴에 시작한다.
- [ ] **T-003** — PB-008 blocking AC 식별
  - Phase: AC identification
  - Artifact: `spec/AC.md`
  - Depends: T-002
- [ ] **T-004** — AC 목록 승인 게이트
  - Phase: AC gate
  - Artifact: `spec/AC.md`
  - Depends: T-003
- [ ] **T-005** — blocking AC 순차 검토 및 ADR/Direct Input 결정
  - Phase: AC review
  - Artifact: `spec/AC.md`, `adr/`
  - Depends: T-004
- [ ] **T-006** — ASR 통합
  - Phase: ASR consolidation
  - Artifact: `spec/ASR.md`
  - Depends: T-005
- [ ] **T-007** — PB-008 Spec 작성
  - Phase: Spec writing
  - Artifact: `spec/cocrates-structured-final-response.md`
  - Depends: T-006
- [ ] **T-008** — Spec review 및 승인
  - Phase: Spec review
  - Artifact: `spec-review/cocrates-structured-final-response.md`
  - Depends: T-007
- [ ] **T-009** — PB-008 backlog 기록 및 Sprint Boundary 준비
  - Phase: backlog encoding
  - Artifact: `scrum/product-backlog.md`
  - Depends: T-008
- [ ] **T-010** — Sprint Boundary → sprint-06
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-05.md`, `scrum/PROMPTS-05.md`
  - Depends: T-009
  - Notes: end-of-sprint gate (review + go-ahead) → archive board + prompts, update backlog, load next sprint

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|--------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |
| 01 | Cocrates 전체 타깃 리브랜딩 요구사항 확정 | 현재 세션 | [`TODO-01.md`](./scrum/TODO-01.md), [`PROMPTS-01.md`](./scrum/PROMPTS-01.md) |
| 02 | Cocrates 브랜딩 구현·검증 | 2026-11-21 | [`TODO-02.md`](./scrum/TODO-02.md), [`PROMPTS-02.md`](./scrum/PROMPTS-02.md) |
| 03 | Cocrates AI Agent·Skills 패키징 요구사항 확정 | 2026-11-21 | [`TODO-03.md`](./scrum/TODO-03.md), [`PROMPTS-03.md`](./scrum/PROMPTS-03.md) |
| 04 | Cocrates AI Agent·Skills 구현 및 검증 | 2026-11-21 | [`TODO-04.md`](./scrum/TODO-04.md), [`PROMPTS-04.md`](./scrum/PROMPTS-04.md) |

## Notes

- sprint-05 계획을 사용자가 승인했고, 승인 즉시 Spec→backlog 실행 보드를 시드했다.
- PB-008은 기존 PB-007 Cocrates Agent 구현을 확장하는 delta 요구사항이다.
- `agent2.md`의 원본 경로는 사용자 요청의 `~/docs` 대신 저장소에 보관된 `docs/cocrates/agent2.md`를 기준으로 한다.
