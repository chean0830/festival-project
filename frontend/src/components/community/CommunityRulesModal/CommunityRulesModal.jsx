import "./CommunityRulesModal.css";

// 하단 바코드 장식용 막대 (너비/높이 랜덤한 느낌을 주기 위한 고정 패턴)
const BARCODE_BARS = [
  { w: 2, h: 100 }, { w: 1, h: 70 }, { w: 3, h: 100 }, { w: 1, h: 55 },
  { w: 2, h: 100 }, { w: 1, h: 80 }, { w: 1, h: 100 }, { w: 3, h: 60 },
  { w: 2, h: 100 }, { w: 1, h: 90 }, { w: 2, h: 100 }, { w: 3, h: 65 },
  { w: 1, h: 100 }, { w: 1, h: 75 }, { w: 2, h: 100 }, { w: 1, h: 55 },
  { w: 3, h: 100 }, { w: 2, h: 85 }, { w: 1, h: 100 }, { w: 2, h: 60 },
  { w: 1, h: 100 }, { w: 3, h: 70 }, { w: 1, h: 100 }, { w: 2, h: 90 },
];

/**
 * 커뮤니티 진입 시 자동으로 뜨는 이용 규칙 안내 모달.
 * 실제 페스티벌/콘서트 티켓 컨셉 디자인 (워터마크, 홀로그램 스트립, 절취선, 바코드, 서명란).
 * "확인했어요"는 이번만 닫고, "오늘 하루 보지 않기"는 자정까지 다시 안 뜨게 한다 (CommunityLayout에서 처리).
 */
function CommunityRulesModal({ onClose, onHideToday }) {
  return (
    <div className="community-rules-modal__backdrop" onClick={onClose}>
      <div className="community-rules-modal__stage" onClick={(event) => event.stopPropagation()}>
        <div
          className="community-rules-modal__ticket"
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-rules-title"
        >
          <div className="community-rules-modal__watermark" aria-hidden="true">
            FESTLOG
          </div>
          <div className="community-rules-modal__fold" aria-hidden="true" />

          <div className="community-rules-modal__head">
            <div className="community-rules-modal__holo-strip" aria-hidden="true" />
            <div className="community-rules-modal__eyebrow">
              <span>FESTLOG · COMMUNITY PASS</span>
              <span className="community-rules-modal__pill">ADMIT ALL</span>
            </div>
            <h1 id="community-rules-title" className="community-rules-modal__title">
              커뮤니티 입장 전, 규칙 확인
            </h1>
            <p className="community-rules-modal__subtitle">
              모두가 즐거운 공간이 되도록, 아래 내용을 확인하고 입장해주세요.
            </p>
            <div className="community-rules-modal__stamp" aria-hidden="true">
              <span>
                VERIFIED
                <br />
                ENTRY
              </span>
            </div>
          </div>

          <div className="community-rules-modal__perf" aria-hidden="true" />

          <div className="community-rules-modal__body">
            <div className="community-rules-modal__rule-block">
              <div className="community-rules-modal__rule-label">규칙 안내</div>
              <ul className="community-rules-modal__stub-list">
                <li>
                  <span className="community-rules-modal__num">01</span>서로를 존중하는 언어를 사용해주세요.
                </li>
                <li>
                  <span className="community-rules-modal__num">02</span>공연·페스티벌과 관련 없는 광고, 홍보성
                  게시글은 삼가주세요.
                </li>
                <li>
                  <span className="community-rules-modal__num">03</span>타인의 개인정보(연락처, 계좌 등)를
                  게시글·댓글에 공개하지 마세요.
                </li>
                <li>
                  <span className="community-rules-modal__num">04</span>동행 모집 등은 안전을 위해 개인 정보
                  교환에 주의해주세요.
                </li>
              </ul>
            </div>

            <div className="community-rules-modal__rule-block">
              <div className="community-rules-modal__rule-label">부적절한 게시글 및 댓글 관리 기준</div>
              <ul className="community-rules-modal__stub-list community-rules-modal__stub-list--danger">
                <li>
                  <span className="community-rules-modal__num">01</span>욕설, 비방, 혐오 표현이 포함된 게시글·댓글
                </li>
                <li>
                  <span className="community-rules-modal__num">02</span>불법 거래, 도배, 스팸성 광고 게시글
                </li>
                <li>
                  <span className="community-rules-modal__num">03</span>허위 정보 유포 또는 타인을 사칭하는 게시글
                </li>
                <li>
                  <span className="community-rules-modal__num">04</span>위 사항 위반 시 사전 통보 없이 삭제될 수
                  있으며, 반복 시 이용이 제한될 수 있습니다.
                </li>
              </ul>
            </div>
          </div>

          <div className="community-rules-modal__auth-row">
            <div className="community-rules-modal__meta-inline">
              <span>GATE COMMUNITY</span>
              <span>NO. FL-2026</span>
            </div>
            <div className="community-rules-modal__barcode-col">
              <div className="community-rules-modal__barcode-wrap" aria-hidden="true">
                {BARCODE_BARS.map((bar, index) => (
                  <span key={index} style={{ width: `${bar.w}px`, height: `${bar.h}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="community-rules-modal__footer">
            <button type="button" className="community-rules-modal__skip-link" onClick={onHideToday}>
              오늘 하루 보지 않기
            </button>
            <button type="button" className="community-rules-modal__confirm-btn" onClick={onClose}>
              확인했어요 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityRulesModal;
