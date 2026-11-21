# Architectural Concerns

Theia IDE Product Template의 제품 Spec 작성을 위해 설계가 필요한 구조적 관심사 등록부다.

## Summary

| ID | Title | Category | Status | Related ADRs | ASR (after ④) |
|----|-------|----------|--------|--------------|---------------|
| AC-001 | 애플리케이션 타깃의 역할과 공통 경계 | Structure & organization | designed | — | ASR-002 |
| AC-002 | 제품 확장의 구성 및 의존성 경계 | Integration & dependencies | designed | — | ASR-003 |
| AC-003 | 채택자 커스터마이징 표면의 지원 범위 | Deliverable form | designed | — | ASR-004 |
| AC-004 | 제품 Spec-구현 일치 검증의 증거 수준 | Quality bar (architectural) | designed | — | ASR-007 |
| AC-005 | Cocrates 타깃 식별자 체계 | Constraints (structural) | designed | adr/cocrates-target-identifiers.md | — |
| AC-006 | 제품 브랜드와 Theia 업스트림 명칭의 경계 | Structure & organization | designed | — | — |
| AC-007 | 업데이트·배포 메타데이터의 제품 소유 범위 | Integration & dependencies | designed | — | — |

## Dependency Order (recommended review path)

1. AC-001 → AC-005 → AC-006 → AC-007
2. 기존 결정: AC-001 → AC-002 → AC-003 → AC-004

## AC Detail

### AC-001 — 애플리케이션 타깃의 역할과 공통 경계

- **Category:** Structure & organization
- **Status:** designed
- **Statement:** `applications/browser`, `applications/electron`, `applications/electron-next`를 하나의 Product Template 안에서 어떤 역할과 공통 계약으로 정의할 것인가? Electron과 Electron Next의 차이를 별도 제품 변형으로 볼지, 동일 제품의 릴리스 채널로 볼지 정해야 한다.
- **Why it matters:** 애플리케이션별 요구사항과 공통 요구사항을 구분하지 않으면 Spec과 제품 백로그가 중복되거나, 한 타깃의 동작을 다른 타깃의 보장으로 잘못 해석할 수 있다.
- **Depends on:** —
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** `applications/browser`, `applications/electron`, `applications/electron-next`는 하나의 Eclipse Theia IDE Product Template이 제공하는 배포 타깃으로 정의한다. `electron-next`는 별도 제품 계약이 아니라 Next 릴리스 채널/제품 변형으로 정의하며, 공통 IDE·확장·플러그인 계약을 공유하고 branding variant, 업데이트 채널, URI scheme, configuration folder, 앱 식별자 같은 타깃별 설정만 다르게 가진다.
- **Notes:** 직접 입력으로 결정했다. PRD와 구현이 이미 공통 제품 구조와 Next 변형을 명확히 보여 주므로 ADR은 작성하지 않는다.

### AC-002 — 제품 확장의 구성 및 의존성 경계

