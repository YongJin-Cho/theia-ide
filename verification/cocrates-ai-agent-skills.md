# Cocrates AI Agent·Skills 구현 검증 기록

- **대상:** `PB-007` / sprint-04
- **검증일:** 2026-11-21
- **기준:** [`spec/cocrates-ai-agent-skills.md`](../spec/cocrates-ai-agent-skills.md)
- **범위:** Browser, Stable Electron, Electron Next, 제품 확장, Skills 번들 계약, `getSkillFileContent`

## 결과 요약

| 영역 | 결과 | 증거 또는 제약 |
|---|---|---|
| 제품 확장 TypeScript 빌드 | 통과 | `build - theia-extensions/product/tsconfig.json` 성공 |
| 제품 확장 lint | 통과 | `lint - theia-extensions/product` 성공; deprecation warning 2건, 오류 0건 |
| 저장소 lint | 통과 | `lint` 성공; TypeScript 지원 버전 경고와 JS 설정 파일 무규칙 안내만 있음 |
| Browser TypeScript 빌드 | 실행 불가 | 저장소 설정의 `baseUrl`, `downlevelIteration`을 현재 TypeScript 5.9.3이 TS 6 대비 deprecated error(TS5101)로 처리 |
| Stable Electron TypeScript 빌드 | 실행 불가 | 동일한 TS5101; `launcher`, `product`, `updater` 설정에서 발생 |
| Electron Next TypeScript 빌드 | 실행 불가 | 동일한 TS5101; `product`, `updater` 설정에서 발생 |
| Stable Electron E2E | 9 passing / 1 failing | 기존 Builtin extensions 시나리오가 `#vsx-extensions\\:builtin .theia-TreeContainer`를 찾지 못함; `applications/electron/test-screenshots/FAILED-builtin-extensions.png` 생성 |
| Electron Next E2E | 9 passing / 1 failing | 동일한 Builtin extensions 시나리오 실패; `applications/electron-next/test-screenshots/FAILED-builtin-extensions.png` 생성 |
| 패키지 생성 | 실행 보류 | 대상 build가 TS5101로 막혀 새 패키지 산출물의 신뢰 가능한 증거를 만들 수 없음 |
| Browser 런타임 | 실행 보류 | 대상 build 실패로 최신 Browser 산출물을 기동할 수 없음 |
| Skills 실제 본문 | 의도적으로 미생성 | `theia-extensions/product/skills/README.md`만 존재; `adr`, `todo`, `sdd` 본문은 사용자 제공 전 생성·복사하지 않음 |

## Spec 추적성

| 요구사항 | 구현/검증 근거 | 판정 |
|---|---|---|
| R-001, R-008 | `applications/electron/package.json`, `applications/electron-next/package.json`의 타깃별 앱 식별자·URI scheme·configuration folder | 정적 확인 |
| R-011 | 제품 확장의 `AbstractStreamParsingChatAgent`, `Agent`/`ChatAgent` 등록 및 `ai-features.chat.defaultChatAgent` 설정 | 정적 확인 + 제품 확장 빌드 |
| R-012 | `theia-extensions/product/skills/README.md`의 사용자 제공 Skills root 계약 | 정적 확인; 실제 본문은 범위 제외 |
| R-013, R-014 | `CocratesSkillsPathService`, `SkillDirectoryContribution`, 두 Electron builder의 `extraResources` → `app/skills` | 정적 확인; 패키지 실행은 build 제약으로 보류 |
| R-015 | `docs/cocrates/agent1.md`에서 생성된 `src/browser/generated/cocrates-agent-system-prompt.ts`와 Agent 연결 | 정적 확인 + 제품 확장 빌드 |
| R-016~R-020 | 기존 `getSkillFileContent` ID 유지, 제품 DI rebind, 선택적 `path`, root 탈출·절대 경로·디렉터리·오류 처리 구현 | 정적 확인 + 제품 확장 빌드; 런타임 호출은 앱 build 제약으로 보류 |
| C-001~C-007 | upstream 수정 없음, 제품 확장 경계, 실제 Skills 본문 미생성, 실행 불가 검증을 성공으로 표시하지 않음 | 정적 확인 |

## 패키징 계약 정적 증거

Stable Electron과 Electron Next의 `electron-builder.yml` 모두 다음을 선언한다.

```yaml
extraResources:
  - from: ../../theia-extensions/product/skills
    to: app/skills
```

따라서 최종 패키지에서 Skills는 `resources/app/skills`에 asar 외부 리소스로 배치되는 계약이다. 두 설정은 각각 `com.cocrates.ide`/`cocrates`/`.cocrates`와 `com.cocrates.ide.next`/`cocrates-next`/`.cocrates-next`를 유지한다.

## 실패·보류 해석

1. 제품 확장 단독 빌드와 lint는 성공했으므로 T-003~T-005가 추가한 TypeScript 계약은 해당 범위에서 컴파일 가능하다.
2. 애플리케이션 빌드 실패는 현재 도구 체인과 저장소의 기존 TS compiler option 호환성 문제다. 이번 검증에서 `ignoreDeprecations`를 임의로 추가하거나 저장소 설정을 바꾸지 않았다.
3. Electron E2E는 두 타깃 모두 9개 시나리오가 통과했지만 Builtin extensions 시나리오가 실패했다. 이를 PB-007 성공으로 과장하지 않는다.
4. 새 패키지를 만들지 못했으므로 Browser·Stable Electron·Electron Next의 최신 구현에 대한 런타임 Skills 발견과 `getSkillFileContent` 호출 증거는 미완료다.
5. 다음 실행에서는 저장소가 지원하는 TypeScript 버전으로 도구 체인을 맞춘 뒤 세 애플리케이션 build → package preview → Browser/Electron 런타임 Skills discovery 및 tool contract 검증을 재실행해야 한다.

## 결론

구현 정적 대조와 제품 확장 단위 검증은 완료했다. 다만 애플리케이션 build 호환성 오류와 양 Electron 타깃의 공통 E2E 실패 때문에 `PB-007` 전체 DoD는 아직 충족으로 닫지 않는다. sprint-04 Boundary에서 완료 항목, 재검증 carry-over, 의도적 범위 제외를 사용자가 검토해야 한다.
