# Architecturally Significant Requirements

Eclipse Theia IDE Product Template의 PRD와 승인된 AC 결과를 통합한 설계 기준이다. 최종 Spec은 애플리케이션 통합과 세 개의 Theia 확장을 분리해 작성한다. 아래 리브랜딩 delta는 AC-005~AC-007의 승인 결과를 반영한 초안이며, 사용자 승인을 거쳐 확정한다.

## Summary

| ID | Title | Source | Related AC | Spec 대상 |
|----|-------|--------|------------|-----------|
| ASR-001 | Eclipse Theia IDE Product Template 정체성 | PRD | — | applications-integration |
| ASR-002 | 애플리케이션 타깃 통합 | AC-001 | AC-001 | applications-integration |
| ASR-003 | Product 확장 | AC-002 | AC-002 | product-extension |
| ASR-004 | Updater 확장 | AC-002 | AC-002 | updater-extension |
| ASR-005 | Launcher 확장 | AC-002 | AC-002 | launcher-extension |
| ASR-006 | 애플리케이션 설정과 채택 표면 | AC-003 | AC-003 | applications-integration |
| ASR-007 | 빌드·패키징·플러그인 실행 흐름 | PRD | — | applications-integration |
| ASR-008 | 런타임 및 패키징 제약 | PRD | — | applications-integration |
| ASR-009 | Spec-구현 일치 검증 증거 | AC-004 | AC-004 | all |
| ASR-010 | Cocrates 타깃 식별자 매핑 | AC-005 | AC-005 | applications-integration, product-extension, updater-extension, launcher-extension |
| ASR-011 | Cocrates 제품 브랜드 경계 | AC-006 | AC-006 | applications-integration, product-extension, updater-extension, launcher-extension |
| ASR-012 | Cocrates 업데이트·배포 메타데이터 | AC-007 | AC-007 | applications-integration, updater-extension, launcher-extension |

## Dependency Order (recommended Spec encoding path)

1. ASR-001 → ASR-002 → ASR-003 → ASR-004 → ASR-005 → ASR-006 → ASR-007 → ASR-008 → ASR-009
2. 리브랜딩 delta는 ASR-002 이후 타깃 식별자(ASR-010), 제품 브랜드 경계(ASR-011), 업데이트·배포 메타데이터(ASR-012) 순으로 각 Spec에 인코딩한다. ASR-010은 ASR-002에 의존하고, ASR-011은 ASR-010을 제품 표면에 적용하며, ASR-012는 ASR-010 및 ASR-011을 배포 설정에 적용한다.

## Spec 분할 원칙

- `spec/applications-integration.md`: Browser, Electron, Electron Next의 통합 관계, 타깃별 설정, 의존성 조합, 빌드·패키징·플러그인 흐름, 채택자 설정, 런타임 제약
- `spec/product-extension.md`: `theia-extensions/product`의 제품 기능과 frontend/Electron main entrypoint
- `spec/updater-extension.md`: `theia-extensions/updater`의 업데이트 기능과 Electron 적용 범위
- `spec/launcher-extension.md`: `theia-extensions/launcher`의 AppImage launcher 기능과 적용 범위

## ASR Detail

### ASR-001 — Eclipse Theia IDE Product Template 정체성

- **Source:** PRD — Summary, Goals, Product capabilities
- **Statement:** 저장소는 Eclipse Theia 플랫폼을 조합해 데스크톱 및 브라우저 기반 IDE 제품을 만들고, 이 구성을 다른 Theia 기반 제품의 출발점으로 재사용할 수 있는 Product Template을 제공해야 한다.
- **Decision summary:** 제품은 사양 복원 문서가 아니라 Eclipse Theia IDE Product Template 자체다.
- **Depends on:** —
- **Related AC:** —

### ASR-002 — 애플리케이션 타깃 통합

- **Source:** AC-001 — 애플리케이션 타깃의 역할과 공통 경계
- **Statement:** `applications/browser`, `applications/electron`, `applications/electron-next`는 하나의 Eclipse Theia IDE Product Template이 제공하는 배포 타깃이어야 한다. `electron-next`는 별도 제품 계약이 아니라 Next 릴리스 채널/제품 변형이어야 하며, 공통 IDE·확장·플러그인 계약을 공유하고 branding variant, 업데이트 채널, URI scheme, configuration folder, 앱 식별자 같은 타깃별 설정을 가질 수 있어야 한다.
- **Decision summary:** 세 애플리케이션은 하나의 제품 템플릿에 속하고 Electron Next는 타깃 변형이다.
- **Depends on:** ASR-001
- **Related AC:** AC-001

