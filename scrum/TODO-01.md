# TODO: Cocrates 전체 타깃 리브랜딩 요구사항 확정

> **Project root:** `theia-ide`
> **Current sprint:** sprint-01 — [Cocrates 전체 타깃 리브랜딩 요구사항 확정](./scrum/sprint-01.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 10   | 0    | 0       | 0       |

**Sprint goal:** Browser, Stable Electron, Electron Next를 Cocrates 브랜드로 전환하기 위한 승인된 요구사항과 Spec을 확정한다.
**Current focus:** —
**Recommended next:** —

## Tasks

- [x] **T-001** — 리브랜딩 PRD delta 작성
  - Phase: SDD ① PRD
  - Artifact: `spec/PRD.md`
  - Depends: —
  - Notes: Browser·Stable Electron·Electron Next(`Cocrates Next`) 전체 타깃과 리브랜딩 범위를 제품 수준으로 추가한다.
- [x] **T-002** — PRD delta 승인
  - Phase: SDD ① PRD gate
  - Artifact: `spec/PRD.md`
  - Depends: T-001
  - Notes: 사용자 승인 후 다음 단계로 진행한다.
- [x] **T-003** — 리브랜딩 blocking AC 식별
  - Phase: SDD ② AC identification
  - Artifact: `spec/AC.md`
  - Depends: T-002
  - Notes: 식별자·URI scheme·설정 폴더·패키징·브랜드 리소스·CI/문서의 사용자 결정을 식별한다.
- [x] **T-004** — AC 목록 및 Dependency Order 승인
  - Phase: SDD ② AC gate
  - Artifact: `spec/AC.md`
  - Depends: T-003
  - Notes: 사용자 승인 후 AC별 설계를 시작한다.
- [x] **T-005** — 리브랜딩 AC 결정
  - Phase: SDD ③ AC review
  - Artifact: `spec/AC.md` 또는 `adr/`
  - Depends: T-004
  - Notes: 모든 blocking AC를 Dependency Order에 따라 설계 또는 deferred로 닫는다.
- [x] **T-006** — ASR delta 통합 및 승인
  - Phase: SDD ④ ASR consolidation
  - Artifact: `spec/ASR.md`
  - Depends: T-005
  - Notes: 기존 ASR-001~ASR-009에 승인된 리브랜딩 결정 ASR-010~ASR-012를 통합하고 사용자 승인을 받았다.
- [x] **T-007** — 전용 Cocrates 브랜딩 Spec 검토 승인
  - Phase: SDD ⑤–⑥ Spec
  - Artifact: `spec/cocrates-branding.md`, `spec-review/cocrates-branding.md`
  - Depends: T-006
  - Notes: 사용자가 `spec/cocrates-branding.md`를 구현·검증 SSOT로 승인했다. Review 결과는 11 pass, 0 fail, 0 needs-clarification이다.
- [x] **T-008** — `PB-006` 백로그 반영 및 스프린트 결과 정리
  - Phase: backlog encoding
  - Artifact: `scrum/product-backlog.md`, `scrum/sprint-01.md`
  - Depends: T-007
  - Notes: `PB-006`에 승인된 `spec/cocrates-branding.md`와 `spec-review/cocrates-branding.md`를 기록했다. 구현·패키징·런타임 검증은 다음 실행 스프린트 범위로 유지한다.
- [x] **T-009** — 스프린트 완료 검토
  - Phase: sprint completion gate
  - Artifact: `PROMPTS.md`, `TODO.md`
  - Depends: T-008
  - Notes: 사용자가 sprint-01 완료 검토를 승인했다. 목표 달성, PB-006 Spec 확정·백로그 반영, 구현 작업의 다음 스프린트 이월을 확인했다.
- [x] **T-010** — Sprint Boundary → sprint-02
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-01.md`, `scrum/PROMPTS-01.md`
  - Depends: T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008, T-009
  - Notes: 완료된 sprint-01 보드와 대화 로그를 보관하고 PB-006을 닫았다. 다음 구현 스프린트 계획은 별도 승인 게이트다.

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|--------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |

## Notes

- 현재 스프린트는 Spec→backlog 변경 종류이며, 승인된 리브랜딩 Spec 확정 전에는 제품 구현을 변경하지 않는다.
- Electron Next는 별도 채널 특성을 유지하는 `Cocrates Next` 제품 변형으로 다룬다.
- 구현·패키징·런타임 검증은 리브랜딩 Spec 승인 후 다음 실행 스프린트의 범위로 계획한다.
