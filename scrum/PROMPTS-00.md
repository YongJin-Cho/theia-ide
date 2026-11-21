# sprint-00 대화 로그

> **스프린트 계획:** [`scrum/sprint-00.md`](./scrum/sprint-00.md)
> **실행 보드:** [`TODO.md`](./TODO.md)

## TURN-001

### 사용자 요청
> 이 저장소는 Theia 플랫폼을 이용해서 IDE를 개발하기 위한 Boilerplate Project이다. 내용을 파악해서 AGENTS.md 파일을 복원해줘(sdd 스킬의 구현 단계 참조).

### Cocrates 응답
- 저장소에 `AGENTS.md`, `TODO.md`, `spec/`, `scrum/`이 없는 상태임을 확인했다.
- SDD ⑦ 구현 단계에 진입하기 위한 sprint-00 계획과 초기 제품 백로그를 `scrum/`에 작성했다.
- **Asked user:** sprint-00 계획을 승인하면 실행 보드를 시드하고 `AGENTS.md` 복원 작업을 시작한다.

## TURN-002

### 사용자 요청
> sprint-00는 AGENTS.md 뿐만 아니라 이 저장소의 구현으로부터 spec을 복원하는 것을 모두 포함해줘.
>
> 1. 먼저 AGETNS.md 파일을 생성해서, 이 저장소의 구현 측면의 context를 추출하고
> 2. 이 과제를 개발하기 위한 PRD -> AC 식별 -> AC 검토 -> ASR 통합 -> spec 작성 -> spec 검토의 sdd 단계를 진행함.
> 3. 최종 spec이 확정되면, spec을 기반으로 product backlog를 생성함. 이미 모두 구현된 것이므로 완료 처리함.
> 4. spec과 구현이 일치하는지 단계를 진행함.

### Cocrates 응답
- sprint-00의 목표와 범위를 `AGENTS.md` 복원에서 구현 기반 문서·Spec 복원 전체로 확장했다.
- PRD부터 Spec 검토, 제품 백로그 생성·완료 처리, Spec-구현 일치 검증까지를 완료 정의와 데모 체크리스트에 반영했다.
- SDD와 Scrum의 게이트 규칙에 따라 계획 승인 전에는 `AGENTS.md`를 생성하거나 SDD 산출물을 작성하지 않는다.
- **Asked user:** 확장된 sprint-00 계획을 승인하고 실행 보드를 시드할 것인지 결정해 달라.

## TURN-003

### 사용자 요청
> ok

### Cocrates 응답
- 확장된 sprint-00 계획을 승인된 것으로 기록했다.
- `TODO.md` 실행 보드를 시드하고 첫 작업을 시작했다.
- 구현 context를 추출해 루트 `AGENTS.md`를 생성했다.
- PRD 초안을 `spec/PRD.md`에 작성하고 다음 사용자 검토 단계로 이동했다.
- **Asked user:** `spec/PRD.md`의 목표·범위·산출물·제약·성공 기준을 검토하고 승인해 달라.

## TURN-004

### 사용자 요청
> 이미 구현된 제품으로부터 사양을 복원하고 있지만, 제품은 "사양 복원"이 아니다. 이 저장소의 제품은 Eclipse Theia IDE Product Template 이다. "사양 복원"에 관한 내용이 Spec에 남는 것은 적절하지 않은 것 같다.

### Cocrates 응답
- PRD의 주체를 문서 복원 과제가 아니라 Eclipse Theia IDE Product Template 제품으로 수정했다.
- 제품 capabilities, 애플리케이션/확장 구조, 채택·패키징 제약을 제품 관점에서 재정의했다.
- sprint-00 목표와 PB-001도 제품 Spec 정립 및 Product Template 구현으로 갱신했다.
- `AGENTS.md`는 개발 context 문서로 유지하고, 제품 요구사항의 SSOT는 승인된 Spec으로 분리했다.
- **Asked user:** 제품 관점으로 수정한 `spec/PRD.md`를 검토하고 승인해 달라.

## TURN-005

### 사용자 요청
> 좋아 다음 진행해줘.