### ASR-003 — Product 확장

- **Source:** AC-002 — 제품 확장의 구성 및 의존성 경계
- **Statement:** `theia-extensions/product`는 Eclipse Theia IDE 제품에 필요한 제품 수준 Theia 확장이어야 한다. 이 확장은 제품 branding, Getting Started, About Dialog, Help 메뉴, AI Registry 설정 및 Electron icon contribution을 제공하고, `AboutDialog`와 `AIRegistryConfiguration`을 제품 구현으로 명시적으로 rebind한다. 이 확장은 모든 채택 애플리케이션의 공통 계약이 아니며, 애플리케이션의 일반적인 override 지점을 보장하지 않는다.
- **Decision summary:** Product는 이 저장소의 Browser/Electron 제품 타깃들이 공유하는 제품 고유 확장이다.
- **Depends on:** ASR-002
- **Related AC:** AC-002

### ASR-004 — Updater 확장

- **Source:** AC-002 — 제품 확장의 구성 및 의존성 경계
- **Statement:** `theia-extensions/updater`는 Electron 제품 타깃의 업데이트 기능과 UI를 제공하는 타깃 특화 Theia 확장이어야 하며, Browser 타깃의 필수 계약이 아니어야 한다.
- **Decision summary:** Updater는 Electron 배포에 한정된 선택적 제품 확장이다.
- **Depends on:** ASR-002
- **Related AC:** AC-002

### ASR-005 — Launcher 확장

- **Source:** AC-002 — 제품 확장의 구성 및 의존성 경계
- **Statement:** `theia-extensions/launcher`는 AppImage 배포에서 `theia` 명령을 제공하는 Electron/Linux 타깃 특화 Theia 확장이어야 하며, Browser 타깃의 필수 계약이 아니어야 한다.
- **Decision summary:** Launcher는 AppImage 배포에 한정된 선택적 제품 확장이다.
- **Depends on:** ASR-002
- **Related AC:** AC-002

### ASR-006 — 애플리케이션 설정과 채택 표면

- **Source:** AC-003 — 채택자 커스터마이징 표면의 지원 범위
- **Statement:** Product Template은 앱 이름, 아이콘, URI scheme, configuration folder, Electron app ID, splash screen, 제품별 package 설정 및 플러그인/확장 조합을 채택자 커스터마이징 표면으로 제공해야 한다. 제품 기능 동작의 변경은 application의 임의 DI rebind가 아니라 별도의 Theia 확장으로 분리해야 한다.
- **Decision summary:** 공식 채택 표면은 애플리케이션 설정·리소스 교체·확장 조합이며 내부 서비스 override는 기본 계약이 아니다.
- **Depends on:** ASR-003
- **Related AC:** AC-003

### ASR-007 — 빌드·패키징·플러그인 실행 흐름

- **Source:** PRD — Product capabilities, Deliverables, Scope
- **Statement:** 저장소는 Yarn/Lerna 루트 작업으로 Theia 확장과 애플리케이션을 빌드하고, 개발/프로덕션 빌드, 플러그인 다운로드, Browser 실행, Electron 패키징 및 preview, lint와 test 흐름을 제공해야 한다.
- **Decision summary:** 제품 템플릿은 기능 코드뿐 아니라 실행 가능한 개발·릴리스 흐름을 제공한다.
- **Depends on:** ASR-002, ASR-003, ASR-004, ASR-005
- **Related AC:** —

### ASR-008 — 런타임 및 패키징 제약

- **Source:** PRD — Constraints
- **Statement:** 제품 구성은 Yarn 1.x/Lerna 워크스페이스와 저장소가 참조하는 Theia/Node.js 제약을 따르고, Electron asar의 읽기 전용·native binary/resource unpacking 제약 및 `postinstall`의 `theia-patch` 흐름을 보존해야 한다.
- **Decision summary:** 채택자와 유지보수자는 기존 런타임·패키징 제약을 제품 계약의 일부로 다룬다.
- **Depends on:** ASR-007
- **Related AC:** —