- **Category:** Integration & dependencies
- **Status:** designed
- **Statement:** `theia-extensions/product`, `theia-extensions/updater`, `theia-extensions/launcher`를 Eclipse Theia IDE 제품에 필요한 확장으로 어떻게 정의하고, application 설정과 기능 확장의 경계를 어디에 둘 것인가? 각 확장의 적용 대상과 Theia 애플리케이션과의 의존성 방향을 어디까지 보장할 것인가?
- **Why it matters:** 확장을 하나의 묶음으로만 기술하면 채택자가 선택적으로 재사용할 수 있는 경계와 Electron 전용 기능의 제약을 알 수 없다.
- **Depends on:** AC-001
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** `theia-extensions/*`는 Eclipse Theia IDE 제품에 필요한 기능 확장을 제공하고, `applications/*`는 타깃별 Theia 의존성 조합·확장 포함 여부·실행 및 패키징 설정을 제공한다. `product`는 모든 채택 애플리케이션의 공통 계약이 아니라 이 저장소의 Browser/Electron 제품 타깃들이 공유하는 Eclipse Theia IDE 제품 고유의 Theia 확장이다. 애플리케이션별 기능 차이는 application에서 동일 서비스 계약을 rebind하는 방식이 아니라 별도의 Theia 확장으로 분리한다. `product`가 `rebind`하는 `AboutDialog`와 `AIRegistryConfiguration`은 application의 일반적인 override 지점으로 보장하지 않는다.
- **Notes:** 직접 입력으로 결정했다. 후보 해석은 `product`를 모든 채택 애플리케이션의 공통 확장이 아니라, Eclipse Theia IDE 제품에 필요한 제품 수준의 Theia 확장으로 정의하는 것이다. `theia-extensions/product`는 이 저장소의 browser/Electron 애플리케이션들이 함께 사용하는 제품 확장이지만, application이 자유롭게 대체해야 하는 공통 계약으로 보지 않는다. 기능 확장은 `theia-extensions/*`에 두고, application에는 타깃별 설정·의존성·실행/패키징 구성을 둔다. 현재 `product` 패키지는 frontend와 Electron main entrypoint를 export하며 branding, Getting Started, About dialog, Help 메뉴, AI registry configuration, Electron icon contribution을 제공한다. 또한 product frontend module은 `AboutDialog`와 `AIRegistryConfiguration`을 명시적으로 `rebind`하므로 동일 계약을 application에서 재정의해도 모듈 순서에 따라 product 구현이 다시 선택될 수 있다. 따라서 application에서의 동일 계약 rebind는 권장 확장 방식이 아니며, application별 차이는 설정으로 노출하거나 별도 타깃 확장으로 분리하는 것이 경계에 맞는다. 애플리케이션 `package.json`의 실행 설정은 DI rebind와 별도 계층이다.

### AC-003 — 채택자 커스터마이징 표면의 지원 범위

- **Category:** Deliverable form
- **Status:** designed
- **Statement:** Product Template이 채택자에게 보장하는 커스터마이징 표면을 앱 이름·아이콘·URI scheme·configuration folder·패키지 설정으로 한정할 것인가, 아니면 확장/플러그인 구성 변경까지 제품 계약에 포함할 것인가?
- **Why it matters:** README와 ADOPTER 문서가 안내하는 재사용 범위와 최종 Spec의 제품 계약이 어긋나면 채택자가 지원되지 않는 내부 구조에 의존할 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** Product Template이 공식적으로 보장하는 채택자 커스터마이징 표면은 애플리케이션 설정과 리소스 교체를 중심으로 한다. 여기에는 앱 이름, 아이콘, URI scheme, configuration folder, Electron app ID, splash screen, 제품별 package 설정이 포함된다. 채택자가 제품 기능의 동작을 변경해야 하는 경우 application에서 기존 서비스를 임의로 `rebind`하는 대신 별도의 Theia 확장으로 분리한다. 플러그인과 확장 조합은 애플리케이션 의존성과 플러그인 설정을 통해 조정할 수 있지만, 각 내부 서비스의 override는 기본 채택 계약으로 보장하지 않는다.
- **Notes:** 직접 입력으로 결정했다. `ADOPTER.md`, `docs/rebranding.md`, 애플리케이션 설정을 기준으로 범위를 정한다.

### AC-005 — Cocrates 타깃 식별자 체계

- **Category:** Constraints (structural)
- **Status:** designed
- **Statement:** Browser, Stable Electron, Electron Next(`Cocrates Next`)에 사용할 `name`, `productName`, `applicationName`, `appId`, `appUserModelId`, URI scheme, configuration folder, executable·artifact 이름을 어떤 일관된 식별자 체계로 정할 것인가?
- **Why it matters:** 앱 식별자와 사용자 데이터·딥링크·패키징 산출물은 설치·업데이트·동시 사용·기존 데이터와의 충돌에 영향을 주며, 임의의 값은 되돌리기 어려운 배포 계약이 된다.
- **Depends on:** AC-001
- **Related ADRs:**
  - `adr/cocrates-target-identifiers.md` — approved
- **Resolution path:** adr
- **Resolution:** Option A를 채택한다. Stable은 `com.cocrates.ide`, `cocrates`, `.cocrates`를 사용하고 Electron Next는 `com.cocrates.ide.next`, `cocrates-next`, `.cocrates-next`를 사용해 앱 식별자·URI scheme·사용자 설정 디렉터리를 분리한다.
- **Notes:** `docs/rebranding.md`는 예시 값만 제공했으나 `com.cocrates`를 공식 reverse-domain으로 확정했다. 기존 `.theia-ide` 사용자 데이터는 새 `.cocrates` 계열로 자동 마이그레이션하지 않는다.

