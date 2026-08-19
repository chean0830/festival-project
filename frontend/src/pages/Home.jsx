import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";

/**
 * 메인 화면
 * 실제 콘텐츠(행사 소개, 일정, 하이라이트 등)로 채워 넣으면 된다.
 */
function Home() {
  return (
    <Layout>
      <section style={{ textAlign: "center", padding: "60px 0" }}>
        <h1 style={{ fontSize: "var(--font-size-xxl)" }}>페스티벌 이름</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          행사 소개 한 줄 설명이 여기 들어갑니다.
        </p>
        <Button size="lg">참가 신청하기</Button>
      </section>
    </Layout>
  );
}

export default Home;
