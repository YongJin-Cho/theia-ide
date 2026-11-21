# Cocrates 브랜딩

Browser, Stable Electron, Electron Next를 Cocrates 제품군으로 리브랜딩하기 위한 횡단 요구사항을 정의한다. 이 문서는 사용자 표면·패키징·CLI·문서·배포 메타데이터에 대한 브랜딩 SSOT이며, 기존 컴포넌트별 Spec의 기능·확장 경계를 대체하지 않는다.

## Context

- 대상 타깃은 `applications/browser`, `applications/electron`, `applications/electron-next`다.
- Browser와 Stable Electron의 제품명은 `Cocrates`, Electron Next의 제품 변형명은 `Cocrates Next`다.
- 구현 범위는 `docs/rebranding.md`와 승인된 ASR-010~ASR-012의 리브랜딩 delta를 따른다.

## Requirements

- R-001: Browser와 Stable Electron의 사용자에게 표시되는 제품명·애플리케이션명은 `Cocrates`여야 하며, Electron Next의 사용자에게 표시되는 제품명·애플리케이션명은 `Cocrates Next`여야 한다. 이 이름은 창 제목, Welcome/About UI, Help UI, CLI 도움말, 런처·데스크톱 항목, 패키지 표시명, 문서 및 릴리스 설명 등 사용자 표면에 일관되게 적용해야 한다. ← ASR-011
- R-002: Stable Electron은 앱 식별자 `com.cocrates.ide`, URI scheme `cocrates`, configuration folder `.cocrates`를 사용해야 한다. Electron Next는 앱 식별자 `com.cocrates.ide.next`, URI scheme `cocrates-next`, configuration folder `.cocrates-next`를 사용해야 한다. `com.cocrates`는 두 Electron 타깃의 공식 reverse-domain 접두사다. ← ASR-010
- R-003: Browser는 Cocrates 제품 표면을 사용해야 하며, 애플리케이션 이름·패키지 표시명·문서·브라우저 제목·파비콘 및 Docker 실행 안내에서 Theia 제품명을 노출하지 않아야 한다. Browser에 제공되지 않는 Electron 전용 앱 식별자·URI scheme·Electron configuration folder를 임의로 추가하지 않는다. ← ASR-010; ASR-011
- R-004: Stable과 Next의 설정·딥링크·패키징 공간은 타깃별 식별자 매핑에 따라 서로 분리되어야 한다. 기존 `.theia-ide` 사용자 데이터는 `.cocrates` 또는 `.cocrates-next`로 자동 마이그레이션하지 않는다. ← ASR-010
- R-005: Electron 패키징 메타데이터는 Stable에서 `com.cocrates.ide`와 `Cocrates`를, Next에서 `com.cocrates.ide.next`와 `Cocrates Next`를 사용해야 한다. Windows `appUserModelId`, electron-builder `appId`, macOS protocol scheme, Linux 실행 파일·desktop 항목·AppImage 아티팩트 및 관련 launcher 경로는 각 타깃의 Cocrates 식별자와 표시명을 반영해야 한다. ← ASR-010; ASR-011
- R-006: AppImage launcher는 Stable에서 `cocrates` 명령 및 `cocrates` URI handler를, Next에서 `cocrates-next` 명령 및 `cocrates-next` URI handler를 사용자 표면에 제공해야 한다. launcher의 사용자 표시명과 desktop `Name`은 각각 `Cocrates`와 `Cocrates Next`여야 한다. ← ASR-010; ASR-011
- R-007: Product 확장의 Welcome, About, Help, branding variant, 로고·아이콘·스플래시 및 관련 UI 카피는 Stable에서 Cocrates, Next에서 Cocrates Next를 표시해야 한다. 이 변경은 Product 확장의 기능·DI 경계를 변경하지 않고 제품 리소스와 표시 문자열에 적용해야 한다. ← ASR-003; ASR-011
- R-008: Updater UI와 Electron 업데이트 관련 표시 문자열은 Cocrates 브랜드를 사용해야 한다. Electron Next updater의 release URL은 `https://github.com/cocrates/theia-ide/releases/download/next`여야 한다. Stable 및 Next의 그 밖의 publish/CDN/registry 호스트는 이 Spec에서 제공된 값이 없는 경우 새 호스트를 추정하지 않는다. ← ASR-004; ASR-012
- R-009: 제품 배포 저장소, CI 식별자, 릴리스 설명, README와 관련 문서의 제품 소유 표면은 `https://github.com/cocrates/theia-ide` 및 Cocrates 명칭을 사용해야 한다. Docker 제품 이미지의 태그는 `cocrates-ide`여야 한다. 제공되지 않은 CDN·registry 호스트는 추정하지 않으며, 업스트림 도구용 builder 이미지나 Theia 플랫폼 의존성의 명칭을 제품 배포 식별자로 바꾸지 않는다. ← ASR-012
- R-010: 제품의 사용자 표면·패키징·CLI·문서·배포 메타데이터에서는 Theia 제품명을 Cocrates 또는 Cocrates Next로 교체해야 한다. 단, `@theia/*` 패키지명, Theia API, Eclipse Theia 업스트림 빌더·도구명처럼 호환성에 필요한 내부 식별자는 유지할 수 있으며, 해당 식별자를 Cocrates 제품명으로 오인하게 만드는 사용자 표면이나 제품 배포 식별자로 노출해서는 안 된다. ← ASR-011
- R-011: Cocrates 브랜딩 변경은 Browser, Stable Electron, Electron Next의 애플리케이션 설정, Product/Updater/Launcher 확장, 리소스·패키징 설정, CI·Docker·문서 메타데이터에 일관되게 반영해야 한다. 관련 파일·설정·스크립트·생성 산출물의 정적 대조를 완료하고, 가능한 경우 lint, test, build, Browser 기동, Electron preview package 및 Electron E2E 결과를 기록해야 한다. ← ASR-007; ASR-009

