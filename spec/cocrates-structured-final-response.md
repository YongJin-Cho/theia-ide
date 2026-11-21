# Cocrates 구조화 최종 응답 및 메시지 이력

Cocrates Agent가 일반 Markdown과 prompt-only JSON object 최종 응답을 모두 처리하고, JSON의 `answer` 표시와 `session`·`commit`·`compaction` 처리를 일관되게 제공하기 위한 구현·검증 기준이다.

## Context

- 상위 제품 요구사항: [`PRD.md`](./PRD.md)의 Sprint-05 구조화 최종 응답 변경
- Theia 1.77 기본 채팅 파이프라인은 제품 JSON 필드를 자동 라우팅하지 않는다.
- `response_format`과 structured tool call은 사용하지 않는다. 모델 제공자와 현재 실행 경로에서의 불안정성을 피하기 위해 prompt-only JSON과 완료 후 텍스트 파싱을 사용한다.

## Requirements

- **R-001:** Cocrates 시스템 프롬프트의 `<instruction>` 섹션에는 `docs/cocrates/agent2.md`의 구조화 최종 응답 계약을 빌드 시 포함해야 한다. 원본 Markdown의 의미와 JSON 필드 계약(`answer`, `session`, `commit`, `compaction`)을 임의로 축약하거나 변경하지 않아야 한다. ← ASR-015; AC-010
- **R-002:** Cocrates Agent는 `response_format` 요청 필드와 structured tool call에 의존하지 않고 시스템 프롬프트 지시로 JSON object 최종 응답을 요청해야 한다. 일반 Markdown 응답을 생성하는 기존 모델·provider에서도 동작해야 한다. ← ASR-017; AC-012; `adr/cocrates-structured-response-parsing.md`
- **R-003:** 응답 완료 시 Cocrates 제품 파서는 fenced JSON 또는 JSON object 텍스트를 추출·파싱해야 한다. 파싱된 값이 object이고 문자열 `answer` 필드를 가지면 구조화 응답으로 처리하고, 그 외에는 기존 일반 Markdown 응답으로 처리해야 한다. 부분 스트림은 완료 전까지 구조화 side effect나 최종 JSON 본문 렌더링을 실행하지 않아야 한다. ← ASR-017
- **R-004:** 구조화 응답에서 사용자에게 표시되는 Chat UI 본문은 `answer` 문자열만 Markdown content로 추가해야 한다. `session`, `commit`, `compaction` 및 기타 JSON 필드는 일반 Chat UI 본문에 노출하지 않아야 한다. ← ASR-017; `adr/cocrates-structured-response-parsing.md`
- **R-005:** JSON이 아니거나 malformed JSON인 최종 응답은 전체 응답을 일반 Markdown으로 표시하는 호환 폴백을 사용해야 하며, JSON 파싱 실패를 구조화 응답 성공으로 기록하지 않아야 한다. ← ASR-017
- **R-006:** 유효한 구조화 응답에 문자열 `session`이 있으면 현재 Chat 세션의 제목을 자동 변경해야 한다. 제목 변경은 기존 ChatService 세션 메타데이터 경계를 사용하고, 빈 값·과도한 길이·허용되지 않는 입력은 거부하거나 안전하게 정규화해야 한다. ← ASR-018; AC-013
- **R-007:** 유효한 구조화 응답에 `commit`이 있으면 사용자 대상 전용 도구·명령의 추가 없이 제품 런타임이 commit side effect를 자동 실행해야 한다. 실행 전 workspace/repository 경로, 입력 형식, commit message, staged 변경 상태를 검증하고, 성공·실패·거부 상태를 별도로 기록해야 한다. ← ASR-018; `adr/cocrates-json-side-effect-safety.md`
- **R-008:** commit 실행 실패는 성공으로 표시하거나 조용히 무시하지 않아야 한다. `answer` 표시와 side effect 결과는 독립적으로 기록하고, 사용자가 결과를 이해할 수 있는 오류 상태를 제공해야 한다. 동일 JSON 응답의 재처리로 commit이 중복 실행되지 않도록 처리 표시 또는 idempotency 보호를 제공해야 한다. ← ASR-018
- **R-009:** 자동 commit을 되돌리는 기능은 원래 commit을 조용히 삭제하는 방식이 아니라 별도의 undo/revert 복구 흐름으로 처리해야 한다. 이 Spec은 자동 rollback을 요구하지 않으며, 구현에서 원 commit과 복구 commit의 관계를 잃지 않아야 한다. ← ASR-018; `adr/cocrates-json-side-effect-safety.md`
- **R-010:** 유효한 구조화 응답에 `compaction` 문자열이 있으면 해당 값과 직전 구조화 `answer`를 세션 대화 모델의 영속화 가능한 content 또는 메타데이터로 기록해야 한다. 이 제품 상태는 provider server-side compaction marker와 구분되어야 한다. ← ASR-019; AC-014; `adr/cocrates-compaction-history-boundary.md`
- **R-011:** `compaction`이 기록된 다음 LLM 요청은 다음 순서의 메시지를 가져야 한다: `user: <compaction message>`, `assistant: <last answer>`, `user: <input>`. `<input>`은 새 사용자 입력이며, 이전 answer는 assistant 메시지로 유지해야 한다. ← ASR-019
- **R-012:** `compaction` 상태는 다음 모델 요청 이력에는 포함하되 일반 Chat UI 본문에는 표시하지 않아야 한다. 사용자에게 보이는 본문은 항상 R-004의 `answer` 계약을 따른다. ← ASR-019
- **R-013:** JSON 응답에 `compaction`이 없으면 기존 Cocrates ChatAgent의 대화 이력 조립과 일반 Markdown 동작을 보존해야 한다. 세션 재로드 시에도 저장된 compaction 상태와 순서를 복원해야 한다. ← ASR-019
- **R-014:** 구현은 기존 Cocrates Agent 등록, 기본 Agent 선택, Skills discovery, `getSkillFileContent`, 일반 도구 및 Browser·Stable Electron·Electron Next 조립 계약을 회귀시키지 않아야 한다. ← ASR-013; ASR-014; ASR-016

