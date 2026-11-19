# Theia IDE 리브랜딩 가이드

이 저장소(Eclipse Theia IDE)를 템플릿으로 사용해 **다른 제품명**의 데스크톱/브라우저 IDE를 만들 때, 바꿔야 하는 설정과 코드 위치를 정리한 문서입니다.

`ADOPTER.md`는 asar 패키징만 다루며, 제품명·아이콘·uriScheme 리브랜딩 절차는 없습니다. 본 문서가 그 역할을 합니다.

> **상표 주의:** "Theia"는 Eclipse Foundation 상표입니다. 배포 제품에서 Theia 브랜드를 그대로 쓰는 것은 피하고, 자체 제품명으로 교체하세요.

---

## 1. 이름 체계 한눈에 보기

리브랜딩은 한 곳이 아니라 **여러 층**에 나뉩니다. 혼동하기 쉬운 키를 먼저 구분합니다.

| 키 | 위치 | Stable 현재값 | 역할 |
|----|------|---------------|------|
| `name` | `applications/*/package.json` | `theia-ide-electron-app` | npm/lerna scope, **Linux 실행 파일명** |
| `productName` | app `package.json` | `Theia IDE` | CLI help, Electron userData 경로 계열 |
| `productName` | `electron-builder.yml` | `TheiaIDE` | 아티팩트명 (`TheiaIDE.AppImage`, `TheiaIDESetup.exe` 등) |
| `applicationName` | `theia.frontend.config` | `Theia IDE` | 창 제목, launcher/desktop `Name=` |
| `appId` | `electron-builder.yml` | `eclipse.theia` | OS 앱 식별자 (설치/업데이트/공증) |
| `appUserModelId` | `theia.frontend.config.electron` | `eclipse.theia` | Windows 작업 표시줄/알림 식별 |
| `uriScheme` | `theia.frontend.config.electron` | `theia` (미지정 시 기본값) | 딥링크·CLI 명령명 (`/usr/local/bin/theia`) |
| `configurationFolder` | `theia.backend.config` | `.theia-ide` | `~/` 아래 preferences 등 설정 디렉터리 |

예시로 **My Product** 로 바꿀 때의 권장 매핑:

| 키 | 새 값 예시 |
|----|------------|
| `name` | `my-product-electron-app` |
| `productName` (package.json) | `My Product` |
| `productName` (electron-builder) | `MyProduct` |
| `applicationName` | `My Product` |
| `appId` / `appUserModelId` | `com.example.myproduct` |
| `uriScheme` | `myproduct` |
| `configurationFolder` | `.my-product` |

---

## 2. 앱 설정 (`package.json` → FrontendApplicationConfig)

`theia build`가 `applications/*/package.json`의 `theia` 블록을 읽어 `src-gen`에 주입합니다. **설정 변경 후 반드시 rebuild**하세요.

### 2.1 Electron (Stable) — `applications/electron/package.json`

현재 핵심 설정:

```json
{
  "name": "theia-ide-electron-app",
  "productName": "Theia IDE",
  "theia": {
    "frontend": {
      "config": {
        "applicationName": "Theia IDE",
        "electron": {
          "appUserModelId": "eclipse.theia",
          "splashScreenOptions": {
            "content": "resources/TheiaIDESplash.svg",
            "height": 276,
            "width": 446
          }
        }
      }
    },
    "backend": {
      "config": {
        "configurationFolder": ".theia-ide"
      }
    }
  }
}
```

Stable에는 `uriScheme`이 **명시되어 있지 않습니다.** Theia 기본값 `theia`가 사용됩니다. 리브랜딩 시 반드시 명시하세요.

변경 예시:

```json
{
  "name": "my-product-electron-app",
  "productName": "My Product",
  "description": "My Product IDE",
  "theia": {
    "frontend": {
      "config": {
        "applicationName": "My Product",
        "electron": {
          "uriScheme": "myproduct",
          "appUserModelId": "com.example.myproduct",
          "splashScreenOptions": {
            "content": "resources/MyProductSplash.svg",
            "height": 276,
            "width": 446
          }
        }
      }
    },
    "backend": {
      "config": {
        "configurationFolder": ".my-product"
      }
    }
  }
}
```