## Constraints

- C-001: 이 Spec은 브랜딩 및 제품 식별자 변경만 다루며, Eclipse Theia upstream 기능·API·`@theia/*` 패키지 계약·업스트림 도구의 내부 명칭을 변경하지 않는다. ← ASR-011
- C-002: 기존 `spec/applications-integration.md`, `spec/product-extension.md`, `spec/updater-extension.md`, `spec/launcher-extension.md`의 기능·의존성·타깃 경계는 유지한다. 이 문서는 네 Spec에 걸친 브랜딩 적용 규칙만 추가한다. ← ASR-002; ASR-003; ASR-004; ASR-005
- C-003: `.theia-ide`에서 `.cocrates` 또는 `.cocrates-next`로 사용자 데이터를 자동 마이그레이션하지 않는다. 기존 데이터의 보존·이전은 사용자가 별도로 처리하는 영역이다. ← ASR-010
- C-004: 제공되지 않은 CDN, registry, publish 호스트 또는 기타 배포 엔드포인트를 예상 경로로 확정하지 않는다. 확정된 외부 배포 위치는 GitHub 저장소와 Electron Next의 `/releases/download/next` 경로뿐이다. ← ASR-012
- C-005: 리브랜딩 후에도 Yarn 1.x/Lerna 작업, Theia 빌드·패키징 흐름, Electron asar 제약 및 `theia-patch` postinstall 흐름을 보존해야 한다. ← ASR-007; ASR-008
- C-006: 실행 검증이 환경 제약으로 불가능한 항목은 통과로 표시하지 않고, 실행 불가 사유와 수행한 정적 대조 증거를 별도로 기록해야 한다. ← ASR-009

## Out of Scope

- Theia upstream 자체의 기능·API·패키지 계약 변경
- 기존 `.theia-ide` 데이터의 자동 마이그레이션 또는 데이터 변환 도구
- 제공되지 않은 CDN·registry·publish 호스트의 결정
- 브랜딩과 무관한 제품 기능, 인증, 조직별 플러그인 및 배포 인프라 구현
- 이 Spec 승인 단계에서의 제품 코드 구현 및 실행 검증

## Related

- `docs/rebranding.md`
- `spec/ASR.md`
- `spec/applications-integration.md`
- `spec/product-extension.md`
- `spec/updater-extension.md`
- `spec/launcher-extension.md`
- `adr/cocrates-target-identifiers.md`
