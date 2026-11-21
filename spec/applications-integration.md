# Theia IDE 애플리케이션 통합

Eclipse Theia IDE Product Template의 Browser, Electron, Electron Next 애플리케이션이 Theia 기능과 제품 확장을 조합하고 개발·배포 흐름을 제공하는 방식을 정의한다.

## Context

- 이 Spec은 `applications/browser`, `applications/electron`, `applications/electron-next`의 통합 계약을 정의한다.
- 제품 자체는 문서 복원 산출물이 아니라 Eclipse Theia IDE Product Template이다. ← ASR-001

## Requirements

- R-001: Product Template은 `applications/browser`, `applications/electron`, `applications/electron-next`를 하나의 Eclipse Theia IDE Product Template이 제공하는 배포 타깃으로 제공해야 한다. ← ASR-001; ASR-002; AC-001
- R-002: Browser 타깃은 브라우저에서 실행되는 Theia IDE를 제공하고 `theia-ide-product-ext`를 포함해야 한다. Browser의 실행·빌드 설정은 `applications/browser/package.json`에 정의해야 한다. ← ASR-002; ASR-003
- R-003: Electron 타깃은 데스크톱 Theia IDE와 Electron main process를 제공하고, product/updater/launcher 확장을 조합할 수 있어야 한다. Electron 실행·빌드·패키징·테스트 설정은 `applications/electron/package.json`과 관련 패키징 설정에 정의해야 한다. ← ASR-002; ASR-003; ASR-004; ASR-005
- R-004: Electron Next 타깃은 Electron 제품의 Next 릴리스 채널/제품 변형이어야 하며, 공통 IDE·확장·플러그인 계약을 공유하면서 branding variant, 업데이트 채널, URI scheme, configuration folder, 앱 식별자 같은 타깃별 설정을 가져야 한다. ← ASR-002; AC-001
- R-005: 애플리케이션은 타깃별 Theia 의존성 조합, 포함할 제품 확장, 실행 설정, 빌드 스크립트, 패키징 스크립트를 소유해야 하며 제품 기능 구현을 애플리케이션 소스에 중복하지 않아야 한다. ← ASR-003; AC-002
- R-006: 채택자는 애플리케이션 설정과 리소스 교체를 통해 앱 이름, 아이콘, URI scheme, configuration folder, Electron app ID, splash screen 및 제품별 package 설정을 변경할 수 있어야 한다. ← ASR-006; AC-003
- R-007: 채택자가 제품 기능의 동작을 변경해야 하는 경우 기존 서비스 계약을 애플리케이션에서 임의로 `rebind`하지 않고 별도의 Theia 확장으로 분리해야 한다. `product`가 `rebind`하는 `AboutDialog`와 `AIRegistryConfiguration`은 애플리케이션의 일반적인 override 지점으로 보장하지 않는다. ← ASR-003; ASR-006; AC-002; AC-003
- R-008: 루트 작업은 Yarn/Lerna 워크스페이스를 통해 확장과 애플리케이션을 조정하고, 개발/프로덕션 빌드, 플러그인 다운로드, Browser 실행, Electron 패키징·preview, lint 및 test 흐름을 제공해야 한다. ← ASR-007

## Constraints

- C-001: 루트 워크스페이스와 패키지 스크립트는 저장소가 참조하는 Theia 버전, Node.js 24 이상, Yarn 1.x 미만 2 버전 제약을 따라야 한다. ← ASR-002; ASR-008
- C-002: Electron 패키징은 asar의 읽기 전용 특성과 native binary/resource unpacking 제약을 따라야 하며, 런타임 파일 접근이 필요한 자원은 `asarUnpack` 및 `.asar.unpacked` 경로 처리를 고려해야 한다. ← ASR-008
- C-003: 루트 `postinstall`의 `theia-patch` 흐름을 유지해야 한다. ← ASR-008
- C-004: 제품 Spec-구현 일치는 파일·설정·스크립트 정적 대조를 기본으로 하고, 가능한 경우 `yarn lint`, `yarn test`, `yarn build`, Browser 기동, Electron preview package 및 Electron E2E를 실행해야 한다. 실행 불가 항목은 통과로 처리하지 않고 실행 불가 사유와 정적 대조 근거를 별도 기록해야 한다. ← ASR-009; AC-004

## Out of Scope

- Theia upstream 자체의 기능 개발 또는 수정
- 특정 고객 제품의 도메인 기능, 별도 인증/배포 서비스, 조직별 플러그인 구현
- 이 Spec 작성 작업에서의 제품 코드·의존성·빌드 파이프라인 변경

## Related

- `spec/PRD.md`
- `spec/ASR.md`
