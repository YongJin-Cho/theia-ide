# Cocrates 내장 Skills 배치·발견·패키징

## Concern
사용자가 제공할 `adr`, `todo`, `sdd` 스킬 트리를 Browser·Stable Electron·Electron Next 제품 패키지에 어떻게 포함하고 런타임에서 발견하게 할 것인가?

## Status
approved

## Context
- Theia는 product manifest가 아니라 스킬 디렉터리와 `SKILL.md` frontmatter를 스캔해 Skills를 발견한다.
- workspace/configured/default/plugin discovery tier가 있으며, 제품 내장 스킬은 패키징된 읽기 가능한 디스크 경로와 frontend contribution이 모두 필요하다.
- Electron `asar: true`에서는 보조 파일을 포함한 스킬 트리를 asar 밖에 두는 것이 안전하다.
- Browser와 Electron은 같은 제품 확장을 사용하지만 런타임 경로를 frontend에서 Node/Electron API로 추측할 수 없다.
- 사용자는 세 스킬의 실제 명세 본문을 나중에 제공한다. 이번 결정은 파일의 최종 내용보다 배치·발견 계약을 확정한다.

## Decision
**Option A — 번들 디렉터리 + SkillDirectoryContribution + 런타임 경로 시드**를 선택한다. 제품 소유 스킬 트리를 패키지하고, backend/main이 타깃별 번들 경로를 시드하며, frontend의 `SkillDirectoryContribution`이 plugin discovery tier에 해당 경로를 제공한다. 제품 번들과 사용자·workspace 스킬을 분리하면서 Browser와 Electron의 런타임 경로 차이를 수용한다.

## Options
### Option A — 번들 디렉터리 + SkillDirectoryContribution + 런타임 경로 시드
- 스킬 트리를 제품 소유 리소스로 패키지하고, Electron은 asar 밖의 배포 리소스에 둔다.
- main/backend가 타깃별 절대 경로를 환경 변수 또는 동등한 채널로 시드하고 frontend contribution이 plugin tier 경로로 반환한다.
- Pro: 제품 번들·사용자 스킬·workspace 스킬을 분리하고 읽기 전용 패키지에서도 discovery를 예측할 수 있다.
- Con: 타깃별 패키징과 경로 시드, application frontend 재번들이 필요하다.

### Option B — 기동 시 configuration folder에 스킬 복사
- 제품 시작 시 스킬 트리를 `<productConfigDir>/skills/`로 복사하여 Theia default tier가 발견하게 한다.
- Pro: 별도 SkillDirectoryContribution과 패키지 경로 시드가 적다.
- Con: 제품 번들과 사용자 편집 파일이 섞이고 업데이트·덮어쓰기·읽기 전용 설치 정책이 필요하다.

### Option C — `ai-features.skills.skillDirectories`에 절대 경로 설정
- 제품 설정 또는 preference에 패키지 스킬 절대 경로를 추가한다.
- Pro: 기존 preference API를 활용하고 구현이 작다.
- Con: 설치 위치가 타깃·플랫폼마다 달라 정적 절대 경로를 안전하게 제공하기 어렵고, 기본 제품 번들의 discovery 계약으로 약하다.

## Tradeoffs
| | Option A | Option B | Option C |
|---|---|---|---|
| 제품·사용자 파일 분리 | 높음 | 낮음 | 높음 |
| Electron asar/읽기 전용 대응 | 높음 | 중간 | 중간 |
| Browser/Docker 대응 | 경로 시드 필요 | 기동 복사 필요 | 설정 경로 필요 |
| 업데이트 복잡도 | 번들 교체 중심 | 복사·보존 정책 필요 | 설치 경로 관리 필요 |
| 구현 범위 | 중간~높음 | 중간 | 낮음 |

## Recommendation
- **Option A**를 권장한다. 문서가 설명하는 제품 내장 Skills의 배치·시드·기여 세 층을 그대로 분리하며, 패키지에 포함된 스킬과 사용자/워크스페이스 스킬의 우선순위를 보존한다.

## Consequences
- 제품 확장 또는 제품 리소스 패키지에 세 스킬의 부모 디렉터리와 discovery contribution이 필요하다.
- 실제 스킬 명세가 제공되기 전까지는 파일 본문을 임의로 만들지 않는다.
- Electron 패키지 검증은 스킬 트리가 의도한 asar 외부 위치에 있고, Browser/Electron frontend 번들이 contribution을 포함하는지 확인해야 한다.
- 제품 번들 스킬은 읽기 전용으로 취급하며, 사용자·workspace 스킬을 제품 번들에 복사하거나 덮어쓰지 않는다.

## Downstream Concerns
- [ ] **ADR candidate — Runtime path seed:** Browser/backend와 Electron main에서 번들 스킬 절대 경로를 전달하는 구체 채널은 구현 전 확정이 필요하다.
- [x] **directly resolved — Skill qualifier:** 제품 내장 스킬은 별도 qualifier 없이 표준 이름을 사용한다. workspace/configured tier가 우선해 사용자 스킬이 제품 스킬을 가릴 수 있다.
- [x] **deferred assumption — Skill contents:** 사용자가 제공할 `SKILL.md`와 보조 파일을 지정 위치에 복사한다. 제공 시 frontmatter와 파일 목록을 검증한다.
- [x] **out of scope — Upstream builtin API:** Theia upstream builtin skill API가 열리기 전까지 제품 확장 방식으로 구현한다.

## Related
- `spec/AC.md` — AC-009
- `spec/PRD.md` — Sprint-03 AI Agent·Skills 변경
- `docs/theia/shipping-ai-skills.md`

## Notes
- 2026-11-21: AC-009 검토를 위해 Option A/B/C를 작성하고 Option A를 권장안으로 제시했다.
- 2026-11-21: 사용자 선택으로 Status → approved; Option A를 Decision으로 기록했다. 런타임 경로 시드 채널은 구현 전 후속 관심사로 남겼다.
