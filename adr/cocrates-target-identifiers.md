# Cocrates 타깃 식별자 체계

## Concern
Cocrates와 `Cocrates Next`의 앱 식별자, URI scheme, configuration folder, 실행 파일·패키지 이름을 어떤 일관된 체계로 정할 것인가?

## Status
proposed

## Context
- Browser, Stable Electron, Electron Next를 하나의 제품군으로 리브랜딩하지만 Electron Next는 별도 채널 변형으로 유지한다.
- `appId`, `appUserModelId`, URI scheme, configuration folder는 설치·업데이트·딥링크·사용자 데이터 위치에 직접 영향을 준다.
- `docs/rebranding.md`는 예시로 `com.example.myproduct`, `myproduct`, `.my-product`를 제시하지만 Cocrates의 실제 식별자 정책은 정하지 않는다.
- 기존 Theia 식별자와 새 Cocrates 식별자를 동시에 사용하면 설치 충돌과 사용자 데이터 혼동이 생길 수 있다.

## Decision

## Options
### Option A — Cocrates 전용 reverse-domain 식별자
- Stable은 `com.cocrates.ide`, URI scheme은 `cocrates`, configuration folder는 `.cocrates`로 정한다.
- Next는 `com.cocrates.ide.next`, `cocrates-next`, `.cocrates-next`로 Stable과 분리한다.
- Pro: 제품 소유권과 채널 분리가 명확하고 설치·딥링크·사용자 데이터 충돌을 피하기 쉽다.
- Con: 실제 조직의 공식 reverse-domain 정책과 다를 경우 배포 전에 값을 다시 바꿔야 한다.

### Option B — 제품명 중심의 짧은 식별자
- Stable은 `cocrates`, URI scheme은 `cocrates`, configuration folder는 `.cocrates`로 정하고 가능한 위치에 짧은 이름을 재사용한다.
- Next는 이름 뒤에 `-next`를 추가한다.
- Pro: 사람이 읽고 기억하기 쉽고 설정이 간단하다.
- Con: OS 식별자 네임스페이스에서 충돌 가능성이 더 높고 reverse-domain 기반 배포 정책과 맞지 않을 수 있다.

### Option C — 기존 Theia 식별자 유지 및 표시명만 교체
- 표시명과 UI 문구만 Cocrates로 바꾸고 `eclipse.theia`, `theia`, `.theia-ide` 계열 식별자를 유지한다.
- Pro: 기존 설치·업데이트·사용자 데이터와의 호환성이 가장 높다.
- Con: 사용자 표면과 배포 메타데이터에 Theia 브랜드가 남고, Cocrates 제품으로 독립 배포하기 어렵다.

## Tradeoffs
| | Option A | Option B | Option C |
|---|---|---|---|
| 브랜드 독립성 | 높음 | 높음 | 낮음 |
| 설치·데이터 충돌 방지 | 높음 | 중간 | 낮음 |
| 공식 reverse-domain 정책 대응 | 확인 필요 | 약함 | 기존 값 유지 |
| 기존 설치 호환성 | 별도 마이그레이션 필요 | 별도 마이그레이션 필요 | 높음 |

## Recommendation
- Option A를 권장한다. 전체 타깃 리브랜딩의 목적에 맞게 제품 식별자를 독립시키고 Stable/Next를 명시적으로 분리할 수 있다.
- 단, `com.cocrates`가 실제 배포 조직의 공식 reverse-domain인지 사용자 또는 배포 정책으로 확인해야 한다.

## Consequences
- 승인 시 Electron builder, package 설정, URI handler, launcher, updater, CI artifact와 사용자 데이터 경로를 동일한 매핑으로 변경해야 한다.
- 기존 Theia 설치의 사용자 데이터·업데이트 호환성은 별도 정책으로 결정해야 한다.
- Option C는 Cocrates 독립 제품 식별자 요구와 맞지 않으므로 채택하지 않는 방향이다.

## Downstream Concerns
- [ ] **ADR candidate — 기존 사용자 데이터 마이그레이션:** `.theia-ide` 계열 설정과 기존 설치를 새 `.cocrates` 계열로 자동 이전할지 결정한다.
- [ ] **ADR candidate — Cocrates 배포 도메인:** `com.cocrates`가 공식 OS 식별자 네임스페이스인지 확인한다.
- [x] **deferred assumption — 실제 릴리스 버전 규칙:** 현재 concern에서는 다루지 않으며 기존 버전 관리 규칙을 유지한다.

## Related
- `spec/AC.md` — AC-005
- `docs/rebranding.md` — 리브랜딩 식별자 기준

## Notes
- 현재 세션: AC-005의 식별자 체계 선택을 위해 Options A~C를 제안했다.