### ASR-009 — Spec-구현 일치 검증 증거

- **Source:** AC-004 — 제품 Spec-구현 일치 검증의 증거 수준
- **Statement:** 제품 Spec과 구현의 일치는 파일·설정·스크립트 정적 대조를 기본으로 검증하고, 가능한 경우 `yarn lint`, `yarn test`, `yarn build`, Browser 기동, Electron preview package 및 Electron E2E를 실행해야 한다. 실행 불가 항목은 통과로 처리하지 않고 실행 불가 사유와 정적 대조 근거를 별도 증거로 기록해야 한다.
- **Decision summary:** 실행 검증을 원칙으로 하되 환경 제약을 항목별로 투명하게 기록한다.
- **Depends on:** ASR-001, ASR-002, ASR-003, ASR-004, ASR-005, ASR-006, ASR-007, ASR-008
- **Related AC:** AC-004

### ASR-010 — Cocrates 타깃 식별자 매핑

- **Source:** AC-005 — Cocrates 타깃 식별자 체계
- **Statement:** Browser, Stable Electron, Electron Next의 사용자 표면·패키징·딥링크·사용자 설정 식별자는 Cocrates 제품군의 타깃별 매핑을 사용해야 한다. Stable은 앱 식별자 `com.cocrates.ide`, URI scheme `cocrates`, configuration folder `.cocrates`를 사용하고, Electron Next는 앱 식별자 `com.cocrates.ide.next`, URI scheme `cocrates-next`, configuration folder `.cocrates-next`를 사용해야 한다. 기존 `.theia-ide` 사용자 데이터는 새 설정 디렉터리로 자동 마이그레이션하지 않는다.
- **Decision summary:** Option A를 채택해 Stable과 Next의 설치·딥링크·사용자 데이터 공간을 분리하고 `com.cocrates`를 공식 reverse-domain으로 사용한다.
- **Depends on:** ASR-002
- **Related AC:** AC-005
- **Related ADRs:**
  - `adr/cocrates-target-identifiers.md` — approved
- **Notes:** 실행 파일·artifact 이름은 타깃별 Cocrates 명칭으로 정렬하되, 구체적인 파일명은 해당 애플리케이션의 기존 패키징 규칙을 따르는 Spec에서 정의한다.

### ASR-011 — Cocrates 제품 브랜드 경계

- **Source:** AC-006 — 제품 브랜드와 Theia 업스트림 명칭의 경계
- **Statement:** 사용자에게 보이는 UI·패키징·CLI·문서·배포 메타데이터의 Theia 제품 문자열은 Cocrates 또는 `Cocrates Next`로 변경해야 한다. `@theia/*` 패키지명, Theia API, 업스트림 빌더·도구명처럼 호환성에 필요한 내부 식별자는 유지하되 제품 사용자 표면이나 제품 배포 식별자로 노출하지 않아야 한다.
- **Decision summary:** 제품 브랜드와 업스트림 호환성 식별자를 분리해, 사용자 표면은 Cocrates로 통일하고 내부 Theia 계약은 보존한다.
- **Depends on:** ASR-010
- **Related AC:** AC-006

### ASR-012 — Cocrates 업데이트·배포 메타데이터

- **Source:** AC-007 — 업데이트·배포 메타데이터의 제품 소유 범위
- **Statement:** 제품 배포 저장소와 제품 artifact·CI·문서 식별자는 Cocrates 체계를 사용해야 한다. GitHub 배포 저장소는 `https://github.com/cocrates/theia-ide`이고 Electron Next updater의 release 경로는 해당 저장소의 `/releases/download/next`를 사용해야 하며, Docker image tag는 `cocrates-ide`여야 한다. 제공되지 않은 CDN·registry 호스트는 추정하지 않는다.
- **Decision summary:** 제공된 GitHub 저장소와 Docker tag만 구체적으로 확정하고, 제공되지 않은 배포 호스트는 기존 설정을 무단 추정하지 않는다.
- **Depends on:** ASR-010, ASR-011
- **Related AC:** AC-007