### 2.2 Electron (Next) — `applications/electron-next/package.json`

Next 채널용 별도 앱입니다. Stable과 충돌하지 않도록 이미 다른 식별자를 씁니다.

| 항목 | 값 |
|------|-----|
| `applicationName` | `Theia IDE Next` |
| `brandingVariant` | `next` |
| `uriScheme` | `theia-next` |
| `appUserModelId` | `eclipse.theia.next` |
| `configurationFolder` | `.theia-ide-next` |

커스텀 제품이 Next 채널을 쓰지 않으면 이 앱을 무시하거나 제거하고, Stable만 리브랜딩해도 됩니다.

### 2.3 Browser — `applications/browser/package.json`

브라우저/Docker 타깃도 `applicationName`, `configurationFolder`, `productName`, `name`을 동일하게 맞춥니다. Favicon은 `applications/browser/ico/favicon.ico`입니다.

### 2.4 루트 `package.json`의 lerna scope

루트 스크립트가 `--scope="theia-ide*app"` / `theia-ide*ext`에 의존합니다. 앱/확장 `name`을 바꾸면 루트 scripts도 함께 수정해야 합니다.

```json
"build:applications": "lerna run --scope=\"theia-ide*app\" --ignore=\"theia-ide-next*\" build:prod --concurrency 1"
```

---

## 3. Configuration folder (설정 디렉터리)

### 동작

- Backend `configurationFolder` → 사용자 홈의 `~/.theia-ide` (preferences, workspace trust, launcher storage, **플러그인 `logs/`** 등)
- 환경변수 `THEIA_CONFIG_DIR`로 오버라이드 가능
- Electron **userData**(캐시/세션)는 별도이며, Linux에서는 대략 `~/.config/${productName}` (`Theia IDE`)
- 확장 로깅·`--log-file`·리브랜딩 후 로그 경로 상세: [docs/theia/extension-logging.md](./theia/extension-logging.md)

### 반드시 같이 바꿀 하드코딩

`applications/electron/scripts/theia-electron-main.js` (AppImage 플러그인 복사 경로):

```js
const configDir = process.env.THEIA_CONFIG_DIR || path.join(os.homedir(), '.theia-ide');
```

`configurationFolder`만 바꾸고 이 fallback을 그대로 두면 AppImage 플러그인 경로와 preferences 경로가 어긋납니다. Next 앱은 `applications/electron-next/scripts/theia-electron-main.js`의 `.theia-ide-next`도 동일하게 처리합니다.

Launcher 상태 저장 경로 세그먼트:

```ts
// theia-extensions/launcher/src/node/launcher-util.ts
globalStorage/theia-ide-launcher/
```

선택적으로 `my-product-launcher` 등으로 바꿀 수 있습니다.

---

## 4. electron-builder: `appId`, `productName`, 프로토콜, 아이콘

파일: `applications/electron/electron-builder.yml`

```yaml
appId: eclipse.theia
productName: TheiaIDE
copyright: Copyright © 2020-2026 Eclipse Foundation, Inc
# ...
win:
  icon: resources/icons/WindowsLauncherIcons/TheiaIDE.ico
mac:
  icon: resources/icons/MacLauncherIcons/icon.icns
  protocols:
    - name: theia
      schemes:
        - theia
linux:
  icon: resources/icons/LinuxLauncherIcons
  vendor: Eclipse Foundation, Inc
```

변경 시:

```yaml
appId: com.example.myproduct
productName: MyProduct
copyright: Copyright © 2026 Example, Inc
win:
  icon: resources/icons/WindowsLauncherIcons/MyProduct.ico
mac:
  protocols:
    - name: myproduct
      schemes:
        - myproduct
linux:
  vendor: Example, Inc
```

`artifactName`은 `${productName}`을 쓰므로 `productName`만 바꿔도 `MyProduct.AppImage`, `MyProductSetup.exe` 등으로 바뀝니다.

### `appId`와 맞춰야 하는 하드코딩

| 파일 | 내용 |
|------|------|
| `applications/electron/package.json` → `appUserModelId` | `eclipse.theia` |
| `applications/electron/scripts/sign-directory.ts` | notarize bundle id `'eclipse.theia'` |
| `after-pack.js` | 공증 시 builder의 `appId` 사용 (yml만 맞춰도 됨) |

