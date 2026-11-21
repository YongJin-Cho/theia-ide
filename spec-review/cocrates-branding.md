# Spec Review: Cocrates 브랜딩

**Spec:** `spec/cocrates-branding.md` (리브랜딩 delta에 맞춤)
**Reviewed:** 현재 세션
**Summary:** 11 pass, 0 fail, 0 needs-clarification

## Review scope

- `spec/PRD.md`의 Cocrates 전체 타깃 리브랜딩 delta
- `spec/AC.md`의 AC-005~AC-007
- `spec/ASR.md`의 ASR-010~ASR-012
- `spec/cocrates-branding.md`
- 기존 `spec/applications-integration.md`, `spec/product-extension.md`, `spec/updater-extension.md`, `spec/launcher-extension.md`

## SSOT Sufficiency

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Blocking ASRs encoded in R-NNN / C-NNN by substance | pass | ASR-010~ASR-012의 식별자, 브랜드 경계, 배포 메타데이터 결정이 R-001~R-011 및 C-001~C-006에 구체적으로 복사되어 있다. |
| 2 | No ID-/path-only bullets | pass | 모든 R/C가 독립적인 동작·값·제약을 포함하고 provenance는 문장 뒤에만 둔다. |
| 3 | Every R-NNN and C-NNN has stable IDs and is testable | pass | R-001~R-011과 C-001~C-006이 안정적인 ID와 정적 대조 또는 실행 검증 가능한 기준을 가진다. |
| 4 | Out of Scope is explicit | pass | 업스트림 변경, 데이터 마이그레이션, 미제공 배포 호스트 결정 및 구현 단계가 명시적으로 제외되어 있다. |
| 5 | No blocking Open Questions remain | pass | 결정되지 않은 제품 식별자·배포 호스트·브랜드 경계가 남아 있지 않다. |

## Pre-Implementation Design Gaps

없음. Browser/Stable Electron/Electron Next의 표시명, Stable/Next 식별자, 데이터 마이그레이션 경계, Theia 호환성 명칭 경계, GitHub·updater·Docker 메타데이터 및 검증 증거 기준이 Spec에 기록되어 있다.

## Cross-Document Inconsistencies

없음. 기존 네 컴포넌트별 Spec에 남아 있는 Theia 제품 표기는 현재 구현 전 기준을 설명하는 기존 내용이며, 구현 시 `cocrates-branding.md`의 리브랜딩 delta를 적용해 갱신해야 한다. 기존 Spec의 확장 기능·의존성·타깃 경계와 이 Spec의 브랜딩 적용 범위는 충돌하지 않는다.

- ASR-010의 Stable/Next 매핑은 R-002, R-004, R-005, R-006에 반영했다.
- ASR-011의 사용자 표면/업스트림 호환성 경계는 R-001, R-003, R-007, R-010 및 C-001~C-002에 반영했다.
- ASR-012의 GitHub release 경로·Docker tag·미제공 호스트 제한은 R-008~R-009 및 C-004에 반영했다.

## Ambiguities & Clarifications Needed

없음.

- Browser에는 Electron 전용 앱 식별자·URI scheme·configuration folder를 임의로 추가하지 않는다는 범위를 명시했다.
- 제공되지 않은 CDN·registry·publish 호스트를 추정하지 않는다는 규칙을 명시했다.
- 기존 `.theia-ide` 데이터의 자동 마이그레이션을 하지 않는다는 결정을 실행 가능한 제약으로 명시했다.

## User Review

- **Status:** pending user approval
- **Decision requested:** `spec/cocrates-branding.md`를 Cocrates 전체 타깃 리브랜딩 구현·검증의 SSOT로 승인
- **Scope of approval:**
  - `spec/cocrates-branding.md`
  - 관련 브랜딩 적용 범위에 한해 기존 네 컴포넌트별 Spec과의 정합성

## Recommended Next Steps

- **Pass + user approves Spec →** `PB-006`을 최종 리브랜딩 Spec 기반 스토리로 갱신하고 sprint-01의 Spec→backlog 결과를 정리한 뒤 완료 검토
- **Fail (Spec gap) →** Stage ⑤로 돌아가 `spec/cocrates-branding.md`를 수정한 후 이 리뷰 재실행
- **Fail (ASR gap) →** Stage ④ → ⑤ → ⑥ 재실행
- **Fail (design gap) →** AC review로 돌아가 필요한 결정을 추가한 뒤 ASR → Spec → Review 재실행
