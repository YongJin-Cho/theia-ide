# Sprint 00 — Eclipse Theia IDE Product Template Spec 정립

> **제품 백로그:** [`product-backlog.md`](./product-backlog.md)
> **실행 보드:** [`../TODO.md`](../TODO.md)

## 스프린트 목표

Eclipse Theia IDE Product Template의 구현을 먼저 조사하여 루트 `AGENTS.md`를 작성하고, 제품 자체의 capabilities·구조·제약을 구현에서 역추출한다. 이후 SDD의 PRD → AC 식별 → AC 검토 → ASR 통합 → Spec 작성 → Spec 검토를 완료하고, 확정된 제품 Spec을 기반으로 제품 백로그를 생성한 뒤 이미 구현된 코드와의 일치 여부를 검증한다.

## 범위

| ID | 스토리 |
|----|--------|
| PB-001 | Eclipse Theia IDE Product Template의 제품 Spec 정립 |

**스프린트 외:** Spec에 없는 코드 기능 변경, 의존성 업데이트, 제품 기능 추가 —

## 완료 정의

1. 저장소의 루트 구조, 애플리케이션/확장 모듈, 주요 설정과 작업 흐름이 구현 사실에 근거해 `AGENTS.md`에 설명되어 있다.
2. PRD와 최종 Spec이 문서화 작업 자체가 아니라 Eclipse Theia IDE Product Template의 제품 역할, capabilities, 구조와 제약을 정의한다.
3. SDD의 PRD, AC, ASR, 최종 Spec, Spec 검토 기록이 사용자 승인 상태로 작성되어 있다.
4. 확정된 제품 Spec의 요구사항이 제품 백로그의 `PB-*` 스토리로 기록되고, 이번 스프린트에서 이미 구현된 것으로 완료 처리되어 있다.
5. Spec과 구현의 일치 여부를 빌드·린트·테스트 또는 문서/설정 대조로 검증하고 검증 기록을 남긴다.
6. 설치·개발 빌드·프로덕션 빌드·패키징·테스트·린트·브라우저 실행 명령이 실제 `package.json` 및 README와 일치한다.

## 데모 체크리스트

- [ ] 구현 사실 조사 및 `AGENTS.md` 작성
- [ ] Product Template PRD 작성 및 검토
- [ ] AC 식별 및 목록 승인
- [ ] AC 검토 및 모든 결정사항 확정
- [ ] ASR 통합 및 승인
- [ ] Product Template Spec 작성 및 승인
- [ ] Spec 기반 제품 백로그 생성 및 구현 완료 처리
- [ ] Spec-구현 일치 검증 기록 작성
- [ ] 스프린트 완료 검토 및 경계 처리
