import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.css";

/**
 * 공통 레이아웃
 *
 * 사용 예시 (각 페이지에서):
 *   function Home() {
 *     return (
 *       <Layout>
 *         <section>메인 페이지 콘텐츠...</section>
 *       </Layout>
 *     );
 *   }
 *
 * 다른 팀원들도 자기 페이지를 이 컴포넌트로 감싸면
 * 헤더/푸터가 자동으로 동일하게 적용된다.
 */
function Layout({ children, hideSubnav = false, hideFooter = false }) {
  return (
    <div className="layout">
      <Header hideSubnav={hideSubnav} />
      <main className="layout__content">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default Layout;