### Cocrates 응답
- 사용자가 제품 관점으로 수정된 PRD를 승인한 것으로 기록했다.
- `spec/PRD.md`를 다시 읽고 승인된 내용에 따라 AC 식별을 진행했다.
- `spec/AC.md`에 애플리케이션 타깃 경계, 제품 확장 경계, 채택자 커스터마이징 범위, 검증 증거 수준의 4개 blocking AC를 Dependency Order와 함께 등록했다.
- **Asked user:** `spec/AC.md`의 4개 blocking AC 목록과 Dependency Order를 검토하고 승인해 달라.

## TURN-006

### 사용자 요청
> ok

### Cocrates 응답
- AC 목록과 Dependency Order 승인을 기록했다.
- AC-001을 `reviewing` 상태로 전환하고 첫 번째 설계 질문을 열었다.
- 현재 구현상 `electron-next`는 별도 애플리케이션 패키지이면서 `brandingVariant`, next update channel, 별도 URI scheme/configuration folder를 갖는다.
- **Asked user:** AC-001에 대해 `browser`, `electron`, `electron-next`를 하나의 Product Template의 배포 타깃으로 정의하고, `electron-next`는 별도 제품이 아닌 Next 릴리스 채널/제품 변형으로 규정하는 방향을 승인할지 결정해 달라. 대안은 `electron-next`를 별도 제품 계약으로 분리하는 것이다.

## TURN-007

### 사용자 요청
> 좋아.

### Cocrates 응답
- AC-001을 승인된 Resolution으로 `designed` 상태에 기록했다.
- 다음 의존성 항목인 AC-002를 `reviewing` 상태로 전환했다.
- 실제 패키지 설정을 대조한 결과 browser는 `theia-ide-product-ext`를 사용하고, Electron 계열은 product/updater/launcher 확장을 함께 사용한다.
- **Asked user:** product 확장은 모든 타깃의 공통 핵심 확장으로 정의하고, updater와 launcher는 Electron/AppImage에 한정된 선택적·타깃 특화 확장으로 정의하는 방향을 승인할지 결정해 달라.

## TURN-008

### 사용자 요청
> product 확장이 공통 핵심 확장이면, 거기에는 어떤 내용이 포함되나? 어떤 내용이 애플리케이션 의존적인가? 그 구별은 어떻게 하지?

### Cocrates 응답
- `theia-extensions/product`와 browser/Electron 애플리케이션의 실제 package.json 및 entrypoint를 대조했다.
- product 확장의 공통 frontend 기여를 branding, Getting Started, About dialog, Help 메뉴, AI registry configuration으로 구체화했다.
- product 패키지 안의 Electron main icon contribution과 애플리케이션 package.json의 Electron 설정을 애플리케이션 의존 영역으로 분리했다.
- **Asked user:** product를 "모든 기능이 모든 타깃에서 동일하게 실행되는 확장"이 아니라 "공통 frontend 기여와 타깃별 entrypoint를 함께 제공하는 제품 확장"으로 정의하는 해석을 검토해 달라.

## TURN-009

### 사용자 요청
> product 확장에 정의된 것이 application에서 다르게 정의될 수 있나? 아니면, 확장이므로 application에서 정의된 것을 product 확장에서 덮어 쓰게 되나?

### Cocrates 응답
- Theia DI 코드를 확인해 product 확장이 `AboutDialog`와 `AIRegistryConfiguration`을 명시적으로 `rebind`하는 사실을 확인했다.
- product 확장이 모든 애플리케이션 설정을 자동으로 덮는 것은 아니며, DI 서비스는 명시적 rebind 여부와 모듈 로딩 순서에 따라 교체될 수 있고, 애플리케이션 `package.json` 설정은 별도 설정 계층으로 동작한다고 정리했다.
- `spec/AC.md`에 이 구별과 실제 구현 근거를 Notes로 기록했다.
- **Asked user:** 이 구별을 반영한 AC-002 Resolution을 검토해 달라. 핵심은 "product는 명시적으로 rebind한 Theia 서비스만 교체하고, 애플리케이션 설정 전체를 덮어쓰지 않는다"는 것이다.

## TURN-010

### 사용자 요청
> 동일한 서비스 계약을 product 확장에서 대체하고, application에서도 대체하면 어떻게 되는가에 관한 질문인데

