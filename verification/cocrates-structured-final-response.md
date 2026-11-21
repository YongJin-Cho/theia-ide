# 검증: Cocrates 구조화 최종 응답 및 메시지 이력

**Spec:** `theia-ide/spec/cocrates-structured-final-response.md`
**Artifact(s):** `theia-ide/theia-extensions/product/src/browser/cocrates-structured-response-side-effects.ts`, `theia-ide/theia-extensions/product/src/browser/cocrates-chat-agent.ts`
**Verified:** 2026-11-21
**Scope:** sprint-06 T-003 — session·commit side effect adapter (`R-006`~`R-009`, `C-003`)
**Summary:** 5 pass, 0 partial, 0 fail, 0 not-verifiable

## Inventory & Results

| # | Spec item | Status | Evidence / Notes |
|---|---|---|---|
| 1 | R-006 | pass | `cocrates-structured-response-side-effects.ts:56-70`에서 `ChatService.renameSession(request.session.id, normalizedTitle)`을 호출한다. 빈 제목과 120자 초과 제목을 거부하고 앞뒤 공백을 정규화한다. |
| 2 | R-007 | pass | `cocrates-structured-response-side-effects.ts`에서 선택 repository, workspace root 포함 여부, provider commit command, message 길이, provider resource 존재를 검증한 뒤 `CommandService.executeCommand`를 호출한다. staged/unstaged를 구분하지 않고 provider가 노출한 모든 commit 대상 resource를 사용한다. |
| 3 | R-008 | pass | commit 상태를 Theia `StorageService`에 `in-flight`/`succeeded`/`failed`로 저장한다. `succeeded`는 재시작 후에도 재실행을 차단하며, `failed`는 다음 처리에서 재시도할 수 있다. 정적 promise lock으로 동시 실행을 직렬화하고 command 실패를 별도 오류로 기록한다. |
| 4 | R-009 | pass | 자동 rollback/revert를 구현하지 않으며, 원 commit을 삭제하는 경로도 없다. Spec의 자동 rollback Out of Scope 및 별도 revert 흐름 조건과 일치한다. |
| 5 | C-003 | pass | JSON 파싱과 side effect 실행은 `cocrates-chat-agent.ts`에서 분리되어 있고, repository·commit 대상 변경·입력·영속 상태 검증과 오류 수집을 수행한다. staged 여부는 거부 조건으로 사용하지 않는다. |

## 실행 검증

| Check | Result | Evidence / Notes |
|---|---|---|
| 제품 확장 build | pass | `build - theia-extensions/product` 통과 (`tsc -b`, exit 0). |
| 제품 확장 lint | fail (기존 오류) | `lint - theia-extensions/product` 실패. T-003 파일 오류는 없었고, 기존 `cocrates-chat-agent-prompt.ts:1`의 file header 누락 및 `:33`의 max-len 오류가 원인이다. `theia-ide-frontend-module.ts:46`, `product-backend-module.ts:22`에는 기존 deprecation warning이 있다. |
| 단위/통합 테스트 | not-verifiable | 제품 확장에 T-003 전용 자동화 테스트가 발견되지 않았고, 현재 작업으로 실행할 수 있는 해당 테스트 task가 없다. |

## Design Review Notes

- 처리 상태는 Theia `StorageService`에 저장하고, 현재 adapter 인스턴스 사이의 동시 실행은 정적 promise lock으로 직렬화한다.
- `repository.input.value`를 설정한 뒤 provider command를 실행한다. Theia 1.77 공통 API가 provider의 commit 결과를 별도 반환하지 않으므로, 예외를 실패로 기록하고 예외 없이 완료된 command를 성공으로 기록한다.
- repository root는 현재 Theia workspace root 중 하나와 같거나 그 하위인지 확인한다. JSON 응답에 별도 repository 경로 필드가 없으므로, 선택된 repository와 응답 의도 경로를 직접 비교하는 검증은 계약상 제공되지 않는다.
- staged/unstaged 구분은 수행하지 않고 provider groups의 resource 존재 여부만 확인한다.

## Deviations (Non-compliance)

- **R-007 / C-003 — Minor:** Theia 공통 `acceptInputCommand`가 provider별 commit 결과를 반환하지 않으므로, adapter는 예외 없는 command 완료를 성공으로 기록한다. provider 내부에서 비예외 실패를 보고하는 경우는 공통 경계에서 판정할 수 없다.
- **R-007 — Minor:** JSON 계약에 repository 경로 필드가 없어 선택된 repository와 응답이 의도한 특정 repository의 일치 여부는 검증할 수 없다. 현재는 선택 repository가 workspace root 하위인지 검증한다.

