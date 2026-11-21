# 제품 백로그 — Eclipse Theia IDE Product Template

> **실행 보드:** [`../TODO.md`](../TODO.md)
> **Updated:** 현재 세션 — sprint-01 경계 완료

## 스토리

- [x] **PB-001** — Eclipse Theia IDE Product Template 초기 Spec 정립
  - Story: Eclipse Theia IDE Product Template의 제품 범위와 구현 기반 Spec을 확정하고 제품 백로그를 생성한다.
  - Spec: `spec/PRD.md`, `spec/ASR.md`, `spec-review/theia-ide-product-template.md`
  - Sprint: sprint-00
  - Depends: —
  - Notes: Spec→backlog 초기화용 bootstrap story. PB-002~PB-005의 제품 스토리로 분해되었고 해당 작업을 완료했다.

- [x] **PB-002** — Theia IDE 애플리케이션 통합
  - Story: 개발팀이 Browser, Electron, Electron Next 타깃을 하나의 Eclipse Theia IDE Product Template으로 빌드·실행·패키징하고 타깃별 설정과 확장 조합을 조정할 수 있다.
  - Spec: `spec/applications-integration.md` §Requirements, §Constraints
  - Sprint: sprint-00
  - Depends: —
  - Notes: 현재 `applications/browser`, `applications/electron`, `applications/electron-next` 구현이 DoD를 충족한다.

- [x] **PB-003** — Eclipse Theia IDE Product 확장
  - Story: Eclipse Theia IDE 제품이 branding, Getting Started, About Dialog, Help, AI Registry 및 Electron icon contribution을 제공한다.
  - Spec: `spec/product-extension.md` §Requirements, §Constraints
  - Sprint: sprint-00
  - Depends: PB-002
  - Notes: 현재 `theia-extensions/product` 구현이 DoD를 충족한다.

- [x] **PB-004** — Eclipse Theia IDE Updater 확장
  - Story: Electron 기반 Eclipse Theia IDE 제품이 updater 기능과 UI를 제공하고 Browser 타깃에는 필수 의존성을 추가하지 않는다.
  - Spec: `spec/updater-extension.md` §Requirements, §Constraints
  - Sprint: sprint-00
  - Depends: PB-002
  - Notes: 현재 `theia-extensions/updater` 구현과 Electron 의존성 구성이 DoD를 충족한다.

- [x] **PB-005** — Eclipse Theia IDE Launcher 확장
  - Story: AppImage/Linux Electron 제품이 `theia` 명령으로 IDE를 시작할 수 있고 Browser 타깃에는 Launcher를 필수로 포함하지 않는다.
  - Spec: `spec/launcher-extension.md` §Requirements, §Constraints
  - Sprint: sprint-00
  - Depends: PB-002
  - Notes: 현재 `theia-extensions/launcher` 구현과 Electron 의존성 구성이 DoD를 충족한다.

- [x] **PB-006** — Cocrates 전체 타깃 리브랜딩 요구사항 및 Spec 확정
  - Story: 제품 담당자가 Browser, Stable Electron, Electron Next를 Cocrates 브랜드로 일관되게 배포할 수 있도록 앱 이름·패키지 식별자·URI scheme·configuration folder·제품 확장 UI·launcher/updater·CI·문서의 승인된 리브랜딩 요구사항과 Spec을 갖는다. Electron Next는 `Cocrates Next` 변형으로 유지한다.
  - Spec: `spec/cocrates-branding.md` §Requirements, §Constraints, §Out of Scope; `spec-review/cocrates-branding.md`
  - Sprint: sprint-01
  - Depends: PB-002, PB-003, PB-004, PB-005
  - Notes: 승인된 횡단 브랜딩 SSOT와 review 결과(11 pass, 0 fail, 0 needs-clarification)를 반영했다. 스프린트-01 경계에서 완료 처리했으며, 구현·패키징·런타임 검증은 다음 Backlog→Implementation 스프린트에서 수행한다.
