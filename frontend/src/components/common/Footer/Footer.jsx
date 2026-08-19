import "./Footer.css";

/**
 * 공통 푸터
 * 실제 팀/행사 정보로 내용만 교체하면 된다.
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">FESTIVAL</div>

        <div className="footer__info">
          <p>주최: OO팀 | 문의: contact@example.com</p>
          <p>주소: 서울특별시 OO구 OO로 123</p>
        </div>

        <div className="footer__links">
          <a href="/">인스타그램</a>
          <a href="/">유튜브</a>
        </div>

        <p className="footer__copyright">
          © {new Date().getFullYear()} Festival Team. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
