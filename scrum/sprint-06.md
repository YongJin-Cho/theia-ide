# Sprint 06 — Cocrates 구조화 최종 응답 구현 및 검증

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

승인된 `spec/cocrates-structured-final-response.md`를 기준으로 Cocrates Agent의 prompt-only JSON 파싱, `answer` 전용 표시, 자동 `session`·`commit` side effect, compaction 메시지 이력 재구성을 구현하고 검증한다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-008 | Cocrates 구조화 최종 응답 및 메시지 이력 side effect |

**스프린트 외:** Theia upstream 직접 수정, response_format/structured tool call 도입, 일반 ChatAgent 전체의 local compaction, 새로운 사용자 대상 side effect tool/command, 외부 provider 추가.

## Definition of Done

1. 승인된 Spec의 R-001~R-014 및 C-001~C-006이 코드·설정·검증 기록에 반영된다.
2. 일반 Markdown 응답과 prompt-only JSON 응답이 모두 동작하고 JSON에서는 `answer`만 UI에 표시된다.
3. `session` 자동 제목 변경과 `commit` 자동 실행·검증·결과 기록이 동작한다.
4. compaction state가 저장되고 다음 요청의 user→assistant→user 순서가 검증된다.
5. 기존 Agent·Skills·도구 계약 회귀 검증과 대상 build/lint 결과가 기록된다.

## Demo Checklist

- 승인된 Spec의 구현 항목과 adapter API 조사 결과 확인
- `agent2.md` 프롬프트 포함 및 prompt-only JSON 파싱 확인
- JSON `answer` 전용 UI 표시와 일반 Markdown 폴백 확인
- `session`·`commit` 자동 side effect 및 실패·undo/revert 경계 확인
- compaction 저장·복원·user→assistant→user 순서 확인
- build/lint 및 가능한 Browser/Electron 검증 결과 확인
- 스프린트 완료 검토 및 경계 처리

## 계획 상태

Sprint plan approval 대기 중이다. 승인 전에는 sprint-06 실행 보드를 시드하거나 구현을 시작하지 않는다.
