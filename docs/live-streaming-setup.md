# FESTLOG 라이브 연결 방법

기본 방식은 OBS 없이 브라우저 카메라와 마이크를 LiveKit Cloud 미디어 서버로 연결합니다.
LiveKit API Secret은 Spring Boot 백엔드에서만 사용하고 React에는 노출하지 않습니다.

## 1. 기존 로컬 DB 업데이트

이미 `festival` DB를 만든 팀원은 MySQL Workbench에서 아래 파일을 한 번 실행합니다.

```text
database/migrations/V4__live_stream_host.sql
database/migrations/V202608211000__sc_browser_live_source.sql
database/migrations/V202608261100__live_donation.sql
database/migrations/V202608271000__live_paid_entry.sql
```

`database/festival.sql`로 DB를 새로 만드는 경우에는 위 파일을 다시 실행하지 않습니다.

## 2. LiveKit Cloud 무료 프로젝트 연결

## 방송 모드 선택

프로젝트 루트의 `.env`에서 방송 모드를 선택합니다.

```env
LIVE_PROVIDER=LOCAL
```

- `LOCAL`: 방송자 카메라 미리보기만 실행하며 LiveKit 사용량이 발생하지 않습니다.
- `LIVEKIT`: LiveKit Cloud를 통해 여러 시청자에게 실제 영상을 송출합니다.

`LIVE_PROVIDER`를 작성하지 않은 경우에도 기본값은 `LOCAL`입니다. 값을 바꾼 뒤에는 백엔드를 재시작해야 합니다.

## LiveKit Cloud 연결

1. `https://cloud.livekit.io`에서 로그인하고 무료 Build 플랜 프로젝트를 만듭니다.
2. 프로젝트의 `Settings > Keys`에서 WebSocket URL, API Key, API Secret을 확인합니다.
3. 프로젝트 루트 `.env`에 아래 값을 추가합니다.

```dotenv
LIVE_PROVIDER=LIVEKIT
LIVEKIT_URL=wss://프로젝트주소.livekit.cloud
LIVEKIT_API_KEY=발급받은_API_KEY
LIVEKIT_API_SECRET=발급받은_API_SECRET
```

`.env`는 GitHub에 커밋하지 않습니다. 팀원은 각자 같은 변수 이름으로 전달받은 값을 넣습니다.

환경변수를 적용해 백엔드를 실행합니다.

```bash
set -a
source .env
set +a
./mvnw spring-boot:run
```

## 3. 브라우저에서 바로 방송

1. `http://localhost:5173/live/new`에서 `브라우저로 바로 방송`을 선택합니다.
2. 공연과 제목을 입력하고 방송을 만듭니다.
3. 방송 관리 화면에서 `카메라·마이크 시작`을 누릅니다.
4. 브라우저의 카메라와 마이크 권한을 허용합니다.
5. 미리보기를 확인하고 `방송 시작`을 누릅니다.
6. 다른 브라우저나 시크릿 창에서 라이브 목록을 열어 시청합니다.

카메라 기능은 `localhost` 또는 HTTPS 환경에서만 사용할 수 있습니다. 방송자의 영상은
LiveKit Cloud로 한 번 전송되고, 시청자는 LiveKit Cloud에서 영상을 받습니다.

## 4. 방송 종료

1. FESTLOG에서 `방송 종료`를 누릅니다.
2. 방송은 라이브 목록에서 즉시 제외됩니다.
3. 방송 페이지가 닫히면서 LiveKit Cloud 영상 연결도 종료됩니다.

## 5. 유료 방송 입장 테스트

유료 방송 결제는 후원 기능과 같은 Toss Payments 테스트 키를 사용합니다.

```dotenv
# 프로젝트 루트 .env
TOSS_SECRET_KEY=test_sk_...

# frontend/.env
VITE_TOSS_CLIENT_KEY=test_ck_...
```

1. 관리자 계정으로 방송을 만들 때 `유료 방송`과 입장료를 선택합니다.
2. 방송을 시작합니다.
3. 시크릿 창에서 다른 회원 계정으로 로그인해 방송에 들어갑니다.
4. 입장권을 테스트 결제하고 방송으로 돌아갑니다.
5. 같은 회원으로 다시 입장했을 때 추가 결제 없이 영상이 연결되는지 확인합니다.

유료 방송은 프론트 화면뿐 아니라 LiveKit 토큰 발급 API에서도 결제 완료 여부를 확인합니다.
