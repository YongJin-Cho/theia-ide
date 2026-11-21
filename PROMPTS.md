# sprint-01 대화 로그

> **스프린트 계획:** [`scrum/sprint-01.md`](./scrum/sprint-01.md)
> **실행 보드:** [`TODO.md`](./TODO.md)

## TURN-001

### 사용자 요청
> PROMPTS.md에 sprint-01 대화 로그를 저장해주고, 전체 타깃 변경으로 진행해줘.

### Cocrates 응답
- Electron Next를 포함한 전체 타깃 변경을 승인된 결정으로 기록했다.
- Browser와 Stable Electron은 Cocrates로 변경하고, Electron Next는 `Cocrates Next` 변형으로 유지하는 범위를 확정했다.
- `scrum/sprint-01.md`에 리브랜딩 요구사항을 Spec과 제품 백로그에 반영하는 sprint-01 계획을 작성했다.
- `scrum/product-backlog.md`에 `PB-006` Cocrates 전체 타깃 리브랜딩 요구사항 및 Spec 확정 스토리를 추가했다.
- 이 단계는 Sprint plan approval 전이므로 `TODO.md` 실행 보드를 시드하지 않았고, Spec 본문이나 구현도 아직 변경하지 않았다.
- **Asked user:** sprint-01 계획을 승인하고 실행 보드를 시드한 뒤 리브랜딩 PRD delta부터 진행할지 결정해 달라.

## TURN-002

### 사용자 요청
> sprint-01 계획을 승인하고 실행 보드를 시드한 뒤 리브랜딩 PRD delta부터 진행해줘.

### Cocrates 응답
- sprint-01 계획 승인을 기록했다.
- `TODO.md`를 sprint-01 실행 보드로 전환하고 T-001부터 T-010까지 SDD Spec→backlog 변경 작업을 시드했다.
- `spec/PRD.md`에 Browser, Stable Electron, Electron Next(`Cocrates Next`) 전체 타깃 리브랜딩 범위와 성공 기준을 추가했다.
- 현재 T-001 PRD delta 작성이 완료되었고, 구현 전에 PRD 승인 게이트를 기다리고 있다.
- **Asked user:** `spec/PRD.md`의 리브랜딩 변경 범위와 성공 기준을 검토하고 승인해 달라.

## TURN-003

### 사용자 요청
> PRD delta를 승인하고 다음 단계로 계속해줘.

### Cocrates 응답
- PRD delta 승인을 기록하고 T-002를 완료 처리했다.
- 기존 AC-001~AC-004를 유지하면서 리브랜딩 범위에서 새로 발생한 구조적 질문을 `spec/AC.md`에 추가했다.
- 새 blocking AC는 Cocrates 타깃 식별자 체계(AC-005), 제품 브랜드와 Theia 업스트림 명칭의 경계(AC-006), 업데이트·배포 메타데이터의 제품 소유 범위(AC-007)다.
- AC-005 → AC-006 및 AC-007의 의존 순서를 제안했으며, 아직 어느 결정도 임의로 확정하지 않았다.
- 현재 T-003 AC 식별이 완료되었고, AC 목록 승인 게이트를 기다리고 있다.
- **Asked user:** `spec/AC.md`의 새 blocking AC-005~AC-007과 Dependency Order를 검토하고 승인해 달라.

## TURN-004

### 사용자 요청
> AC 목록과 Dependency Order를 승인하고 계속해줘.

### Cocrates 응답
- AC 목록 승인을 기록하고 T-003과 T-004를 완료 처리했다.
- Dependency Order에 따라 첫 unsettled concern인 AC-005를 `reviewing` 상태로 전환했다.
- `adr/cocrates-target-identifiers.md`를 제안 상태로 작성해 Cocrates/`Cocrates Next`의 앱 식별자·URI scheme·configuration folder·패키지 식별자에 대한 세 가지 대안을 비교했다.
- Option A(`com.cocrates.ide` / `cocrates` / `.cocrates`, Next는 `.next` 분리)를 권장했으며, 실제 reverse-domain 정책과 기존 Theia 사용자 데이터 마이그레이션은 별도 확인이 필요하다.
- 아직 AC-005를 확정하지 않았고, AC-006과 AC-007 검토는 AC-005 결정 뒤에 진행한다.
- **Asked user:** `adr/cocrates-target-identifiers.md`의 옵션을 검토하고 Cocrates 타깃 식별자 체계를 선택해 달라.

## TURN-005

### 사용자 요청
> 좋아.

### Cocrates 응답
- `좋아`를 권장안인 Option A 승인으로 기록했다.
- `adr/cocrates-target-identifiers.md`를 `approved`로 갱신하고 Stable/Next 식별자 매핑을 Decision에 기록했다.
- AC-005에 Option A의 구체적 Resolution과 승인된 ADR 링크를 반영했다.
- 기존 사용자 데이터 마이그레이션과 실제 `com.cocrates` reverse-domain 정책은 새 식별자 계약에 직접 영향을 주므로 후속 concern으로 남겼다.
- 후속 concern이 정리되기 전까지 AC-005는 `reviewing` 상태를 유지한다.
- **Asked user:** 기존 `.theia-ide` 사용자 데이터 마이그레이션과 `com.cocrates` reverse-domain을 이번 범위에서 별도 결정하지 않고 deferred assumption으로 두고 AC-005를 완료 처리할지 결정해 달라.

