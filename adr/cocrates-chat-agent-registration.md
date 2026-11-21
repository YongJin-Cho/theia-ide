# Cocrates ChatAgent 등록 및 기본 Agent 선택

## Concern
Cocrates를 Theia ChatAgent로 어떤 방식으로 등록하고, mention이 없는 채팅의 Default Chat Agent로 어떻게 선택할 것인가?

## Status
approved

## Context
- Cocrates는 Browser·Stable Electron·Electron Next에서 동일한 제품 Agent로 제공되어야 한다.
- `adding-ai-agents.md`는 코드 기반 ChatAgent의 `Agent`·`ChatAgent` 이중 등록을 표준 패턴으로 설명한다.
- Theia의 기본 Agent 선택은 `ai-features.chat.defaultChatAgent` preference가 우선하고, 선택적으로 DI default/fallback ID를 사용할 수 있다.
- 사용자 요구는 Default Chat Agent로 Cocrates를 추가하는 것이며, 제품 Agent는 `docs/cocrates/agent1.md`의 시스템 프롬프트와 도구를 사용해야 한다.

## Decision
**Option A — 제품 확장 코드 기반 ChatAgent + 기본 Agent preference**를 선택한다. Cocrates를 제품 확장에 타입 안전한 ChatAgent로 등록하고 `ai-features.chat.defaultChatAgent`를 통해 mention 없는 채팅의 기본 Agent로 제공한다.

## Options
### Option A — 제품 확장 코드 기반 ChatAgent + 기본 Agent preference
- `theia-extensions/product` 또는 별도 제품 확장에 `AbstractStreamParsingChatAgent` 기반 Cocrates Agent를 구현한다.
- `Agent`와 `ChatAgent`를 모두 bind하고, `ai-features.chat.defaultChatAgent`의 default를 Cocrates ID로 제공한다.
- Pro: 제품 프롬프트·도구·등록을 타입 안전하게 통합하고 세 타깃에서 동일하게 번들할 수 있다.
- Con: Theia ChatAgent API와 application frontend 번들에 의존하며, 제품 확장 코드가 필요하다.

### Option B — 파일 기반 Custom Agent만 제공
- 워크스페이스 또는 제품 기본 경로에 `.agents/agents/cocrates/agent.md`를 배치한다.
- CustomChatAgent discovery에 의존하고 설정에서 기본 Agent를 선택한다.
- Pro: 확장 코드와 DI 변경이 적고 프롬프트를 파일로 유지하기 쉽다.
- Con: 제품 패키지의 기본 경로·발견·기본 Agent preference를 별도로 보장해야 하며, 도구·제품별 invoke 통합이 제한된다.

## Tradeoffs
| | Option A | Option B |
|---|---|---|
| 제품 패키지 통합 | 확장과 application 번들에 직접 통합 | 파일 배치·발견 경로에 의존 |
| 기본 Agent 보장 | preference와 코드 등록을 함께 검증 가능 | Custom Agent discovery와 설정에 의존 |
| 프롬프트 유지 | 소스에서 `agent1.md`를 번들 템플릿으로 연결 | agent.md 파일 자체가 런타임 소스 |
| 구현 비용 | 높음 | 낮음 |
| 타깃 일관성 | 높음 | 경로·패키징 설계가 추가로 필요 |

## Recommendation
- **Option A**를 권장한다. 이번 목표는 사용자에게 배포되는 제품 기본 Agent이며, 제품 확장과 application 번들에 명시적으로 등록하는 방식이 Browser/Electron/Electron Next의 일관성과 기본 Agent 보장에 유리하다.

## Consequences
- 선택된 Agent ID와 system prompt fragment가 제품 확장과 preference 계약에 들어간다.
- Agent Mode를 추가하지 않고 단일 prompt variant를 기본으로 사용한다.
- 파일 기반 Custom Agent만을 제품 Agent 구현으로 사용하지 않는다.

## Downstream Concerns
- [x] **directly resolved — Agent mode:** 별도 mode가 요구되지 않았으므로 단일 prompt variant를 사용한다.
- [ ] **ADR candidate — System prompt source:** `docs/cocrates/agent1.md`를 코드 번들 템플릿으로 동기화하는 방식은 AC-010에서 검토한다.
- [ ] **ADR candidate — Skill packaging:** 내장 Skills discovery와 배포 경로는 AC-009에서 검토한다.
- [x] **covered — Tool surface:** 기존 Theia tool ID와 제품 확장 rebind 원칙은 AC-011 및 관련 문서가 다룬다.

## Related
- `spec/AC.md` — AC-008
- `spec/PRD.md` — Sprint-03 AI Agent·Skills 변경
- `docs/theia/adding-ai-agents.md`
- `docs/cocrates/agent1.md`

## Notes
- 2026-11-21: AC-008 검토를 위해 Option A/B를 작성하고 Option A를 권장안으로 제시했다.
- 2026-11-21: 사용자 선택으로 Status → approved; Option A를 Decision으로 기록했다. System prompt와 Skill packaging은 각각 AC-010과 AC-009에서 후속 검토한다.
