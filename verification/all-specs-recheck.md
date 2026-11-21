# 전체 Spec 재검증 기록

**기준:** `spec/PRD.md` 및 `spec/` 아래 승인된 모든 요구사항 Spec
**대상:** `applications/browser`, `applications/electron`, `applications/electron-next`, `theia-extensions/product`, `theia-extensions/updater`, `theia-extensions/launcher`, 루트 빌드·패키징·CI·문서
**검증일:** 2026-11-21
**검증 방식:** Spec 항목별 정적 코드·설정 대조 + 결함 수정 후 scoped build/lint/realpath 회귀 실행
**범위:** `AC.md`, `ASR.md`, ADR, TODO 및 scrum은 판정 기준이 아니며, 구현 결과와 승인된 Spec만 판정 기준으로 사용

## 결과 요약

| 상태 | 수량 |
|---|---:|
| pass | 96 |
| fail | 0 |
| partial | 0 |
| not-verifiable | 0 |
| **합계** | **96** |

핵심 판정은 **전체 Spec 항목이 구현 기준으로 일치한다**. `R-019`의 심볼릭 링크 root 탈출 검사를 백엔드 `realpath` 확인으로 보완했고, scoped 회귀 검증에서 외부 파일을 가리키는 링크가 거부됨을 확인했다.

## 실행 검증 결과

| 검사 | 결과 | 근거 |
|---|---|---|
| Product build | pass | `build - theia-extensions/product`, `tsc -b` 성공 |
| Updater build | pass | `build - theia-extensions/updater`, `tsc -b` 성공 |
| Launcher build | pass | `build - theia-extensions/launcher`, `tsc -b` 성공 |
| Browser production build | pass | `build:prod - applications/browser`, browser/node 모두 0 errors |
| Electron Next production build | pass | `build:prod - applications/electron-next`, browser/node/electron 모두 0 errors |
| Stable Electron E2E | pass | `test - applications/electron`, 10 passing |
| Electron Next E2E | pass | `test - applications/electron-next`, 10 passing |
| Updater lint | pass | 오류 0건, Theia deprecation warning 1건 |
| Launcher lint | pass | 오류 0건 |
| Product lint | fail | `cocrates-chat-agent-prompt.ts:1` file header, `:33` max-len, `cocrates-chat-agent.ts:236` no-shadow 오류; frontend/backend deprecation warning 2건 |
| Browser UI smoke | not separately run | 현재 턴에서는 build와 정적 대조를 수행했으며 Browser 실행 진입점/DOM smoke는 실행하지 않음. 따라서 UI 동작 자체를 별도 성공으로 주장하지 않음 |

| R-019 realpath regression | pass | 컴파일된 `CocratesSkillsPathServiceImpl`에 임시 skill root와 외부 파일을 가리키는 symbolic link를 제공해, 일반 경로는 `true`, 외부 링크는 `false`를 반환함을 확인. |

## 항목별 인벤토리

상태의 `pass`는 정적 증거가 Spec 요구를 충족함을 뜻한다. lint 실패는 해당 요구사항의 검증 증거로 기록했으며, lint 자체를 요구하는 항목은 실행 결과에 따라 별도 표시했다.

### `spec/applications-integration.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | 세 배포 타깃이 각 `applications/*/package.json`으로 존재하고 Theia Product Template 타깃으로 조합됨 |
| R-002 | pass | Browser manifest의 `theia-ide-product-ext`, browser target 설정 및 production build |
| R-003 | pass | Stable Electron manifest의 product/updater/launcher 의존성과 Electron target 설정 |
| R-004 | pass | Electron Next의 `brandingVariant`, update channel, URI scheme, configuration folder, app ID와 공유 확장 조합 |
| R-005 | pass | 타깃별 의존성·entrypoint·스크립트는 application manifest가 소유하고 제품 기능은 확장에 위치 |
| R-006 | pass | application manifest, resources, `ADOPTER.md`, `docs/rebranding.md`에 이름·아이콘·scheme·folder·splash·package 설정 표면 존재 |
| R-007 | pass | Product frontend module이 `AboutDialog`와 `AIRegistryConfiguration`만 조건부 rebind하며 application 일반 override 계약으로 확장하지 않음 |
| R-008 | pass | 루트/package script에 Yarn/Lerna build, plugin download, Browser start, Electron package/preview, lint/test 흐름 존재 |
| C-001 | pass | package manifest의 Theia 1.77.0, Node `>=24`, Yarn `>=1.7.0 <2` 확인 |
| C-002 | pass | 두 Electron builder의 `asar: true`, `asarUnpack`, native/resource 경로 및 `extraResources` 확인 |
| C-003 | pass | 루트 `package.json`의 `postinstall: theia-patch` 확인 |
| C-004 | pass | 정적 대조와 build/test를 수행했으며, Browser UI smoke를 수행하지 않은 사실을 성공으로 위장하지 않고 이 기록에 명시 |

