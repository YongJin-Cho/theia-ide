# Spec Review: Cocrates 구조화 최종 응답 및 메시지 이력

**Spec:** `theia-ide/spec/cocrates-structured-final-response.md` (aligned with `PRD.md`)
**Reviewed:** 2026-11-21
**Summary:** 8 pass, 0 fail, 1 needs-clarification

## SSOT Sufficiency

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | Blocking ASRs encoded in R-NNN / C-NNN (substance) | pass | ASR-017~ASR-019가 R-001~R-014와 C-001~C-006에 구체적인 동작·제약으로 반영되었다. |
| 2 | No ID-/path-only bullets (provenance after statement OK) | pass | 모든 provenance 앞에 독립적으로 이해 가능한 요구사항 문장이 있다. |
| 3 | Every R-NNN is testable; every C-NNN present and stable | pass | R-001~R-014와 C-001~C-006이 중복 없이 존재하며 검증 inventory로 사용할 수 있다. |

## Pre-Implementation Design Gaps

- 없음. prompt-only JSON, `answer` UI 경계, 자동 side effect, compaction 저장·순서가 승인된 ADR 결정으로 고정되어 있다.

## Cross-Document Inconsistencies

- 없음. PRD Sprint-05 범위, ASR-017~ASR-019, AC-012~AC-014, 승인된 ADR 결정이 Spec과 일치한다.

## Ambiguities & Clarifications Needed

- **needs-clarification — Spec §Open Questions:** 실제 ChatService 세션 제목 API, git/SCM 실행 adapter, 기존 ChatResponse content/deserializer 활용 가능 여부는 구현 단계의 현재 Theia 1.77 API 확인이 필요하다. 이는 기능 방향을 바꾸지 않는 구현 선택이며, 구현 전 API 조사와 검증 기록으로 해소한다.

## Recommended Next Steps

- **Pass + user approves Spec →** PB-008 backlog의 Spec 경로를 갱신하고 Sprint Boundary에서 Spec→backlog sprint를 종료한다.
- 다음 구현 sprint에서 승인된 Spec만 소비해 Agent 파서·side effect·compaction 이력을 구현한다.
- 구현 시 Open Questions의 adapter 조사를 먼저 수행하고, 결정이 기능 요구사항을 바꾸면 Spec을 다시 승인받는다.

## User Review

- **Status:** approved
- **Decision:** 사용자가 Spec을 승인했으며, 이 문서를 PB-008 구현·검증의 SSOT로 사용한다.
- **Date:** 2026-11-21
