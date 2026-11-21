# Theia IDE Updater 확장

`theia-extensions/updater`는 Electron 기반 Eclipse Theia IDE 제품의 업데이트 기능과 UI를 제공하는 타깃 특화 Theia 확장이다.

## Context

- 확장 소스는 `theia-extensions/updater/src`에 있다.
- Browser 타깃의 필수 제품 계약이 아니라 Electron 배포를 위한 선택적 확장이다. ← ASR-004

## Requirements

- R-001: Updater 확장은 Electron 제품 타깃에서 업데이트 동작과 사용자 인터페이스를 제공해야 한다. ← ASR-004; AC-002
- R-002: Updater 패키지는 `theiaExtensions`에 `lib/electron-main/update/theia-updater-main-module`을 `electronMain` entrypoint로, `lib/electron-browser/theia-updater-frontend-module`을 `frontendElectron` entrypoint로 등록해야 한다. 공통 updater 계약과 설정은 `src/common/updater`에 두고 Electron main/browser 구현은 각 타깃 entrypoint에 둬야 한다. ← ASR-004
- R-003: Electron 애플리케이션은 필요할 때 `theia-ide-updater-ext`를 의존성으로 포함하고, Browser 애플리케이션은 Updater 확장을 필수 의존성으로 요구하지 않아야 한다. ← ASR-004

## Constraints

- C-001: Updater 기능을 Browser 실행 계약으로 확장하지 않아야 한다. ← ASR-004
- C-002: Updater 확장의 적용 대상과 설정은 Electron 애플리케이션의 실행·배포 구성과 함께 관리해야 한다. ← ASR-004; ASR-006

## Out of Scope

- 외부 업데이트 서버 또는 릴리스 인프라 자체
- Browser 배포의 업데이트 구현
- Product 확장의 브랜딩 기능

## Related

- `spec/PRD.md`
- `spec/ASR.md`
