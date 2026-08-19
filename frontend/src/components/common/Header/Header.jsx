import { useState } from "react";
import "./Header.css";

/**
 * 공통 헤더 — 두 줄 구조
 * 1줄: 로고(FESTLOG) — 비워둔 가운데 — 검색창 + Login
 * 2줄: 햄버거(전체 메뉴) 버튼 + 공연일정 / 커뮤니티 / MD구매 바로가기
 *
 * 햄버거 버튼을 누르면 왼쪽에서 메뉴 서랍(drawer)이 열리고,
 * 그 안에 프로필(로그인 상태) + 전체 메뉴 목록이 나온다.
 */

// 2줄에 바로 보이는 바로가기 메뉴
const subNavItems = [
  { label: "공연일정", href: "/program" },
  { label: "커뮤니티", href: "/community" },
  { label: "MD구매", href: "/shop" },
];

// 햄버거 눌렀을 때 열리는 전체 메뉴 목록
const drawerMenuItems = [
  { label: "공연일정", href: "/program" },
  { label: "커뮤니티", href: "/community" },
  { label: "MD구매", href: "/shop" },
  { label: "페스티벌 기록", href: "/festival-log" },
  { label: "내 주변 음식점", href: "/nearby-food" },
  { label: "라이브", href: "/live" },
];

// TODO: feature/auth 붙으면 실제 로그인 상태로 교체
const isLoggedIn = false;

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* 1줄: 로고 + 검색 + 로그인 (배경은 화면 끝까지, 안쪽 내용만 살짝 여백을 둠) */}
      <div className="header__top-bar">
        <div className="header__top">
          {/* 로고 — 아이콘 없이 워드마크(텍스트)만. 아이콘은 나중에 다시 정하면 추가하면 됨. */}
          <a href="/" className="header__logo">
            FESTLOG
          </a>

          <div className="header__actions">
            <div className="header__search">
              <svg
                className="header__search-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="header__search-input"
                placeholder="검색어를 입력하세요"
              />
            </div>

            <a href="/login" className="header__login-btn">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Login
            </a>
          </div>
        </div>
      </div>

      {/* 2줄: 햄버거 메뉴 + 바로가기 */}
      <div className="header__subnav">
        <button
          type="button"
          className="header__menu-btn"
          aria-label="전체 메뉴 열기"
          onClick={() => setIsMenuOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <nav className="header__subnav-links">
          {subNavItems.map((item) => (
            <a key={item.href} href={item.href} className="header__subnav-link">
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* 햄버거 눌렀을 때 열리는 메뉴 서랍 */}
      {isMenuOpen && (
        <>
          <div
            className="header__drawer-backdrop"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="header__drawer">
            <button
              type="button"
              className="header__drawer-close"
              aria-label="메뉴 닫기"
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>

            <div className="header__drawer-profile">
              {isLoggedIn ? (
                <p className="header__drawer-profile-text">내 프로필</p>
              ) : (
                <>
                  <p className="header__drawer-profile-text">로그인이 필요해요</p>
                  <a href="/login" className="header__login-btn header__login-btn--sm">
                    Login
                  </a>
                </>
              )}
            </div>

            <nav className="header__drawer-nav">
              {drawerMenuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="header__drawer-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;
