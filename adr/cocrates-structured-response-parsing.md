# Cocrates 구조화 최종 응답 파싱 방식

## Concern
Cocrates Agent가 일반 Markdown과 JSON object 최종 응답을 구분하고, JSON에서는 `answer`만 Chat UI에 표시하도록 어떤 파싱·렌더링 경계를 사용할 것인가?

## Status
approved

## Context
- PB-008은 JSON 최종 응답의 `answer`만 사용자에게 보이고 `session`, `commit`, `compaction`은 제품 코드가 처리하도록 요구한다.
- Theia 1.77의 기본 ChatAgent는 채팅 요청에 `response_format`을 자동으로 전달하지 않으며 parsed JSON을 제품 필드 단위로 라우팅하지 않는다.
- OpenAI structured output은 일부 Chat Completions 경로에서만 schema가 적용되고, Response API·다른 제공자·스트리밍에서는 텍스트 JSON 폴백이 필요할 수 있다.
- 기존 일반 Markdown 응답과 현재 Cocrates Agent의 스트리밍 동작은 유지해야 한다.

## Decision
**Option B — Prompt-only JSON parsing**. Cocrates는 `response_format`과 structured tool call에 의존하지 않고 `agent2.md` 지시로 JSON object를 요청한다. 응답 완료 후 제품 파서가 JSON을 추출해 `answer`만 Chat UI에 추가하고, JSON이 아니면 기존 일반 Markdown 경로를 사용한다. 이는 현재 response_format과 tool call의 불안정성을 피하고 기존 스트리밍·provider 호환성을 우선하기 위한 결정이다.

## Options
### Option A — Structured response hook + JSON fallback
- Cocrates Agent에서 응답 요청과 최종 content 처리를 오버라이드한다.
- 지원 모델에서는 `response_format`/parsed 결과를 사용하고, 그 외에는 완료된 텍스트를 JSON으로 폴백 파싱한다.
- Pro: 단일 JSON 계약과 `answer`만 렌더링하는 경계를 직접 구현할 수 있다.
- Con: 비스트리밍 완료 처리, 제공자별 structured 지원 차이, 파싱 실패 경로를 관리해야 한다.

### Option B — Prompt-only JSON parsing
- `agent2.md` 지시만으로 JSON을 요청하고 완료된 응답 텍스트를 `getJsonOfText` 계열 로직으로 파싱한다.
- 일반 Markdown이면 기존 파싱 결과를 그대로 렌더링한다.
- Pro: Theia provider API 변경이 작고 다양한 모델에서 동작한다.
- Con: schema 강제가 없고 malformed/부분 스트림을 다뤄야 하며 JSON 계약 준수율이 낮아질 수 있다.

### Option C — Tool-based side effects with free-text response
- 사용자 본문은 일반 Markdown 스트림으로 유지하고 `session`, `commit`, `compaction`을 별도 tool 호출로 처리한다.
- Pro: Theia 관용 패턴이며 스트리밍 UX와 provider 호환성이 좋다.
- Con: 사용자가 요청한 단일 JSON 최종 응답 계약을 직접 제공하지 못하고, JSON field 라우팅의 기준이 tool 계약으로 바뀐다.

## Tradeoffs
| | Option A | Option B | Option C |
|---|---|---|---|
| JSON 계약 충족 | 높음 | 중간 | 낮음 |
| 제공자 호환성 | 중간 | 높음 | 높음 |
| 스트리밍 UX | 완료 후 렌더링 필요 | 폴백 시 부분 JSON 위험 | 높음 |
| 구현·유지보수 | 중간~높음 | 중간 | 중간 |
| 사용자 요구와의 직접성 | 높음 | 중간 | 낮음 |

## Recommendation
- 초기 권고는 Option A였으나, 사용자가 response_format과 tool call의 처리 불안정성을 이유로 Option B를 선택했다.
- Option B에서도 `session`·`commit` side effect 실행 정책은 AC-013에서 별도로 결정한다.

## Consequences
- Cocrates 전용 ChatAgent에 최종 응답 파싱 및 `answer` 렌더링 경계를 둔다.
- malformed JSON과 일반 Markdown은 별도 호환 경로로 처리해야 한다.
- structured 경로에서는 응답 완료 전까지 사용자 본문이 늦게 보일 수 있다.
- Theia upstream 전체 ChatAgent의 기본 동작은 변경하지 않는다.

## Downstream Concerns
- [ ] **ADR candidate — JSON side effect safety:** `session`과 `commit`의 권한·확인·실패 처리를 결정한다(AC-013).
- [ ] **ADR candidate — Compaction history boundary:** compaction 이력의 저장·재구성 방식을 결정한다(AC-014).
- [x] **covered — General Markdown compatibility:** 기존 Cocrates Agent의 비JSON 응답 경로를 보존한다.
- [x] **directly resolved — Structured API dependency:** `response_format`과 structured tool call은 사용하지 않고 prompt-only JSON과 완료 후 폴백 파싱을 사용한다.

## Related
- `theia-ide/spec/AC.md` — AC-012
- `theia-ide/scrum/sprint-05.md` — PB-008
- `theia-ide/docs/theia/structured-output-side-effects.md`

## Notes
- 2026-11-21: AC-012 검토를 위해 제안 상태로 생성했다. 사용자 요구의 단일 JSON 계약을 기준으로 Option A를 권장한다.
- 2026-11-21: Status → approved; 사용자가 Option B(prompt-only JSON parsing)를 선택했다. response_format과 structured tool call은 사용하지 않는다.