`appId` ≠ `appUserModelId`이면 Windows에서 앱 식별이 꼬일 수 있으므로 **동일 값**을 권장합니다.

---

## 5. uriScheme

### 제어 범위

- 딥링크: `theia://...` → `myproduct://...`
- AppImage CLI: `/usr/local/bin/${uriScheme}`
- Linux `.desktop` MIME: `x-scheme-handler/${uriScheme}`
- macOS `electron-builder.yml` → `mac.protocols`

### 설정

```json
"electron": {
  "uriScheme": "myproduct"
}
```

```yaml
mac:
  protocols:
    - name: myproduct
      schemes: [myproduct]
```

### 하드코딩 분기 (필수 수정)

```ts
// theia-extensions/launcher/src/node/launcher-endpoint.ts
const sudoPromptName = uriScheme === 'theia-next' ? 'Theia IDE Next' : 'Theia IDE';
```

uriScheme/`applicationName` 기반으로 바꾸거나, 커스텀 제품명으로 고정하세요.

---

## 6. Welcome / About / Help UI (제품 브랜딩 확장)

경로: `theia-extensions/product/`

| 파일 | 역할 |
|------|------|
| `src/browser/branding-util.tsx` | Welcome/About 공통 제목·본문 (대부분 **"Eclipse Theia IDE" 하드코딩**) |
| `src/browser/theia-ide-getting-started-widget.tsx` | Welcome 페이지 |
| `src/browser/theia-ide-about-dialog.tsx` | About 다이얼로그 |
| `src/browser/theia-ide-contribution.tsx` | Help → Report Issue / Documentation URL |
| `src/browser/style/index.css` | 로고·아이콘 CSS 변수 |
| `src/browser/icons/` | UI 워드마크·아이콘 |
| `src/browser/theia-ide-config.ts` | `brandingVariant` (`stable` / `next`) |

### 제품명 제목

```tsx
// branding-util.tsx
return <h1>Eclipse Theia <span className="tide-branding-accent">IDE</span>{suffix}</h1>;
```

`applicationName`을 바꿔도 **이 하드코딩은 그대로**입니다. Welcome/About이 “Eclipse Theia IDE”로 남습니다. 반드시 `branding-util.tsx`와 본문 카피·링크를 교체하세요.

가능하면 `FrontendApplicationConfigProvider.get().applicationName`을 쓰도록 리팩터링하면 설정과 UI가 일치합니다.

### 로고 / 액센트 컬러

```css
:root {
    --theia-branding-logo: url(../icons/TheiaIDE.png);
    --theia-branding-icon: url(../icons/512-512.png);
    --theia-branding-accent: #5088e7;
}
```

아이콘 파일을 교체하고 CSS 경로·색을 맞춥니다. Next 변형은 `body[data-theia-branding="next"]` 블록을 사용합니다.

### Help URL

`theia-ide-contribution.tsx`:

- `REPORT_ISSUE_URL` → 자체 이슈 트래커
- `DOCUMENTATION_URL` → 자체 문서

---

## 7. 패키징 아이콘·스플래시·이미지 이름

### Electron 리소스 (`applications/electron/resources/`)

| 용도 | 현재 경로 |
|------|-----------|
| Windows `.ico` | `icons/WindowsLauncherIcons/TheiaIDE.ico` |
| macOS `.icns` | `icons/MacLauncherIcons/icon.icns` |
| Linux PNG | `icons/LinuxLauncherIcons/` |
| 창 아이콘 | `icons/WindowIcon/512-512.png` |
| Splash | `TheiaIDESplash.svg` |
| NSIS 사이드바 | `icons/InstallerSidebarImage/164-314Windows.bmp` |

파일명을 바꾸면 `electron-builder.yml`의 `files` / `icon` / splash `content` 경로를 **함께** 수정합니다.

소스 아트는 저장소 루트 `TheiaIDE logo/`에도 있습니다.

### Product UI 아이콘

`theia-extensions/product/src/browser/icons/` — `TheiaIDE.png`, `512-512.png` 등.

### Docker / 이미지 태그

