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
| Browser production build | 통과 | `build:prod - applications/browser` 성공; `theia build --app-target="browser"`가 browser/node 모두 0 errors |
| Stable Electron production build | 통과 | `yarn build`의 `build:applications` 성공; `theia build --app-target="electron"` browser/node/electron 모두 0 errors |
| Electron Next production build | 통과 | `yarn build`의 `build:applications`에는 Stable만 포함되므로 `package:applications:next`의 사전 build와 산출물로 확인 |
| Stable Electron 패키징 | 통과 | `package:applications` 성공; `dist/Cocrates.AppImage`, `dist/Cocrates.deb` 생성 |
| Electron Next 패키징 | 통과 | `package:applications:next` 성공; `dist/Cocrates Next.AppImage`, `dist/Cocrates Next.deb` 생성 |
| Stable Electron E2E | 통과 | `yarn test`에서 10 passing |
| Electron Next E2E | 통과 | `yarn test`에서 10 passing |
| Browser 런타임 | 실행 보류 | Browser build는 통과했으나 제공된 launch configuration을 debug adapter가 실행하지 못해 UI smoke를 수행하지 못함 |
| Skills 실제 본문 | 제공·패키징 확인 | 사용자가 제공한 `adr/SKILL.md`, `todo/SKILL.md`, `sdd/SKILL.md`와 `sdd/workflow/`가 소스 및 두 Electron `resources/app/skills`에 존재 |

## Spec 추적성

| 요구사항 | 구현/검증 근거 | 판정 |
|---|---|---|
| R-001, R-008 | `applications/electron/package.json`, `applications/electron-next/package.json`의 타깃별 앱 식별자·URI scheme·configuration folder | 정적 확인 |
| R-011 | 제품 확장의 `AbstractStreamParsingChatAgent`, `Agent`/`ChatAgent` 등록 및 `ai-features.chat.defaultChatAgent` 설정 | 정적 확인 + 제품 확장 빌드 |
| R-012 | 사용자가 제공한 `adr/SKILL.md`, `todo/SKILL.md`, `sdd/SKILL.md`와 `sdd/workflow/` | 패키지 포함 확인 |
| R-013, R-014 | `CocratesSkillsPathService`, `SkillDirectoryContribution`, 두 Electron builder의 `extraResources` → `app/skills` | 정적 확인 + Stable/Next 패키징 성공 |
| R-015 | `docs/cocrates/agent1.md`에서 생성된 `src/browser/generated/cocrates-agent-system-prompt.ts`와 Agent 연결 | 정적 확인 + 제품 확장 빌드 |
| R-016~R-020 | 기존 `getSkillFileContent` ID 유지, 제품 DI rebind, 선택적 `path`, root 탈출·절대 경로·디렉터리·오류 처리 구현 | 정적 확인 + 제품 확장 및 애플리케이션 build 성공; 런타임 호출 smoke는 별도 보강 가능 |
| C-001~C-007 | upstream 수정 없음, 제품 확장 경계, 실제 Skills 본문 미생성, 실행 불가 검증을 성공으로 표시하지 않음 | 정적 확인 |

## 패키징 계약 정적 증거

Stable Electron과 Electron Next의 `electron-builder.yml` 모두 다음을 선언한다.

```yaml
extraResources:
  - from: ../../theia-extensions/product/skills
    to: app/skills
```

따라서 최종 패키지에서 Skills는 `resources/app/skills`에 asar 외부 리소스로 배치되는 계약이다. 두 설정은 각각 `com.cocrates.ide`/`cocrates`/`.cocrates`와 `com.cocrates.ide.next`/`cocrates-next`/`.cocrates-next`를 유지한다.

## 실행 경로 정정

초기 기록의 실패는 제품 파이프라인 실패가 아니었다. VS Code가 노출한 개별 `tsc -b applications/.../tsconfig.json` 작업을 `yarn build`와 혼동해 실행한 결과였으며, TypeScript 5.9.3의 TS5101이 보고됐다. 저장소의 공식 경로는 다음과 다르다.

- `yarn build` → `build:extensions` → `build:applications` → Theia/esbuild 기반 production build
- `yarn package:applications` → Stable Electron production package
- `yarn package:applications:next` → Electron Next production package
- `yarn test` → Stable Electron과 Electron Next E2E
- `yarn build:prod` in `applications/browser` → Browser production build

공식 경로를 다시 실행한 결과는 모두 성공했다. 따라서 초기 TS5101 및 9 passing/1 failing 결과는 이 검증의 최종 판정에서 폐기한다. Browser UI smoke는 launch configuration의 debug adapter 실행 실패로 별도 보류했다.

## 결론

PB-007의 구현, 공식 build/package, Stable Electron·Electron Next E2E, Skills 소스·패키징 정적 증거가 완료됐다. 초기 검증 기록은 잘못된 실행 경로를 사용했으므로 이 정정 내용이 최종 증거다. Browser production build도 통과했으며, Browser UI smoke와 실제 tool 호출은 별도 실행 진입점이 확보되면 보강할 수 있다.
