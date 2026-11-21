# 검증: Cocrates 브랜딩

**Spec:** `spec/cocrates-branding.md` (PRD.md와 정합)
**Artifact(s):** `applications/browser`, `applications/electron`, `applications/electron-next`, `theia-extensions/product`, `theia-extensions/updater`, `theia-extensions/launcher`, `package.json`, `.github`, `README.md`, 관련 스크립트
**Verified:** 현재 세션
**Summary:** 17 pass, 0 fail, 0 partial, 0 not-verifiable

## 인벤토리 및 결과

| # | Spec item | Status | Evidence / Notes |
|---|-----------|--------|------------------|
| 1 | R-001 | pass | 세 앱 package.json의 `productName`/`applicationName`과 Product UI 제목·카피가 Cocrates/Cocrates Next로 갱신되었다. |
| 2 | R-002 | pass | Stable `com.cocrates.ide`/`cocrates`/`.cocrates`, Next `com.cocrates.ide.next`/`cocrates-next`/`.cocrates-next`가 각 package.json과 Electron builder 설정에 반영되었다. |
| 3 | R-003 | pass | Browser package.json의 표시명·제품명·configuration folder가 Cocrates로 갱신되었고 Electron 전용 설정은 추가하지 않았다. |
| 4 | R-004 | pass | Stable/Next 설정 폴더와 Electron 식별자가 분리되며 기존 `.theia-ide` 자동 마이그레이션 코드는 추가되지 않았다. |
| 5 | R-005 | pass | `electron-builder.yml`의 appId/productName/protocol이 Stable과 Next의 승인된 값으로 갱신되었고 Preview 패키징이 성공했다. |
| 6 | R-006 | pass | Launcher endpoint가 `cocrates`/`cocrates-next` URI에 Cocrates/Cocrates Next sudo 표시명을 사용하며 applicationName은 각 package.json에서 전달된다. |
| 7 | R-007 | pass | Product 확장의 Welcome/About 공통 제목·카피, AI registry tool name, Help 링크가 Cocrates 브랜딩으로 갱신되었다. |
| 8 | R-008 | pass | Updater 진행 UI가 applicationName 기반 Cocrates 명칭을 사용하고 Electron Next feed URL이 `https://github.com/cocrates/theia-ide/releases/download/next`다. |
| 9 | R-009 | pass | GitHub repository/homepage와 Docker workflow tag `cocrates-ide`, Next CI artifact 이름을 갱신했다. 별도 CDN/registry 호스트는 추가하지 않았다. |
| 10 | R-010 | pass | 사용자 제품 표면의 Theia 제품명은 제거했으며 `@theia/*`, Theia API, 업스트림 도구명과 내부 모듈 식별자는 유지했다. |
| 11 | R-011 | pass | 관련 소스·설정 정적 대조, TypeScript build, 애플리케이션 build, lint, Stable/Next Electron Preview 패키징을 완료했다. |
| 12 | C-001 | pass | 브랜딩 변경만 수행했으며 Theia API·패키지 계약을 변경하지 않았다. |
| 13 | C-002 | pass | 기존 애플리케이션·Product/Updater/Launcher 확장 경계를 유지했다. |
| 14 | C-003 | pass | `.theia-ide` 데이터 자동 마이그레이션 코드를 구현하지 않았다. |
| 15 | C-004 | pass | 제공된 GitHub release 경로와 Docker tag만 사용하고 미제공 배포 호스트를 추정하지 않았다. |
| 16 | C-005 | pass | Yarn/Lerna, Theia build/package, Electron asar와 postinstall 흐름을 보존했다. |
| 17 | C-006 | pass | 실행·정적 검증 결과를 이 기록에 남겼고, build/lint/package 결과와 환경 경고를 구분해 기록했다. |

## 설계 검토 메모

- Lerna 애플리케이션 scope는 새 package name에 맞춰 `cocrates*app`으로 변경했고, 확장 package name은 Theia 호환 내부 식별자로 유지했다.
- 아이콘·splash 파일의 저장소 내부 파일명은 기존 리소스 경로와 electron-builder wiring을 보존했다. 사용자에게 표시되는 productName과 UI 카피는 Cocrates로 변경했다.
- Preview 패키징 로그에는 기존 선택적 플랫폼 의존성 경고가 있었지만 Stable/Next 패키징은 성공했다.

## 편차

없음.

## 문서화되지 않은 ASR

없음. 구현 선택은 승인된 Spec의 식별자 경계, Theia 호환성 제약, 미제공 호스트 제한 안에 있다.

## 검증 실행 증거

- `build - theia-extensions/product`: pass
- `build - theia-extensions/updater`: pass
- `build - theia-extensions/launcher`: pass
- `build - applications/browser`: pass
- `build - applications/electron`: pass
- `build - applications/electron-next`: pass
- `lint`: pass
- `package:preview - applications/electron`: pass
- `package:preview - applications/electron-next`: pass
- 정적 대조: 승인된 Stable/Next 식별자와 금지된 사용자 표면 문자열을 대상 소스에서 확인

## 권장 다음 단계

- 모든 인벤토리 항목이 pass이므로 구현 범위는 완료 상태다.
- 다음은 스프린트 완료 검토에서 DoD와 데모 증거를 사용자에게 제시하는 것이다.
