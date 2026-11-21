# Sprint 04 — Cocrates AI Agent·Skills 구현 및 검증

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

승인된 `spec/cocrates-ai-agent-skills.md`를 기준으로 Cocrates Default Chat Agent, 생성된 시스템 프롬프트, 내장 Skills 패키징·발견, 확장된 `getSkillFileContent`를 구현하고 Browser·Stable Electron·Electron Next에서 검증 가능한 결과를 만든다.

실제 `adr`, `todo`, `sdd` 스킬 명세 본문은 사용자 제공 전까지 생성하거나 복사하지 않는다. 구현 착수 전에 Skills 런타임 경로 시드 채널을 별도 결정으로 확정한다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-007 | Cocrates Default Chat Agent 및 내장 Skills 배포 |

**스프린트 외:** 새로운 AI 모델·외부 배포 호스트, Cocrates Agent의 별도 mode, Theia upstream 직접 수정, 사용자가 아직 제공하지 않은 세 스킬 명세 본문.

## 구현 순서 제안

1. 대상 Theia 확장과 AI Agent·Skill 관련 기존 API/DI 구성을 조사하고 구현 경계를 확정한다.
2. Skills 런타임 경로 시드 채널을 ADR 또는 Direct Input으로 확정한다. 이 결정 전에는 Skills 구현을 시작하지 않는다.
3. Cocrates ChatAgent와 빌드 생성 시스템 프롬프트를 구현한다.
4. 제품 번들 Skills 디렉터리, `SkillDirectoryContribution`, Browser/Electron 타깃 패키징 및 런타임 발견을 구현한다.
5. 기존 `getSkillFileContent` tool ID를 유지한 채 `path`, skill-root 가드, 보조 파일 원문 반환, 오류 JSON, 제품 DI rebind를 구현한다.
6. Spec의 Browser·Stable Electron·Electron Next 검증 기준에 따라 빌드·패키징·런타임 검증을 수행하고 `verification/`에 기록한다.

## 완료 정의

1. PB-007의 승인된 Spec 요구사항 R-001~R-020과 제약 C-001~C-007이 코드·설정·패키징 산출물에 반영된다.
2. `docs/cocrates/agent1.md`는 빌드 생성 소스의 단일 원본으로 연결되고, 런타임 원본 파일이나 수동 복사본에 의존하지 않는다.
3. Browser·Stable Electron·Electron Next에서 Cocrates가 기본 Chat Agent로 등록되고 제품 번들 Skills가 발견된다.
4. `getSkillFileContent`의 기존 `SKILL.md` 동작과 신규 보조 파일·경로 안전성·오류 계약이 테스트 또는 검증 절차로 확인된다.
5. 사용자가 제공한 스킬 본문이 없다는 범위를 위반하지 않는다.
6. 구현·패키징·검증 결과와 환경 제약이 `verification/`에 기록되고 PB-007 DoD를 검토할 수 있다.

## 데모 체크리스트

- [ ] Skills 런타임 경로 시드 채널 결정과 구현 경계 확인
- [ ] Cocrates ChatAgent 등록 및 기본 Agent preference 동작 확인
- [ ] 생성된 `agent1.md` 시스템 프롬프트가 ChatAgent에 연결됨을 확인
- [ ] Browser·Stable Electron·Electron Next에서 내장 Skills 패키징·발견 확인
- [ ] `getSkillFileContent`의 기존·보조 파일·경로 차단·오류 계약 확인
- [ ] Spec 추적성과 검증 기록 작성
- [ ] 스프린트 완료 검토 및 경계 처리

## 계획 상태

사용자가 sprint-04 계획을 승인했다. `TODO.md`와 `PROMPTS.md`를 sprint-04 실행 보드·로그로 시드하고 구현을 시작했다.
