# Theia IDE Boilerplate 개발 지침

## Repository structure

이 저장소는 Eclipse Theia 플랫폼을 조합해 브라우저 및 Electron 기반 IDE 제품을 빌드·패키징하는 Yarn/Lerna 모노레포이자, Theia 기반 데스크톱 제품의 템플릿이다.

```text
./
├── applications/       # browser, electron, electron-next 애플리케이션
├── theia-extensions/   # product, updater, launcher 커스텀 Theia 확장
├── plugins/             # 다운로드·실행되는 VS Code/Theia 플러그인
├── scripts/             # 버전 갱신, 빌드 보조, 릴리스 및 파일 권한 스크립트
├── configs/             # 공통 TypeScript, ESLint, 라이선스 검사 설정
├── docs/                # 개발·리브랜딩 등 저장소 문서
├── next/                # Next 릴리스 관련 CI 및 안내
├── .github/             # 이슈 템플릿과 GitHub Actions
└── .vscode/             # 디버그 실행 구성과 편집기 설정
```

루트 `package.json`이 워크스페이스와 Lerna 작업을 조정한다. 애플리케이션은 Theia와 제품 확장을 조합하고, `theia-extensions`는 애플리케이션의 의존성으로 연결된다. `plugins`는 애플리케이션 빌드 후 다운로드되어 실행 대상에 포함된다. `dist`, `src-gen`, `lib`, `.browser_modules`와 같은 생성물은 소스 변경의 기본 대상이 아니다.

## Working principles

1. 저장소의 기능 변경은 Theia 1.77.0 및 Node.js 24, Yarn 1.x 제약과 각 패키지의 기존 구조를 따른다.
2. 요구사항이 있는 작업은 `spec/`의 승인된 Spec을 기준으로 구현하고, 조사 결과는 `docs/`, 진행 상태는 `TODO.md`와 `scrum/`에 기록한다.
3. 루트 작업은 Lerna를 통해 애플리케이션과 확장을 함께 조정한다. 특정 패키지 작업은 해당 패키지 디렉터리의 스크립트를 우선 사용한다.
4. Theia upstream 코드를 직접 수정하기보다 확장으로 기능을 연결하고, 꼭 필요한 upstream 수정은 patch 메커니즘과 기존 `postinstall` 흐름을 따른다.
5. 제품 브랜딩·앱 식별자·설정 폴더·아이콘을 바꿀 때는 `ADOPTER.md`와 `docs/rebranding.md`의 패키징 주의사항을 함께 확인한다.

## Implementation guide

### Module design and structure

- `applications/browser`: 브라우저/컨테이너 실행 대상. 개발 서버는 기본적으로 3000 포트를 사용한다.
- `applications/electron`: 일반 배포용 Electron 애플리케이션, electron-builder 설정, 실행 스크립트와 E2E 테스트를 포함한다.
- `applications/electron-next`: Next 채널용 Electron 애플리케이션이다. 일반 Electron 앱과 설정을 공유하지만 `brandingVariant`, update channel, URI scheme, configuration folder가 다르다.
- `theia-extensions/product`: 제품 브랜딩과 About/Getting Started UI 및 Electron main 기여.
- `theia-extensions/updater`: Electron 업데이트 기능과 UI.
- `theia-extensions/launcher`: AppImage에서 `theia` 명령을 만들기 위한 launcher 기여.

애플리케이션 패키지의 Theia 설정은 각 `package.json`의 `theia` 필드에 두며, 의존성은 필요한 `@theia/*` 모듈과 로컬 제품 확장을 명시한다. 확장의 소스는 `src/` 아래에 두고 패키지 빌드 결과는 `lib/`에 생성한다.

### How to implement