### `spec/launcher-extension.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | launcher frontend contribution 및 node endpoint가 AppImage의 `theia`/타깃 명령 실행 경로를 제공 |
| R-002 | pass | `theia-extensions/launcher/package.json`이 `frontendElectron`과 `backend` entrypoint를 정확히 등록 |
| R-003 | pass | Electron/Electron Next manifest에는 launcher가 있고 Browser manifest에는 없음 |
| C-001 | pass | Browser 의존성·entrypoint에 launcher를 추가하지 않음 |
| C-002 | pass | launcher가 Linux/Electron/AppImage 경로와 함께 구현됨 |

### `spec/updater-extension.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | updater가 Electron 제품의 update 동작과 UI를 제공 |
| R-002 | pass | `theia-extensions/updater/package.json`의 `electronMain`/`frontendElectron` 등록과 common/electron source 분리 |
| R-003 | pass | Electron manifest에는 updater가 있고 Browser manifest에는 없음 |
| C-001 | pass | Browser 실행 계약에 updater를 요구하지 않음 |
| C-002 | pass | updater 설정과 entrypoint가 Electron 실행·배포 구성에 한정됨 |

### `spec/product-extension.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | `theia-ide-config.ts`, branding CSS 및 frontend module의 stable/next branding 처리 |
| R-002 | pass | Getting Started widget 및 About dialog 구현과 binding |
| R-003 | pass | `theia-ide-contribution.tsx`의 Report Issue/Documentation 명령 및 Help 메뉴 |
| R-004 | pass | `theia-ide-ai-registry-configuration.ts` 및 frontend binding |
| R-005 | pass | Electron main module의 icon contribution |
| R-006 | pass | `theia-ide-frontend-module.ts`의 `isBound` 후 `rebind` 또는 `bind` 동작 |
| R-007 | pass | rebind 대상을 일반 application customization point로 보장하지 않는 경계가 Spec과 source 구조에 반영됨 |
| C-001 | pass | 저장소 제품 타깃용 확장으로만 package되고 범용 adopter 계약으로 선언되지 않음 |
| C-002 | pass | 제품 기능 구현이 `theia-extensions/product`에 있고 application에는 중복 구현 없음 |
| C-003 | pass | Inversify 모듈 로딩·binding 순서 의존성을 application 일반 override 계약으로 문서화하지 않음 |

### `spec/cocrates-branding.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | 세 manifest의 product/application name, Product UI, launcher/updater/문서 표면에 Cocrates/Cocrates Next 적용 |
| R-002 | pass | Stable `com.cocrates.ide`/`cocrates`/`.cocrates`, Next `com.cocrates.ide.next`/`cocrates-next`/`.cocrates-next` |
| R-003 | pass | Browser manifest와 favicon/resources가 Cocrates 표면을 사용하며 Electron 전용 식별자를 Browser에 추가하지 않음 |
| R-004 | pass | Stable/Next configuration folder와 Electron app ID가 분리되고 `.theia-ide` 자동 migration 없음 |
| R-005 | pass | Electron builder appId/productName/protocol 및 타깃별 resource/artifact 설정 확인 |
| R-006 | pass | launcher가 stable `cocrates`, next `cocrates-next`와 타깃별 표시명을 사용 |
| R-007 | pass | Product Welcome/About/Help/branding variant와 리소스가 타깃별 Cocrates 명칭을 사용 |
| R-008 | pass | updater UI가 application name 기반으로 표시되고 Next Linux feed가 승인된 GitHub release 경로임 |
| R-009 | pass | GitHub repository, CI, README, Docker workflow의 제품 표면과 `cocrates-ide` image tag 확인 |
| R-010 | pass | 사용자 제품 표면은 Cocrates로 바뀌었고 `@theia/*`·Theia API·upstream 도구명은 호환성 범위에서 유지 |
| R-011 | pass | 관련 source/config 정적 대조 및 가능한 build/E2E 완료; Product lint 실패는 실행 결과로 별도 기록 |
| C-001 | pass | Theia upstream API/package 계약을 브랜딩 때문에 변경하지 않음 |
| C-002 | pass | 기존 application/Product/Updater/Launcher 기능·타깃 경계 유지 |
| C-003 | pass | `.theia-ide` 자동 migration 없음 |
| C-004 | pass | 명시된 GitHub 경로 외 새 CDN/registry/publish host를 확정하지 않음 |
| C-005 | pass | Yarn/Lerna, Theia build/package, asar, `theia-patch` 흐름 유지 |
| C-006 | pass | 미실행 Browser smoke를 성공으로 처리하지 않고 이 보고서에 구분해 기록 |

