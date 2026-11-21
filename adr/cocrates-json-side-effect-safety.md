# Cocrates JSON side effect 실행 안전성

## Concern
JSON의 `session`과 `commit` 필드를 어떤 제품 서비스·권한·실패 처리 경계에서 실행할 것인가?

## Status
approved

## Context
- Cocrates 최종 JSON의 `answer`는 사용자에게 표시하지만 `session`과 `commit`은 제품 런타임 side effect다.
- 세션 제목 변경은 현재 Chat 세션 메타데이터를 변경하고, git commit은 저장소 이력을 변경하는 작업이다.
- 모델 출력은 신뢰할 수 없는 입력으로 취급해야 하며, malformed JSON·중복 실행·부분 성공·권한 오류를 구분해야 한다.
- AC-012에서 `response_format`과 structured tool call은 사용하지 않고 prompt-only JSON + 완료 후 파싱을 사용하기로 결정했다.

## Decision
**Option A — 파싱 직후 자동 실행**을 선택한다. 유효한 JSON의 `session`과 `commit`을 제품 런타임이 자동 처리한다. commit은 실행 전 기본 입력·저장소 검증을 수행하고, 실행 결과를 응답 상태에 기록한다. 사용자가 commit을 되돌려야 하는 경우 별도 undo/revert 흐름으로 복구한다. 전용 도구·명령을 사용자에게 추가로 노출하는 Option C는 채택하지 않는다.

## Options
### Option A — 파싱 직후 자동 실행
- 유효한 JSON을 파싱하면 `session`과 `commit`을 즉시 실행한다.
- Pro: 사용자 요청에서 side effect까지 자동화되고 구현 흐름이 단순하다.
- Con: 모델이 반환한 commit이 사용자 확인 없이 저장소 이력을 변경하며, 재시도·중복 실행 위험이 크다.

### Option B — 안전 검증 후 사용자 확인 및 실행
- `session`은 검증된 문자열로 제목을 변경하고, `commit`은 저장소·staged 상태·메시지를 검증한 뒤 명시적 사용자 확인을 거쳐 실행한다.
- Pro: 되돌리기 어려운 git 변경을 사용자 통제 아래 둔다.
- Con: 한 번의 JSON 응답으로 즉시 완료되지 않으며 확인 UI/상태 관리가 필요하다.

### Option C — side effect를 전용 도구·명령으로 분리
- JSON 파서는 필드와 의도만 추출하고, 실제 세션 변경·commit은 별도 제품 명령 또는 tool 계약이 수행한다.
- Pro: 실행 권한·감사·재시도 경계를 명확히 분리할 수 있다.
- Con: JSON 처리와 tool/command 상태를 연결하는 추가 조정이 필요하다.

## Tradeoffs
| | Option A | Option B | Option C |
|---|---|---|---|
| 사용자 통제 | 낮음 | 높음 | 높음 |
| 구현 단순성 | 높음 | 중간 | 낮음~중간 |
| git 안전성 | 낮음 | 높음 | 높음 |
| 응답 즉시성 | 높음 | 중간 | 중간 |
| 감사·재시도 | 낮음 | 중간 | 높음 |

## Recommendation
- 초기 권고는 Option C였으나, 사용자가 사용자 대상 전용 도구·명령을 추가하지 않기를 원하고 commit undo/revert 흐름을 수용해 Option A를 선택했다.
- `session`은 기존 ChatService 세션 제목 API를 사용하되 입력 검증을 거친다. `commit`은 저장소 루트 확인, staged 변경 확인, commit message 검증을 거친 뒤 자동 실행한다.

## Consequences
- JSON 파싱 성공과 side effect 성공은 별도 상태로 기록한다.
- commit은 사용자 확인 없이 자동 실행되므로, 저장소·staged 변경·commit message 기본 검증과 실행 결과 기록이 필수다.
- commit 실패는 `answer`를 숨기거나 성공으로 표시하지 않고 사용자에게 오류를 전달해야 한다.
- 동일 응답 재처리 시 commit이 중복 실행되지 않도록 idempotency 또는 처리 표시가 필요하다.
- undo는 원래 commit을 삭제하는 것이 아니라 별도 revert/복구 흐름으로 처리한다.

## Downstream Concerns
- [ ] **ADR candidate — Commit execution adapter:** 기존 shell/git tool, SCM API, 전용 backend service 중 실행 어댑터를 결정한다.
- [x] **covered — Session title:** 기존 ChatService 세션 제목 변경 API를 우선 사용한다.
- [x] **deferred assumption — Undo:** commit undo는 이번 AC에서 자동 rollback이 아니라 별도 revert/복구 흐름으로 다룬다.
- [x] **directly resolved — Untrusted output:** 모델 JSON 필드와 commit message는 신뢰할 수 없는 입력으로 검증한다.

## Related
- `theia-ide/spec/AC.md` — AC-013
- `theia-ide/adr/cocrates-structured-response-parsing.md`
- `theia-ide/docs/theia/structured-output-side-effects.md`

## Notes
- 2026-11-21: AC-013 검토를 위해 제안 상태로 생성했다. Option C를 권장한다.
- 2026-11-21: Status → approved; 사용자가 Option A 자동 실행을 선택했다. commit 문제는 별도 undo/revert 흐름으로 처리한다.
