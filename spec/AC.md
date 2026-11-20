# Architectural Concerns

Theia IDE Product Template의 제품 Spec 작성을 위해 설계가 필요한 구조적 관심사 등록부다.

## Summary

| ID | Title | Category | Status | Related ADRs | ASR (after ④) |
|----|-------|----------|--------|--------------|---------------|
| AC-001 | 애플리케이션 타깃의 역할과 공통 경계 | Structure & organization | identified | — | — |
| AC-002 | 제품 확장의 구성 및 의존성 경계 | Integration & dependencies | identified | — | — |
| AC-003 | 채택자 커스터마이징 표면의 지원 범위 | Deliverable form | identified | — | — |
| AC-004 | 제품 Spec-구현 일치 검증의 증거 수준 | Quality bar (architectural) | identified | — | — |

## Dependency Order (recommended review path)

1. AC-001 → AC-002 → AC-003 → AC-004

## AC Detail

### AC-001 — 애플리케이션 타깃의 역할과 공통 경계

- **Category:** Structure & organization
- **Status:** identified
- **Statement:** `applications/browser`, `applications/electron`, `applications/electron-next`를 하나의 Product Template 안에서 어떤 역할과 공통 계약으로 정의할 것인가? Electron과 Electron Next의 차이를 별도 제품 변형으로 볼지, 동일 제품의 릴리스 채널로 볼지 정해야 한다.
- **Why it matters:** 애플리케이션별 요구사항과 공통 요구사항을 구분하지 않으면 Spec과 제품 백로그가 중복되거나, 한 타깃의 동작을 다른 타깃의 보장으로 잘못 해석할 수 있다.
- **Depends on:** —
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** —
- **Notes:** PRD의 제품 capabilities와 현재 각 애플리케이션 `package.json` 설정을 함께 기준으로 검토한다.

### AC-002 — 제품 확장의 구성 및 의존성 경계

- **Category:** Integration & dependencies
- **Status:** identified
- **Statement:** `theia-extensions/product`, `theia-extensions/updater`, `theia-extensions/launcher`를 Product Template의 필수 구성으로 어떻게 정의하고, 각 확장의 적용 대상과 Theia 애플리케이션과의 의존성 방향을 어디까지 보장할 것인가?
- **Why it matters:** 확장을 하나의 묶음으로만 기술하면 채택자가 선택적으로 재사용할 수 있는 경계와 Electron 전용 기능의 제약을 알 수 없다.
- **Depends on:** AC-001
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** —
- **Notes:** 제품 확장 패키지와 Electron/browser target의 실제 의존성 선언을 대조한다.

### AC-003 — 채택자 커스터마이징 표면의 지원 범위

- **Category:** Deliverable form
- **Status:** identified
- **Statement:** Product Template이 채택자에게 보장하는 커스터마이징 표면을 앱 이름·아이콘·URI scheme·configuration folder·패키지 설정으로 한정할 것인가, 아니면 확장/플러그인 구성 변경까지 제품 계약에 포함할 것인가?
- **Why it matters:** README와 ADOPTER 문서가 안내하는 재사용 범위와 최종 Spec의 제품 계약이 어긋나면 채택자가 지원되지 않는 내부 구조에 의존할 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** —
- **Notes:** `ADOPTER.md`, `docs/rebranding.md`, 애플리케이션 설정을 검토한다.

### AC-004 — 제품 Spec-구현 일치 검증의 증거 수준

- **Category:** Quality bar (architectural)
- **Status:** identified
- **Statement:** 이미 구현된 Product Template의 Spec 일치 여부를 문서·설정·스크립트 정적 대조만으로 판정할 것인가, 아니면 실제 lint/build/test/package/runtime 실행을 필수 증거로 요구할 것인가?
- **Why it matters:** 실행 검증은 높은 신뢰도를 주지만 환경·시간·외부 플러그인에 의존한다. 정적 대조만 허용하면 실행 경로의 결함을 놓칠 수 있다.
- **Depends on:** AC-001, AC-002
- **Related ADRs:**
  - —
- **Resolution path:** direct-input
- **Resolution:** —
- **Notes:** 검증 단계에서 실행 가능한 명령과 환경 제약을 함께 기록한다.