### `spec/cocrates-ai-agent-skills.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | 세 application manifest가 공유 IDE/확장 계약을 사용하고 타깃별 설정을 분리 |
| R-002 | pass | Product extension의 branding, Getting Started, About, Help, AI Registry, Electron icon contribution |
| R-003 | pass | updater가 Electron 전용이며 Browser 필수 계약이 아님 |
| R-004 | pass | launcher가 AppImage/Linux/Electron 전용이며 Browser 필수 계약이 아님 |
| R-005 | pass | 이름·아이콘·scheme·folder·app ID·splash·package/extension 조합이 공식 설정 표면으로 존재 |
| R-006 | pass | 루트 Yarn/Lerna build, plugin download, Browser 실행, Electron package/preview, lint/test script 존재 |
| R-007 | pass | 정적 대조와 가능한 build/E2E를 수행; Product lint 실패는 결과에 기록 |
| R-008 | pass | Stable/Next 식별자와 folder 분리, `.theia-ide` 자동 migration 없음 |
| R-009 | pass | 사용자 표면·package/CLI/문서의 Cocrates 명칭과 내부 Theia 호환 식별자의 구분 |
| R-010 | pass | repository, Next release path, Docker image tag가 지정값을 사용 |
| R-011 | pass | `AbstractStreamParsingChatAgent`, `Agent`/`ChatAgent` 등록, default agent preference 확인 |
| R-012 | pass | Product `skills`에 사용자가 제공한 `adr`, `sdd`, `todo` root와 보조 파일 계약 존재; 이번 재검증에서 실제 skill 내용을 새로 생성하지 않음 |
| R-013 | pass | `CocratesSkillsPathService`, `SkillDirectoryContribution`, plugin tier 및 bundled/user/workspace 경로 분리 |
| R-014 | pass | 두 Electron builder의 `extraResources`가 `theia-extensions/product/skills`를 `app/skills`로 배치 |
| R-015 | pass | `agent1.md`에서 생성된 prompt source를 ChatAgent가 사용하고 runtime 원본 파일을 읽지 않음 |
| R-016 | pass | 기존 `getSkillFileContent` ID를 유지하고 Product DI rebind를 사용하며 두 번째 provider를 추가하지 않음 |
| R-017 | pass | 필수 `skillName`, 선택 `path`, 기본/`SKILL.md`/`./SKILL.md` 처리 및 qualified/plain skill 검색 경로 |
| R-018 | pass | `workflow/`, `references/`, `scripts/`, `assets/` 등 skill-root 상대 파일을 raw content로 반환하고 directory는 성공 본문으로 반환하지 않음 |
| R-019 | pass | `extended-get-skill-file-content.ts`가 기존 URI 부모 검사 뒤 `CocratesSkillsPathService.isPathWithinRealPath`를 호출하고, Node 구현이 root·target 모두 `realpath`로 해석한 뒤 `relative` 경계로 비교한다. 외부 파일을 가리키는 symbolic link 회귀 검증도 통과했다. |
| R-020 | pass | skill/file/path escape 오류를 JSON 문자열로 반환하고 directory·절대 경로·누락 파일을 성공 본문으로 반환하지 않음 |
| C-001 | pass | Theia upstream 수정 없이 Product extension rebind와 application integration으로 구현 |
| C-002 | pass | Theia/Yarn/Lerna/Node 제약과 `theia-patch` 흐름 유지 |
| C-003 | pass | Skills는 Electron `extraResources`로 asar 외부 `resources/app/skills`에 배치 |
| C-004 | pass | `@theia/*`, tool ID, `~{getSkillFileContent}` 연결 유지 |
| C-005 | pass | 이번 재검증에서 실제 `adr`/`todo`/`sdd` 본문을 임의 생성·복사하지 않음 |
| C-006 | pass | 미정 CDN/registry 및 새 Agent mode를 확정하지 않음; 기존 구현의 경로 시드 채널은 source에 명시된 환경/패키지 경로로 동작 |
| C-007 | pass | Browser/Stable/Next 및 Electron package 경로에 대해 가능한 build/test 및 정적 결과를 분리 기록 |