## Undocumented ASRs (Specification Gaps)

- 없음. 멱등성 상태 수명은 승인된 Option B ADR과 Spec R-008/C-003에 반영했다.
- staged capability concern은 사용자의 직접 입력으로 staged 여부를 거부 조건에서 제외하는 정책으로 해소했고, Spec R-007/C-003과 adapter 조사 문서에 반영했다.

## Recommended Next Steps

- T-003의 구현 결함은 scoped 정적 검증 기준으로 해소되었다.
- provider가 예외 없이 보고하는 내부 commit 실패를 판정하려면 provider별 결과 API가 필요하지만, 이는 현재 Theia 공통 경계 밖의 후속 concern이다.
- 제품 확장 lint의 기존 오류(`cocrates-chat-agent-prompt.ts`)는 T-003 파일과 무관하므로 T-006에서 기존 오류로 기록한다.
- T-003은 완료 처리했고, provider 결과 한계는 후속 범위로 기록했다.

## T-004 검증 — compaction 저장·복원 및 메시지 순서

**범위:** `R-010`~`R-013`, `C-004`~`C-005`

| Spec 항목 | 상태 | 근거 |
|---|---|---|
| R-010 | pass | `cocrates-compaction-content.ts`의 제품 전용 response content가 `compaction`과 직전 `answer`를 `toSerializable()`로 저장한다. Theia의 provider `CompactionChatResponseContent`와 별도 `kind`를 사용한다. |
| R-011 | pass | `CocratesChatAgent.getMessages()`가 저장된 최신 제품 compaction을 찾으면 기존 transcript를 사용하지 않고 `user: compaction`, `assistant: answer`, `user: 현재 입력`을 순서대로 반환한다. |
| R-012 | pass | 제품 content의 `asString()`/`asDisplayString()`이 `undefined`를 반환하므로 일반 Chat UI 본문에는 나타나지 않는다. `answer`만 별도의 Markdown content로 표시된다. |
| R-013 | pass | compaction content는 Theia chat response 직렬화에 포함되고, frontend `ChatContentDeserializerContribution`으로 세션 복원 시 같은 제품 content를 재생성한다. compaction이 없으면 `super.getMessages()`로 기존 동작을 사용한다. |
| C-004 | pass | 제품 content kind와 provider marker(`compaction`)를 분리하고, provider marker를 제품 local state로 해석하지 않는다. |
| C-005 | pass | branch·agent 전환별 무효화 정책을 추가하지 않았으며, 현재 active Cocrates 요청에서 최신 저장 상태를 보수적으로 재구성한다. |

### T-004 실행 검증

| Check | Result | Evidence / Notes |
|---|---|---|
| 제품 확장 build | pass | `build - theia-extensions/product` 통과 (`tsc -b`, exit 0). |
| 자동화 테스트 | not-verifiable | 현재 제품 확장에 T-004 전용 단위/통합 테스트 task가 없다. T-006에서 전체 가능한 검증 경로를 다시 실행한다. |

### T-004 구현 메모

- 저장 content는 UI 표시 문자열을 제공하지 않지만 `toLanguageModelMessage()`는 provider-agnostic text message 두 개를 반환한다.
- compaction 이후 요청에서는 의도적으로 저장된 compaction 경계 뒤에 현재 입력만 추가한다. 이미지/context variable의 일반적인 전체 history 재조립은 이번 Spec의 텍스트 순서 계약 밖이며, 회귀 점검에서 확인 대상이다.
- 세션 복원은 Theia의 기존 chat session store와 deserializer lifecycle을 사용하므로 별도 제품 `StorageService` 상태를 만들지 않는다.

## T-005 검증 — 기존 Agent·Skills·도구 계약 회귀 점검

**범위:** `R-014`

