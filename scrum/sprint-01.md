# Sprint 01 — Cocrates 전체 타깃 리브랜딩 요구사항 확정

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

`docs/rebranding.md`를 기준으로 Eclipse Theia IDE Product Template의 Browser, Stable Electron, Electron Next 전체를 Cocrates 브랜드로 전환하기 위한 승인된 요구사항과 제품 Spec을 확정한다. Electron Next는 기존 별도 채널 특성을 유지하되 제품명은 `Cocrates Next` 변형으로 정의한다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-006 | Cocrates 전체 타깃 리브랜딩 요구사항 및 Spec 확정 |

**스프린트 외:** 승인된 리브랜딩 Spec을 실제 소스·설정·리소스·CI·문서에 구현하는 작업, 패키징 산출물 생성, 런타임·브라우저·Electron 검증 — Spec 확정 후 별도 실행 단계에서 수행한다.

## 완료 정의

1. Cocrates 전체 타깃 변경 결정이 리브랜딩 요구사항의 근거로 기록되어 있다.
2. PRD delta에서 Browser, Stable Electron, Electron Next(`Cocrates Next`)의 제품 표면과 리브랜딩 범위를 정의한다.
3. blocking AC를 식별하고, 식별자·URI scheme·설정 폴더·패키징·브랜드 리소스·CI/문서 범위의 미결정 사항을 모두 사용자 승인 상태로 닫는다.
4. ASR delta가 승인된 결정을 통합한다.
5. 애플리케이션 통합 및 product/updater/launcher 확장에 대한 리브랜딩 Spec이 구현·검증 가능한 요구사항으로 갱신되고 Spec review 기록이 승인 상태다.
6. 변경된 요구사항이 `PB-006`으로 제품 백로그에 기록되어 다음 구현 스프린트의 범위를 추적할 수 있다.

## 데모 체크리스트

- [ ] Cocrates 전체 타깃 범위가 반영된 PRD delta 작성 및 승인
- [ ] 리브랜딩 blocking AC 식별 및 목록 승인
- [ ] 모든 blocking AC 결정 및 승인
- [ ] ASR delta 통합 및 승인
- [ ] 리브랜딩 Spec 갱신 및 Spec review 승인
- [ ] `PB-006` 제품 백로그 기록
- [ ] 스프린트 완료 검토 및 경계 처리
