# Sprint 05 — Cocrates 구조화 최종 응답 및 메시지 압축

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

Cocrates Agent가 일반 Markdown 응답과 구조화된 JSON 최종 응답을 모두 안전하게 처리하도록 확장한다. 구조화 응답에서는 `answer`만 채팅 UI에 Markdown으로 표시하고, `session`, `commit`, `compaction` 필드는 제품 계약에 따라 처리하며, 다음 대화에는 compaction 계약이 요구하는 메시지 이력을 재구성한다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-008 | Cocrates 구조화 최종 응답 및 메시지 이력 side effect |

**스프린트 외:** Theia upstream 직접 수정, 일반 Theia ChatAgent 전체에 대한 범용 local compaction, 새로운 외부 모델 제공자 연동, 기존 server-side compaction 프로토콜의 변경.

## 구현 순서 제안

1. `agent2.md`의 최종 응답 계약과 기존 Cocrates Agent/Theia 1.77 Chat API의 차이를 Spec·AC로 정리한다.
2. 구조화 응답 처리 방식(JSON schema 강제·텍스트 JSON 폴백·스트리밍 종료 처리)과 `session`/`commit` side effect 실행 경계를 ADR로 확정한다.
3. Cocrates 시스템 프롬프트 생성 소스에 `agent2.md` 내용을 추가한다.
4. 일반 Markdown과 JSON object를 구분하고, JSON의 `answer`만 Chat UI 응답으로 렌더링하는 Agent 응답 파서를 구현한다.
5. `session`은 ChatService 세션 제목 변경으로, `commit`은 검증된 git commit 실행으로 연결하고 실패·권한·안전성 오류를 처리한다.
6. `compaction`이 있는 응답을 영속화 가능한 요약으로 기록하고 다음 요청에 `user: <compaction>, assistant: <last answer>, user: <input>` 순서가 전달되도록 메시지 이력 조립을 구현한다.
7. 일반 Markdown 호환성, malformed JSON, 각 side effect 성공·실패, compaction 다음 턴의 메시지 순서와 build/lint를 검증한다.

## 완료 정의

1. `docs/cocrates/agent2.md`의 `<instruction>` 계약이 Cocrates 시스템 프롬프트에 빌드 시 반영된다.
2. 일반 Markdown 최종 응답은 기존처럼 표시되고, JSON object 최종 응답은 `answer`만 사용자에게 Markdown으로 표시된다.
3. `session`과 `commit` 필드는 정의된 side effect 경계를 통해 처리되며, 실패가 조용히 성공으로 처리되지 않는다.
4. `compaction`이 있는 다음 요청은 지정된 user/assistant/user 메시지 이력 계약을 지키며, compaction이 없는 요청은 기존 이력을 보존한다.
5. 기존 Cocrates Agent 등록·Skills·도구 계약을 깨뜨리지 않는다.
6. 구현·검증 결과와 미실행 항목이 Spec/verification 기록에 남고 PB-008 DoD를 검토할 수 있다.

## 데모 체크리스트

- [ ] Sprint 05 Spec→backlog 요구사항과 구조적 결정 정리
- [ ] 구조화 응답·side effect·compaction 이력 설계 결정 승인
- [ ] `agent2.md` 시스템 프롬프트 연결 확인
- [ ] Markdown/JSON 응답 렌더링 및 `answer` 필드 표시 확인
- [ ] `session`/`commit` side effect 성공·실패 계약 확인
- [ ] compaction 다음 요청의 user/assistant/user 이력 확인
- [ ] build/lint 및 검증 기록 작성
- [ ] 스프린트 완료 검토 및 경계 처리

## 계획 상태

Sprint plan approval 대기 중이다. 승인 전에는 `TODO.md` 실행 보드를 시드하거나 Spec 파이프라인을 시작하지 않는다.
