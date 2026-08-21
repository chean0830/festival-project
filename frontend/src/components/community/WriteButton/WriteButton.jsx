import "./WriteButton.css";

/**
 * 커뮤니티 "글쓰기" 버튼. 연필 아이콘 + 텍스트, 호버 시 밑줄이 그려지는 애니메이션.
 */
function WriteButton({ onClick }) {
  return (
    <button type="button" className="write-btn" onClick={onClick}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 20l1.2-4.4L15.8 5 19 8.2 8.4 18.8 4 20z"
          stroke="#0f5c30"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      글쓰기
      <svg className="write-btn__underline" viewBox="0 0 70 6" preserveAspectRatio="none" aria-hidden="true">
        <path d="M1 3 Q 20 6 35 3 T 69 3" />
      </svg>
    </button>
  );
}

export default WriteButton;
