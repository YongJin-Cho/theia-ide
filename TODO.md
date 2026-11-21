# TODO: Cocrates AI Agent·Skills 패키징 요구사항 확정

> **Project root:** `theia-ide`
> **Current sprint:** sprint-03 — [Cocrates AI Agent·Skills 패키징 요구사항 확정](./scrum/sprint-03.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 0    | 8    | 0       | 0       |

**Sprint goal:** Cocrates Default Chat Agent와 내장 Skills 배포를 위한 승인된 Spec과 구현 backlog를 확정한다.
**Current focus:** T-001
**Recommended next:** T-001 — PRD 검토 및 승인

## Tasks

- [ ] **T-001** — PRD 작성 및 승인
  - Phase: ① PRD
  - Artifact: `spec/PRD.md`
  - Depends: —
  - Notes: 기존 Product Template PRD에 PB-007의 Cocrates Agent·Skills 패키징 delta를 추가했다. 사용자 승인 대기.
- [ ] **T-002** — Blocking AC 식별 및 승인
  - Phase: ② AC identification
  - Artifact: `spec/AC.md`
  - Depends: T-001
  - Notes: PRD 승인 후 수행
- [ ] **T-003** — AC별 결정(ADR 또는 Direct Input)
  - Phase: ③ AC review
  - Artifact: `spec/AC.md`, `adr/`
  - Depends: T-002
  - Notes: 모든 blocking AC를 Dependency Order에 따라 정리
- [ ] **T-004** — ASR 통합 및 승인
  - Phase: ④ ASR consolidation
  - Artifact: `spec/ASR.md`
  - Depends: T-003
  - Notes: PRD와 설계 완료 AC의 결과를 통합
- [ ] **T-005** — 구현·검증 Spec 작성
  - Phase: ⑤ Spec writing
  - Artifact: `spec/cocrates-ai-agent-skills.md`
  - Depends: T-004
  - Notes: R-* / C-* 요구사항과 타깃별 패키징 계약 작성
- [ ] **T-006** — Spec review 및 승인
  - Phase: ⑥ Spec review
  - Artifact: `spec-review/cocrates-ai-agent-skills.md`
  - Depends: T-005
  - Notes: 승인된 Spec을 구현 SSOT로 확정
- [ ] **T-007** — PB-007 backlog encode
  - Phase: backlog encode
  - Artifact: `scrum/product-backlog.md`
  - Depends: T-006
  - Notes: 승인된 Spec 기반 구현·검증 DoD를 backlog에 반영
- [ ] **T-008** — Sprint Boundary → sprint-04
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-03.md`, `scrum/PROMPTS-03.md`
  - Depends: T-001, T-002, T-003, T-004, T-005, T-006, T-007
  - Notes: end-of-sprint gate (review + go-ahead) → board와 prompts archive, backlog update, 다음 구현 스프린트 계획

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|--------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |
| 01 | Cocrates 전체 타깃 리브랜딩 요구사항 확정 | 현재 세션 | [`TODO-01.md`](./scrum/TODO-01.md), [`PROMPTS-01.md`](./scrum/PROMPTS-01.md) |
| 02 | Cocrates 브랜딩 구현·검증 | 2026-11-21 | [`TODO-02.md`](./scrum/TODO-02.md), [`PROMPTS-02.md`](./scrum/PROMPTS-02.md) |

## Notes

- sprint-03 계획은 승인되었고 Spec→backlog 실행 보드를 시드했다.
- 실제 `adr`, `todo`, `sdd` 스킬 명세 본문은 사용자 제공 전까지 작성·복사하지 않는다.
- PB-007 구현은 sprint-03의 Spec 승인과 Boundary 이후 다음 Backlog→Implementation 스프린트에서 수행한다.
