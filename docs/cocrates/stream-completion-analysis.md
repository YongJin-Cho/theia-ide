# 스트림 완료 이벤트 이전 종료 가능성 조사

## 결론

가능하다. 현재 구조에서는 upstream 스트림이 명시적인 완료 이벤트를 전달하기 전에 종료되어도, 수신 측이 이를 정상 완료로 간주할 수 있다.

## 확인한 계약

`@theia/ai-core`의 `LanguageModelStreamResponse`는 다음 형태만 정의한다.

- `stream: AsyncIterable<LanguageModelStreamResponsePart>`
- `LanguageModelStreamResponsePart`에는 text, tool call, thinking, usage, compaction이 포함된다.
- 별도의 `completion` 또는 `done` 응답 파트는 정의되어 있지 않다.

따라서 현재 계약에서 스트림 완료는 기본적으로 `for await` 루프가 더 이상 값을 받지 않고 끝나는 것으로 관찰된다.

## 현재 제품 코드의 동작

`theia-extensions/product/src/browser/cocrates-chat-agent.ts`의 `addStreamResponsePreservingToolCalls`는 다음과 같이 스트림을 소비한다.

```ts
for await (const token of response.stream) {
    // 토큰 처리
}

// 루프가 끝나면 최종 structured response 처리
```

루프가 끝난 원인은 다음 중 하나일 수 있지만 현재 코드에는 구분 정보가 없다.

1. 모델이 정상적으로 응답을 끝냄
2. provider가 스트림을 조기에 닫음
3. 네트워크·서버·SDK 계층에서 완료 프레임 전에 연결이 종료됨
4. 취소가 발생해 provider iterator가 종료됨

루프가 예외를 던지는 경우에는 `AbstractChatAgent.invoke`의 `catch`로 가지만, iterator가 예외 없이 `done: true`를 반환하면 제품 코드와 Theia 기본 코드 모두 정상 완료 후속 처리를 진행한다.

## OpenAI 경로 확인

### Responses API

`openai-response-api-utils.ts`의 변환기는 provider 이벤트 `response.completed`를 받으면 usage를 yield한다. 하지만 이 이벤트를 제품 계층에서 확인할 수 있는 `completion` 파트로 변환하지 않는다.

또한 `finally`에서 `response.completed` 전에 스트림이 중단되어도 부분 usage를 yield한 뒤 iterator가 종료될 수 있다. 즉 `response.completed` 미수신과 iterator 정상 종료가 동시에 가능하다.

### Chat Completions API

`openai-chat-completion-stream.ts`는 underlying stream을 순회한 뒤 수집된 text/tool call을 반환한다. 현재 제품 계층으로 전달되는 파트에는 provider의 `finish_reason` 또는 “정상 finish 확인” 상태가 노출되지 않는다. 따라서 finish 프레임이 오기 전에 iterator가 종료되면, 수집된 결과가 정상 완료처럼 처리될 수 있다.

### 재시도 계층

`openai-streaming-retry.ts`는 스트림 순회가 예외로 끝난 경우에만 재시도 조건을 평가한다. 스트림이 예외 없이 조기 종료되면 정상 return 경로로 빠지며, 별도의 완료 검증은 하지 않는다.

## 호출 체인의 결과

1. `CocratesChatAgent.addStreamResponsePreservingToolCalls`의 `for await`가 종료된다.
2. `addStructuredResponse(text, request)`가 호출된다.
3. `AbstractChatAgent.invoke`가 `recordTokenUsageFromResponse`를 수행한다.
4. `onResponseComplete(request)`가 호출되고 기본 구현은 `request.response.complete()`를 호출한다.

따라서 현재 구현은 “완료 이벤트를 수신했다”가 아니라 “iterator가 끝났다”를 완료로 취급한다.

## 판단

- 스트림이 completion을 받기 전에 종료될 수 있는가? **예.** AsyncIterable 계약상 가능하고, OpenAI Responses 변환기에도 완료 이벤트 전에 종료될 수 있는 경로가 있다.
- 현재 제품이 이를 감지하는가? **아니오.** 제품 Agent에는 정상 완료 여부를 나타내는 상태나 완료 이벤트 검증이 없다.
- 조기 종료가 예외로 표면화되는가? **항상 그렇지는 않다.** provider가 iterator를 정상 종료시키면 예외 없이 최종 응답 완료로 진행한다.
- 별도 completion 파트를 기다리면 해결되는가? **현재 계약만으로는 아니다.** Theia 공통 stream part에 completion 파트가 없으므로 provider 계약 변경 또는 provider별 완료 상태 전달이 필요하다.

## 후속 수정 시 고려할 선택지

1. provider 어댑터가 정상 종료 여부를 검증하고, 완료 확인 전 종료 시 예외를 던진다.
2. `LanguageModelStreamResponse` 계약에 완료 상태/종료 원인을 노출하는 별도 메타데이터 또는 파트를 추가한다.
3. 취소·네트워크 중단·정상 완료를 구분할 수 있는 provider별 래퍼를 제품 경계에 둔다.

이 조사는 코드 변경 없이 현재 동작과 위험을 기록한 것이다.
