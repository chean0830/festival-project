# 배포 가이드 — Oracle Cloud Always Free VM (Docker Compose)

프론트 + 백엔드 2개 + MySQL + Redis 를 VM 한 대에서 실행하고, Caddy가 한 도메인 뒤에서
정적 파일 서빙과 리버스 프록시(HTTPS 자동)를 담당한다.

```
https://<도메인>  ─►  web(Caddy)  ─┬─ 정적 SPA (frontend/dist)
                                  └─ /api /oauth2 /login/oauth2 /uploads /ws-chat ─► backend:8080
backend ─► mysql:3306, redis:6379, ai-proxy:8081
```

## 1. VM 준비 (Oracle Cloud)

1. Oracle Cloud 가입 → Compute → Instance 생성
   - Image: **Ubuntu 22.04**
   - Shape: **VM.Standard.A1.Flex** (Ampere ARM), 예: 2 OCPU / 12 GB (Always Free 한도 4 OCPU / 24 GB)
   - ARM 용량 부족 에러가 나면 리전/가용성 도메인을 바꿔 재시도
2. 인스턴스의 **VNIC 보안 목록**(또는 NSG)에 Ingress 규칙 추가: TCP **80**, **443** (0.0.0.0/0)
3. SSH 접속 후:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker $USER && newgrp docker
   # Ubuntu 기본 방화벽(iptables)이 80/443을 막는 경우:
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

## 2. 도메인 (DuckDNS)

1. https://www.duckdns.org 로그인 → 서브도메인 생성 (예: `festlog.duckdns.org`)
2. current ip 를 VM **공인 IP**로 설정
3. 전파 확인: `dig +short festlog.duckdns.org`

## 3. 코드 + 환경변수

```bash
git clone <repo-url> festival && cd festival
git checkout develop            # 또는 배포 대상 브랜치
cp .env.production.example .env
nano .env                       # 아래 값들을 채운다
```

`.env` 필수 값:

| 키 | 설명 |
|---|---|
| `APP_DOMAIN` | `festlog.duckdns.org` (scheme/슬래시 없이) |
| `DB_PASSWORD` | MySQL root 비밀번호 겸 백엔드 접속 비번 |
| `GOOGLE_/KAKAO_/NAVER_CLIENT_ID/SECRET` | 각 OAuth 콘솔 값 |
| `MAIL_*` | SMTP (Gmail 앱 비밀번호 등) |
| `LIVEKIT_URL/API_KEY/API_SECRET` | LiveKit Cloud > Project > Keys |
| `TOSS_SECRET_KEY` | Toss 결제 서버 키 |
| `GEMINI_API_KEY` | AI 챗봇/포스터/일기 (백엔드·ai-proxy 공용) |
| `OPENWEATHER_API_KEY`, `KAKAO_LOCAL_API_KEY` | 날씨 / 내 주변 |
| `VITE_KAKAO_JS_KEY`, `VITE_TOSS_CLIENT_KEY` | 프론트 빌드에 인라인됨 |

## 4. OAuth 리다이렉트 URI 등록

각 콘솔에 아래 URI를 추가 (배포 도메인 기준):

- Google Cloud Console → 사용자 인증 정보 → OAuth 클라이언트:
  `https://<도메인>/login/oauth2/code/google`
- Kakao Developers → 카카오 로그인 → Redirect URI:
  `https://<도메인>/login/oauth2/code/kakao`
  그리고 앱 설정 → 플랫폼 → Web 사이트 도메인에 `https://<도메인>` 추가
- Naver Developers → 로그인 오픈 API → 서비스 URL / Callback URL:
  `https://<도메인>/login/oauth2/code/naver`

> Kakao JS 키 사용 페이지(공유/지도 등)가 있으면 JavaScript 키 도메인에도 `https://<도메인>` 등록.

## 5. 실행

```bash
docker compose up -d --build      # 첫 빌드는 수 분 소요 (Maven + npm)
docker compose logs -f backend    # 기동 로그 확인
```

- MySQL은 **데이터 볼륨이 비어 있을 때만** `database/festival.sql`을 한 번 로드한다.
  스키마를 다시 넣으려면 `docker compose down -v` 후 재기동 (데이터 전부 삭제됨 — 주의).
- Caddy가 첫 요청 시 Let's Encrypt 인증서를 자동 발급한다 (80/443 열려 있어야 함).

## 6. 점검 체크리스트

- [ ] `https://<도메인>` 접속 → SPA 로드, 새로고침해도 라우팅 유지
- [ ] 이메일/소셜 로그인 → 로그인 후 프론트로 복귀, 세션 유지
- [ ] 검색 / 공연·아티스트 상세 데이터 표시
- [ ] 오픈채팅 입장 → 메시지 실시간 송수신 (WebSocket)
- [ ] 프로필 이미지 업로드 → `/uploads/...` 로 표시, 컨테이너 재시작 후에도 유지
- [ ] 결제 테스트 플로우 (Toss 테스트 키)
- [ ] 라이브 입장 (LIVE_PROVIDER=LIVEKIT)

## 7. 갱신 배포

```bash
git pull
docker compose up -d --build
```

## 참고 / 한계

- 업로드 파일은 VM Docker 볼륨에 저장된다. 백업하려면 `uploads` 볼륨을 주기적으로
  tar 로 떠두거나 이후 S3/R2로 옮긴다.
- Redis는 없어도 채팅이 로컬 브로커로 동작한다. 단일 VM이라 필수는 아니지만 포함해 둔다.
- `SPRING_PROFILES_ACTIVE=prod` 는 compose가 주입한다. `prod` + `oauth` + `mail` 프로파일이 함께 활성화된다.
- CORS: 프론트와 API가 같은 도메인(동일 출처)이라 별도 CORS 설정이 필요 없다.