1. 루트 요구사항·Spec·현재 TODO를 확인한 뒤 관련 애플리케이션과 확장 패키지의 `package.json`, README, 인접 소스를 읽는다.
2. 의존성이나 생성물을 직접 편집하지 말고, 루트 또는 대상 패키지의 소스·설정·스크립트를 변경한다.
3. 의존성 설치 또는 Theia 버전 변경 후에는 `yarn`을 실행해 `postinstall`의 `theia-patch`가 적용되도록 한다.
4. 개발 빌드는 다음 순서를 사용한다.
   - `yarn`
   - `yarn build:dev`
   - `yarn download:plugins`
5. 프로덕션 빌드는 `yarn build` 후 `yarn download:plugins`를 사용한다.
6. Electron 패키징은 `yarn package:applications` 또는 `yarn electron package`를 사용한다. 미리보기 패키지는 `yarn electron package:preview`다.
7. 브라우저 앱은 `yarn browser start`로 실행하고 `http://localhost:3000/`에 접속한다.
8. 로컬 Theia 프레임워크를 대상으로 할 때는 `yarn build:local-theia`와 `docs/developing-with-local-theia.md`를 따른다.
9. 변경 후 생성된 `src-gen`, `lib`, `dist`가 변경되어도 원인과 커밋 필요성을 확인한다. 수동으로 생성물을 기능 구현의 대체물로 편집하지 않는다.

## Verification guide

- 정적 검사는 `yarn lint`를 사용한다.
- 전체 테스트는 `yarn test`를 사용한다.
- Electron E2E는 대상 애플리케이션의 Preview 패키징을 먼저 실행한 뒤 테스트한다.
  - 일반 Electron: `yarn electron package:preview` → `yarn electron test`
  - Electron Next: `yarn electron-next package:preview` → `yarn electron-next test`
  - `package:preview`는 기존 `dist`를 정리하고 native module을 rebuild한 뒤 E2E가 사용할 fresh `dist/linux-unpacked` 산출물을 생성한다. 개발 빌드(`yarn build:applications:dev`, `yarn build:applications:next:dev`)만 실행한 뒤 Electron E2E를 실행하지 않는다.
- 브라우저 변경은 Electron 패키징과 별도의 lifecycle로 검증한다. `yarn browser start`로 서버를 실행하고 `http://localhost:3000/`에서 기동 및 핵심 동작을 확인한 뒤 서버를 종료한다.
- 애플리케이션 빌드 검증은 개발 환경에서는 `yarn build:dev`, 배포 대상에서는 `yarn build`를 사용한다.
- 패키징 관련 변경은 `yarn package:applications` 또는 해당 Electron 패키지의 `package:preview`로 확인한다. Preview/E2E 이후 다음 테스트를 실행할 때는 대상 애플리케이션 Preview 패키징으로 `dist` 산출물을 새로 만든다.
- 명령, 구조, 구현이 Spec의 요구사항과 일치하는지 확인하고 결과는 `verification/`에 기록한다. 단순 문서 복원은 실제 파일·스크립트·README 대조를 우선하며, 환경 제약으로 실행하지 못한 명령은 검증 기록에 명시한다.

## Notes

- Electron 배포는 `applications/electron/electron-builder.yml`의 asar 패키징을 사용한다. 네이티브 바이너리나 런타임에 실제 파일 경로가 필요한 스크립트는 `asarUnpack` 및 `.asar.unpacked` 경로 처리를 검토해야 한다.
- 루트 `package.json`의 `postinstall`은 `theia-patch`다. Theia가 유지하는 upstream 패치가 설치 과정에 적용되므로 이 흐름을 제거하지 않는다.
- 일반 앱과 Next 앱은 서로 다른 configuration folder와 Electron 식별자를 사용한다. 둘 중 하나를 바꾸면 해당 앱의 `package.json`과 리소스를 함께 확인한다.
- 저장소 README는 이 프로젝트를 Eclipse Theia IDE의 제품이자 데스크톱 Theia 제품용 템플릿으로 설명한다. 제품 기능보다 플랫폼 조합·패키징·확장 연결이 이 저장소의 중심 책임이다.
