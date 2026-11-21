# 자동 commit 멱등성 상태 수명

## Concern
동일한 구조화 응답의 자동 commit 재처리를 어느 범위까지 차단하고, 실패한 commit을 어떻게 재시도할 것인가?

## Status
approved

## Context
- R-008은 동일 JSON 응답의 재처리로 commit이 중복 실행되지 않도록 보호할 것을 요구한다.
- 현재 구현은 `request.id`와 commit message를 조합한 키를 프로세스 메모리의 `Set`에 저장한다.
- 메모리 전용 상태는 애플리케이션 재시작 뒤 사라지며, command 실행 전에 키를 기록해 실패한 commit도 재시도할 수 없게 만든다.
- Theia 1.77의 공통 SCM 경계에는 자동 side effect 처리 이력을 보존하는 전용 저장소가 없다.

## Decision
**Option B — 제품 로컬 영속 저장소**를 선택한다. 성공한 commit의 처리 식별자를 제품 로컬 저장소에 영속화해 애플리케이션 재시작 후에도 동일 응답의 중복 commit을 차단하고, 실패한 commit은 재시도 가능한 상태로 남긴다.

## Options
### Option A — 애플리케이션 수명 멱등성
- 현재처럼 메모리 상태를 사용해 실행 중인 애플리케이션에서만 동일 응답을 차단한다.
- Pro: 구현 비용과 저장 구조가 가장 작다.
- Con: 재시작 후 중복 실행을 막지 못하고, durable idempotency 요구를 충족하지 못한다.

### Option B — 제품 로컬 영속 저장소
- 구조화 응답 식별자, commit message, repository 식별자, 상태(`in-flight`, `succeeded`, `failed`)를 제품 로컬 저장소에 기록한다.
- command 실행 성공 후에만 `succeeded`를 확정하고, `failed`는 정책에 따라 재시도 가능하게 한다.
- Pro: 재시작 후에도 중복 성공 commit을 차단하고 실패 복구 경계를 명확히 할 수 있다.
- Con: 저장소 schema·직렬화·동시 실행 잠금과 기존 Theia 세션/저장 경계를 추가로 설계해야 한다.

### Option C — 영속 저장소 없이 보수적 재실행 거부
- 처리 상태를 영속화하지 않고, 현재 실행 중인 상태만 유지하되 재시작 이후에는 동일 응답 여부를 판정할 수 없으므로 자동 commit을 거부한다.
- Pro: 중복 commit 위험을 재시작 이후 최소화한다.
- Con: 정상적인 응답도 재시작 뒤 실행되지 않으며, 응답 식별자와 repository 상태를 확인할 수 없는 사용자에게 거부 오류가 발생한다.

## Tradeoffs
| | Option A — 메모리 수명 | Option B — 로컬 영속 | Option C — 재시작 후 거부 |
|---|---|---|---|
| 재시작 후 중복 방지 | 불가 | 가능 | 자동 실행하지 않음 |
| 실패 후 재시도 | 현재 구현상 불명확 | 상태 정책으로 명시 가능 | 재시작 후 거부 |
| 구현 비용 | 낮음 | 높음 | 중간 |
| 사용자 경험 | 단순하지만 중복 위험 | 상태가 가장 설명 가능 | 보수적이고 거부가 잦음 |
| 현재 sprint 범위 적합성 | 높음 | 낮음~중간 | 중간 |

## Recommendation
- **Option B — 제품 로컬 영속 저장소**를 권고한다. R-008의 재시작 이후 중복 방지와 실패 상태의 명확한 lifecycle을 가장 직접적으로 충족한다.
- 다만 Theia 1.77 제품 확장에 이미 사용할 수 있는 로컬 저장 경계가 확인되지 않으면, 이번 sprint에서는 Option C를 안전한 임시 정책으로 사용하고 영속 저장소를 별도 범위로 기록해야 한다.

## Consequences
- commit 실행 전 `in-flight`, 성공 후 `succeeded`, 실패 후 `failed` 상태를 제품 로컬 저장소에 영속화한다.
- `succeeded` 상태는 동일 응답의 재처리를 차단하고, `failed` 상태는 오류를 기록한 뒤 명시적으로 재시도할 수 있게 한다.
- 동시 실행은 저장소의 원자적 상태 전환 또는 동등한 잠금 경계로 중복 실행을 막는다.
- 실패 상태는 command가 실패한 뒤 재시도할 수 있도록 하되, 동시 실행 중복을 막는 잠금 또는 `in-flight` 상태가 필요하다.
- Option A를 선택하면 R-008의 durable 해석을 충족하지 못하는 deviation을 사용자가 수용해야 한다.
- Option C를 선택하면 재시작 후 자동 commit을 안전하게 거부하는 오류 상태를 사용자에게 제공해야 한다.

## Downstream Concerns
- [x] **directly resolved — SCM change scope:** 사용자의 직접 입력에 따라 staged 여부를 commit 거부 조건으로 사용하지 않고, 선택된 repository provider가 commit 대상으로 노출하는 변경을 모두 처리한다.
- [x] **deferred assumption — Repository identity:** 제품 로컬 저장소를 선택하는 경우 repository root·workspace 식별자 형식은 구현 단계에서 현재 Theia API에 맞춰 정한다.

## Related
- `theia-ide/adr/cocrates-json-side-effect-safety.md`
- `theia-ide/adr/cocrates-commit-execution-adapter.md`
- `theia-ide/spec/cocrates-structured-final-response.md` — R-007~R-008, C-003
- `theia-ide/verification/cocrates-structured-final-response.md`

## Notes
- 2026-11-21: 검증에서 확인된 메모리 전용 멱등성 및 실패 상태 lifecycle 공백에 대한 후속 ADR로 생성했다.
- 2026-11-21: Status → approved; 사용자가 R-008 충족을 위해 Option B — 제품 로컬 영속 저장소를 선택했다. 성공 상태는 재시작 후에도 재처리를 차단하고 실패 상태는 재시도 가능하게 한다.