### Cocrates 응답
- 생성된 Browser frontend 모듈 로딩 순서를 확인했다. 현재 `theia-ide-product-ext` 모듈은 다른 frontend 모듈 뒤에서 load된다.
- 동일한 DI 계약을 양쪽에서 `rebind`하면 마지막으로 load된 모듈의 구현이 최종 바인딩이 된다. 현재 구조에서 애플리케이션 모듈이 product보다 먼저 로드되면 product가 이기고, product 이후에 로드되면 애플리케이션이 이긴다.
- 애플리케이션이 `bind`만 하면 기존 바인딩과 중복되어 단일 서비스 조회에서 모호성/오류가 발생할 수 있으므로 동일 계약 대체에는 `rebind`와 명시적 로딩 순서가 필요하다.
- `package.json`의 애플리케이션 설정은 DI 바인딩과 별도 계층이므로 이 규칙을 적용하지 않는다.
- **Asked user:** AC-002의 제품 확장 계약에 "동일 서비스의 최종 구현은 DI 모듈 로딩 순서에 따른다"는 규칙을 포함할지 결정해 달라.

## TURN-011

### 사용자 요청
> 일반적으로 보면, application 모듈이 먼저 로드되고, 확장 모듈이 로드될 것 같은데... 그렇다면, application 모듈에서 rebind해도, 확장에서 rebind하면 확장의 것이 사용될 수 있을 것 같아. 이런 맥락으로 보면, application에서는 rebind를 하는 방식의 확장은 바람직하지 않음. 더군다나 product 확장이 application 공통이라는 것도 적절하지 않음.
>
> 정리하면, theia ide에서 이런 기능 확장은 theia-ext으로 만들어져야 하고, 설정만 application에 두어야 하는 것 아닐까? product 확장이 공통이라기 보다는 theia ide에 필요한 theia platform의 확장이라고 해석해야 하지 않을까?

### Cocrates 응답
- 기존의 "product는 공통 핵심 확장" 해석이 부정확하다는 점을 반영했다.
- `product`를 모든 채택 애플리케이션의 공통 계약이 아니라 Eclipse Theia IDE 제품에 필요한 제품 수준 Theia 확장으로 재해석했다.
- 기능 확장은 `theia-extensions/*`에 두고, application에는 타깃별 설정·의존성·실행/패키징 구성을 두는 후보 Resolution을 AC-002에 기록했다.
- 현재 구현의 `AboutDialog`·`AIRegistryConfiguration` rebind 때문에 application에서 동일 계약을 다시 대체하는 방식은 권장 확장 경계가 아니라는 점을 기록했다.
- **Asked user:** 이 해석을 AC-002의 Resolution으로 확정할지 승인해 달라.

## TURN-012

### 사용자 요청
> ok

### Cocrates 응답
- AC-002를 승인된 Resolution으로 `designed` 상태에 기록했다.
- `theia-extensions/*`를 Eclipse Theia IDE 제품 기능 확장 영역으로, `applications/*`를 타깃별 설정·의존성·실행/패키징 조합 영역으로 확정했다.
- `product`의 `AboutDialog`·`AIRegistryConfiguration` rebind는 애플리케이션의 일반적인 override 지점으로 보장하지 않는다고 기록했다.
- 다음 의존성 항목인 AC-003을 `reviewing` 상태로 전환했다.
- **Asked user:** AC-003에서 채택자가 변경할 수 있는 제품 표면을 앱 설정 중심으로 한정할지 결정해 달라.

## TURN-013

### 사용자 요청
> ok

### Cocrates 응답
- AC-003을 승인된 Resolution으로 `designed` 상태에 기록했다.
- 공식 커스터마이징 표면을 앱 설정·리소스 교체 중심으로 확정했다.
- 제품 기능 변경은 application의 임의 `rebind`가 아니라 별도 Theia 확장으로 분리한다고 기록했다.
- 다음 의존성 항목인 AC-004를 `reviewing` 상태로 전환했다.
- **Asked user:** Spec-구현 일치 검증에서 정적 대조와 실제 실행 검증을 어떤 수준으로 요구할지 결정해 달라.

## TURN-014

### 사용자 요청
> ok

