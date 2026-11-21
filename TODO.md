# TODO: Cocrates 전체 타깃 리브랜딩 구현·검증

> **Project root:** `theia-ide`
> **Current sprint:** sprint-02 — [Cocrates 브랜딩 구현·검증](./scrum/sprint-02.md)
> **Product Backlog:** [`scrum/product-backlog.md`](./scrum/product-backlog.md)
> **Conversation log:** [`PROMPTS.md`](./PROMPTS.md)

## Snapshot

| Done | Open | Blocked | Skipped |
|------|------|---------|---------|
| 5    | 2    | 0       | 0       |

**Sprint goal:** 승인된 Cocrates 브랜딩 Spec을 Browser, Stable Electron, Electron Next에 구현하고 정적·실행 검증한다.
**Current focus:** T-006
**Recommended next:** T-006 — 스프린트 완료 검토

## Tasks

- [x] **T-001** — 애플리케이션·제품 확장 브랜딩 구현
  - Phase: implementation
  - Artifact: `applications/browser`, `applications/electron`, `applications/electron-next`, `theia-extensions/product`
  - Depends: —
  - Notes: PB-006; Spec R-001~R-005, R-007, R-010 및 C-001~C-003을 구현했다. Stable/Next 식별자·표시명·설정 폴더와 Product UI 카피·AI tool name·Help 링크를 갱신했고, `@theia/*`·Theia API 계약은 유지했다. 관련 TypeScript 및 애플리케이션 build가 통과했다.
- [x] **T-002** — Updater·Launcher 브랜딩 구현
  - Phase: implementation
  - Artifact: `theia-extensions/updater`, `theia-extensions/launcher`
  - Depends: T-001
  - Notes: PB-006; Spec R-006, R-008 및 관련 C-004~C-005를 구현했다. Stable/Next URI handler 표시명, updater UI 및 Next updater 경로를 갱신했고 미제공 배포 호스트는 추가하지 않았다. updater/launcher TypeScript build가 통과했다.
- [x] **T-003** — CI·Docker·문서·배포 메타데이터 브랜딩 구현
  - Phase: implementation
  - Artifact: `package.json`, `.github`, `README.md`, 관련 스크립트
  - Depends: T-002
  - Notes: PB-006; Spec R-001, R-009~R-011 및 C-004~C-005를 구현했다. 제품 소유 표면·GitHub 경로·Docker tag·CI artifact 이름·README 핵심 표면을 Cocrates로 갱신하고 Theia 업스트림 도구명은 보존했다.
- [x] **T-004** — 정적 브랜딩 대조 및 자동화 검증
  - Phase: demo
  - Artifact: `TODO.md`, `PROMPTS.md`
  - Depends: T-003
  - Notes: Spec R-001~R-011/C-001~C-006 정적 대조를 완료했다. 제품·확장 build, 애플리케이션 build, lint, Stable/Next Electron Preview 패키징이 통과했다.
- [x] **T-005** — Spec 기반 Cocrates 브랜딩 검증 기록
  - Phase: verification
  - Artifact: `verification/cocrates-branding.md`
  - Depends: T-004
  - Notes: Stage ⑧ inventory로 R-001~R-011 및 C-001~C-006을 기록했다. 결과는 17 pass, 0 fail, 0 partial, 0 not-verifiable이며 undocumented ASR는 없다.
- [ ] **T-006** — 스프린트 완료 검토
  - Phase: sprint completion gate
  - Artifact: `PROMPTS.md`, `TODO.md`
  - Depends: T-005
  - Notes: 목표·DoD·데모 증거와 미해결 항목을 사용자에게 검토받는다.
- [ ] **T-007** — Sprint Boundary → sprint-03
  - Phase: cross-cutting
  - Artifact: `scrum/TODO-02.md`, `scrum/PROMPTS-02.md`
  - Depends: T-001, T-002, T-003, T-004, T-005, T-006
  - Notes: 완료 승인 후 보드와 대화 로그를 보관하고 다음 계획을 처리한다.

## Completed sprints

| Sprint | Goal | Closed | Archive |
|--------|------|---------|---------|
| 00 | Eclipse Theia IDE Product Template Spec 정립 | 현재 세션 | [`TODO-00.md`](./scrum/TODO-00.md), [`PROMPTS-00.md`](./scrum/PROMPTS-00.md) |
| 01 | Cocrates 전체 타깃 리브랜딩 요구사항 확정 | 현재 세션 | [`TODO-01.md`](./scrum/TODO-01.md), [`PROMPTS-01.md`](./scrum/PROMPTS-01.md) |

## Notes

- sprint-02는 승인된 `spec/cocrates-branding.md`만 요구사항 SSOT로 사용한다.
- Electron Next는 별도 채널 특성을 유지하는 `Cocrates Next` 제품 변형으로 다룬다.
- 구현 중 `AGENTS.md`를 읽고 변경된 구조·빌드·검증 방법을 동기화한다.
