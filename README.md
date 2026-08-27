# ☕ Grids & Circles

원두 상품의 주문부터 관리자 운영까지 지원하는 카페 메뉴 관리 서비스입니다. Spring Boot REST API와 Next.js 클라이언트로 구성했으며, 오후 2시 배송 마감 단위의 주문 병합과 매출 통계 집계를 핵심 비즈니스 로직으로 구현했습니다.

## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NBE-14-1-YUKGAEJANG — 1차 팀 프로젝트 |
| 기간 | 2026.08.24 ~ 2026.08.31 |
| 인원 | 5명 |
| 목표 | RESTful CRUD API, JPA 기반 도메인 설계, 핵심 비즈니스 로직 테스트 및 프론트엔드 연동 |

### 주요 기능

- 고객 상품 조회 및 주문 생성
- 이메일 기반 주문 내역 조회와 페이지네이션
- 주문 배송지 수정 및 주문 취소
- 동일 배송 단위의 추가 주문과 동일 상품 수량 병합
- 관리자 상품 등록·조회·수정·삭제
- 관리자 주문 조회 및 상품명·주문일 검색
- 일별·월별 매출과 판매량 상위 상품 통계 대시보드
- 로딩·오류·빈 데이터 상태를 구분한 사용자 피드백

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Backend | Java 25, Spring Boot 4.1.1, Spring MVC |
| Persistence | Spring Data JPA, Hibernate |
| Database | H2(Local/Test), MySQL 호환 검증 |
| Test | JUnit 5, AssertJ, Mockito, Spring Boot Test, Testcontainers |
| Build | Gradle Kotlin DSL |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Collaboration | GitHub, Notion, Postman |

## 시스템 구성

```text
Browser
   │ HTTP / JSON
   ▼
Next.js Client
   │ /api/v1
   ▼
Spring Boot API
   │
   ▼
Spring Data JPA ── H2 / MySQL
```

백엔드는 Controller–Service–Repository 계층으로 구성했습니다. Controller는 요청 검증과 HTTP 응답을, Service는 주문 병합과 조회 정책을, Repository는 영속화와 통계 집계를 담당합니다.

## 핵심 비즈니스 로직

### 배송 마감 단위 계산

오후 2시를 경계로 주문의 배송 단위를 계산합니다.

- 14시 이전 주문: 전날 14:00 이상, 당일 14:00 미만
- 14시 이후 주문: 당일 14:00 이상, 다음 날 14:00 미만
- 경계값은 시작 시각을 포함하고 종료 시각을 제외하는 `[start, end)` 방식으로 처리합니다.

시간 계산은 `BatchTimeWindowUtil`로 분리하고 14:00:00 정각과 자정 부근의 경계값을 단위 테스트로 검증했습니다.

### 주문 병합 정책

추가 주문은 다음 조건이 모두 일치할 때만 기존 주문에 병합합니다.

1. 이메일
2. 주소
3. 우편번호
4. 배송 마감 구간

주소 또는 우편번호가 하나라도 다르면 같은 이메일이라도 신규 주문을 생성합니다. 기존 주문에 같은 상품을 다시 추가하면 새로운 `OrderItem`을 만들지 않고 수량을 합산합니다.

```text
주문 요청
   ├─ 이메일·주소·우편번호·마감 구간 일치 ── 기존 Order 사용
   │                                           └─ 동일 상품이면 수량 합산
   └─ 일치 주문 없음 ─────────────────────── 신규 Order 생성
```

배송지 수정은 해당 주문의 주소와 우편번호만 변경하며, 수정 결과가 다른 주문과 같아져도 주문 간 자동 병합은 수행하지 않습니다.

### 관리자 통계

전체 주문 데이터를 애플리케이션으로 가져와 계산하지 않고 JPQL의 `SUM`, `GROUP BY`와 Projection을 사용해 DB에서 집계합니다.

- 일별 매출
- 월별 매출
- 판매 수량 기준 상위 상품(기본 Top 3)

## ERD

```text
Product 1 ───── N OrderItem N ───── 1 Order
```

### Product

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | BIGINT | 상품 식별자 |
| `name` | VARCHAR | 상품명 |
| `price` | INTEGER | 판매 가격 |
| `image_url` | VARCHAR | 상품 이미지 URL |

### Order

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | BIGINT | 주문 식별자 |
| `email` | VARCHAR | 고객 식별 이메일 |
| `zip_code` | VARCHAR | 우편번호 |
| `address` | VARCHAR | 배송 주소 |
| `order_date` | DATETIME | 주문 시각 |

### OrderItem

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | BIGINT | 주문 항목 식별자 |
| `order_id` | BIGINT | 주문 외래 키 |
| `product_id` | BIGINT | 상품 외래 키 |
| `quantity` | INTEGER | 주문 수량 |