## Constraints

- **C-001:** `response_format`과 structured tool call을 구조화 응답의 필수 경로로 사용하지 않아야 한다. prompt-only JSON 요청과 완료 후 텍스트 파싱이 기준이며, 파싱 실패 시 일반 Markdown 폴백을 사용한다. ← ASR-017; `adr/cocrates-structured-response-parsing.md`
- **C-002:** Theia upstream 전체 ChatAgent 또는 기존 provider의 기본 동작을 직접 수정하지 않고, 가능한 제품 확장 경계에서 구현해야 한다. ← ASR-017; ASR-019
- **C-003:** `session`과 `commit` side effect는 JSON 파싱 성공과 분리된 실행 상태를 가져야 한다. commit은 자동 실행이지만 저장소·staged 변경·입력 검증을 생략할 수 없다. ← ASR-018
- **C-004:** 제품 JSON compaction state와 OpenAI/ChatGPT/Anthropic 등 provider의 server-side compaction marker를 동일한 타입이나 replay 규칙으로 취급하지 않아야 한다. ← ASR-019
- **C-005:** branch·agent 전환별 compaction 무효화 정책은 이번 Spec의 기본 범위가 아니다. 구현 중 안전한 fallback이 필요할 때만 별도 요구사항으로 재개한다. ← AC-014; `adr/cocrates-compaction-history-boundary.md`
- **C-006:** 검증은 정적 코드 대조와 가능한 제품 확장 build/lint/test를 포함해야 하며, 실행할 수 없는 Browser/Electron 검증은 성공으로 간주하지 않고 사유를 기록해야 한다. ← ASR-009

## Out of Scope

- Theia upstream `@theia/ai-chat` 또는 provider 패키지의 직접 수정
- 일반 Theia ChatAgent 전체에 적용되는 범용 local `/compact` 기능
- `response_format` schema 강제 및 structured tool call의 provider별 안정화
- commit의 자동 rollback; commit undo는 별도 revert/복구 흐름
- branch·agent 전환별 compaction state 무효화의 완전한 정책
- 새로운 외부 모델 provider 또는 새로운 사용자 대상 side effect tool/command 추가

## Open Questions

- 실제 ChatService 세션 제목 API와 git/SCM 실행 어댑터의 구체적인 DI 경계는 구현 단계에서 현재 Theia 1.77 API를 확인해 결정한다. 기능 요구사항을 변경하지 않는 구현 선택이다.
- 기존 ChatResponse content/deserializer로 제품 compaction state를 영속화할 수 없는 경우, Spec의 user→assistant→user 순서를 보존하는 최소 Agent-local fallback과 그 UI/wire 차이를 검증 기록에 남긴다.

## Related

- `theia-ide/spec/PRD.md`
- `theia-ide/spec/AC.md`
- `theia-ide/spec/ASR.md`
- `theia-ide/adr/cocrates-structured-response-parsing.md`
- `theia-ide/adr/cocrates-json-side-effect-safety.md`
- `theia-ide/adr/cocrates-compaction-history-boundary.md`
- `theia-ide/docs/cocrates/agent2.md`
- `theia-ide/docs/theia/structured-output-side-effects.md`
- `theia-ide/docs/theia/message-compaction.md`
- `theia-ide/docs/theia/local-message-compaction.md`
