# 검증: Cocrates 구조화 최종 응답 및 메시지 이력

**Spec:** `theia-ide/spec/cocrates-structured-final-response.md`
**Artifact(s):** `theia-ide/theia-extensions/product/src/browser/cocrates-structured-response-side-effects.ts`, `theia-ide/theia-extensions/product/src/browser/cocrates-chat-agent.ts`
**Verified:** 2026-11-21
**Scope:** sprint-06 T-003 — session·commit side effect adapter (`R-006`~`R-009`, `C-003`)
**Summary:** 2 pass, 3 partial, 0 fail, 0 not-verifiable

## Inventory & Results

| # | Spec item | Status | Evidence / Notes |
|---|---|---|---|
| 1 | R-006 | pass | `cocrates-structured-response-side-effects.ts:56-70`에서 `ChatService.renameSession(request.session.id, normalizedTitle)`을 호출한다. 빈 제목과 120자 초과 제목을 거부하고 앞뒤 공백을 정규화한다. |
| 2 | R-007 | partial | `:87-117`에서 선택 repository, provider commit command, 입력 길이, pending resource 존재를 확인한 뒤 `CommandService.executeCommand`를 호출한다. 그러나 `provider.groups`의 모든 resource를 staged 변경으로 취급하며 staged/unstaged를 구분하지 않는다. workspace/repository root와 commit message 허용 형식에 대한 명시적 검증도 없다. 따라서 staged 변경 검증을 요구하는 R-007을 완전히 충족하지 않는다. |
| 3 | R-008 | partial | `:75-82`의 `processedCommits` Set으로 동일 `request.id`와 message의 재처리를 차단하고, `:109-117`에서 command 실패를 오류로 기록하며 `:40-52`에서 answer와 오류 표시를 분리한다. 다만 처리 표시가 메모리 전역 Set에만 있어 세션/애플리케이션 재시작 후 보존되지 않으며, 실행 전에 Set에 추가되어 실패 후 재시도를 동일 응답에서 허용하지 않는다. durable idempotency와 실패 상태의 명확한 lifecycle은 미충족이다. |
| 4 | R-009 | pass | 자동 rollback/revert를 구현하지 않으며, 원 commit을 삭제하는 경로도 없다. Spec의 자동 rollback Out of Scope 및 별도 revert 흐름 조건과 일치한다. |
| 5 | C-003 | partial | JSON 파싱과 side effect 실행은 `cocrates-chat-agent.ts:49-67`에서 분리되어 있고 세션/commit 오류를 별도 수집한다. 그러나 commit 실행 전 staged 변경 검증이 없고, workspace/repository 경로 검증도 구현되지 않았다. |

## 실행 검증

| Check | Result | Evidence / Notes |
|---|---|---|
| 제품 확장 build | pass | `build - theia-extensions/product` 통과 (`tsc -b`, exit 0). |
| 제품 확장 lint | fail (기존 오류) | `lint - theia-extensions/product` 실패. T-003 파일 오류는 없었고, 기존 `cocrates-chat-agent-prompt.ts:1`의 file header 누락 및 `:33`의 max-len 오류가 원인이다. `theia-ide-frontend-module.ts:46`, `product-backend-module.ts:22`에는 기존 deprecation warning이 있다. |
| 단위/통합 테스트 | not-verifiable | 제품 확장에 T-003 전용 자동화 테스트가 발견되지 않았고, 현재 작업으로 실행할 수 있는 해당 테스트 task가 없다. |

## Design Review Notes

- 현재 `processedCommits`는 정적 메모리 Set이다. 같은 응답의 현재 런타임 중 재처리는 막지만 저장·복원되지 않으므로 durable idempotency 저장소로 볼 수 없다.
- `repository.input.value`를 설정한 뒤 provider command를 실행하지만, command가 입력을 실제로 소비했는지 또는 commit 성공을 반환했는지 제품 adapter가 확인하지 않는다. Theia 1.77 공통 API에 성공 결과가 없는 경우, provider별 확인 또는 보수적 결과 상태가 필요하다.
- 선택된 repository가 JSON 응답의 의도한 workspace/repository와 일치하는지 검증하는 입력이 side effect API에 전달되지 않는다. 현재 구현은 Theia의 `selectedRepository`에 암묵적으로 의존한다.

## Deviations (Non-compliance)

- **R-007 / C-003 — Major:** pending resource를 staged 변경으로 오인할 수 있어 unstaged-only 상태에서도 commit 명령을 실행할 수 있다. staged 상태를 provider별로 보수적으로 판정하거나 판정 불가 시 거부해야 한다.
- **R-007 — Major:** workspace/repository 경로 검증이 구현되지 않았다. 현재는 선택 repository 존재만 확인한다.
- **R-008 — Major:** idempotency 표시가 메모리 전역 Set에만 저장된다. 재시작 이후 중복 실행 방지 근거가 없고 실패 전 처리 표시로 상태 lifecycle이 불명확하다.
- **R-008 — Minor:** commit command 완료가 예외를 던지지 않는 것만으로 성공 처리된다. provider의 명시적 성공/실패 결과를 확인할 수 없는 제약을 기록하거나 provider별 검증이 필요하다.

## Undocumented ASRs (Specification Gaps)

- **Commit 결과 영속성 정책:** Spec은 중복 실행 방지를 요구하지만 처리 표시의 수명(요청·세션·애플리케이션·디스크)을 정의하지 않았다. 현재 구현은 애플리케이션 프로세스 수명으로 선택했다. 재시작 후에도 중복 방지가 필수인지 사용자 결정 또는 Spec 보완이 필요하다.
- **SCM provider capability의 staged 상태 표현:** Spec은 staged 상태 검증을 요구하지만 Theia 1.77 provider별 `ScmResource` 상태 매핑을 정의하지 않았다. 공통 API로 판정 불가한 provider는 거부할지, provider adapter를 추가할지 결정이 필요하다.

## Recommended Next Steps

- T-003을 열린 상태로 유지한다.
- 1순위: provider별 staged resource 판정 경계를 구현하고 판정 불가 provider는 안전하게 거부한다.
- 2순위: repository root/workspace 일치 검증과 commit message 입력 정책을 명시·구현한다.
- 3순위: idempotency 상태 수명과 실패 후 재시도 정책을 결정한 뒤 구현한다.
- 린트 기존 오류는 T-003 결함과 별도이며, T-006에서 기존 오류로 기록하거나 별도 수정 범위로 다룬다.
- 위 결함을 수정한 뒤 `09-feedback-loop`에 따라 수정 후 재검증한다.