## TURN-006

### 사용자 요청
> 1. 마이그레이션은 하지 않음.
> 2. com.cocrates OK.

### Cocrates 응답
- 기존 `.theia-ide` 사용자 데이터는 새 `.cocrates` 계열로 자동 마이그레이션하지 않는다고 결정했다.
- `com.cocrates`를 Stable/Next 앱 식별자의 공식 reverse-domain으로 확정했다.
- `adr/cocrates-target-identifiers.md`의 두 후속 concern을 직접 해결로 닫고, AC-005를 `designed`로 변경했다.
- 다음 unsettled concern인 AC-006을 `reviewing`으로 전환했다.
- 제안하는 경계는 사용자에게 보이는 UI·패키징·CLI·문서·배포 메타데이터의 Theia 제품 문자열은 Cocrates로 변경하되, `@theia/*` 패키지명·Theia API·업스트림 도구명처럼 호환성에 필요한 내부 식별자는 유지하는 것이다.
- **Asked user:** 이 사용자 표면/업스트림 호환 식별자 경계를 AC-006 Resolution으로 승인해 달라.

## TURN-007

### 사용자 요청
> ok

### Cocrates 응답
- AC-006 Resolution 승인을 기록했다.
- 사용자 표면·패키징·CLI·문서·배포 메타데이터는 Cocrates 브랜드로 변경하고, `@theia/*`·Theia API·업스트림 도구명은 호환성에 필요한 내부 명칭으로 유지하는 경계를 AC-006에 반영했다.
- AC-006을 `designed`로 닫고, 다음 concern인 AC-007을 `reviewing`으로 전환했다.
- 현재 구현 대조에서 updater의 Next 다운로드 URL은 `https://github.com/eclipse-theia/theia-ide/releases/download/next`, Docker 이미지 태그는 `theia-ide`를 사용한다.
- 실제 Cocrates 릴리스 저장소·CDN·컨테이너 경로는 아직 제공되지 않았다.
- **Asked user:** 실제 배포 엔드포인트가 없는 동안 제품 식별자·artifact/image 이름은 Cocrates로 바꾸되 updater URL·publish URL·문서 링크는 명시적 자리표시자로 남길지, 아니면 예상되는 Cocrates 경로로 확정할지 결정해 달라.

## TURN-008

### 사용자 요청
> github link는 https://github.com/cocrates/theia-ide 로해줘. docker image tag도 cocrates-ide로 해주고.

### Cocrates 응답
- AC-007을 `designed`로 확정했다.
- GitHub 배포 저장소를 `https://github.com/cocrates/theia-ide`로 결정했다.
- Electron Next updater URL은 해당 저장소의 기존 `/releases/download/next` 채널 경로를 사용하도록 정했다.
- Docker image tag는 `cocrates-ide`로 결정했다.
- 별도로 제공되지 않은 CDN·registry 호스트는 추정하지 않도록 범위를 제한했다.
- AC-005, AC-006, AC-007을 모두 확정해 모든 blocking AC가 `designed` 상태가 되었다.
- 현재 AC review stage-exit gate에서 대기 중이다.
- **Asked user:** 확정된 AC-005~AC-007을 포함한 전체 AC review 결과를 승인하고 ASR delta 통합 단계로 진행할지 결정해 달라.

## TURN-009

### 사용자 요청
> 확정된 전체 AC review 결과를 승인하고 ASR delta 통합 단계로 진행해줘.

### Cocrates 응답
- 전체 blocking AC review 승인을 반영하고 ASR delta 통합을 시작했다.
- 기존 ASR-001~ASR-009를 유지하면서 승인된 리브랜딩 결정을 ASR-010 `Cocrates 타깃 식별자 매핑`, ASR-011 `Cocrates 제품 브랜드 경계`, ASR-012 `Cocrates 업데이트·배포 메타데이터`로 추가했다.
- AC-005~AC-007에 각각 ASR back-link를 기록하고 `spec/ASR.md`를 다음 단계인 Spec 갱신의 입력으로 정리했다.
- 현재 T-006은 ASR 승인 게이트이며, 구현은 아직 시작하지 않았다.
- **Asked user:** `spec/ASR.md`의 기존 요구사항과 리브랜딩 delta 통합 결과를 검토하고 승인해줘.

## TURN-010

### 사용자 요청
> ok. Cocrates branding 관련 스펙은 별도 파일로 작성하고 관리하는 것이 좋겠어.

### Cocrates 응답
- `spec/ASR.md`의 리브랜딩 delta 통합을 승인한 것으로 기록하고 T-006을 완료 처리했다.
- 기존 네 컴포넌트별 Spec은 유지하고, 브랜딩 요구사항을 횡단하는 전용 `spec/cocrates-branding.md`를 새 SSOT로 관리하는 방향으로 T-007을 전환했다.
- T-007의 검토 산출물을 `spec-review/cocrates-branding.md`로 지정했다.
- **Asked user:** 전용 브랜딩 Spec 하나(`spec/cocrates-branding.md`)로 관리하는 권장 구조를 확인해 달라. 이 구조를 승인하면 초안 작성과 Spec review를 진행한다.
