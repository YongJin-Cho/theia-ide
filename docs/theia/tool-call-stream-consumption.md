# LLM 도구 호출 stream 소비 오류

## 증상

도구 목록은 LLM 요청에 포함되지만 도구 실행 시 다음 오류가 발생한다.

- `Error executing tool 'getSkillFileContent': Tool call content for tool getSkillFileContent not found in the response`
- `Error executing tool 'getWorkspaceFileList': Tool call content for tool getWorkspaceFileList not found in the response`

## 원인

`CocratesChatAgent.addContentsToResponse()`가 모든 모델 응답에 `getTextOfResponse()`를 먼저 호출했다. Theia의 `getTextOfResponse()`는 stream을 한 번 순회하면서 텍스트 조각만 합친다. 따라서 `tool_calls` 조각은 응답 모델에 추가되지 않고 버려진다.

이후 Theia의 `FrontendChatToolRequestService.findToolCallContent()`가 도구 실행을 확인하려고 응답 content에서 해당 도구 호출을 찾지만, 호출 content가 없으므로 오류를 던진다. 도구 정의가 요청에 포함되는지와는 별개의 문제다.

## 수정

`CocratesChatAgent`가 stream 응답을 직접 한 번 순회하도록 변경했다.

- 텍스트 조각은 기존 stream parsing 규칙으로 누적한다.
- tool call, usage, thinking 등 비텍스트 조각은 `parse()`를 통해 기본 ChatAgent content로 보존한다.
- 비텍스트 조각이 있는 응답은 일반 tool-call 응답으로 유지해 실행 상관관계를 보존한다.
- 비텍스트 조각이 전혀 없는 순수 텍스트 stream에만 Cocrates 구조화 JSON 후처리를 적용한다.
- 비-stream 텍스트/parsed 응답의 기존 구조화 JSON 동작은 유지한다.

## 검증

- `build - theia-extensions/product`: 통과
- `lint - theia-extensions/product`: 기존 오류로 실패
  - `cocrates-chat-agent-prompt.ts:1` file header 누락
  - `cocrates-chat-agent-prompt.ts:33` max-len 초과
  - 수정 파일 자체의 새 lint 오류는 없음
