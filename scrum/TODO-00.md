# TODO: Eclipse Theia IDE Product Template Spec 정립

> **Project root:** `theia-ide`
> **Current sprint:** sprint-00 — [Eclipse Theia IDE Product Template Spec 정립](./scrum/sprint-00.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 10   | 0    | 0       | 0       |

**Sprint goal:** Eclipse Theia IDE Product Template의 구현을 조사해 제품 Spec과 제품 백로그를 정립하고 구현 일치 여부를 검증한다.
**Current focus:** —
**Recommended next:** —

## Tasks

- [x] **T-001** — 구현 context 추출 및 `AGENTS.md` 작성
  - Phase: implementation context
  - Artifact: `AGENTS.md`
  - Depends: —
  - Notes: 저장소 구조, 패키지 스크립트, Theia 앱/확장 구성, 패키징 제약, 검증 방법을 실제 파일에서 추출한다.
- [x] **T-002** — PRD 작성 및 사용자 검토
  - Phase: SDD ① PRD
  - Artifact: `spec/PRD.md`
  - Depends: T-001
  - Notes: Product Template의 목표·범위·성공 기준을 기록하고 사용자 승인을 받는다.
- [x] **T-003** — AC 식별 및 목록 승인
  - Phase: SDD ② AC identification
  - Artifact: `spec/AC.md`
  - Depends: T-002
  - Notes: PRD에서 사용자 결정이 필요한 구조적 질문을 식별한다.
- [x] **T-004** — AC 검토 및 결정
  - Phase: SDD ③ AC review
  - Artifact: `spec/AC.md` 또는 `adr/`
  - Depends: T-003
  - Notes: 모든 blocking AC를 Dependency Order에 따라 설계 또는 deferred 상태로 닫는다.
- [x] **T-005** — ASR 통합 및 승인
  - Phase: SDD ④ ASR consolidation
  - Artifact: `spec/ASR.md`
  - Depends: T-004
  - Notes: PRD와 확정된 모든 AC 결과를 Spec 작성 기준으로 통합한다.
- [x] **T-006** — Spec 작성 및 검토 승인
  - Phase: SDD ⑤–⑥ Spec
  - Artifact: `spec/applications-integration.md`, `spec/product-extension.md`, `spec/updater-extension.md`, `spec/launcher-extension.md`, `spec-review/`
  - Depends: T-005
  - Notes: 애플리케이션 통합 Spec과 product/updater/launcher 확장 Spec을 분리 작성하고, 각 Spec의 R-NNN/C-NNN 요구사항을 사용자 승인받는다.
- [x] **T-007** — 확정 Spec 기반 제품 백로그 생성 및 완료 처리
  - Phase: backlog encoding
  - Artifact: `scrum/product-backlog.md`
  - Depends: T-006
  - Notes: Spec의 요구사항을 PB-*로 추가하고 이번 저장소에 이미 구현된 것으로 DoD 완료 처리한다.
- [x] **T-008** — Spec과 구현 일치 검증
  - Phase: SDD ⑧ verification
  - Artifact: `verification/boilerplate-context.md`
  - Depends: T-007
  - Notes: 문서/구조 대조와 가능한 lint/build/test 명령으로 검증하고 증거를 남긴다.
- [x] **T-009** — 데모 체크리스트 및 스프린트 결과 정리
  - Phase: demo
  - Artifact: `TODO.md`, `PROMPTS.md`
  - Depends: T-008
  - Notes: 완료 정의와 데모 증거를 최신화한다.
- [x] **T-010** — Sprint Boundary → complete
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-00.md`, `scrum/PROMPTS-00.md`
  - Depends: T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008, T-009
  - Notes: sprint completion 승인 후 보드와 대화 로그를 보관하고 다음 스프린트를 계획한다.

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|--------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |

## Notes

- 현재 스프린트는 Spec→backlog 종류이며, Spec 확정 전까지 제품 기능을 변경하지 않는다.
- `AGENTS.md`는 구현 context의 orientation 문서이고, 최종 요구사항의 SSOT는 승인된 Spec이다.
- sprint-00의 제품 백로그와 검증이 모두 완료되어 다음 제품 스프린트는 필요하지 않다.
