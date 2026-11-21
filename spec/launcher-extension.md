# Theia IDE Launcher 확장

`theia-extensions/launcher`는 AppImage 기반 Eclipse Theia IDE 배포에서 `theia` 명령을 제공하는 Linux/Electron 타깃 특화 Theia 확장이다.

## Context

- 확장 소스는 `theia-extensions/launcher/src`에 있다.
- Browser 타깃의 필수 제품 계약이 아니라 AppImage 배포를 위한 선택적 확장이다. ← ASR-005

## Requirements

- R-001: Launcher 확장은 AppImage 애플리케이션에서 Eclipse Theia IDE를 명령줄의 `theia` 명령으로 시작할 수 있는 기능을 제공해야 한다. ← ASR-005; AC-002
- R-002: Launcher 패키지는 `theiaExtensions`에 `lib/browser/create-launcher-frontend-module`을 `frontendElectron` entrypoint로, `lib/node/launcher-backend-module`을 `backend` entrypoint로 등록해야 하며, frontend launcher 서비스와 node endpoint를 각각 해당 모듈에서 연결해야 한다. ← ASR-005
- R-003: Electron 애플리케이션은 필요할 때 `theia-ide-launcher-ext`를 의존성으로 포함하고, Browser 애플리케이션은 Launcher 확장을 필수 의존성으로 요구하지 않아야 한다. ← ASR-005

## Constraints

- C-001: Launcher 기능을 Browser 실행 계약으로 확장하지 않아야 한다. ← ASR-005
- C-002: Launcher의 적용 대상은 AppImage 및 Linux/Electron 패키징 제약과 함께 관리해야 한다. ← ASR-005; ASR-008

## Out of Scope

- Windows/macOS용 명령줄 설치 프로그램
- AppImage 포맷 자체의 배포 인프라
- Product 및 Updater 확장의 기능

## Related

- `spec/PRD.md`
- `spec/ASR.md`
