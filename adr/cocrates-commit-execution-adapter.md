# 자동 commit 실행 어댑터

## Concern
자동 실행이 승인된 구조화 응답의 `commit` 필드를 어떤 실행 어댑터 경계에서 처리할 것인가?

## Status
proposed

## Context
- 상위 side effect 결정은 유효한 JSON의 `commit`을 제품 런타임이 자동 실행하도록 승인했다.
- 사용자 대상 전용 도구·명령을 추가하지 않으며, 실행 전 workspace/repository 경로, 입력 형식, commit message, staged 변경 상태를 검증해야 한다.
- Theia 1.77의 채팅 파이프라인에는 JSON 필드에서 git commit으로 이어지는 기본 라우팅이 없다.
- commit은 저장소 이력을 변경하므로 실패·거부·재처리 상태를 `answer` 표시와 분리해 기록해야 한다.
- 이번 결정은 실행 경계를 정하는 것이며, 자동 rollback/undo 정책은 상위 ADR에 따라 별도 revert 흐름으로 남긴다.

## Decision

## Options
### Option A — 기존 shell/git 경계 재사용
- 제품 런타임이 기존 shell/git 실행 경계를 내부 어댑터로 호출하고, 외부에 새 사용자 대상 도구·명령을 노출하지 않는다.
- Pro: 현재 저장소의 git CLI 동작과 검증·오류 출력을 활용할 수 있고 구현 범위가 가장 작다.
- Con: 명령 인자 구성·환경·프로세스 종료·출력 파싱을 제품이 책임져야 하며, shell 경계가 허용하는 권한과 안전성을 엄격히 제한해야 한다.

### Option B — Theia SCM API 직접 사용
- 제품 확장이 Theia SCM 서비스와 repository/provider 경계를 통해 staged 변경과 commit을 직접 요청한다.
- Pro: Theia의 workspace/repository 모델과 UI 상태에 가까우며 shell quoting과 프로세스 관리 위험을 줄일 수 있다.
- Con: Theia 1.77의 공통 SCM API가 모든 provider에 동일한 commit 기능을 보장하는지 확인해야 하고, provider별 capability·오류·메시지 차이를 흡수해야 한다.

### Option C — 전용 backend service
- 제품 확장은 commit 요청을 전용 backend service에 전달하고, backend가 repository 권한·실행·멱등성·감사를 담당한다.
- Pro: 실행 권한, 감사 로그, 재시도, 멱등성, 정책 집행을 중앙화하기 가장 쉽다.
- Con: IPC/네트워크 계약, service lifecycle, 보안 경계, 오류 전달을 새로 설계해야 하며 현재 단일 데스크톱 제품 범위에 비해 비용과 운영 복잡성이 크다.

## Tradeoffs
| | Option A — shell/git | Option B — Theia SCM | Option C — backend service |
|---|---|---|---|
| 현재 제품과의 적합성 | 높음: 기존 실행 경계 재사용 | 중간~높음: Theia 모델에 정합 | 낮음: 새 실행 계층 필요 |
| 구현 비용 | 낮음 | 중간 | 높음 |
| shell/프로세스 위험 | 높음 | 낮음~중간 | backend로 격리 가능 |
| provider 호환성 | git CLI 기준으로 높음 | provider capability에 의존 | backend 구현 범위에 의존 |
| 권한·감사·멱등성 | 제품에서 직접 구현 | 제품에서 직접 구현 | 중앙화하기 쉬움 |
| 오류·진행 상태 연결 | 프로세스 출력 변환 필요 | API 결과 변환 필요 | IPC/네트워크 상태 변환 필요 |
| 오프라인·데스크톱 단순성 | 높음 | 높음 | 낮음 |
| 향후 확장성 | 중간 | 중간 | 높음 |

## Recommendation
- **Option A — 기존 shell/git 경계 재사용**을 권고한다.
- 이번 Sprint의 범위는 Theia 1.77 제품 확장에서 승인된 자동 commit 계약을 구현하는 것이며, 전용 backend를 운영할 요구사항은 없다.
- Theia SCM API는 provider별 commit capability가 현재 요구를 안정적으로 충족하는지 추가 확인해야 하므로 기본 경로로 선택하기에는 불확실성이 있다.
- Option A를 선택하더라도 임의 shell 문자열을 조합하지 않고, repository root를 workspace 서비스로 확정한 뒤 고정된 git 인자 배열과 검증된 commit message만 전달한다. 실행 결과·exit code·처리 식별자를 별도 상태로 기록하고 동일 응답 재처리를 차단한다.

## Consequences
- commit adapter는 제품 확장 내부에서 repository 검증, staged 상태 확인, commit message 검증, 프로세스 실행, 결과 기록을 담당한다.
- shell/git 경계는 입력을 단일 문자열로 연결하지 않는 API 또는 인자 배열 실행 방식을 사용해야 한다.
- git 설치 여부, repository 상태, staged 변경 없음, hook 실패, 권한 오류를 각각 실패 상태로 구분해야 한다.
- Theia SCM provider의 commit API를 기본 실행 경로로 사용하지 않으며, provider capability가 없는 경우에도 동작하는 CLI 경계를 우선한다.
- 전용 backend service의 중앙 감사·정책 집행은 이번 범위에서 구현하지 않는다.

## Downstream Concerns
- [x] **covered — Session title adapter:** 기존 `ChatService.renameSession` 경계를 사용한다.
- [x] **covered — Commit input validation:** repository root, staged 변경, message, 실행 인자를 제품 경계에서 검증한다.
- [x] **deferred assumption — Backend migration:** 다중 사용자·원격 workspace·중앙 감사 요구가 생길 때 backend service ADR을 다시 연다.
- [x] **out of scope — Undo/revert:** 원 commit 삭제가 아닌 별도 revert 흐름으로 처리한다.

## Related
- `theia-ide/adr/cocrates-json-side-effect-safety.md` — parent decision
- `theia-ide/spec/cocrates-structured-final-response.md` — R-007~R-009, C-003
- `theia-ide/docs/theia/structured-output-side-effects.md`

## Notes
- 2026-11-21: 상위 side effect ADR의 후속 concern으로 생성했다. 세 실행 경계를 비교하고 Option A를 권고한다.