| 계약 | 상태 | 근거 |
|---|---|---|
| Cocrates Agent 등록·기본 Agent 선택 | pass | `cocrates-chat-agent.ts`가 `AbstractStreamParsingChatAgent`를 확장하고 `Cocrates` ID를 유지한다. `theia-ide-frontend-module.ts`가 동일 singleton을 `Agent`와 `ChatAgent`에 등록하고 `ai-features.chat.defaultChatAgent` 기본값을 `Cocrates`로 제공한다. |
| Skills discovery | pass | `CocratesSkillDirectoryContribution`이 `SkillDirectoryContribution`으로 등록되고, bundled Skills 경로를 `plugin` tier의 `cocrates` qualifier로 반환한다. 경로 확인 실패는 빈 목록과 warning으로 처리한다. |
| `getSkillFileContent` | pass | 제품 확장은 upstream `GET_SKILL_FILE_CONTENT_FUNCTION_ID`를 유지한 `ExtendedGetSkillFileContent`로 조건부 rebind한다. 기존 `skillName` 계약과 기본 `SKILL.md` 동작을 유지하면서 선택적 상대 `path`를 추가하고 절대 경로·root 탈출·디렉터리·누락 파일을 거부한다. |
| 일반 도구 계약 | pass | Cocrates prompt가 Theia workspace/file/search/task/launch/browser 도구의 기존 function ID를 참조하며 구조화 응답·compaction 변경은 tool ID나 handler 등록을 대체하지 않는다. |
| Browser 조립 | pass | `applications/browser/package.json`이 `theia-ide-product-ext`를 의존하고 제품 확장의 frontend entrypoint가 Theia extension에 선언되어 있다. |
| Stable Electron 조립 | pass | `applications/electron/package.json`이 product/updater/launcher 확장을 의존하고 `electron-builder.yml`이 `app/skills` 리소스를 포함한다. Stable 식별자와 `.cocrates` configuration folder도 유지한다. |
| Electron Next 조립 | pass | `applications/electron-next/package.json`이 product/updater/launcher 확장을 의존하고 `electron-builder.yml`이 `app/skills` 리소스를 포함한다. Next 식별자와 `.cocrates-next` configuration folder도 유지한다. |

### T-005 판정

정적 소스·설정 대조에서 R-014 회귀를 발견하지 못했다. T-005 전용 자동화 테스트는 없으므로 런타임 계약은 T-006의 가능한 build/test 및 제품 경로 검증으로 보강한다.

## T-006 검증 — build/lint 및 가능한 제품 경로

**범위:** `C-006` 및 sprint-06 Demo Checklist

| Check | Result | Evidence / Notes |
|---|---|---|
| 제품 확장 build | pass | `build - theia-extensions/product` 성공 (`tsc -b`). |
| 전체 production build | pass | `build` 성공. Lerna가 launcher/product/updater 확장을 build하고 Stable Electron 및 Browser production build를 완료했으며 Theia browser/node/electron 단계가 0 errors였다. |
| Browser production build | pass | `build:prod - applications/browser`를 단독 재실행해 browser/node 0 errors를 확인했다. 병렬 native rebuild 간섭으로 발생한 첫 실행의 task exit 1은 재실행으로 배제했다. |
| Stable Electron production build | pass | `build:prod - applications/electron` 성공. browser/node/electron 0 errors. |
| Electron Next production build | pass | `build:prod - applications/electron-next` 실행에서 browser/node/electron 단계가 오류 없이 완료됐다. |
| Stable/Next Electron E2E | pass | 저장소 `test` 성공. Stable Electron 10 passing, Electron Next 10 passing. |
| 제품 확장 lint | fail (기존 오류) | `cocrates-chat-agent-prompt.ts:1` file header 누락, `:33` max-len 초과가 원인이다. 구조화 응답·compaction·side-effect 파일의 lint 오류는 없다. deprecation warning 2건은 오류가 아니다. |
| 저장소 lint | fail (기존 오류 전파) | 전체 `lint`가 위 제품 prompt 오류로 중단됐다. 새 변경 파일의 추가 lint 오류는 없다. |
| Browser UI smoke | not-verifiable | `Launch Browser Backend & Frontend`가 `It is not possible to provide debug adapter executable`로 시작되지 않아 DOM smoke를 수행하지 못했다. |
| 구조화 응답 전용 자동화 테스트 | not-verifiable | 제품 확장에 T-002~T-006 전용 자동화 테스트 task가 없다. |

### T-006 판정

C-006의 실행 가능한 build/test 범위는 통과했다. lint 실패와 Browser UI smoke 미실행은 각각 기존 파일 오류와 환경의 debug adapter 제약으로 기록하며, PB-008 구현 실패로 판정하지 않는다.