`Order`가 `OrderItem`의 생명주기를 관리하도록 `cascade = ALL`, `orphanRemoval = true`를 적용했습니다.

## API

Base URL: `/api/v1`

### 상품

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/products` | 상품 등록 |
| `GET` | `/products?page=0&direction=asc&productName=원두` | 상품 목록·검색·가격 정렬 |
| `GET` | `/products/{id}` | 상품 단건 조회 |
| `PUT` | `/products/{id}` | 상품 정보 수정 |
| `DELETE` | `/products/{productId}` | 상품 삭제 |

`direction`은 `asc`, `desc`를 지원하며 값이 없으면 ID 오름차순으로 조회합니다.

### 주문

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/orders` | 신규 주문 또는 기존 주문 병합 |
| `PUT` | `/orders/{orderId}` | 배송 주소·우편번호 수정 |
| `DELETE` | `/orders/{orderId}` | 주문 취소 |
| `GET` | `/orders?page=0` | 관리자 전체 주문 조회 |
| `GET` | `/orders?email={email}&page=0` | 이메일별 주문 조회 |
| `GET` | `/orders/email?email={email}` | 이메일 주문 존재 여부 확인 |
| `GET` | `/orders/search/product?productName={name}&page=0` | 상품명으로 주문 검색 |
| `GET` | `/orders/search/date?orderDate=YYYY-MM-DD&page=0` | 주문일로 주문 검색 |

### 관리자 통계

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/admin/statistics/revenue/daily` | 일별 매출 조회 |
| `GET` | `/admin/statistics/revenue/monthly` | 월별 매출 조회 |
| `GET` | `/admin/statistics/top-products?limit=3` | 판매량 상위 상품 조회 |

상세 요청·응답 DTO는 [Notion API 명세서](https://app.notion.com/p/acb15a01205483acb54f0127f1fcaaa2)를 참고하세요.

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 상품 조회 및 주문 |
| `/orders` | 이메일 입력을 통한 주문 조회 |
| `/orders/list` | 주문 목록·배송지 수정·주문 취소 |
| `/admin` | 관리자 기본 진입 경로 |
| `/admin/orders` | 관리자 주문 목록·검색 |
| `/admin/products` | 관리자 상품 목록 |
| `/admin/products/add` | 상품 등록 |
| `/admin/products/{id}/edit` | 상품 수정 |
| `/admin/statistics` | 매출 및 판매 통계 대시보드 |

## 테스트 전략

테스트 개수 자체보다 비즈니스 위험과 변경 가능성을 기준으로 테스트 범위를 선정했습니다.

| 계층 | 검증 대상 |
| --- | --- |
| Entity | 동일 상품 수량 합산과 연관관계 설정 |
| Service | 신규 주문, 주문 병합, 상품 미존재 예외, DTO 변환 |
| Repository | 일별·월별 매출과 판매량 상위 상품 집계 |
| Controller | 상품 API 요청 검증과 HTTP 응답 |
| Integration | 실제 트랜잭션 롤백과 DB 저장 |
| Cross-DB | Testcontainers 기반 MySQL 통계 쿼리 실행 |

주문 병합은 이메일·주소·우편번호가 모두 같은 경우와 주소 또는 우편번호가 다른 경우를 각각 테스트합니다. 여러 상품 중 하나가 존재하지 않을 때는 `@SpringBootTest`로 전체 트랜잭션 롤백을 검증합니다.

```bash
cd backend
./gradlew clean test
```

MySQL 통합 테스트는 Docker가 실행 중일 때 Testcontainers로 수행하며, Docker를 사용할 수 없는 환경에서는 자동으로 생략됩니다.

## 주요 문제 해결

### H2와 MySQL의 날짜 함수 차이

- 문제: MySQL의 `DATE()`를 사용하는 일별 집계 쿼리가 H2에서 `Function "DATE" not found`로 실패했습니다.
- 해결: Hibernate가 양쪽 DB에 맞는 SQL을 생성할 수 있도록 `cast(orderDate as LocalDate)`로 변경했습니다.
- 검증: H2 Repository 테스트와 MySQL Testcontainers 통합 테스트를 분리해 실행했습니다.

### Repository 시그니처 변경에 따른 테스트 불일치

- 주문 병합 기준에 주소와 우편번호가 추가되면서 기존 3개 인자 Mock이 실제 5개 인자 호출과 달라졌습니다.
- 상품 검색에 `Specification`이 추가되면서 `findAll(pageable)` 테스트를 `findAll(specification, pageable)` 기준으로 수정했습니다.
- 캐시된 결과가 아닌 전체 상태를 확인하기 위해 `./gradlew clean test`로 회귀 테스트했습니다.

### Next.js 프로덕션 빌드 실패

- 문제: `/orders/list`에서 `useSearchParams()`를 `Suspense` 경계 없이 사용해 프로덕션 사전 렌더링이 실패했습니다.
- 해결: URL 파라미터를 읽는 컴포넌트를 분리하고 외부에 `Suspense`와 로딩 UI를 배치했습니다.
- 결과: TypeScript 검사와 전체 정적 페이지 생성을 포함한 `npm run build`를 통과했습니다.

### 환경별 API 주소 관리

- 문제: 여러 페이지에 `localhost:8080`이 중복되어 배포 환경 전환과 충돌 해결이 어려웠습니다.
- 해결: `NEXT_PUBLIC_API_BASE_URL`과 공통 `API_BASE_URL` 설정으로 요청 주소를 통일하고 `.env.local`은 Git 추적에서 제외했습니다.

### 목록 상태 UX

관리자 주문·상품 목록과 사용자 주문 목록에서 로딩, 오류, 빈 결과를 구분해 표시하도록 개선했습니다. 데이터 요청 중 빈 화면이 노출되거나 네트워크 오류가 정상적인 빈 목록처럼 보이는 문제를 방지했습니다.

## 프로젝트 구조

```text
NBE-14-1-YUKGAEJANG/
├── backend/
│   ├── src/main/java/com/yukgaejang/cafemenu/
│   │   ├── domain/post/
│   │   │   ├── order/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── repository/
│   │   │   │   └── service/
│   │   │   └── product/
│   │   └── global/
│   │       ├── configure/
│   │       ├── exceptionHandler/
│   │       └── util/
│   └── src/test/
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── orders/
│   │   └── _shared/
│   └── public/
└── README.md
```

## 로컬 실행

### 요구 사항

- JDK 25
- Node.js 20 이상
- Docker Desktop — MySQL Testcontainers 실행 시에만 필요

### Backend

```bash
git clone https://github.com/prgrms-be-devcourse/NBE-14-1-YUKGAEJANG.git
cd NBE-14-1-YUKGAEJANG/backend
./gradlew bootRun
```

기본 API 주소는 `http://localhost:8080/api/v1`이며, 로컬 파일형 H2 데이터베이스를 사용합니다.

