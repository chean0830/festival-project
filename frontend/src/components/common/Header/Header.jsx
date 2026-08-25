import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "../../../api/searchApi";
import SearchDropdown from "../../search/SearchDropdown/SearchDropdown";
import useCurrentMember from "../../../features/profile/hooks/useCurrentMember";
import { logout } from "../../../api/authApi";
import NotificationBell from "../../../features/notification/components/NotificationBell";
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
  { label: "MD 사전예약", href: "/shop/preorder" },
];

// 햄버거 눌렀을 때 열리는 전체 메뉴 목록
const drawerMenuItems = [
  { label: "공연일정", href: "/program" },
  { label: "커뮤니티", href: "/community" },
  { label: "MD구매", href: "/shop" },
  { label: "MD 사전예약", href: "/shop/preorder" },
  { label: "페스티벌 기록", href: "/festival-log" },
  { label: "내 주변 쉼표", href: "/nearby-food" },
  { label: "내 방문 지도", href: "/visits/map" },
  { label: "라이브", href: "/live" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const currentMember = useCurrentMember();
  const isLoggedIn = Boolean(currentMember?.memberId);

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  // 검색창 바깥을 클릭하면 드롭다운을 닫는다.
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchResults, setSearchResults] = useState([]);

  // 입력할 때마다 바로 요청하지 않고, 타이핑이 멈추고 250ms 지나면 검색한다.
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      search(trimmed)
        .then((data) => {
          if (!cancelled) setSearchResults(data);
        })
        .catch(() => {
          if (!cancelled) setSearchResults([]);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  function goToSearchPage(term) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setIsSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    goToSearchPage(searchTerm);
  }

  function handleSelectResult(item) {
    setSearchTerm(item.name);
    goToSearchPage(item.name);
  }

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
            <div className="header__search" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
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
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (searchTerm.trim()) setIsSearchOpen(true);
                  }}
                />
              </form>

              {isSearchOpen && searchTerm.trim() && (
                <SearchDropdown
                  results={searchResults}
                  query={searchTerm}
                  onSelect={handleSelectResult}
                  onViewAll={() => goToSearchPage(searchTerm)}
                />
              )}
            </div>

            {isLoggedIn ? (
              <div className="header__account">
                <NotificationBell />
                <a href="/profile" className="header__profile-btn">
                  내 프로필
                </a>
                <button type="button" className="header__logout-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            ) : (
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
            )}
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
                <>
                  <a
                    href="/profile"
                    className="header__drawer-profile-text"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    내 프로필
                  </a>
                  <button
                    type="button"
                    className="header__logout-btn header__login-btn--sm"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
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