### AC-006 — 제품 브랜드와 Theia 업스트림 명칭의 경계

- **Category:** Structure & organization
- **Status:** designed
- **Statement:** 소스 코드 식별자·내부 패키지명·업스트림 도구명에 남아 있는 `theia`/`theia-ide` 문자열 중 어떤 것을 Cocrates 제품 표면에서 반드시 제거하고, 어떤 내부 호환 명칭을 유지할 것인가?
- **Why it matters:** 모든 문자열을 기계적으로 바꾸면 업스트림 API·패키지 계약을 깨뜨릴 수 있고, 반대로 경계를 정의하지 않으면 사용자에게 Theia 브랜드가 남는다.
- **Depends on:** AC-005
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** 사용자에게 보이는 UI·패키징·CLI·문서·배포 메타데이터의 Theia 제품 문자열은 Cocrates 또는 `Cocrates Next`로 변경한다. `@theia/*` 패키지명, Theia API, 업스트림 빌더·도구명처럼 호환성에 필요한 내부 식별자는 유지한다. 유지되는 내부 명칭은 제품 사용자 표면이나 제품 배포 식별자로 노출하지 않는다.
- **Notes:** PRD의 사용자 표면 브랜드 제거 원칙을 직접 입력으로 구체화했다. 내부 호환 식별자를 기계적으로 변경해 Theia 의존성 계약을 깨뜨리지 않는다.

### AC-007 — 업데이트·배포 메타데이터의 제품 소유 범위

- **Category:** Integration & dependencies
- **Status:** designed
- **Statement:** updater URL, electron-builder publish 설정, CI release artifact/image 이름, Docker registry 경로와 문서 링크를 Cocrates 배포 인프라로 확정할 것인가, 아니면 템플릿 변수·자리표시자로 남길 것인가?
- **Why it matters:** 잘못된 updater·publish URL은 설치된 사용자를 잘못된 릴리스로 연결할 수 있고, 실제 Cocrates 배포 인프라 정보가 없는 상태에서 임의 URL을 넣으면 구현 후 재작업이 발생한다.
- **Depends on:** AC-005
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** Cocrates의 실제 GitHub 배포 저장소는 `https://github.com/cocrates/theia-ide`로 사용한다. Electron Next updater의 release URL과 관련 문서 링크는 이 저장소를 기준으로 갱신하고, Docker 이미지 태그는 `cocrates-ide`로 변경한다. 제품 artifact·CI 이름도 Cocrates 식별자 체계에 맞추되, 별도로 제공되지 않은 CDN·registry 호스트는 새로 추정하지 않는다.
- **Notes:** 사용자가 실제 GitHub 저장소와 Docker image tag를 직접 결정했다. updater URL은 기존 `/releases/download/next` 채널 경로를 새 저장소에 적용한다.

### AC-004 — 제품 Spec-구현 일치 검증의 증거 수준

- **Category:** Quality bar (architectural)
- **Status:** designed
- **Statement:** 이미 구현된 Product Template의 Spec 일치 여부를 문서·설정·스크립트 정적 대조만으로 판정할 것인가, 아니면 실제 lint/build/test/package/runtime 실행을 필수 증거로 요구할 것인가?
- **Why it matters:** 실행 검증은 높은 신뢰도를 주지만 환경·시간·외부 플러그인에 의존한다. 정적 대조만 허용하면 실행 경로의 결함을 놓칠 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** 제품 Spec-구현 일치 검증은 정적 대조를 기본 증거로 하고, 가능한 범위에서 `yarn lint`, `yarn test`, `yarn build:dev` 또는 대상별 build, Browser 기동, Electron preview package 및 Electron E2E를 추가 실행한다. 환경·시간·외부 플러그인·native module 때문에 실행할 수 없는 항목은 검증을 통과한 것으로 간주하지 않고, 실행 불가 사유와 정적 대조 근거를 검증 기록에 분리해 남긴다.
- **Notes:** 직접 입력으로 결정했다. 실행 검증을 원칙으로 하되, 환경 제약을 숨기지 않고 증거 수준을 항목별로 기록한다.
