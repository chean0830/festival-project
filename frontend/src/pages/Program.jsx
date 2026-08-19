import Layout from "../components/common/Layout/Layout";

/**
 * 공연일정 페이지 (준비중)
 * 메인화면의 "더보기"를 누르면 여기로 이동한다.
 * 실제 공연일정 기능이 만들어지면 이 안을 채우면 됨.
 */
function Program() {
  return (
    <Layout>
      <section style={{ textAlign: "center", padding: "120px 0" }}>
        <h1>공연일정</h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          공연일정 페이지는 아직 준비중이에요.
        </p>
      </section>
    </Layout>
  );
}

export default Program;
