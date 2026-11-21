# Theia IDE Product 확장

`theia-extensions/product`는 Eclipse Theia IDE 제품에 필요한 제품 수준 Theia 확장이다. 이 저장소의 Browser/Electron 제품 타깃들이 사용하지만 모든 채택 애플리케이션의 공통 계약은 아니다.

## Context

- 확장 소스는 `theia-extensions/product/src`에 있다.
- 패키지는 frontend entrypoint와 Electron main entrypoint를 함께 제공한다. ← ASR-003

## Requirements

- R-001: Product 확장은 제품 branding을 적용하고 stable/next branding variant에 따라 frontend branding 상태를 설정해야 한다. ← ASR-003; AC-002
- R-002: Product 확장은 Theia Getting Started widget과 About Dialog를 Eclipse Theia IDE 제품 UI로 제공해야 한다. ← ASR-003
- R-003: Product 확장은 Help 메뉴에 Report Issue와 Documentation 명령을 제공해야 한다. ← ASR-003
- R-004: Product 확장은 Theia AI Registry 설정을 Eclipse Theia IDE 제품의 AI 기능 구성으로 제공해야 한다. ← ASR-003
- R-005: Product 확장은 Electron main entrypoint에서 제품 아이콘 기여를 제공해야 한다. 이 기여는 Electron 타깃에서만 실행되며 Browser frontend 계약으로 간주하지 않는다. ← ASR-003
- R-006: Product frontend module은 Theia의 `AboutDialog`와 `AIRegistryConfiguration` 서비스가 이미 바인딩된 경우 제품 구현으로 `rebind`하고, 바인딩되지 않은 경우 제품 구현을 `bind`해야 한다. ← ASR-003
- R-007: R-006의 rebind 대상 서비스는 애플리케이션이 일반적으로 재정의할 수 있는 customization point로 보장하지 않아야 하며, 애플리케이션별 동작 변경은 별도 Theia 확장으로 구현해야 한다. ← ASR-003; ASR-006

## Constraints

- C-001: Product 확장은 모든 채택 애플리케이션의 범용 공통 확장이 아니라 이 저장소의 Eclipse Theia IDE 제품 타깃을 위한 제품 고유 확장으로 취급해야 한다. ← ASR-003
- C-002: Product 확장 기능을 애플리케이션 패키지에 중복 구현하지 않고 `theia-extensions/product`에 유지해야 한다. ← ASR-003
- C-003: Product 확장의 DI 동작은 모듈 로딩 순서와 Theia Inversify 바인딩 규칙의 영향을 받으므로, 애플리케이션의 동일 서비스 `rebind`를 안정적인 override 계약으로 문서화하지 않아야 한다. ← ASR-003

## Out of Scope

- Updater 기능
- AppImage launcher 기능
- 특정 채택자 제품의 별도 UI 또는 서비스 override

## Related

- `spec/PRD.md`
- `spec/ASR.md`
