# PRD: Eclipse Theia IDE Product Template

## Summary

이 저장소는 Eclipse Theia 플랫폼을 조합하여 데스크톱 및 브라우저 기반 IDE 제품을 만들 수 있게 하는 Product Template이다. 표준 Theia 기능, 제품 전용 확장, 플러그인, 빌드·패키징 구성을 함께 제공하여 이 저장소 자체를 Eclipse Theia IDE로 배포하고, 이를 바탕으로 다른 Theia 기반 제품을 구성할 수 있게 한다.

## Sprint-01 리브랜딩 변경

이번 변경에서는 이 Product Template이 제공하는 전체 배포 타깃을 Cocrates 제품군으로 전환한다. Browser와 Stable Electron은 `Cocrates` 제품으로 제공하고, Electron Next는 별도 채널 특성을 유지하는 `Cocrates Next` 변형으로 제공한다.

### 리브랜딩 범위

- Browser, Stable Electron, Electron Next의 사용자에게 보이는 제품명과 애플리케이션 설정을 Cocrates 브랜드에 맞춘다.
- OS 앱 식별자, 실행 파일·패키지 이름, URI scheme, configuration folder, Electron builder 설정을 새 제품 식별 체계로 정렬한다.
- Welcome/About/Help, 제품 확장, updater, launcher, AI registry와 제품 리소스의 Theia IDE 하드코딩을 Cocrates 제품 표면으로 갱신한다.
- CI, Docker/배포 메타데이터, 스크립트, 문서의 제품명·산출물명·이미지 태그를 같은 체계로 정렬한다.
- Theia 플랫폼·업스트림 빌더 도구를 가리키는 이름과 Cocrates 제품 이름을 구분하고, 제품 배포물에서는 Theia IDE 브랜드가 사용자 표면에 남지 않도록 한다.

### 리브랜딩 성공 기준

- 세 타깃이 각각 `Cocrates` 또는 `Cocrates Next`로 식별되며, 서로 충돌하지 않는 앱 식별자·URI scheme·설정 폴더를 사용한다.
- 제품 UI와 패키징 설정에서 사용자에게 노출되는 브랜드·아이콘·스플래시·산출물·CLI 이름이 타깃별 정책과 일치한다.
- launcher, updater, AI registry, CI와 문서가 새 제품 식별자를 사용하고, Theia 업스트림 도구명은 필요한 곳에만 남는다.
- 승인된 리브랜딩 Spec을 기준으로 소스 변경, 패키징, Browser/Electron 실행 검증을 재현할 수 있다.

## Goals

- Electron과 브라우저 실행 대상에 Theia IDE 기능과 제품 브랜딩을 조합한다.
- 제품 전용 확장과 외부 플러그인을 애플리케이션에 연결할 수 있는 구조를 제공한다.
- 개발 빌드, 프로덕션 빌드, Electron 패키징, 브라우저 실행 및 기본 검증 흐름을 제공한다.
- Theia 기반 데스크톱 제품을 채택하는 팀이 이 저장소를 템플릿으로 재사용할 수 있도록 패키징·리브랜딩·확장 지점을 명확히 한다.

## Audience

- Eclipse Theia 기반 IDE 또는 데스크톱 개발 제품을 만드는 팀
- Theia IDE 제품의 기능·브랜딩·업데이트·실행 구성을 유지보수하는 개발자
- 브라우저 및 Electron 배포물을 빌드·패키징·검증하는 릴리스 담당자

## Product capabilities

- **Theia IDE application:** 편집기, 탐색기, 터미널, 디버깅, SCM, 플러그인 호스트, AI 및 기타 Theia 기능을 조합한 IDE 실행 환경
- **Desktop target:** Electron 기반 Theia IDE와 electron-builder 패키징
- **Browser target:** 브라우저에서 실행 가능한 Theia IDE 및 컨테이너 배포 기반
- **Product extensions:** product 브랜딩/UI, updater, AppImage launcher 확장
- **Plugin distribution:** Theia 내장 플러그인과 Open VSX/외부 플러그인의 다운로드·실행 구성
- **Adoption surface:** 앱 이름·아이콘·URI scheme·configuration folder·패키지 설정을 제품별로 변경할 수 있는 템플릿 구조

## Deliverables

- 실행 가능한 Theia IDE 제품 구성: `applications/browser`, `applications/electron`, `applications/electron-next`
- 제품 전용 Theia 확장: `theia-extensions/product`, `theia-extensions/updater`, `theia-extensions/launcher`
- 빌드·패키징·플러그인 다운로드·테스트를 위한 루트 및 패키지 스크립트
- 채택자용 문서와 개발 context: `README.md`, `ADOPTER.md`, `docs/`, `AGENTS.md`

## Scope

### In Scope

- Theia 기반 IDE 기능을 애플리케이션별 의존성으로 조합
- Electron, Electron Next, 브라우저 실행 대상의 빌드 및 실행 구성
- product, updater, launcher 커스텀 확장 연결
- 내장 및 외부 플러그인 다운로드·실행 구성
- 개발/프로덕션 빌드, Electron 패키징, 브라우저 컨테이너 실행, lint 및 테스트 흐름
- Theia 제품 채택을 위한 앱 설정, 브랜딩, 패키징, asar 및 patch 흐름

### Out of Scope

- Theia upstream 자체의 기능 개발 또는 수정

## Constraints

- 루트 워크스페이스는 Yarn 1.x 및 Lerna로 관리하고, 저장소가 참조하는 Theia 버전과 Node.js 엔진 제약을 따른다.
- Electron 패키징은 asar의 읽기 전용 특성과 native binary/resource unpacking 제약을 따른다.
- `postinstall`의 `theia-patch` 흐름을 유지하여 Theia가 요구하는 의존성 패치를 적용한다.
- 제품 요구사항의 SSOT는 승인된 Spec이며, `AGENTS.md`는 개발자가 구조와 작업 방법을 빠르게 파악하기 위한 orientation 문서다.

## Success Criteria

- 이 저장소가 Eclipse Theia IDE Product Template으로 제공하는 제품 역할과 주요 capabilities가 최종 Spec에 명확히 정의된다.
- Electron, Electron Next, 브라우저 애플리케이션과 세 제품 확장의 구현 역할이 Spec과 실제 패키지 설정에 일치한다.
- 개발·프로덕션 빌드, 플러그인 다운로드, 패키징, 브라우저 실행, lint 및 테스트 흐름이 실제 스크립트와 일치한다.
- 채택자가 제품 브랜딩·앱 식별자·설정 폴더·아이콘을 조정할 수 있는 구조와 asar/patch 제약이 문서화된다.
- Spec에서 도출한 제품 백로그가 현재 구현 상태를 정확히 반영하고, 검증 기록이 각 요구사항에 대한 근거를 제공한다.