### Cocrates 응답
- AC-004를 승인된 Resolution으로 `designed` 상태에 기록했다.
- 검증은 정적 대조를 기본으로 하되 가능한 lint/build/test/runtime 실행을 추가하고, 실행 불가 항목은 사유와 증거 수준을 분리 기록하는 방식으로 확정했다.
- 네 개의 blocking AC가 모두 `designed` 상태가 되어 AC review 단계의 설계 작업을 완료했다.
- **Asked user:** AC-001부터 AC-004까지의 최종 Resolution을 검토하고, AC review를 종료하여 ASR 통합 단계로 이동할지 승인해 달라.

## TURN-015

### 사용자 요청
> 계속해줘

### Cocrates 응답
- AC review 종료 승인을 기록하고 T-004를 완료 처리했다.
- `spec/ASR.md`를 작성해 PRD의 제품 요구사항과 AC-001~AC-004의 Resolution을 ASR-001~ASR-007로 통합했다.
- `spec/AC.md`에 ASR back-link를 기록했다.
- ASR의 Spec 작성 Dependency Order를 `ASR-001 → ASR-002 → ASR-003 → ASR-004 → ASR-005 → ASR-006 → ASR-007`로 설정했다.
- **Asked user:** `spec/ASR.md`의 통합 내용과 Dependency Order를 검토하고 승인해 달라.

## TURN-016

### 사용자 요청
> spec은 application(browser/electron/electron-next)으로의 통합과 관련된 내용과 3개의 확장을 구분해서 작성하는 것이 좋겠어.

### Cocrates 응답
- 최종 Spec을 하나의 파일로 합치지 않고 다음 네 개로 분리하는 방향으로 ASR을 수정했다.
  - `spec/applications-integration.md`
  - `spec/product-extension.md`
  - `spec/updater-extension.md`
  - `spec/launcher-extension.md`
- ASR-003~ASR-005를 product/updater/launcher 확장별 요구사항으로 분리했다.
- 애플리케이션 통합, 채택자 설정, 빌드·패키징·플러그인 흐름과 런타임 제약은 applications-integration Spec에 배치했다.
- T-006의 산출물 경로를 네 개의 Spec과 Spec review 기록으로 갱신했다.
- **Asked user:** 수정된 `spec/ASR.md`의 네 Spec 분할과 Dependency Order를 검토하고 승인해 달라.

## TURN-017

### 사용자 요청
> 진행해줘

### Cocrates 응답
- ASR 분할과 Dependency Order 승인을 기록하고 T-005를 완료 처리했다.
- 최종 Spec을 애플리케이션 통합과 세 확장으로 분리해 작성했다.
- 생성한 Spec은 `spec/applications-integration.md`, `spec/product-extension.md`, `spec/updater-extension.md`, `spec/launcher-extension.md`다.
- 각 Spec은 독립적으로 Requirements/Constraints/Out of Scope를 포함하며 ASR의 설계 결과를 자체적으로 담고 있다.
- **Asked user:** 네 개의 Spec 초안을 검토하고 Spec review 단계의 승인을 진행할지 결정해 달라.

## TURN-018

### 사용자 요청
> ok

### Cocrates 응답
- 네 개의 Spec 초안을 검토하고 Updater/Launcher의 모호한 entrypoint 요구사항을 실제 `package.json` 경로로 구체화했다.
- 통합 Spec review 기록을 `spec-review/theia-ide-product-template.md`에 작성했다.
- SSOT 충분성, ASR 반영, 문서 간 일관성, 설계 공백, 모호성 검사를 모두 통과로 기록했다.
- **Asked user:** 네 개의 Spec을 구현·검증의 SSOT로 승인해 달라.

## TURN-019

### 사용자 요청
> 좋아 다음 진행해줘.

