# Sprint 03 — Cocrates AI Agent·Skills 패키징 요구사항 확정

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

Cocrates를 Default Chat Agent로 제공하고 `adr`, `todo`, `sdd` 스킬을 제품 패키지에 포함·배포하기 위한 사용자 승인 요구사항, 아키텍처 결정, 구현 Spec과 product backlog를 확정한다. `getSkillFileContent`의 스킬 보조 파일 지원과 각 배포 타깃의 발견·패키징 검증 조건을 함께 명시한다.

이 스프린트는 **Spec→backlog 스프린트**이며 제품 코드 구현은 다음 Backlog→Implementation 스프린트의 범위로 남긴다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-007 | Cocrates Default Chat Agent 및 내장 Skills 배포 |

**스프린트 외:** 사용자가 제공하기로 한 `adr`, `todo`, `sdd` 스킬 명세의 실제 본문 작성·복사, Theia upstream 직접 수정, 새로운 AI 모델·외부 배포 호스트 확정, Cocrates Agent의 별도 모드 설계.

**계획 승인:** 사용자가 `ok`로 sprint-03 계획과 Spec→backlog 실행을 승인했다.

## 완료 정의

1. `docs/theia/adding-ai-agents.md`, `shipping-ai-skills.md`, `extending-get-skill-file-content.md`, `docs/cocrates/agent1.md`를 근거로 한 PRD·AC·ASR·Spec이 작성되고 사용자 승인을 받는다.
2. Default Chat Agent 등록, 시스템 프롬프트 원문 연결, Skills 번들 배치·런타임 발견·패키징, `getSkillFileContent` 확장에 필요한 모든 blocking decision이 ADR 또는 Direct Input으로 정리된다.
3. 구현 가능한 `R-*`/`C-*` 요구사항과 Browser·Stable Electron·Electron Next·패키지 검증 기준이 Spec에 기록된다.
4. 승인된 Spec을 바탕으로 `PB-007`의 구현·검증 가능한 DoD가 product backlog에 기록된다.
5. 실제 스킬 명세 본문은 제공 전까지 구현 범위에서 제외되며, 나중에 복사할 위치와 필요한 frontmatter·폴더 계약만 Spec에 명시된다.

## 데모 체크리스트

- [ ] PRD 및 범위 제약 확정
- [ ] Blocking AC 식별 및 모든 결정(ADR/Direct Input) 완료
- [ ] ASR·Spec 작성 및 Spec review 승인
- [ ] `PB-007` 구현·검증 DoD를 product backlog에 기록
- [ ] 다음 Backlog→Implementation 스프린트의 구현 범위와 검증 진입 조건 확인
- [ ] 스프린트 완료 검토 및 경계 처리