| 위치 | 현재 이름 |
|------|-----------|
| README / 로컬 빌드 | `docker build -t theia-ide -f browser.Dockerfile .` |
| `.github/workflows/publish-theia-ide-img.yml` | `ghcr.io/.../theia-ide` |
| `browser.Dockerfile` | 컨테이너 사용자/경로에 `theia` 문자열 포함 가능 |

제품 Docker 이미지 태그를 `my-product` 등으로 바꿉니다. 빌더 이미지(`Dockerfile`, `eclipsetheia/theia-blueprint:builder`)는 빌드 도구용이라 제품명과 무관합니다.

---

## 8. Launcher (CLI · .desktop)

확장: `theia-extensions/launcher/`

AppImage 실행 시:

1. CLI 설치 제안 → `/usr/local/bin/${uriScheme}`
2. `.desktop` 생성: `Name=${applicationName}`, 파일명 `{appId}-launcher.desktop`  
   - 여기서 `appId`는 `applicationName.toLowerCase().replace(/\s+/g, '-')`  
   - 예: `Theia IDE` → `theia-ide`
3. URL handler: `MimeType=x-scheme-handler/${uriScheme}`

추가 하드코딩:

| 위치 | 현재값 |
|------|--------|
| `create-launcher-contribution.ts` command id | `theia-ide.launcher.create` |
| command category | `Theia IDE` |
| `launcher-endpoint.ts` sudo 이름 | `Theia IDE` / `Theia IDE Next` |

`uriScheme`과 `applicationName`만 맞춰도 사용자에게 보이는 CLI·메뉴명은 대부분 바뀝니다. command id/category는 선택 사항입니다.

---

## 9. Updater · AI registry · 기타 문자열

| 파일 | 내용 |
|------|------|
| `theia-extensions/updater/.../theia-updater-frontend-contribution.ts` | UI 텍스트 `'Theia IDE Update'` |
| `theia-extensions/updater/.../theia-updater-impl.ts` | Next 채널 다운로드 URL (자체 배포 시 변경) |
| `theia-extensions/product/.../theia-ide-ai-registry-configuration.ts` | tool name `theia-ide` / `theia-ide-next` |
| `applications/electron/scripts/update-checksum.ts` | 기본값 `TheiaIDE.AppImage` |
| `applications/electron/scripts/update-blockmap.ts` | 기본값 `TheiaIDE.exe` |
| `applications/electron/scripts/cli-usage.js` | `productName` 기반 (설정만으로 반영) |

전자 업데이트(publish URL)는 `electron-builder.yml`의 `publish.url`을 자체 CDN/릴리스 서버로 바꿉니다.

---

## 10. BrandingVariant (stable / next)

`theia-ide-config.ts`:

```ts
export type BrandingVariant = 'stable' | 'next';
```

- `brandingVariant: "next"` → `data-theia-branding="next"` → Next 전용 로고/색
- Welcome 제목에 ` Next` 접미사

단일 제품만 배포한다면 `stable`만 쓰고 next 분기·아이콘을 제거하는 편이 단순합니다. 자체 채널이 필요하면 타입과 CSS 셀렉터를 확장하세요.

---

## 11. CI / 워크플로 아티팩트명

`.github/workflows/`에 아티팩트·이미지명이 하드코딩되어 있습니다.

- `build.yml` — `TheiaIDE` 경로 필터 등
- `build-next.yml` / `build-next-release.yml` — `TheiaIDE*.AppImage`, `theia-ide-next-*`
- `publish-theia-ide-img.yml` — `theia-ide` 이미지 태그

자체 CI를 유지한다면 `productName` / 이미지명에 맞게 일괄 수정합니다.

---

## 12. OS별 식별자 요약

| OS | 식별자 | Stable 현재값 | 비고 |
|----|--------|---------------|------|
| 공통 | `appId` | `eclipse.theia` | electron-builder |
| Windows | `appUserModelId` | `eclipse.theia` | package.json |
| Windows | exe / setup | `TheiaIDE.exe`, `TheiaIDESetup.exe` | builder `productName` |
| macOS | protocol | `theia` | builder + uriScheme |
| macOS | notarize id | `eclipse.theia` | `sign-directory.ts` |
| Linux | executable | `theia-ide-electron-app` | package.json `name` |
| Linux | artifacts | `TheiaIDE.AppImage`, `.deb` | builder `productName` |
| Linux | desktop id | `theia-ide` | `applicationName`에서 유도 |
| Linux | vendor | `Eclipse Foundation, Inc` | builder |

