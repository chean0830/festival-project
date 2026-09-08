import "./ChatRulesModal.css";

const BARCODE_BARS = [
  { w: 2, h: 100 }, { w: 1, h: 70 }, { w: 3, h: 100 }, { w: 1, h: 55 },
  { w: 2, h: 100 }, { w: 1, h: 80 }, { w: 1, h: 100 }, { w: 3, h: 60 },
  { w: 2, h: 100 }, { w: 1, h: 90 }, { w: 2, h: 100 }, { w: 3, h: 65 },
  { w: 1, h: 100 }, { w: 1, h: 75 }, { w: 2, h: 100 }, { w: 1, h: 55 },
  { w: 3, h: 100 }, { w: 2, h: 85 }, { w: 1, h: 100 }, { w: 2, h: 60 },
  { w: 1, h: 100 }, { w: 3, h: 70 }, { w: 1, h: 100 }, { w: 2, h: 90 },
];

/**
 * 오픈채팅방 입장 시 자동으로 뜨는 이용 규칙 안내 모달.
 * CommunityRulesModal과 같은 티켓 컨셉 디자인을 공유한다.
 * "확인했어요"는 이번만 닫고, "오늘 하루 보지 않기"는 자정까지 다시 안 뜨게 한다 (OpenChatRoomPage에서 처리).
 */
function ChatRulesModal({ roomName, onClose, onHideToday }) {
  return (
    <div className="chat-rules-modal__backdrop" onClick={onClose}>
      <div className="chat-rules-modal__stage" onClick={(event) => event.stopPropagation()}>
        <div
          className="chat-rules-modal__ticket"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-rules-title"
        >
          <div className="chat-rules-modal__watermark" aria-hidden="true">
            FESTLOG
          </div>
          <div className="chat-rules-modal__fold" aria-hidden="true" />

          <div className="chat-rules-modal__head">
            <div className="chat-rules-modal__holo-strip" aria-hidden="true" />
            <div className="chat-rules-modal__eyebrow">
              <span>FESTLOG · OPEN CHAT PASS</span>
              <span className="chat-rules-modal__pill">ADMIT ALL</span>
            </div>
            <h1 id="chat-rules-title" className="chat-rules-modal__title">
              {roomName ? `${roomName} 입장 전, 규칙 확인` : "오픈채팅 입장 전, 규칙 확인"}
            </h1>
            <p className="chat-rules-modal__subtitle">
              함께 쓰는 실시간 채팅방이에요. 아래 내용을 확인하고 입장해주세요.
            </p>
            <div className="chat-rules-modal__stamp" aria-hidden="true">
              <span>
                VERIFIED
                <br />
                ENTRY
              </span>
            </div>
          </div>

          <div className="chat-rules-modal__perf" aria-hidden="true" />

          <div className="chat-rules-modal__body">
            <div className="chat-rules-modal__rule-block">
              <div className="chat-rules-modal__rule-label">채팅 예절</div>
              <ul className="chat-rules-modal__stub-list">
                <li>
                  <span className="chat-rules-modal__num">01</span>서로를 존중하는 언어를 사용해주세요.
                </li>
                <li>
                  <span className="chat-rules-modal__num">02</span>도배, 광고성 메시지는 삼가주세요.
                </li>
                <li>
                  <span className="chat-rules-modal__num">03</span>연락처, 계좌 등 개인정보 공유는 주의해주세요.
                </li>
                <li>
                  <span className="chat-rules-modal__num">04</span>보낸 메시지는 채팅방의 모든 참여자에게
                  실시간으로 보여요.
                </li>
              </ul>
            </div>

            <div className="chat-rules-modal__rule-block">
              <div className="chat-rules-modal__rule-label">채팅 관리 기준</div>
              <ul className="chat-rules-modal__stub-list chat-rules-modal__stub-list--danger">
                <li>
                  <span className="chat-rules-modal__num">01</span>욕설·비방 등 금칙어는 자동으로 가려질 수
                  있어요.
                </li>
                <li>
                  <span className="chat-rules-modal__num">02</span>불편한 메시지는 신고하거나 해당 사용자를
                  차단할 수 있어요.
                </li>
                <li>
                  <span className="chat-rules-modal__num">03</span>언제든 채팅방을 나갈 수 있어요.
                </li>
                <li>
                  <span className="chat-rules-modal__num">04</span>반복 위반 시 사전 통보 없이 이용이 제한될 수
                  있습니다.
                </li>
              </ul>
            </div>
          </div>

          <div className="chat-rules-modal__auth-row">
            <div className="chat-rules-modal__meta-inline">
              <span>GATE OPEN CHAT</span>
              <span>NO. FL-2026</span>
            </div>
            <div className="chat-rules-modal__barcode-col">
              <div className="chat-rules-modal__barcode-wrap" aria-hidden="true">
                {BARCODE_BARS.map((bar, index) => (
                  <span key={index} style={{ width: `${bar.w}px`, height: `${bar.h}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="chat-rules-modal__footer">
            <button type="button" className="chat-rules-modal__skip-link" onClick={onHideToday}>
              오늘 하루 보지 않기
            </button>
            <button type="button" className="chat-rules-modal__confirm-btn" onClick={onClose}>
              확인했어요 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRulesModal;
