# Spec Review: Eclipse Theia IDE Product Template

**Spec:** `spec/applications-integration.md`, `spec/product-extension.md`, `spec/updater-extension.md`, `spec/launcher-extension.md` (aligned with `spec/PRD.md`)
**Reviewed:** 현재 세션
**Summary:** 12 pass, 0 fail, 0 needs-clarification

## Review scope

- `spec/PRD.md`
- `spec/AC.md`
- `spec/ASR.md`
- `spec/applications-integration.md`
- `spec/product-extension.md`
- `spec/updater-extension.md`
- `spec/launcher-extension.md`

## SSOT Sufficiency

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Blocking ASRs encoded in R-NNN / C-NNN by substance | pass | ASR-001~ASR-009이 네 Spec에 분배되어 있다. |
| 2 | No ID-/path-only bullets | pass | 모든 R/C가 독립적인 요구사항 문장을 갖고 provenance는 뒤에만 둔다. |
| 3 | Every R-NNN and C-NNN has stable IDs and is testable | pass | 애플리케이션 통합과 세 확장 Spec의 R/C 번호가 파일별로 안정적이다. Updater/Launcher entrypoint 요구사항은 실제 `package.json` 경로로 구체화했다. |
| 4 | Out of Scope is explicit | pass | 네 Spec 모두 대상별 제외 범위를 정의한다. |
| 5 | No blocking Open Questions remain | pass | `Open Questions` 섹션이 없으며 AC/ASR 설계 결정이 모두 반영됐다. |

## Pre-Implementation Design Gaps

없음. 제품 타깃 통합과 세 확장의 경계, DI rebind 제한, 채택 표면, 빌드·패키징·검증 기준이 Spec에 기록되어 있다.

## Cross-Document Inconsistencies

없음.

- PRD의 Product Template 정체성은 `applications-integration.md` R-001과 각 확장 Spec의 Context에 반영했다.
- AC-001~AC-004의 Resolution은 ASR-002~ASR-009를 거쳐 네 Spec의 R/C에 반영했다.
- Browser/Electron/Electron Next 구분과 product/updater/launcher 적용 범위가 서로 모순되지 않는다.

## Ambiguities & Clarifications Needed

없음.

- `product`의 공통성은 모든 채택 애플리케이션의 공통 계약이 아니라 이 저장소 제품 타깃 간 제품 확장 공유라는 의미로 명시했다.
- 동일 서비스 계약의 application override는 보장하지 않는다는 경계를 명시했다.
- Updater와 Launcher entrypoint는 실제 패키지 설정 경로로 구체화했다.

## User Review

- **Status:** pending user approval
- **Decision requested:** 네 개의 Spec을 구현·검증의 SSOT로 승인
- **Scope of approval:**
  - `spec/applications-integration.md`
  - `spec/product-extension.md`
  - `spec/updater-extension.md`
  - `spec/launcher-extension.md`

## Recommended Next Steps

- **Pass + user approves Spec →** sprint-00 product backlog에 최종 Spec 기반 PB-*를 기록하고 이미 구현된 것으로 완료 처리 → Sprint Boundary
- **Fail (Spec gap) →** Stage ⑤로 돌아가 해당 Spec 수정 후 이 리뷰 재실행
- **Fail (ASR gap) →** Stage ④ → ⑤ → ⑥ 재실행
- **Fail (design gap) →** AC review로 돌아가 필요한 결정을 추가한 뒤 ASR → Spec → Review 재실행