---

## 13. 전체 체크리스트

### A. 필수 (제품이 새 이름으로 보이게)

- [ ] `applications/electron/package.json` — `name`, `productName`, `description`, `applicationName`, `appUserModelId`, `configurationFolder`, **명시적** `uriScheme`, splash 경로
- [ ] `applications/electron/electron-builder.yml` — `appId`, `productName`, icons, splash `files`, `protocols`, `vendor`/`copyright`, publish URL
- [ ] `applications/browser/package.json` (+ favicon)
- [ ] (필요 시) `applications/electron-next/*` 동일 세트 또는 next 제거
- [ ] `theia-extensions/product` — `branding-util.tsx` 제목/카피, CSS, `icons/`, Help URL
- [ ] `applications/electron/scripts/theia-electron-main.js` — `~/.theia-ide` fallback
- [ ] `applications/electron/resources/` — splash·Win/Mac/Linux 아이콘 (+ yml 경로)
- [ ] rebuild 후 `src-gen`에 새 설정 반영 확인

### B. Launcher / Updater

- [ ] `launcher-endpoint.ts` — sudo 이름 분기
- [ ] (선택) launcher command id/category, storage 폴더명
- [ ] updater UI 문자열·publish URL
- [ ] AI registry tool name

### C. 패키징 / 서명 / CI

- [ ] `sign-directory.ts` — bundle id
- [ ] `update-checksum.ts` / `update-blockmap.ts` 기본 파일명
- [ ] `.github/workflows/*` 아티팩트·이미지명
- [ ] Docker 태그 / `publish-theia-ide-img.yml`
- [ ] 루트 `package.json` lerna `--scope` (package `name` 변경 시)

### D. 문서·메타데이터

- [ ] README 제품 설명·상표 문구
- [ ] `author` / `homepage` / `repository` / `copyright` / `vendor`

### E. 검증

- [ ] Welcome / About 문구·로고
- [ ] 창 제목 = `applicationName`
- [ ] `~/.my-product` 등 preferences 디렉터리 생성
- [ ] AppImage: `/usr/local/bin/<uriScheme>`, `.desktop` Name
- [ ] Windows 설치·시작 메뉴, macOS 프로토콜, Linux 아티팩트 파일명
- [ ] Docker 실행 후 브라우저 타이틀·파비콘

---

## 14. 최소 변경 세트 (복붙용)

아래만 맞춰도 “설정·패키징·CLI” 축은 새 이름이 됩니다. **Welcome/About은 `branding-util.tsx`를 반드시 함께** 수정하세요.

```json
// applications/electron/package.json (발췌)
{
  "name": "my-product-electron-app",
  "productName": "My Product",
  "theia": {
    "frontend": {
      "config": {
        "applicationName": "My Product",
        "electron": {
          "uriScheme": "myproduct",
          "appUserModelId": "com.example.myproduct",
          "splashScreenOptions": {
            "content": "resources/MyProductSplash.svg",
            "height": 276,
            "width": 446
          }
        }
      }
    },
    "backend": {
      "config": {
        "configurationFolder": ".my-product"
      }
    }
  }
}
```

```yaml
# applications/electron/electron-builder.yml (발췌)
appId: com.example.myproduct
productName: MyProduct
mac:
  protocols:
    - name: myproduct
      schemes: [myproduct]
```

```js
// applications/electron/scripts/theia-electron-main.js
const configDir = process.env.THEIA_CONFIG_DIR || path.join(os.homedir(), '.my-product');
```

```tsx
// theia-extensions/product/src/browser/branding-util.tsx
return <h1>My <span className="tide-branding-accent">Product</span></h1>;
// + 본문 카피·다운로드/문서 링크도 제품에 맞게 교체
```

---

## 관련 문서

- [Adopter Guide](../ADOPTER.md) — asar 패키징
- [Developing with Local Theia](./developing-with-local-theia.md)
- [Packaging Theia as a Desktop Product](https://theia-ide.org/docs/blueprint_documentation/) (업스트림)
- [Composing Applications](https://theia-ide.org/docs/composing_applications/) (업스트림)
