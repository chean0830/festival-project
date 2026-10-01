<div align="center">

# 🎪 FESTLOG

**페스티벌 정보부터 기록, 라이브, 굿즈 거래까지 한 곳에서 즐기는 페스티벌 커뮤니티 플랫폼**

<br>

<img src="docs/badges/java-25-000000.svg" />
<img src="docs/badges/spring-boot-4-6db33f.svg" />
<img src="docs/badges/spring-security-6db33f.svg" />
<img src="docs/badges/jpa-59666c.svg" />
<img src="docs/badges/mysql-4479a1.svg" />
<img src="docs/badges/redis-ff4438.svg" />
<br>
<img src="docs/badges/react-19-61dafb.svg" />
<img src="docs/badges/vite-646cff.svg" />
<img src="docs/badges/websocket-stomp-010101.svg" />
<img src="docs/badges/livekit-1f1f1f.svg" />
<img src="docs/badges/gemini-8e75b2.svg" />
<img src="docs/badges/toss-payments-0064ff.svg" />

</div>

<br>

## 📑 프로젝트 포트폴리오

<div align="center">
  <img src="docs/portfolio/slide-01.jpg" width="800" />
</div>

<details>
<summary><b>01. 프로젝트 개요</b></summary>
<br>

<img src="docs/portfolio/slide-02.jpg" width="800" />
<img src="docs/portfolio/slide-03.jpg" width="800" />
<img src="docs/portfolio/slide-04.jpg" width="800" />
<img src="docs/portfolio/slide-05.jpg" width="800" />
<img src="docs/portfolio/slide-06.jpg" width="800" />
<img src="docs/portfolio/slide-07.jpg" width="800" />

</details>

<details>
<summary><b>02. 설계와 기술</b></summary>
<br>

<img src="docs/portfolio/slide-08.jpg" width="800" />
<img src="docs/portfolio/slide-09.jpg" width="800" />
<img src="docs/portfolio/slide-10.jpg" width="800" />
<img src="docs/portfolio/slide-11.jpg" width="800" />
<img src="docs/portfolio/slide-12.jpg" width="800" />

</details>

<details>
<summary><b>03. 구현 결과</b></summary>
<br>

<img src="docs/portfolio/slide-13.jpg" width="800" />
<img src="docs/portfolio/slide-14.jpg" width="800" />
<img src="docs/portfolio/slide-15.jpg" width="800" />
<img src="docs/portfolio/slide-16.jpg" width="800" />
<img src="docs/portfolio/slide-17.jpg" width="800" />
<img src="docs/portfolio/slide-18.jpg" width="800" />
<img src="docs/portfolio/slide-19.jpg" width="800" />
<img src="docs/portfolio/slide-20.jpg" width="800" />
<img src="docs/portfolio/slide-21.jpg" width="800" />
<img src="docs/portfolio/slide-22.jpg" width="800" />
<img src="docs/portfolio/slide-23.jpg" width="800" />
<img src="docs/portfolio/slide-24.jpg" width="800" />
<img src="docs/portfolio/slide-25.jpg" width="800" />
<img src="docs/portfolio/slide-26.jpg" width="800" />
<img src="docs/portfolio/slide-27.jpg" width="800" />
<img src="docs/portfolio/slide-28.jpg" width="800" />

</details>

<details>
<summary><b>04. 트러블슈팅</b></summary>
<br>

<img src="docs/portfolio/slide-29.jpg" width="800" />
<img src="docs/portfolio/slide-30.jpg" width="800" />
<img src="docs/portfolio/slide-31.jpg" width="800" />
<img src="docs/portfolio/slide-32.jpg" width="800" />
<img src="docs/portfolio/slide-33.jpg" width="800" />
<img src="docs/portfolio/slide-34.jpg" width="800" />
<img src="docs/portfolio/slide-35.jpg" width="800" />

</details>

<details>
<summary><b>05. 평가와 개선</b></summary>
<br>

