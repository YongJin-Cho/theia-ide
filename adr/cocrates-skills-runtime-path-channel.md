# Skills 런타임 경로 시드 채널

## Concern
backend/main이 제품 번들 Skills의 절대 경로를 frontend의 `SkillDirectoryContribution`에 어떻게 전달해야 하는가?

## Status
approved

## Context
- 승인된 AC-009와 `adr/cocrates-skills-packaging.md`는 번들 배치, backend/main 경로 시드, frontend contribution의 3층 구조를 선택했지만 전달 채널은 후속 관심사로 남겼다.
- `SkillDirectoryContribution`은 frontend에서 실행되므로 Node `fs`, Electron `process.resourcesPath`, `cwd`를 직접 사용할 수 없다.
- Browser와 Stable/Electron Next는 개발·패키지 실행에서 서로 다른 경로를 가질 수 있으며 Electron Skills는 asar 외부 읽기 리소스여야 한다.
- 구현 전에 채널을 고정하지 않으면 타깃별 런타임 발견과 패키징 검증을 재작업할 위험이 있다.

## Decision
**Option B — 전용 backend RPC 서비스**를 선택한다. 제품 backend가 번들 Skills 절대 경로를 반환하는 전용 service/proxy 계약을 제공하고 frontend `SkillDirectoryContribution`이 그 결과를 `plugin` tier 경로로 사용한다. EnvVariablesServer보다 제품 경계를 명시적으로 캡슐화하고 preference/config보다 설치 경로를 사용자 설정에 노출하지 않는 선택이다.

## Options
### Option A — EnvVariablesServer 기반 환경 변수
- backend/main 또는 Electron main이 제품 Skills 절대 경로를 제품 전용 환경 변수로 시드한다.
- frontend contribution은 `EnvVariablesServer` 스냅샷을 통해 값을 읽고 plugin tier 경로로 반환한다.
- Pro: Theia의 기존 backend→frontend 환경 변수 채널과 프로세스 상속 흐름을 재사용한다.
- Con: 환경 변수 이름·초기화 시점·개발/패키지별 시드 책임을 명확히 관리해야 한다.

### Option B — 전용 backend RPC 서비스
- 제품 backend에 Skills 경로를 반환하는 전용 service와 frontend proxy를 추가한다.
- frontend contribution은 RPC 호출 결과를 사용해 경로를 제공한다.
- Pro: 경로 전달 계약과 오류 처리를 제품 API로 명시적으로 캡슐화한다.
- Con: backend/frontend proxy, DI, 초기화·재연결 로직이 추가되어 구현 면적과 런타임 결합이 커진다.

### Option C — preference/config 경로
- 애플리케이션 설정 또는 preference에 제품 번들 Skills 경로를 기록하고 frontend가 이를 읽는다.
- 타깃별 패키징이 설정 값을 개발·배포 경로에 맞게 제공한다.
- Pro: 설정으로 관찰·변경하기 쉽고 Theia preference 표면과 연결하기 쉽다.
- Con: 설치별 절대 경로를 설정에 노출하며, 사용자 변경·stale path·Electron asar 경로 차이를 별도 처리해야 한다.

## Tradeoffs
| | Option A | Option B | Option C |
|---|---|---|---|
| 기존 플랫폼 재사용 | 높음 | 낮음 | 중간 |
| 제품 코드 면적 | 낮음~중간 | 높음 | 낮음 |
| 타깃별 동적 경로 | 높음 | 높음 | 중간 |
| 경로의 사용자 노출·변경 위험 | 낮음 | 낮음 | 높음 |
| 검증 부담 | 환경 변수 시드와 초기화 | RPC lifecycle | 설정·stale path 정책 |

## Recommendation
- 조사 단계에서는 기존 플랫폼 재사용성이 높은 Option A를 권장했지만, 사용자 검토 결과 Option B를 선택했다. 구현은 제품 경계를 명시적으로 캡슐화하는 전용 RPC를 따른다.

## Consequences
- 제품 backend가 개발·패키지 실행별 번들 Skills 경로를 계산하고 RPC로 반환한다.
- 제품 frontend contribution은 Node 경로 API를 직접 사용하지 않고 RPC proxy를 통해 경로를 받는다.
- Electron main/backend의 개발 실행과 packaged 실행에서 제품 Skills 경로를 각각 올바르게 계산해야 한다.
- 실제 사용자 제공 전까지 `adr`, `todo`, `sdd`의 스킬 파일은 생성·복사하지 않는다.

## Downstream Concerns
- [x] RPC 서비스 식별자·응답 계약: `CocratesSkillsPathService`와 `getBundledSkillsPath(): Promise<string | undefined>`를 사용하고, 경로가 준비되지 않으면 `undefined`를 반환하는 기본값으로 directly resolved
- [ ] Electron `extraResources` 상대 경로 및 Browser 개발/배포 경로: 구현 중 타깃별 패키징 계약을 확정한다.
- [x] 제품·사용자·workspace Skills discovery tier 분리: 부모 AC-009와 기존 ADR에서 covered
- [x] 실제 세 스킬 본문: 사용자 제공 전까지 out of scope

## Related
- `adr/cocrates-skills-packaging.md`
- `spec/cocrates-ai-agent-skills.md` §R-013~R-014, §C-003, §C-006
- `docs/theia/shipping-ai-skills.md` §3~§5
- `docs/cocrates/agent-skills-implementation-notes.md`

## Notes
- 2026-11-21: Options A (EnvVariablesServer), B (전용 backend RPC), C (preference/config)를 비교하는 proposed ADR로 작성했다. 사용자 승인 전에는 구현 채널을 확정하지 않는다.
- 2026-11-21: Status → approved. Option B를 선택하고 `CocratesSkillsPathService`의 경로 반환 계약을 기본값으로 확정했다.
