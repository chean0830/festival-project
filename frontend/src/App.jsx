import Home from "./pages/Home";

/**
 * 지금은 라우팅(react-router 등) 없이 메인 화면(Home)만 보여주는 상태.
 * 나중에 로그인/커뮤니티/챗봇 페이지가 생기면
 * react-router-dom을 설치해서 여기서 라우트를 나눠주면 된다.
 */
function App() {
  return <Home />;
}

export default App;
