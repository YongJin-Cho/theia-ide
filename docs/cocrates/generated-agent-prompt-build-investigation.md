# Cocrates Agent 시스템 프롬프트 생성·Git 추적 조사

## 조사 대상

- 생성 스크립트: `theia-extensions/product/scripts/generate-cocrates-agent-prompt.mjs`
- 생성 파일: `theia-extensions/product/src/browser/generated/cocrates-agent-system-prompt.ts`
- 원본 문서: `docs/cocrates/agent1.md`

## 생성 스크립트가 실행되는 시점

생성 스크립트 자체는 `docs/cocrates/agent1.md`를 읽어 `src/browser/generated/cocrates-agent-system-prompt.ts`를 덮어쓴다. 이 스크립트는 제품 확장 `package.json`의 `build` 스크립트 앞부분에서만 직접 호출된다.

```json
"build": "node scripts/generate-cocrates-agent-prompt.mjs && tsc -b"
```

따라서 다음 경로에서는 실행된다.

1. 루트 `yarn build:extensions`
2. 루트 `yarn build`와 `yarn build:dev`의 확장 빌드 단계
3. `lerna run --scope="theia-ide*ext" build`가 제품 확장에 대해 실행하는 경우
4. 제품 확장 디렉터리에서 `yarn build`를 실행하는 경우

GitHub Actions의 Next 릴리스 빌드도 `yarn build:extensions`를 호출하므로 이 생성 단계가 포함된다.

반대로 다음은 제품 확장의 `build` 스크립트를 호출하지 않는다.

- 제품 확장의 TypeScript 프로젝트를 직접 빌드하는 `tsc -b` 작업
- 제품 확장의 `watch` 작업
- 애플리케이션 빌드만 직접 실행하는 경로

애플리케이션들은 `theia-ide-product-ext`를 의존하고, 제품 확장의 `build`가 먼저 실행되는 루트 표준 빌드에서는 생성 파일이 준비된다.

## Git 추적 및 gitignore 확인

현재 두 파일 모두 Git에 추적되고 있다. 저장소의 `.gitignore`에는 `**/lib`, `**/src-gen` 등이 있지만 `src/browser/generated` 또는 해당 파일을 무시하는 규칙은 없다.

생성 파일은 `cocrates-chat-agent.ts`에서 정적으로 import된다.

```ts
import { COCRATES_SYSTEM_PROMPT_ID, cocratesSystemPrompt } from './generated/cocrates-agent-system-prompt.js';
```

## 결론

현재 구조에서는 생성 파일을 바로 gitignore로 옮기지 않는 것을 권장한다.

생성 파일의 원본은 추적되는 `docs/cocrates/agent1.md`이고 표준 `yarn build:extensions`가 파일을 다시 만들 수 있으므로, **빌드 파이프라인만을 기준으로 보면** 생성 파일을 무시하는 설계도 가능하다. 그러나 현재는 직접 `tsc -b`·watch 작업과 에디터의 TypeScript 분석이 생성 파일을 전제로 하며, 이 경로들에는 생성 단계가 없다. 파일을 무시하고 인덱스에서도 제거하면 새 체크아웃 직후 이 경로에서 import 대상이 없어져 빌드/분석이 실패할 수 있다.

따라서 지금은 생성 파일을 추적 상태로 유지하는 편이 안전하다. 생성 파일을 gitignore하려면 먼저 다음 계약을 함께 바꿔야 한다.

- 직접 빌드·watch·개발 작업의 시작 단계에도 생성 스크립트를 보장
- 새 체크아웃에서 애플리케이션 또는 제품 확장을 직접 다루는 문서·작업이 생성 단계를 사용하도록 정리
- Git 인덱스에서 기존 파일을 제거한 뒤 clean checkout과 CI에서 생성 순서를 검증

현재 조사에서는 `.gitignore`나 Git 추적 상태를 변경하지 않았다.

## 대화 기록 처리

이 조사 결과만 `docs/`에 기록했으며, 대화 이력은 `PROMPTS.md`에 추가하지 않았다.
