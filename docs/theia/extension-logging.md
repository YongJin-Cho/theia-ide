# 확장 런타임 로깅

조사 기준: 형제 저장소 `../theia/` (`@theia/core` **1.77.0**) + 본 저장소 `applications/{browser,electron,electron-next}`의 `theia` 설정.  
관련: [rebranding.md](../rebranding.md) §3 Configuration folder, [frontend-backend.md](./frontend-backend.md).  
Upstream: [Logging Configuration](https://github.com/eclipse-theia/theia/blob/master/packages/core/README.md#logging-configuration), [#14861](https://github.com/eclipse-theia/theia/pull/14861) (`--log-file`).

**목표:** Theia/VS Code 확장에서 런타임 디버깅용 로그를 출력하고, 파일로 남기고, 디스크·UI에서 확인하는 방법을 한곳에 모은다. 리브랜딩 시 로그·설정 폴더가 어떻게 바뀌는지도 명시한다.

---

## 한눈에 보기

| 질문 | 답 |
|------|----|
| Theia 확장 기본 로그 | `ILogger` → 콘솔(stdout/stderr). frontend는 DevTools에도 표시 |
| 파일로 남기려면 | 기동 시 **`--log-file=<path>`** (기본 자동 파일 로그 없음) |
| 플러그인(VS Code API) 로그 디렉터리 | `{configDir}/logs/{YYYYMMDDTHHMMSS}/host/<extensionId>/` |
| Stable config dir | `~/.theia-ide` (`configurationFolder: ".theia-ide"`) |
| Next config dir | `~/.theia-ide-next` |
| Electron userData | `productName` 기준 (예: Linux `~/.config/Theia IDE`) — **플러그인 `logs/`와 별개** |
| UI에만 보이면 됨 | Output 채널 (`OutputChannelManager` / `createOutputChannel`) |
| 리브랜딩 시 로그 폴더 | `configurationFolder` → `~/.<새폴더>/logs/...` / `productName` → Electron userData만 변경 |

---

## 1. 로그 경로 세 갈래

혼동하기 쉬운 경로를 먼저 구분한다.

| 종류 | 누가 쓰나 | 기본 위치 (Stable Linux) | 리브랜딩 키 |
|------|-----------|--------------------------|-------------|
| **ILogger 콘솔** | Theia 확장·코어 | 터미널 / DevTools | (경로 없음) |
| **ILogger 파일** | `--log-file` 지정 시 | 사용자가 준 경로 | 무관 (절대/상대 경로) |
| **플러그인 세션 logs** | VS Code/`@theia/plugin` 확장의 `logPath`/`logUri` | `~/.theia-ide/logs/<세션>/host/` | `configurationFolder` |
| **Electron userData** | Chromium 캐시·쿠키·Crashpad 등 | `~/.config/Theia IDE` | `productName` (package.json) |

코어에는 별도 `FileLogger` 클래스가 없다. 파일 기록은 `ConsoleLoggerServer`가 `--log-file`일 때만 append한다 ([PR #14861](https://github.com/eclipse-theia/theia/pull/14861)).

---

## 2. Theia 확장에서 로그 출력 (`ILogger`)

### 2.1 권장 패턴 (named logger)

```ts
import { inject, named, injectable } from '@theia/core/shared/inversify';
import { ILogger } from '@theia/core/lib/common/logger';

@injectable()
export class MyContribution {
    @inject(ILogger) @named('my-ext:MyContribution')
    protected readonly logger: ILogger;

    async init(): Promise<void> {
        this.logger.info('Initialized');
        this.logger.debug('detail:', { foo: 1 });
        this.logger.warn('something odd');
        this.logger.error('failed', err);
    }
}
```

- 이름 규칙: `[optional-purpose]package:ClassName` (Theia coding guidelines).
- `@named(...)`가 있으면 `root.child(name)`이 자동 생성된다. 이름 없는 root logger도 동작하지만, 토픽별 레벨 조절이 어렵다.
- 레벨: `TRACE(10)` < `DEBUG(20)` < `INFO(30, 기본)` < `WARN(40)` < `ERROR(50)` < `FATAL(60)`.  
  `logLevel >= configuredLevel`일 때만 출력.

본 저장소 예 (`theia-extensions/launcher`):

```ts
@inject(ILogger)
protected readonly logger: ILogger;
```

### 2.2 Frontend vs Backend

| 레이어 | 모듈 | 동작 |
|--------|------|------|
| Backend (node) | `logger-backend-module` | `ConsoleLoggerServer` → 콘솔 (+ 선택적 `--log-file`) |
| Frontend | `logger-frontend-module` | 로컬 콘솔 출력 **후** 백엔드 RPC(`/services/logger`)로도 전달 → **양쪽 콘솔에 보일 수 있음** |
| Browser-only | `logger-frontend-only-module` | 인프로세스 콘솔만 (`--log-file` 없음) |

기동 후 `setRootLogger`가 `console.log`/`warn`/`error` 등을 `ILogger`로 리다이렉트한다. 그 시점부터 평범한 `console.log`도 INFO로 포맷된다.

포맷 예:

```text
2026-11-19T10:03:48.000Z my-ext:MyContribution INFO Initialized
```

### 2.3 Output 채널 (UI 전용)

파일·ILogger와 무관. View → Output에서 확인.

```ts
import { OutputChannelManager, OutputChannelSeverity } from '@theia/output/lib/browser/output-channel';

@inject(OutputChannelManager)
protected readonly channels: OutputChannelManager;

showStatus(): void {
    const ch = this.channels.getChannel('My Extension');
    ch.appendLine('hello', OutputChannelSeverity.Info);
    ch.show();
}
```

VS Code 플러그인:

```ts
const ch = vscode.window.createOutputChannel('My Plugin');
// 또는 레벨 있는 LogOutputChannel
const log = vscode.window.createOutputChannel('My Plugin', { log: true });
```

---

## 3. 로그를 파일로 남기는 방법

### 3.1 ILogger → `--log-file` (권장, 코어 지원)

```bash
# 개발
yarn electron start --log-file=/tmp/theia-ide.log
# 또는
yarn start:debug --log-file=./theia.log   # start:debug = --log-level=debug

# 패키징된 Electron
./TheiaIDE.AppImage --log-file=$HOME/theia-ide.log
# Windows: TheiaIDE.exe --log-file=C:\logs\theia.log
```

동작 (`ConsoleLoggerServer` + `LogLevelCliContribution`):

1. 경로를 `path.resolve`로 절대경로화.
2. 기존 파일이 있으면 `*.<ISO-ctime>.old`로 rename.
3. 새 파일을 만들고 append 스트림으로 기록.
4. **`--log-file`을 주지 않으면 디스크에 ILogger 파일이 생기지 않는다.**

셸 리다이렉트도 가능하다: `yarn electron start 2>&1 | tee theia.log`.

### 3.2 VS Code / Theia 플러그인 → `ExtensionContext.logPath`

플러그인 호스트가 세션마다 디렉터리를 만든다. **디렉터리만 만들고, 파일 내용은 플러그인이 직접 쓴다.** 코어 `ILogger`는 여기로 가지 않는다.

```ts
export function activate(context: vscode.ExtensionContext): void {
    // context.logPath / context.logUri
    // ≈ ~/.theia-ide/logs/20261119T100348/host/<publisher.extension>/
    const fs = require('fs');
    const path = require('path');
    const file = path.join(context.logPath, 'my-plugin.log');
    fs.appendFileSync(file, `${new Date().toISOString()} started\n`);
}
```

세션 폴더 형식: `{configDir}/logs/{YYYYMMDDTHHMMSS}/host/`  
보관 개수 기본 **10** (`--plugin-max-session-logs-folders`).

### 3.3 레벨·토픽 조절 CLI

| 플래그 | 역할 |
|--------|------|
| `--log-level=<fatal\|error\|warn\|info\|debug\|trace>` | 기본 레벨 (기본 `info`) |
| `--log-config=<json>` | logger별 레벨. `--log-level`과 **상호배타**. 파일 변경 시 런타임 반영 |
| `--log-file=<path>` | ILogger 파일 append |
| `--plugin-max-session-logs-folders=<n>` | 플러그인 세션 logs 보관 수 |
| `--electronUserData=<dir>` | Electron userData 오버라이드 |

`--log-config` 예:

```json
{
  "defaultLevel": "info",
  "levels": {
    "my-ext*": "debug",
    "terminal*": "warn"
  }
}
```

와일드카드: exact match 우선, 여러 와일드카드가 맞으면 **마지막** 규칙 승.

본 저장소 디버그 편의:

- `applications/electron/package.json` → `"start:debug": "yarn start --log-level=debug"`
- `.vscode/launch.json` → Electron/Browser 구성에 `--log-level=debug`

환경변수:

| 변수 | 효과 |
|------|------|
| `THEIA_CONFIG_DIR` | config + `logs/` 루트 전체 오버라이드 |
| `THEIA_LOG_LEVEL` | **코어 ILogger는 읽지 않음** (일부 AI MCP 문서에만 등장) |

---

## 4. 로그 파일·콘솔 확인 방법

### 4.1 콘솔 / DevTools

| 환경 | 어디서 보나 |
|------|-------------|
| `yarn electron start` / `yarn browser start` | 기동한 터미널 stdout/stderr |
| VS Code/Cursor 디버그 실행 | Debug Console (`outputCapture: "std"`) |
| Electron UI | Command Palette → **Toggle Developer Tools** (`theia.toggleDevTools`) → Console |
| Browser | 브라우저 DevTools Console |

### 4.2 Output 뷰

View → Output → 채널 드롭다운에서 확장/코어 채널 선택.

### 4.3 디스크

```bash
# 플러그인 세션 로그 디렉터리 (Stable)
ls ~/.theia-ide/logs/
ls ~/.theia-ide/logs/<최신세션>/host/

# Next
ls ~/.theia-ide-next/logs/

# ILogger 파일 (--log-file로 지정한 경로만)
tail -f /tmp/theia-ide.log

# Electron userData (캐시 등 — ILogger/플러그인 logs 아님)
ls ~/.config/"Theia IDE"/
ls ~/.config/"Theia IDE Next"/
```

OS별 config + plugin logs (홈 기준, `configurationFolder` 기본값):

| OS | Stable | Next |
|----|--------|------|
| Linux / macOS | `~/.theia-ide/logs/...` | `~/.theia-ide-next/logs/...` |
| Windows | `%USERPROFILE%\.theia-ide\logs\...` | `%USERPROFILE%\.theia-ide-next\logs\...` |

Electron userData (`productName` 기준):

| OS | Stable (`Theia IDE`) | Next (`Theia IDE Next`) |
|----|----------------------|-------------------------|
| Linux | `~/.config/Theia IDE` | `~/.config/Theia IDE Next` |
| macOS | `~/Library/Application Support/Theia IDE` | `.../Theia IDE Next` |
| Windows | `%APPDATA%\Theia IDE` | `%APPDATA%\Theia IDE Next` |

Portable 모드: 앱 경로에 `data/`가 있으면 config는 `{app}/data/user-data`, Electron userData는 `{app}/data/app-data`.

이 머신에서 확인된 예:

```text
~/.theia-ide/logs/20261119T100348/host/
~/.config/Theia IDE Next/
```

---

## 5. 리브랜딩 시 로그·설정 폴더

[rebranding.md](../rebranding.md)의 키와 로그의의 대응:

| 키 | Stable 현재 | 바꾸면 |
|----|-------------|--------|
| `theia.backend.config.configurationFolder` | `.theia-ide` | 플러그인 `logs/`·preferences·skills 등이 `~/.<새값>/` 아래로 이동 |
| `productName` (`applications/*/package.json`) | `Theia IDE` | Electron **userData**만 변경 (Linux: `~/.config/<새 productName>`) |
| `productName` (`electron-builder.yml`) | `TheiaIDE` | 설치 아티팩트명 — 로그 경로와 무관 |
| `applicationName` | `Theia IDE` | 창 제목 등 — 로그 경로와 무관 |
| `THEIA_CONFIG_DIR` | (옵션) | config+`logs/` 전부 이 경로로 고정 |

### 5.1 예시: My Product

| 설정 | 값 | 결과 경로 (Linux) |
|------|-----|-------------------|
| `configurationFolder` | `.my-product` | `~/.my-product/logs/<세션>/host/` |
| `productName` (package.json) | `My Product` | `~/.config/My Product` (userData) |
| `--log-file` | `/var/log/my-product.log` | 그대로 (리브랜딩 무관) |

### 5.2 같이 고쳐야 하는 하드코딩

`applications/electron/scripts/theia-electron-main.js` (AppImage built-in plugins 복사):

```js
const configDir = process.env.THEIA_CONFIG_DIR || path.join(os.homedir(), '.theia-ide');
```

`configurationFolder`만 `.my-product`로 바꾸고 이 fallback을 두면 **preferences/`logs`와 AppImage 플러그인 경로가 어긋난다.** Next는 `theia-electron-main.js`의 `.theia-ide-next`도 동일.

### 5.3 Config dir 결정 우선순위

`EnvVariablesServerImpl.createConfigDirUri()`:

1. `THEIA_CONFIG_DIR` 환경변수  
2. 앱에 `data/` 폴더가 있으면 → `{app}/data/user-data` (portable)  
3. 아니면 → `{homedir}/{configurationFolder}`

---

## 6. 실무 체크리스트

1. **Theia 확장 디버그** → `@inject(ILogger) @named('pkg:Class')` + `--log-level=debug` (터미널/DevTools).
2. **영속 ILogger 파일** → 반드시 `--log-file=/abs/or/rel/path.log`.
3. **VS Code 플러그인 파일** → `context.logPath` ≈ `~/.theia-ide/logs/<세션>/host/<id>/`.
4. **사용자에게 보이는 메시지** → Output 채널.
5. **리브랜딩 후 플러그인 logs** → `configurationFolder` (+ `THEIA_CONFIG_DIR`, AppImage 하드코딩) 확인.
6. **Electron 캐시/크래시** → `productName` userData. 플러그인 `logs/`와 혼동하지 말 것.

---

## 7. 관련 소스

| 주제 | 경로 (`../theia/` 기준, IDE는 본 저장소) |
|------|------------------------------------------|
| `ILogger` / `setRootLogger` | `packages/core/src/common/logger.ts` |
| `LogLevel` / `ConsoleLogger` | `packages/core/src/common/logger-protocol.ts` |
| 파일 append | `packages/core/src/node/console-logger-server.ts` |
| CLI (`--log-level`, `--log-file`, …) | `packages/core/src/node/logger-cli-contribution.ts` |
| Config dir | `packages/core/src/node/env-variables/env-variables-server.ts` |
| 플러그인 logs dir | `packages/plugin-ext/src/main/node/paths/plugin-paths-service.ts` |
| `ExtensionContext.logPath` | `packages/plugin-ext/src/plugin/plugin-manager.ts` |
| Logging docs | `packages/core/README.md` § Logging Configuration |
| IDE `configurationFolder` | `applications/{electron,electron-next,browser}/package.json` |
| CLI help | `applications/electron/scripts/cli-usage.js` |
| AppImage configDir 하드코딩 | `applications/electron/scripts/theia-electron-main.js` |
| 리브랜딩 | `docs/rebranding.md` |
