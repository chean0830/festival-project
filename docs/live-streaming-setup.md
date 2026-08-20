# OBS + YouTube 라이브 연결 방법

FESTLOG는 영상을 직접 중계하지 않습니다. OBS가 YouTube로 영상을 보내고,
FESTLOG는 YouTube 영상을 웹페이지에 표시합니다.

## 1. 기존 로컬 DB 업데이트

이미 `festival` DB를 만든 팀원은 MySQL Workbench에서 아래 파일을 한 번 실행합니다.

```text
database/migrations/V4__live_stream_host.sql
database/migrations/V5__youtube_connection.sql
```

`database/festival.sql`로 DB를 새로 만드는 경우에는 V4, V5를 다시 실행하지 않습니다.

## 2. Google Cloud 설정

1. Google Cloud Console에서 `YouTube Data API v3`를 사용 설정합니다.
2. 기존 FESTLOG 웹 OAuth 클라이언트의 승인된 리디렉션 URI에 아래 주소를 추가합니다.

```text
http://localhost:8080/api/youtube/oauth/callback
```

3. OAuth 동의 화면이 테스트 상태라면 방송할 팀원의 Google 이메일을 테스트 사용자로 추가합니다.
4. 프로젝트 루트 `.env`에 아래 값을 추가합니다.

```dotenv
YOUTUBE_CLIENT_ID=Google-OAuth-클라이언트-ID
YOUTUBE_CLIENT_SECRET=Google-OAuth-클라이언트-보안비밀
YOUTUBE_REDIRECT_URI=http://localhost:8080/api/youtube/oauth/callback
YOUTUBE_TOKEN_ENCRYPTION_KEY=32자-이상의-무작위-문자열
```

암호화 키는 아래 명령으로 만들 수 있습니다.

```bash
openssl rand -base64 32
```

`.env`의 실제 인증정보는 GitHub에 커밋하지 않습니다.

## 3. 회원 YouTube 연결 및 방송 자동 생성

1. `http://localhost:5173/live/new`에서 `YouTube 연결`을 누릅니다.
2. 방송에 사용할 회원 본인의 Google/YouTube 계정으로 동의합니다.
3. FESTLOG가 해당 채널의 라이브 권한을 확인합니다.
4. 공연과 방송 정보를 입력하고 `방송 만들기`를 누릅니다.
5. FESTLOG가 YouTube 방송과 스트림을 자동 생성하고 OBS 서버 주소와 스트림 키를 한 번 표시합니다.

스트림 키는 DB에 저장하지 않으며 다른 사람에게 공유하면 안 됩니다.

새 YouTube 채널은 최초 라이브 활성화에 최대 24시간이 걸릴 수 있습니다.

### 기존 방송 주소 직접 연결

1. YouTube Studio에서 `만들기 > 실시간 스트리밍 시작`을 선택합니다.
2. 스트림을 만든 뒤 스트림 키를 확인합니다.
3. 스트림 키는 OBS에만 입력하고, 코드·DB·GitHub에는 절대 올리지 않습니다.
4. YouTube 방송의 공유 주소(`https://www.youtube.com/watch?v=...`)를 복사합니다.

## 4. OBS 설정

1. OBS `설정 > 방송`으로 이동합니다.
2. 서비스는 `YouTube - RTMPS`를 선택합니다.
3. 계정 연결 또는 YouTube Studio의 스트림 키를 입력합니다.
4. 화면/카메라/마이크 소스를 추가합니다.
5. `방송 시작`을 눌러 YouTube Studio 미리보기가 나오는지 확인합니다.

## 5. FESTLOG 방송 시작

1. `http://localhost:5173/live`에 접속합니다.
2. 로그인 후 `방송 만들기`를 누릅니다.
3. 자동 생성 또는 기존 주소 입력 방식을 선택하고 공연과 제목을 입력합니다.
4. OBS와 YouTube 송출을 먼저 확인합니다.
5. FESTLOG 방송 관리 화면에서 `방송 시작 상태로 변경`을 누릅니다.

이때부터 다른 회원과 비회원의 라이브 목록에 방송이 표시됩니다.

## 6. 방송 종료

1. FESTLOG에서 `방송 종료`를 누릅니다.
2. 방송은 라이브 목록에서 즉시 제외됩니다.
3. OBS와 YouTube Studio에서도 실제 송출을 종료합니다.

FESTLOG 버튼은 사이트의 공개 상태를 관리하고, 실제 영상 송출 시작·종료는
OBS와 YouTube Studio에서 별도로 관리합니다.