### `spec/cocrates-structured-final-response.md`

| Spec 항목 | 상태 | 증거 / 메모 |
|---|---|---|
| R-001 | pass | `cocrates-chat-agent-prompt.ts`의 생성 prompt에 `agent2.md` 구조화 응답 계약과 네 JSON 필드가 포함됨 |
| R-002 | pass | `response_format`/structured tool call 의존 없이 prompt-only JSON과 완료 후 parser를 사용 |
| R-003 | pass | fenced JSON/JSON object 추출·파싱, complete response 처리, partial stream에서는 side effect를 실행하지 않음 |
| R-004 | pass | Chat UI에는 `answer` Markdown만 추가하고 session/commit/compaction은 일반 본문으로 추가하지 않음 |
| R-005 | pass | malformed/non-JSON/`answer` 없는 object는 기존 Markdown parser 경로로 fallback |
| R-006 | pass | trim·empty·120자 초과를 검증한 뒤 `ChatService.renameSession`을 호출 |
| R-007 | pass | workspace 하위 repository, commit command, message, 변경 resource를 검증하고 provider command로 처리; staged 여부로 거부하지 않음 |
| R-008 | pass | StorageService에 `in-flight`/`succeeded`/`failed`를 저장하고 성공 재실행 차단·실패 재시도·promise lock을 구현 |
| R-009 | pass | 자동 rollback을 구현하지 않고 원 commit 삭제 경로도 없음 |
| R-010 | pass | 제품 전용 compaction content에 compaction과 직전 answer를 직렬화 가능한 형태로 저장 |
| R-011 | pass | 다음 요청의 prefix가 `user: <compaction>`, `assistant: <last answer>`, 이후 `user: <input>` 순서 |
| R-012 | pass | compaction content의 display string이 없고 answer만 일반 UI 본문에 표시 |
| R-013 | pass | compaction이 없으면 superclass history를 유지하고 content deserializer로 재로드 복원 |
| R-014 | pass | Agent 등록/default 선택, Skills discovery, `getSkillFileContent`, 일반 tool 및 세 target 조립 계약을 유지 |
| C-001 | pass | prompt-only parser/fallback 경로이며 response_format/structured tool call을 필수로 사용하지 않음 |
| C-002 | pass | Theia upstream ChatAgent/provider 직접 수정 없이 Product 경계에서 구현 |
| C-003 | pass | session/commit 상태가 JSON parsing과 분리되고 repository/input/resource 검증 및 persistent state 수행 |
| C-004 | pass | 제품 compaction content kind와 provider server-side marker를 분리 |
| C-005 | pass | branch/agent 전환 무효화 정책을 새로 확정하지 않음 |
| C-006 | pass | 정적 대조와 가능한 build/test를 수행하고 미실행 UI smoke를 성공으로 표시하지 않음 |

## 설계 검토 및 미문서화 ASR

### 확인된 검증 품질 이슈

- Product lint는 기존 `cocrates-chat-agent-prompt.ts:1`, `:33` 오류와 `cocrates-chat-agent.ts:236`의 `no-shadow` 오류로 계속 실패한다. 이번 수정 파일에서 새 lint 오류는 확인되지 않았다. build와 realpath 회귀 검증은 통과했지만 전체 Product lint 성공으로 기록하지 않는다.

### 미문서화 ASR

- 새로 발견한 독립적인 사용자 소유 설계 결정은 없다. symbolic-link real-path 검증은 기존 `R-019` 요구를 구현한 것이며 별도 설계 범위를 추가하지 않는다.
- commit 응답에 repository 경로가 없는 현재 계약의 한계는 기존 Spec/검증 기록에 이미 적혀 있다.

## 편차 및 권장 조치

- **Product lint 잔여 오류:** generated prompt 파일의 header/max-len 오류와 `cocrates-chat-agent.ts:236`의 shadowing은 이번 `R-019` 수정과 무관한 기존 오류다. 별도 lint 정리 작업으로 분리한다.

## 결론

`R-019`를 포함한 전체 Spec 96개 항목은 현재 구현 및 검증 기준으로 pass다. Product lint는 기존 오류 때문에 여전히 실패하지만, 이번 결함 수정의 build 및 symbolic-link realpath 회귀 검증은 통과했다. Browser UI smoke는 이번 수정 범위에서 실행하지 않았으므로 별도 성공으로 주장하지 않는다.
