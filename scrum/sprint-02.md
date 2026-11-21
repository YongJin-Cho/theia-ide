# Sprint 02 — Cocrates 브랜딩 구현·검증

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

승인된 `spec/cocrates-branding.md`를 구현 SSOT로 사용해 Browser, Stable Electron, Electron Next의 사용자 표면·식별자·패키징·제품 확장·CI/문서 브랜딩을 Cocrates로 적용하고 정적 대조 및 가능한 실행 검증 결과를 기록한다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-006 | Cocrates 전체 타깃 리브랜딩 요구사항 및 Spec 확정 |

**스프린트 외:** 새로운 브랜딩 결정, 제공되지 않은 CDN·registry 호스트 확정, Theia upstream API·`@theia/*` 계약 변경, 브랜딩과 무관한 기능 변경.

## 완료 정의

1. `spec/cocrates-branding.md`의 R-001~R-011과 C-001~C-006에 해당하는 구현 변경이 Browser, Stable Electron, Electron Next 전체 타깃에 반영된다.
2. `@theia/*`, Theia API, 업스트림 도구명 등 호환성 식별자는 보존되고 사용자 제품 표면에는 Cocrates 명칭이 적용된다.
3. Stable/Next 식별자·URI scheme·configuration folder·launcher·패키징 메타데이터가 Spec의 타깃별 매핑과 일치한다.
4. GitHub 저장소, Electron Next updater 경로, Docker tag 및 문서/CI 제품 메타데이터가 승인된 값과 일치하며 미제공 호스트는 추정하지 않는다.
5. 정적 대조와 가능한 lint/test/build/Browser/Electron 검증을 실행하고, 실행 불가 항목은 사유와 정적 증거를 검증 기록에 남긴다.
6. 변경된 구현과 검증 결과가 `PB-006`의 완료 조건을 충족한다.

## 데모 체크리스트

- [ ] Browser·Stable Electron·Electron Next 사용자 표면 및 리소스의 Cocrates 브랜딩 대조
- [ ] Stable/Next 식별자·URI scheme·configuration folder·launcher·패키징 대조
- [ ] Product·Updater·Launcher 확장 및 CI/Docker/문서 메타데이터 대조
- [ ] 가능한 lint/test/build 및 Browser/Electron 검증 실행
- [ ] Spec 기반 검증 기록 작성 및 구현 결과 검토
- [ ] 스프린트 완료 검토 및 경계 처리
