import { useState } from "react";
import "./Header.css";

/**
 * 공통 헤더 (로고 + 메뉴 버튼/네비게이션)
 * - 데스크탑: 가로 메뉴
 * - 모바일: 햄버거 버튼 클릭 시 메뉴 열림/닫힘
 *
 * menuItems는 실제 정보구조(IA) 확정되면 교체
 */
const menuItems = [
  { label: "홈", href: "/" },
  { label: "프로그램", href: "/program" },
  { label: "참가신청", href: "/apply" },
  { label: "오시는길", href: "/location" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner">
        <a href="/" className="header__logo">
          FESTIVAL
        </a>

        {/* 데스크탑 메뉴 */}
        <nav className="header__nav header__nav--desktop">
          {menuItems.map((item) => (
            <a key={item.href} href={item.href} className="header__nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        {/* 모바일 메뉴 버튼 (햄버거) */}
        <button
          className="header__menu-btn"
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMenuOpen && (
        <nav className="header__nav header__nav--mobile">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="header__nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