### Cocrates 응답
- Spec 승인과 T-006을 완료 처리했다.
- 확정 Spec에서 제품 백로그를 `PB-002` 애플리케이션 통합, `PB-003` product 확장, `PB-004` updater 확장, `PB-005` launcher 확장으로 분해하고 모두 이미 구현된 상태로 완료 처리했다.
- `verification/theia-ide-product-template.md`를 작성했다.
- `yarn lint`, `yarn build:extensions`, `yarn build:applications:dev`, `yarn build:applications:next:dev`가 성공했다.
- Electron 테스트는 9건 통과했지만 전체 테스트에서 Electron Next E2E가 Chrome 초기화 중 실패했다. 이를 C-004 partial로 기록했으며, 조용히 통과 처리하지 않았다.
- **Asked user:** Electron Next E2E 실패를 수정하는 ⑨ feedback loop로 이동할지, 현재 환경/테스트 초기화 문제를 검증 제한으로 수용하고 스프린트 완료 검토로 이동할지 결정해 달라.

## TURN-020

### 사용자 요청
> 1. yarn electron-next package:preview && yarn electron-next test 로 실행하니까 잘 동작하고 9개 모두 pass 했는데...
> 2. yarn browser start로 실행하고, localhost:3000으로 브라우저에서 확인하니까 잘 동작함.
> ----
> 내가 테스트하는 환경과 검증 환경이 어떻게 다른지 확인해줘.

### Cocrates 응답
- Electron Next Preview 패키징 태스크를 먼저 실행한 뒤 Electron Next 테스트를 재실행했고 9개 모두 통과했다.
- Preview 없이 실행한 최초 `yarn test`는 기존 `dist` 산출물을 사용하므로 사용자 명령과 실행 전제가 달랐음을 확인했다.
- Preview 재생성 후 root `yarn test`도 Electron 9개와 Electron Next 9개 모두 통과했다.
- Browser는 Electron `dist`를 사용하지 않고 `yarn browser start`로 개발 서버를 실행하는 별도 lifecycle임을 확인했다.
- 검증 기록의 C-004를 partial에서 pass로 정정하고 환경 차이 분석을 `verification/theia-ide-product-template.md`에 기록했다.
- **Asked user:** 수정된 검증 결과를 승인하고 스프린트 완료 검토로 진행할지 확인해 달라.

## TURN-021

### 사용자 요청
> 검증 문제가 반복되지 않도록 AGENTS.md 파일에 보완하는 것이 어떨까?

### Cocrates 응답
- 현재 `AGENTS.md`에도 Electron preview 후 E2E를 실행하는 안내는 있지만, Electron Next에 대한 명시적 lifecycle과 fresh `dist` 전제는 부족하다고 확인했다.
- 다음 내용을 Verification guide에 추가하는 방안을 제안했다.
  - Electron과 Electron Next는 각각 `package:preview`를 먼저 실행
  - Preview가 생성한 fresh `dist`를 대상으로 해당 앱의 test 실행
  - 개발 build만 수행한 뒤 Electron E2E를 실행하지 않음
  - Browser는 `browser start`를 별도 프로세스로 유지하고 `localhost:3000`을 수동 확인
  - 검증 후 장기 실행 서버 종료 및 산출물 상태 확인
- **Asked user:** 이 보완안을 `AGENTS.md`에 반영할지 결정해 달라.

## TURN-022

### 사용자 요청
> ok

### Cocrates 응답
- `AGENTS.md`의 Verification guide를 보완했다.
- 일반 Electron과 Electron Next의 Preview-first E2E 명령을 각각 명시했다.
- 개발 빌드만 실행한 뒤 E2E를 실행하지 않도록 stale `dist` 방지 규칙을 추가했다.
- Browser를 Electron과 별도 lifecycle로 분리하고 `yarn browser start` 및 `localhost:3000` 확인 절차를 명시했다.
- Preview/E2E 후 다음 테스트에서 대상 Preview를 다시 생성하도록 기록했다.
- **Asked user:** —

## TURN-023

### 사용자 요청
> sprint 종료/경계처리해줘.

### Cocrates 응답
- sprint-00 완료 검토를 승인된 것으로 기록했다.
- 목표, Spec/Spec review, 제품 백로그, lint/build/test 및 Browser 검증 결과를 모두 완료 상태로 확인했다.
- `T-009` 데모·결과 정리와 `T-010` Sprint Boundary를 닫고 sprint-00 보드와 대화 로그를 보관했다.
- 제품 백로그의 모든 PB 스토리가 완료되어 후속 제품 스프린트 없이 deliverable을 종료했다.
- **Asked user:** —
