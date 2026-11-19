# Theia Frontend / Backend 구조

조사 기준: 형제 저장소 `../theia/` (`@theia/core` **1.77.0**) + 본 저장소 `applications/{browser,electron,electron-next}`의 `theia` 설정. 공식 개요는 [Architecture Overview](https://theia-ide.org/docs/architecture/), RPC는 [Communication via RPC](https://theia-ide.org/docs/json_rpc/).

**목표:** frontend와 backend가 어떻게 나뉘고 통신하는지, 그리고 **frontend를 닫아도 backend 프로세스가 남는 이유**를 한곳에 모은다.

---

## 한눈에 보기

| 질문 | 답 |
|------|----|
| 왜 둘로 나뉘나 | 브라우저·원격 서버와 Electron 데스크톱을 **같은 소스**로 지원하기 위해 UI(frontend)와 Node 서비스(backend)를 분리 |
| Frontend | DOM UI. 브라우저 탭 또는 Electron `BrowserWindow`(renderer). `FrontendApplication.start()` |
| Backend | Node.js + Express HTTP 서버. 정적 frontend 번들 서빙 + WebSocket/RPC. `BackendApplication.start(port)` |
| 통신 | 주로 **하나의 WebSocket** 위에 JSON-RPC 채널 멀티플렉싱. REST/HTTP도 사용 |
| DI | frontend·backend 각각 독립 Inversify 컨테이너. 확장은 `browser` / `node` 모듈을 따로 기여 |
| Frontend 종료 ≠ Backend 종료 | WebSocket이 끊겨도 **backend 프로세스는 기본적으로 계속 살아 있음**. 정리되는 것은 (타임아웃 후) **연결 컨텍스트**뿐 |
| 1 backend : N frontend | **예.** 같은 backend 프로세스에 frontend id별 connection context가 여러 개 붙음 (Electron 다중 창, browser 다중 탭) |
| Browser | `frontendConnectionTimeout: 3000` — 끊긴 뒤 3초간 컨텍스트 보존 후 폐기. 프로세스는 유지 |
| Electron | **창 하나만 닫음** → backend **유지**. **마지막 창까지 닫음**(`window-all-closed`) → `app.quit()` → fork된 backend kill. `frontendConnectionTimeout: -1`은 연결 컨텍스트용 |
| 1.77에서 바뀐 점 | **프로세스·RPC·연결 타임아웃 모델은 1.76과 동일.** 달라진 것은 (1) runtime 패키지·`lib/backend`가 **ESM**, (2) `FrontendApplication`의 `ready`가 preload fade-out **완료를 기다리지 않음**, (3) secondary window UX 강화(별도 frontend id는 아님) |

---

## 1. 프로세스 모델

```text
┌─────────────────────────────────────────────────────────────┐
│ Browser 타깃 (`yarn browser start`)                         │
│                                                             │
│  Node 프로세스 = BackendApplication (Express :3000 기본)    │
│       │  serves static frontend + /services WebSocket       │
│       ▼                                                     │
│  브라우저 탭(들) = FrontendApplication (0..N 클라이언트)     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Electron 타깃 (`yarn electron start`)                       │
│                                                             │
│  electron-main  (ElectronMainApplication)                   │
│       │ fork (기본) 또는 --no-cluster 시 동일 프로세스       │
│       ▼                                                     │
│  BackendApplication  (localhost 임의 포트)                  │
│       ▲ WebSocket                                           │
│       │                                                     │
│  BrowserWindow renderer = FrontendApplication               │
│  (+ 창마다 별도 frontend id / 연결 컨텍스트)                 │
└─────────────────────────────────────────────────────────────┘
```

핵심 소스 (`../theia/packages/core`):

| 역할 | 경로 |
|------|------|
| Backend 수명주기 | `src/node/backend-application.ts` |
| Frontend 수명주기 | `src/browser/frontend-application.ts` |
| Electron main·backend fork | `src/electron-main/electron-main-application.ts` |
| WS 연결·재연결·타임아웃 | `src/node/messaging/websocket-frontend-connection-service.ts` |
| Frontend WS 협상 | `src/browser/messaging/ws-connection-source.ts` |
| 연결 관리 메시지 / markForClose | `src/common/messaging/connection-management.ts` |
| 채널 멀티플렉싱 | `src/node/messaging/default-messaging-service.ts` |
| Backend 설정 기본값 | `dev-packages/application-package/src/application-props.ts` |

공식 문서 요지: Electron에서는 frontend·backend가 **둘 다 로컬**이고, 원격/브라우저 배포에서는 backend가 **원격 호스트**에 있을 수 있다. 소스는 동일하게 `common` + 플랫폼 폴더로 나뉜다.

---

## 2. 플랫폼 폴더 (확장 코드 배치)

| 폴더 | 가정하는 런타임 |
|------|----------------|
| `common/` | 플랫폼 무관 (프로토콜, 공유 타입) |
| `browser/` | DOM API (frontend) |
| `electron-browser/` | DOM + Electron renderer API |
| `node/` | Node.js (backend) |
| `electron-main/` | Electron main process |
| `node-electron/` 등 | Electron 전용 backend 변형 |

Frontend 코드는 **Node API를 가정하면 안 되고**, backend 코드는 **DOM을 가정하면 안 된다**. 제품 확장은 이 규칙을 그대로 따른다 (`theia-extensions/*/src/{browser,node,electron-main,…}`).

---

## 3. 기동 순서

### Backend

1. 기여된 backend DI 모듈 로드  
2. `BackendApplication` 획득  
3. contribution: `initialize` → Express `configure` → HTTP `listen` → `onStart(server)`  
4. 기본 포트: Electron이면 `0`(OS 할당), 아니면 `3000` (`localhost`)  
5. Express가 frontend 정적 자산을 함께 서빙하는 것이 기본 레이아웃  

종료: `SIGINT`/`SIGTERM` → `gracefulShutdown()`(contribution `onStop` + 컨테이너 unbind) → `process.exit`. `process.on('exit')`는 동기 fallback 정리용.

### Frontend

1. 기여된 frontend DI 모듈 로드  
2. `FrontendApplication.start()`  
   - contribution 시작 → shell attach → layout 복원 → `revealShell`(preload fade-out **시작**) → `ready`  
3. 이와 병행해 `WebSocketConnectionSource`가 `/services` WebSocket을 열고 `INITIAL_CONNECT`로 frontend id를 알림  

**1.77:** `ready`는 `.theia-preload` fade-out이 **끝난 뒤가 아니라 시작과 함께** 도달한다 (`revealShell` → 배경에서 `removeStartupIndicator`). splash/플러그인 뷰 등 `ready`를 기다리는 코드는 인디케이터가 아직 사라져 가는 동안 실행된다. fade-out 기본 길이도 0.8 s → 0.15 s. `.theia-preload`가 사라진 뒤에만 동작해야 하면 `MutationObserver` 등으로 제거를 기다리거나 `revealShell`을 오버라이드한다 ([Migration.md](https://github.com/eclipse-theia/theia/blob/v1.77.0/doc/Migration.md)).

### Electron

1. `scripts/theia-electron-main.js` → 생성물 `lib/backend/electron-main.js`  
2. `ElectronMainApplication`: 이벤트 훅 → (선택) early window → **`startBackend()`**  
3. 기본은 `child_process.fork(THEIA_BACKEND_MAIN_PATH)` — 백엔드가 포트를 IPC로 알림  
4. `app.whenReady` → security token 쿠키 → contributions → 창 로드(`?port=…`)  
5. Renderer가 해당 포트의 backend에 WebSocket 연결  

`--no-cluster`면 backend를 fork하지 않고 같은 프로세스에서 `dynamicRequire`한다.

**1.77 패키징:** `lib/backend`는 `"type": "module"`인 ESM 번들이다. Electron preload·frontend 번들은 여전히 classic script. ASAR 패키지에서 셸 통합·ripgrep 등 외부 프로세스가 읽어야 하는 파일은 `BundledResourceProvider`가 config dir로 추출한다.

---

## 4. 통신 (JSON-RPC over WebSocket)

```text
Frontend                         Backend
   │                                │
   │  Socket.IO WebSocket           │
   │  path ≈ /services              │
   │ ─────────────────────────────► │  WebsocketFrontendConnectionService
   │  INITIAL_CONNECT(frontendId)   │    → ReconnectableSocketChannel
   │ ◄───────────────────────────── │
   │                                │  ChannelMultiplexer
   │  sub-channel /services/foo     │    → RpcConnectionHandler(path)
   │  sub-channel /services/bar     │
   │ ◄──── JSON-RPC ───────────────►│
```

- 확장: backend에 `RpcConnectionHandler`(+ `ConnectionHandler` contribution), frontend에 `WebSocketConnectionProvider.createProxy(path, …)`.  
- **하나의 물리 WebSocket**에 여러 서비스 path가 멀티플렉스된다.  
- Frontend id: browser는 `BrowserFrontendIdProvider`가 페이지 로드마다 UUID 생성. Electron renderer는 `ElectronFrontendIdProvider`가 `webcontentId`를 쓴다. 재연결 시 같은 id로 `RECONNECT`를 보낸다.  
- 재연결 실패 시 browser는 `reloadOnReconnect: true`라 UI를 새로고침한다.

상세 패턴 예시는 공식 [JSON-RPC 문서](https://theia-ide.org/docs/json_rpc/)(Task 서버 예제)를 본다.

---

## 5. Frontend를 닫아도 Backend가 남는 이유

### 5.1 설계 의도

Backend는 **장기 실행 HTTP/WebSocket 서버**다.

- Browser/클라우드: 탭을 닫거나 새로고침해도 같은 Node 서버가 다른(또는 다음) 클라이언트를 받을 수 있어야 한다.  
- “마지막 클라이언트가 사라지면 프로세스 종료” 같은 기본 정책은 **없다**.  
- 끊김 시 정리 대상은 **그 frontend id의 connection context**(채널·연결 스코프 DI)이지, `BackendApplication` 프로세스 전체가 아니다.

`WebsocketFrontendConnectionService.handleSocketDisconnect` 요약:

| `frontendConnectionTimeout` | 동작 |
|-----------------------------|------|
| `0` (프레임워크 기본) | disconnect 즉시 connection context 닫음 |
| `> 0` | 그 ms 동안 컨텍스트 유지 → 재연결 가능, 만료 시 닫음 |
| `< 0` | disconnect만으로는 **컨텍스트를 닫지 않음** |
| `markForClose`된 경우 | 타임아웃과 무관하게 disconnect 시 즉시 닫음 |

환경 변수 `FRONTEND_CONNECTION_TIMEOUT`이 설정돼 있으면 숫자로 파싱해 **앱 config보다 우선**한다 (`@theia/core` README).

중요: 위 표는 **연결 컨텍스트** 수명이다. 컨텍스트를 닫아도 Express 리스너·backend 프로세스는 그대로다.

### 5.2 제품 설정

| 타깃 | `theia.backend.config.frontendConnectionTimeout` | 의미 |
|------|--------------------------------------------------|------|
| `applications/browser` | `3000` | 탭 닫힘/네트워크 끊김 후 3초간 재연결 대기 후 컨텍스트 폐기 |
| `applications/electron` / `electron-next` | `-1` | 끊김만으로 컨텍스트 미폐기 (의도적 종료 시 `markForClose`로 보완) |

Electron renderer는 창이 곧 닫힐 때 `ConnectionCloseService.markForClose(frontendId)`를 호출한다 (`electron-window-service.ts` ← `onAboutToClose`). 그러면 이후 disconnect에서 타임아웃 `-1`이어도 해당 컨텍스트는 바로 정리된다.

### 5.3 타깃별 “무엇이 남는가”

#### Browser (`yarn browser start`)

1. 터미널의 Node 프로세스 = backend (frontend 정적 파일 + API).  
2. 브라우저 탭을 닫음 → WebSocket `disconnect` → (3초 후) 그 탭의 connection context 정리.  
3. **터미널의 Node는 계속 `:3000`을 listen.** 같은 URL로 다시 열면 새 frontend id로 `INITIAL_CONNECT`.  
4. Backend를 끄려면 터미널에서 Ctrl+C (`SIGINT`) 등으로 프로세스를 종료해야 한다.

증상으로 자주 보이는 것: 탭만 닫았는데도 포트가 살아 있어 재기동 시 `EADDRINUSE`, 또는 예전 backend가 떠 있는 줄 모르고 새 빌드를 기대하는 경우.

#### Electron — 창 닫기와 backend

| 동작 | Backend 프로세스 |
|------|------------------|
| 창 **하나** 닫음 (다른 창 남음) | **살아 있음** — 같은 fork backend가 남은 창을 계속 서비스 |
| **마지막** 창까지 닫음 | `window-all-closed` → `requestStop()` → `app.quit()` → fork backend `process.kill` — **함께 종료** |
| New Window 등으로 창 추가 | 같은 `backendPort`로 새 renderer가 접속 (새 frontend id) |

1. electron-main은 기동 시 backend를 **한 번** fork하고 `windows` Map으로 창을 관리한다.  
2. 창 URL에 같은 `?port=…`를 넣으므로 **인스턴스당 backend 1 : 창 N**.  
3. 개별 창 종료 시 renderer가 `markForClose` → 그 창의 connection context만 정리. electron-main·backend는 유지.  
4. Backend만 죽은 채 창이 남으면 스플래시 반복 + `singleInstance` 함정 → `docs/theia/debug-logging.md`.  
5. **1.77:** Windows에서 fork backend를 죽일 때 부모의 exit code를 덮어쓰지 않도록 정리됨 (`#18105`). 수명주기 자체는 동일.

“창을 닫아도 backend가 안 죽는다”는 관찰은 **창 하나**를 닫을 때 맞고, **앱 전체(마지막 창) 종료**와는 다르다.

**New Window vs secondary window:** 위 “창”은 `ElectronMainApplication`이 관리하는 **독립 `BrowserWindow`**(각자 frontend id·WebSocket). 에디터 탭을 떼어 내는 **secondary window**는 메인 renderer와 `postMessage`로 통신하며 **별도 frontend connection context를 만들지 않는다**. 1.77에서 cross-window 탭 드래그·복원 등이 강화됐지만, 1 backend : N frontend 카운팅에는 New Window만 해당한다.

### 5.3.1 다중 클라이언트 (1 backend : N frontend)

`WebsocketFrontendConnectionService`의 `connectionsByFrontend: Map<frontendId, channel>`이 이를 그대로 표현한다.

| 시나리오 | 같은 backend를 공유? |
|----------|---------------------|
| Electron 창 A, B (동일 앱 인스턴스) | **예** — 한 fork, 창마다 frontend id |
| Browser 탭 여러 개 → 같은 `localhost:3000` | **예** — 한 Node `theia start` |
| `yarn browser start`와 `yarn electron start`를 동시에 | **아니오** — 프로세스가 둘 (포트도 다름) |
| Electron 두 번째 기동 (`singleInstance`) | 보통 기존 인스턴스로 포커스/새 창 — **새 backend를 안 띄움** |

원격(`@theia/remote`)도 “프론트 N ↔ (프록시를 경유한) 원격 backend 1” 모델로 확장된다. **1.77:** Dev Container attach 시 원격에 backend **ESM marker**(`package.json` `"type": "module"`)를 복사하지 않으면 원격 Node가 CJS로 오인해 기동에 실패할 수 있다 (`#18316`).

### 5.4 Connection context vs process (정리)

```text
Frontend 탭/창 종료
        │
        ▼
 WebSocket disconnect
        │
        ├─► (timeout / markForClose) connection context close
        │         Channel onClose → 연결 스코프 DI unbind
        │         ※ 여기까지가 “세션/프록시 정리”
        │
        └─► BackendApplication 프로세스
                  Browser: 계속 실행 (Ctrl+C 등 필요)
                  Electron: 마지막 창 종료 시 electron-main quit → backend kill
```

---

## 6. 개발 함정: “창은 다 닫았는데 새 코드가 안 먹는다”

Backend는 **프로세스가 기동될 때** `lib/`를 메모리에 로드한다. 디스크에 다시 빌드해도 **이미 떠 있는 backend는 옛 코드를 계속 쓴다.**

Cocrates git commit이 전형적이다.

| 계층 | 경로 | 역할 |
|------|------|------|
| Frontend | `cocrates-agent.ts` → RPC proxy | 구조화 응답의 `commit`을 보고 호출 |
| Backend | `src/node/cocrates-git-commit-service.ts` + `cocrates-backend-module.ts` | 실제 `git add` / `git commit` |

프론트만 새로고침·창만 다시 열면 **agent UI 쪽은 새 빌드일 수 있어도**, RPC 상대인 **옛 backend**에는 새 `RpcConnectionHandler`가 없다 → “커밋 기능이 안 붙었다”처럼 보인다.

창을 모두 닫았다고 생각했는데도 옛 backend가 남는 대표 경로:

| 원인 | 무슨 일이 일어나는가 |
|------|----------------------|
| **Browser** | 탭을 다 닫아도 터미널 `yarn browser start` Node는 그대로. 재빌드 후 탭만 열면 옛 backend |
| **Electron `singleInstance`** | 이미 인스턴스가 있으면 새 `yarn electron start`는 바로 종료되고 기존 창만 포커스. **기존 fork backend(옛 코드) 재사용** — 새 기동처럼 보여도 프로세스는 안 바뀜 |
| **detached orphan (Linux/macOS)** | backend fork가 `detached: true`. electron-main을 `kill -9`·터미널 강제 종료 등으로 `app.on('quit')` 없이 죽이면 **backend Node만 고아로 남음** |
| **창 ≠ 앱 종료 착각** | 창은 없는데 다른 터미널/백그라운드에 예전 `electron`·`lib/backend/main`이 살아 있음 |

확인·정리:

```bash
# 잔존 후보
ps -ef | rg 'lib/backend/main|theia-electron-main|applications/electron' || true

# Electron 계열 정리 예 (debug-logging.md와 동일 취지)
pkill -f 'node_modules/electron/dist/electron.*(theia-electron-main|applications/electron)' || true
```

그다음 `yarn workspace theia-ide-cocrates-ext build`(또는 `yarn build:extensions`) 후 **backend 프로세스까지** 다시 기동한다. Electron은 창만이 아니라 터미널의 electron 프로세스가 끝난 것을 확인하는 편이 안전하다.

---

## 7. 제품 개발 시 실무 메모

- **어디에 코드를 둘지:** UI·명령·위젯 → `browser` (또는 `electron-browser`). 파일/터미널/플러그인 호스트·git·긴 작업 → `node`. 공유 인터페이스 → `common` + RPC path.  
- **`node/` 변경 후:** 확장 빌드 + **backend 프로세스 재시작**이 필수. frontend reload만으로는 부족.  
- **ESM (1.77):** `@theia/*` runtime·생성된 `lib/backend`는 ES module. 확장에서 Theia를 deep-import하거나 backend를 unbundled로 돌릴 때 `exports`·상대 import 확장자(`.js`)·`createRequire`를 의식한다. 자세한 마이그레이션은 upstream [Migration.md § v1.77.0](https://github.com/eclipse-theia/theia/blob/v1.77.0/doc/Migration.md).  
- **Browser 디버깅:** 탭을 닫아도 backend 로그가 터미널에 계속 나오면 정상이다.  
- **Electron 디버깅:** 기본은 backend fork라 로그/디버거 attach 대상이 둘이다. `--no-cluster`로 한 프로세스에 모을 수 있다. Electron은 44.x 계열.  
- **포트/잔존 프로세스:** 위 §6 및 `docs/theia/debug-logging.md`의 single-instance/`pkill` 절.  
- **원격:** `@theia/remote`는 원격에 backend를 띄운 뒤 로컬 프록시 포트로 frontend가 “로컬처럼” RPC한다. 수명주기는 원격 Node 프로세스 쪽에 있다.

---

## 8. 관련 문서

| 문서 | 내용 |
|------|------|
| `docs/theia/debug-logging.md` | frontend 로그가 backend로 복제되는 경로, Electron single-instance / orphan backend |
| [Architecture Overview](https://theia-ide.org/docs/architecture/) | 공식 2-process 개요 |
| [Communication via RPC](https://theia-ide.org/docs/json_rpc/) | 서비스 등록·proxy 패턴 |
| [Migration.md (v1.77.0)](https://github.com/eclipse-theia/theia/blob/v1.77.0/doc/Migration.md) | ESM, `ready`/preload, Electron 44 등 업그레이드 노트 |
| GitHub PR [#13082](https://github.com/eclipse-theia/theia/pull/13082) | frontendConnectionTimeout / 재연결 도입 |
