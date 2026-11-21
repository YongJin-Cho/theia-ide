# Cocrates Compaction 이력 저장·재구성 경계

## Concern
JSON의 `compaction`과 이전 최종 `answer`를 어디에 저장하고 다음 요청에서 `user: <compaction>`, `assistant: <last answer>`, `user: <input>` 순서를 어떻게 보장할 것인가?

## Status
proposed

## Context
- `agent2.md`는 compaction이 있는 다음 대화를 `user: <compaction message>`, `assistant: <last answer>`, `user: <input>` 이력으로 제공하도록 요구한다.
- Theia server-side compaction은 provider별 opaque marker를 저장·재전송하며, 일반 ChatAgent의 local in-session compaction은 v1.77에서 제공되지 않는다.
- Cocrates JSON 응답의 `compaction`은 제품 전용 라우팅 필드이므로 기존 provider compaction marker와 혼동하지 않아야 한다.
- UI transcript와 실제 다음 LLM request의 history가 달라질 수 있으므로 세션 재로드·branch·다음 턴에서 순서를 일관되게 유지해야 한다.

## Decision

## Options
### Option A — Chat model에 compaction summary content로 저장
- Cocrates 응답을 처리할 때 compaction 전용 ChatResponse content/메타데이터를 세션에 저장하고 다음 `getMessages`에서 요구된 user/assistant/user 순서를 만든다.
- Pro: 세션 재로드와 기존 chat hierarchy에 맞는 영속화가 가능하다.
- Con: Theia chat model content/deserializer 확장이 필요하고 UI 표시 정책을 추가해야 한다.

### Option B — Agent-local request shaping
- Cocrates Agent가 다음 요청 직전에 최근 상태를 읽어 compaction, last answer, current input 메시지를 직접 조립한다.
- Pro: upstream chat model 변경이 적고 Cocrates 확장 안에서 빠르게 구현할 수 있다.
- Con: UI transcript·저장 세션과 wire history가 달라지며 branch/재로드/agent 전환 시 상태 누락 위험이 있다.

### Option C — 세션 메타데이터/외부 저장소에 compact state 저장
- `compaction`과 last answer를 Chat session metadata 또는 제품 전용 저장소에 저장하고 요청 조립 시 불러온다.
- Pro: 기존 ChatResponse content와 분리하고 제품 정책을 독립적으로 관리할 수 있다.
- Con: 세션 영속화·동시성·branch 식별·데이터 정리 계약을 새로 만들어야 한다.

## Tradeoffs
| | Option A | Option B | Option C |
|---|---|---|---|
| 세션 재로드 | 높음 | 낮음~중간 | 중간~높음 |
| upstream 영향 | 중간~높음 | 낮음 | 중간 |
| UI와 wire 일치 | 높음 | 낮음 | 중간 |
| 구현 범위 | 중간~높음 | 낮음~중간 | 중간 |
| branch/agent 전환 | 기존 모델 활용 | 취약 | 별도 설계 필요 |

## Recommendation
- Option A를 권장한다. compaction이 대화 이력의 일부라는 계약을 세션에 영속화하고, 다음 request가 재구성되어도 순서가 유지되게 해야 한다.
- 단, Theia upstream 직접 수정은 범위 밖이므로 제품 확장에서 가능한 기존 ChatResponse content·세션 메타데이터 확장 지점을 먼저 확인한다. 불가능하면 Option B를 명시적 제한과 함께 채택한다.

## Consequences
- Cocrates 전용 compaction 상태와 provider server-side compaction marker를 구분해야 한다.
- `answer`는 assistant 메시지로, compaction은 요구된 user 메시지로, 새 입력은 그 뒤 user 메시지로 조립해야 한다.
- compaction이 없는 응답은 기존 history 조립을 유지해야 한다.
- 저장·복원 실패 시 기존 대화 전체를 조용히 버리지 않고 오류 또는 안전한 fallback을 제공해야 한다.

## Downstream Concerns
- [ ] **ADR candidate — Compaction content visibility:** compaction user 메시지를 UI에 표시할지 숨김 content로 기록할지 결정한다.
- [ ] **ADR candidate — Branch invalidation:** active branch가 바뀌거나 agent를 전환할 때 compact state를 어떻게 무효화할지 결정한다.
- [x] **covered — Provider marker separation:** 기존 server-side provider compaction marker는 제품 JSON compaction state와 별도 취급한다.

## Related
- `theia-ide/spec/AC.md` — AC-014
- `theia-ide/adr/cocrates-structured-response-parsing.md`
- `theia-ide/adr/cocrates-json-side-effect-safety.md`
- `theia-ide/docs/theia/message-compaction.md`
- `theia-ide/docs/theia/local-message-compaction.md`

## Notes
- 2026-11-21: AC-014 검토를 위해 제안 상태로 생성했다. Option A를 권장한다.
