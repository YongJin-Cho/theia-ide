# PRD: Theia IDE Boilerplate 구현 기반 지침 및 Spec 복원

## Summary

Theia 플랫폼으로 IDE를 개발하는 이 저장소의 구현을 조사해, 이후 작업자를 위한 루트 `AGENTS.md`와 구현·검증의 기준이 되는 승인된 Spec을 복원한다. 이미 존재하는 애플리케이션, 확장, 빌드, 패키징, 테스트 구성을 새 기능으로 변경하지 않고 문서와 요구사항으로 정확히 기록한다.

## Goals

- 저장소의 구조, 모듈 관계, 개발 명령, 패키징 제약, 검증 절차를 `AGENTS.md`로 제공한다.
- 구현에서 확인되는 제품 요구사항과 구조적 제약을 SDD 산출물(PRD, AC, ASR, Spec)로 복원한다.
- 확정된 Spec을 제품 백로그로 표현하고 현재 구현이 각 항목을 충족하는지 검증한다.

## Audience

- Theia 기반 데스크톱 또는 브라우저 제품을 개발하는 저장소 유지보수자
- 이 저장소에 처음 참여해 빌드·패키징·확장 구조를 이해해야 하는 개발자
- Spec과 실제 구현의 일치 여부를 검토하는 리뷰어

## Deliverables

- `AGENTS.md`: 저장소 루트의 개발 context 및 작업 지침
- `spec/PRD.md`, `spec/AC.md`, `spec/ASR.md`: 복원 과정의 SDD 산출물
- `spec/boilerplate-context.md`: 구현과 검증의 최종 Spec
- `spec-review/boilerplate-context.md`: Spec 검토 및 승인 기록
- `scrum/product-backlog.md`: 확정 Spec에서 생성된 제품 백로그
- `verification/boilerplate-context.md`: Spec-구현 일치 검증 기록

## Scope

### In Scope

- 루트, `applications`, `theia-extensions`, `plugins`, `scripts`, `configs`, `docs`, `next`의 구현 context 조사
- 브라우저·Electron·Electron Next 애플리케이션과 product/updater/launcher 확장의 역할 및 연결 기록
- 설치, 개발/프로덕션 빌드, 플러그인 다운로드, 패키징, 실행, 린트, 테스트 명령의 구현 대조
- Theia 버전, Node/Yarn 제약, asar 및 `theia-patch` 등 비자명한 패키징·설치 제약 기록
- 구현에서 복원한 요구사항을 Spec과 제품 백로그로 정리하고 현재 구현과 대조

### Out of Scope

- 애플리케이션 기능, 확장 기능, 의존성 또는 빌드 파이프라인의 변경
- 새로운 아키텍처 선택, 제품 브랜딩 변경, 성능 개선, 버그 수정
- 존재하지 않는 요구사항이나 미래 제품 기능의 추측
- 배포 환경 전체를 재현하는 장시간 패키징 또는 외부 서비스 검증

## Constraints

- 현재 저장소의 파일, 설정, 스크립트, README를 근거로 하며 확인되지 않은 동작은 사실로 기술하지 않는다.
- 문서와 Spec은 저장소의 기존 구현을 설명해야 하며, 문서 복원 과정에서 소스 코드를 변경하지 않는다.
- Theia 1.77.0, Node.js 24 이상, Yarn 1.x 미만 2 버전 제약과 Lerna 워크스페이스 구성을 존중한다.
- 최종 Spec은 구현 및 검증 단계의 SSOT이며, `AGENTS.md`는 작업 방법과 context를 제공하는 orientation 문서다.
- 사용자 승인 게이트가 필요한 SDD 단계는 승인 없이 다음 단계로 진행하지 않는다.

## Success Criteria

- 루트 `AGENTS.md`가 주요 구조, 구현 방법, 검증 방법, 비자명한 Notes를 정확히 설명한다.
- 모든 blocking AC가 설계 또는 deferred로 종료되고, 그 결과가 ASR과 최종 Spec에 반영된다.
- 최종 Spec이 `R-NNN` 및 `C-NNN` 요구사항으로 자체 완결되어 있다.
- 최종 Spec에서 도출한 제품 백로그가 생성되고, 기존 구현이 완료 상태임을 근거와 함께 기록한다.
- 검증 기록이 Spec의 각 요구사항을 실제 파일·설정·명령 또는 실행 결과에 연결한다.