### Frontend

```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 전체 검증

```bash
# Backend
cd backend
./gradlew clean test

# Frontend
cd ../frontend
npm run lint
npm run check:type
npm run build
```

## 협업 방식

### 브랜치 전략

```text
main          최종 배포 브랜치
dev           기능 통합 브랜치
feat/*        기능 개발
fix/*         버그 수정
test/*        테스트
refactor/*    구조 개선
chore/*       설정 및 운영 작업
```

모든 작업은 기능 브랜치에서 진행하고 `dev`로 Pull Request를 생성합니다. `dev`는 2명 이상의 승인을 받은 후 병합하며, 충돌은 담당자를 정해 한 번에 해결합니다.

### 커밋 컨벤션

| 타입 | 용도 |
| --- | --- |
| `feat:` | 기능 추가 |
| `fix:` | 버그 수정 |
| `test:` | 테스트 추가·수정 |
| `refactor:` | 동작 변경 없는 구조 개선 |
| `docs:` | 문서 변경 |
| `chore:` | 빌드·설정·운영 작업 |

### AI 활용 원칙

요구사항과 비즈니스 규칙은 팀이 먼저 합의하고, AI는 UI 초안, 반복 코드 작성과 오류 분석을 보조하는 도구로 활용했습니다. 생성 결과는 코드 리뷰, 테스트, 로컬 실행과 프로덕션 빌드로 검증했습니다.

## 팀원 및 역할

| 팀원 | 주요 담당 |
| --- | --- |
| 한종연 | 상품 목록, 정렬·페이지네이션, Product 테스트 |
| 송혜민 | 주문 목록, 이메일 조회, 주문 검색, 공통 예외 처리 |
| 이제혁 | 상품 등록·이미지, 관리자 상품 등록 화면 |
| 이태호 | 주문 생성·병합, 통계 집계·대시보드, Order·Global 테스트 |
| 김영우 | 상품·주문 삭제, 마감 시간 유틸, 관리자 화면 및 API 연동 |

## 현재 상태와 향후 개선

### 완료

- 핵심 상품·주문 기능과 프론트엔드 API 연동
- 관리자 주문·상품·통계 화면
- 주문 검색과 페이지네이션
- 주문 병합 정책 및 경계값 테스트
- H2·MySQL 통계 쿼리 호환성 검증
- 백엔드 전체 테스트 및 프론트엔드 프로덕션 빌드 통과

### 향후 개선

- Railway·Vercel 등 클라우드 환경 배포
- 운영 환경의 DB·CORS·로그 설정 분리
- 동시 주문 시 중복 생성 방지를 위한 잠금 또는 DB 제약 검토
- 주문 시점 가격 스냅샷 도입
- 인증·인가를 통한 관리자 API 보호
- 공통 API 요청 모듈을 통한 프론트엔드 `fetch` 중복 제거
