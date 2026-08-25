## 브랜치명
refactor/error-code-enum

## 수정 내용
- ApiException의 `code` 파라미터를 자유 문자열(String)에서 ErrorCode enum으로 변경
- ErrorCode enum 신규 생성 — 각 에러 종류마다 HTTP 상태코드 + 기본 메시지를 한 곳에서 관리
- GlobalExceptionHandler에 @Valid 검증 실패(MethodArgumentNotValidException) 핸들러 추가
  → 지금까지는 ApiException만 처리했는데, DTO의 @NotBlank/@Email 검증 실패는 별도 처리가 없어서
  Spring 기본 에러 포맷이 그대로 노출되고 있었음. 이번에 우리가 합의한 {"code", "message"} 형식으로 통일.

## 왜 수정하는지
- 지금까지 각자 담당 파일에서 code를 문자열로 직접 지어서 던지고 있었습니다. (PRODUCT_NOT_FOUND, INVALID_INPUT 등)
- 문자열 방식은 오타가 나도 컴파일러가 못 잡아주고, 같은 상황에 사람마다 다른 이름을 쓸 위험이 있습니다. (상품 없음을 PRODUCT_NOT_FOUND, NOT_FOUND_PRODUCT 등으로 지을 수 있음)
- enum으로 강제해 오타가 날 가능성을 원천 차단되고, ErrorCode.java 파일 하나만 보면 우리 API가 던질 수 있는 모든 에러 종류가 한눈에 볼 수 있습니다.

## 무슨 로직인지
- ApiException을 던질 때 이제 ErrorCode를 지정
- GlobalExceptionHandler가 ApiException을 잡으면 ErrorCode에 정의된 status/메시지를 꺼내서
  {"code": "PRODUCT_NOT_FOUND", "message": "...", "timestamp": "..."} 형태로 응답
- @Valid 검증 실패는 별도 핸들러가 첫 번째 필드 에러를 꺼내서 동일한 형태로 응답
  (예: {"code": "INVALID_INPUT", "message": "email must not be blank"})

## 기술 선택의 이유
- enum vs 상수(static final String) 비교: 상수도 오타는 막아주지만, HTTP 상태코드/기본 메시지까지 같이 묶어서 관리하려면 enum이 더 적합 (각 값에 필드를 붙일 수 있음)

- 기존에 문자열로 code를 직접 넘기던 부분(ApiException(status, "문자열", message) 형태)은 ApiException(ErrorCode.XXX, message) 형태로 제가 교체하겠습니다.