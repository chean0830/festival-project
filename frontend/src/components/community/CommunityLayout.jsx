import { useState } from "react";
import { Outlet } from "react-router-dom";
import CommunityRulesModal from "./CommunityRulesModal/CommunityRulesModal";

const HIDE_RULES_STORAGE_KEY = "community_rules_hidden_until";

function isHiddenForToday() {
  const hiddenUntil = localStorage.getItem(HIDE_RULES_STORAGE_KEY);
  if (!hiddenUntil) return false;
  return Date.now() < Number(hiddenUntil);
}

function endOfTodayTimestamp() {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
}

/**
 * 커뮤니티 섹션(/community/**) 전체를 감싸는 레이아웃 라우트.
 * 커뮤니티 안에서 글쓰기/상세로 이동하는 동안에는 이 컴포넌트가 계속 마운트된 상태라
 * 규칙 모달을 한 번만 보여주고, 다른 메뉴(공연일정 등)로 나갔다가 다시 들어오면
 * 이 컴포넌트가 새로 마운트되면서 모달이 다시 뜬다.
 */
function CommunityLayout() {
  const [showRulesModal, setShowRulesModal] = useState(() => !isHiddenForToday());

  function handleHideToday() {
    localStorage.setItem(HIDE_RULES_STORAGE_KEY, String(endOfTodayTimestamp()));
    setShowRulesModal(false);
  }

  return (
    <>
      {showRulesModal && (
        <CommunityRulesModal
          onClose={() => setShowRulesModal(false)}
          onHideToday={handleHideToday}
        />
      )}
      <Outlet />
    </>
  );
}

export default CommunityLayout;