<img src="docs/portfolio/slide-36.jpg" width="800" />
<img src="docs/portfolio/slide-37.jpg" width="800" />
<img src="docs/portfolio/slide-38.jpg" width="800" />

</details>

<br>

## 📌 주요 기능

| 분류 | 기능 |
| --- | --- |
| 🎫 **프로그램** | 페스티벌·공연 목록, 장르별 분류, 캘린더, 행사 상세, 아티스트 상세, 행사별 오픈채팅 |
| 🔍 **탐색** | 통합 검색(로마자 검색 지원), 뉴스, 날씨, 주변 맛집, 공연장 지도 |
| 📔 **페스티벌 로그** | 다녀온 페스티벌 기록 작성, 방문 인증과 방문 지도, 배지, AI 포스터 생성 |
| 🎥 **라이브** | 브라우저 카메라로 바로 방송(LiveKit), 유료 입장, 실시간 후원 |
| 🛍 **샵** | MD 굿즈 예약 구매와 결제(토스페이먼츠), 중고거래와 판매자 1:1 채팅 |
| 💬 **커뮤니티** | 게시글 작성·수정, 신고 |
| 🤖 **AI 챗봇** | 질문 의도를 분류해 행사 정보 안내와 맞춤 추천 |
| 🔔 **알림** | 관심 아티스트 공연 알림, 맞춤 추천 알림, 카카오톡 알림 |
| 👤 **회원** | 회원가입, 구글 소셜 로그인, 비밀번호 재설정, 프로필과 활동 내역 |

<br>

## 🏗 구조

```
festival-project
├── src/                 # Spring Boot 메인 서버 (:8080)
├── ai-proxy-server/     # Gemini 호출을 대신하는 AI 프록시 서버 (:8081)
├── frontend/            # React + Vite 웹 클라이언트 (:5173)
├── database/            # 초기 스키마(festival.sql), 마이그레이션, 샘플 데이터
├── db/                  # 기존 DB에 적용하는 업데이트 SQL
└── docs/                # 라이브 방송 설정 가이드
```

- 채팅은 WebSocket(STOMP)으로 주고받고, Redis Pub/Sub으로 여러 서버에 메시지를 전달합니다.
- 프론트엔드 개발 서버는 `/api`, `/oauth2`, `/uploads`, `/ws-chat` 요청을 백엔드(8080)로 넘깁니다.

<br>

## 🚀 실행 방법

### 1. 준비물
- Java 25, Node.js, MySQL, Redis

### 2. DB 만들기
MySQL에서 `database/festival.sql`을 실행해 `festival` DB를 만듭니다.
샘플 데이터가 필요하면 `database/seed_*.sql`도 실행합니다.

### 3. 환경변수 설정
프로젝트 루트의 `.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

| 이름 | 설명 |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL 접속 정보 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | 구글 소셜 로그인 |
| `LIVE_PROVIDER` | `LOCAL`(미리보기만) 또는 `LIVEKIT`(실제 송출) |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | LiveKit Cloud 연결 |
| `TOSS_SECRET_KEY` | 토스페이먼츠 결제 |

> 라이브 방송 설정은 [docs/live-streaming-setup.md](docs/live-streaming-setup.md)를 참고하세요.

### 4. 서버 실행

```bash
# 백엔드 (http://localhost:8080)
./mvnw spring-boot:run

# AI 프록시 서버 (http://localhost:8081)
cd ai-proxy-server && ./mvnw spring-boot:run

# 프론트엔드 (http://localhost:5173)
cd frontend && npm install && npm run dev
```

<br>

## 👥 팀원

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/chean0830">
        <img src="https://github.com/chean0830.png" width="100" /><br>
        <b>chean0830</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/nae442939-prog">
        <img src="https://github.com/nae442939-prog.png" width="100" /><br>
        <b>nae442939-prog</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/stone-iron">
        <img src="https://github.com/stone-iron.png" width="100" /><br>
        <b>stone-iron</b>
      </a>
    </td>
  </tr>
</table>
