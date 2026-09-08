import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import {
  getChatRoomByEvent,
  getChatMessages,
  joinChatRoom,
  leaveChatRoom,
  blockChatMember,
  reportChatMessage,
} from "../api/chatApi";
import { getLastSeenAt, markChatSeen } from "../utils/chatSeen";
import ChatRulesModal from "../components/chat/ChatRulesModal/ChatRulesModal";
import "./OpenChatRoomPage.css";

const HIDE_RULES_STORAGE_KEY = "chat_rules_hidden_until";
const NEAR_BOTTOM_THRESHOLD = 80;
const BUBBLE_TRUNCATE_LENGTH = 160; // 대략 8줄 이상일 때만 "전체 보기"가 뜨도록 (실제 줄바꿈은 CSS line-clamp가 처리)

function isRulesHiddenForToday() {
  const hiddenUntil = localStorage.getItem(HIDE_RULES_STORAGE_KEY);
  if (!hiddenUntil) return false;
  return Date.now() < Number(hiddenUntil);
}

function endOfTodayTimestamp() {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}:${minutes}`;
}

function formatDateDivider(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function getInitial(nickname) {
  return nickname ? nickname.slice(0, 1) : "?";
}

// 참여자가 많아져도 누구 메시지인지 한눈에 구분되도록, 발신자마다 고정된 색을 배정한다.
const SENDER_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#14B8A6", "#EC4899", "#6366F1", "#0EA5E9", "#D97706"];
function colorForMember(memberId) {
  return SENDER_COLORS[Math.abs(memberId) % SENDER_COLORS.length];
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="#fff" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScrollDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LeaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 9v4M12 16.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M10.3 3.9L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 5.5l13 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function OpenChatRoomPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [room, setRoom] = useState(undefined);
  const [loadError, setLoadError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const [showRulesModal, setShowRulesModal] = useState(() => !isRulesHiddenForToday());
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [fullViewMessage, setFullViewMessage] = useState(null);
  const [participantCount, setParticipantCount] = useState(null);

  const clientRef = useRef(null);
  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const unreadCutoffRef = useRef(null);
  const inputRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const joinedRoomIdRef = useRef(null);

  useEffect(() => {
    if (!memberId) return undefined;
    let cancelled = false;
    initialScrollDoneRef.current = false;

    async function load() {
      try {
        const roomData = await getChatRoomByEvent(eventId, memberId);
        if (cancelled) return;
        setRoom(roomData);
        setParticipantCount(roomData.participantCount);
        unreadCutoffRef.current = getLastSeenAt(roomData.roomId);

        if (!roomData.blocked) {
          try {
            const joined = await joinChatRoom(memberId, roomData.roomId);
            if (cancelled) return;
            joinedRoomIdRef.current = roomData.roomId;
            if (joined) setParticipantCount(joined.participantCount);
          } catch {
            // 입장 실패해도(예: 경합으로 뒤늦게 차단됨) 방 조회/기록 읽기는 계속 진행한다.
          }
        }

        const history = await getChatMessages(roomData.roomId);
        if (cancelled) return;
        setMessages(history);

        const client = new Client({
          webSocketFactory: () => new SockJS("/ws-chat"),
          reconnectDelay: 3000,
          onConnect: () => {
            if (cancelled) return;
            setConnected(true);
            client.subscribe(`/topic/chat-rooms/${roomData.roomId}`, (frame) => {
              const received = JSON.parse(frame.body);
              setMessages((prev) => [...prev, received]);
            });
            client.subscribe(`/topic/chat-rooms/${roomData.roomId}/presence`, (frame) => {
              const presence = JSON.parse(frame.body);
              setParticipantCount(presence.participantCount);

              if (presence.type === "JOIN" || presence.type === "LEAVE") {
                setMessages((prev) => [
                  ...prev,
                  {
                    messageId: `system-${Date.now()}-${Math.random()}`,
                    system: true,
                    systemType: presence.type,
                    nickname: presence.nickname,
                    createdAt: new Date().toISOString(),
                  },
                ]);
              }
            });
          },
          onWebSocketClose: () => {
            if (!cancelled) setConnected(false);
          },
        });
        client.activate();
        clientRef.current = client;
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    }

    load();

    return () => {
      cancelled = true;
      clientRef.current?.deactivate();
      clientRef.current = null;
      if (joinedRoomIdRef.current != null) {
        leaveChatRoom(memberId, joinedRoomIdRef.current).catch(() => {});
        joinedRoomIdRef.current = null;
      }
    };
  }, [eventId, memberId]);

  useEffect(() => {
    if (menuOpenFor == null) return undefined;

    function handleClickOutside(e) {
      if (!e.target.closest(".open-chat-page__bubble-wrap")) {
        setMenuOpenFor(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenFor]);

  useEffect(() => {
    const container = messagesRef.current;

    if (!initialScrollDoneRef.current) {
      if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        initialScrollDoneRef.current = true;
      }
    } else {
      const nearBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_THRESHOLD
        : true;

      if (nearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        setShowScrollButton(true);
      }
    }

    if (room && messages.length > 0) {
      markChatSeen(room.roomId, messages[messages.length - 1].createdAt);
    }
  }, [messages, room]);

  function handleMessagesScroll() {
    const container = messagesRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_THRESHOLD;
    setShowScrollButton(!nearBottom);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  }

  function handleHideRulesToday() {
    localStorage.setItem(HIDE_RULES_STORAGE_KEY, String(endOfTodayTimestamp()));
    setShowRulesModal(false);
  }

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !room || !clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: `/app/chat-rooms/${room.roomId}/send`,
      body: JSON.stringify({ memberId, message: trimmed }),
    });
    setInput("");
  }

  async function handleLeave() {
    if (!room) return;
    if (!window.confirm("채팅방을 나가시겠어요?")) return;

    try {
      await leaveChatRoom(memberId, room.roomId);
      joinedRoomIdRef.current = null;
      navigate(-1);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleReport(msg) {
    setMenuOpenFor(null);
    if (!window.confirm(`"${msg.nickname}"님의 메시지를 신고할까요?`)) return;

    try {
      await reportChatMessage(memberId, msg.messageId, "채팅 메시지 신고");
      window.alert("신고했어요. 운영팀이 확인할게요.");
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleBlock(msg) {
    setMenuOpenFor(null);
    if (!window.confirm(`"${msg.nickname}"님을 이 채팅방에서 차단할까요? 더 이상 메시지를 보낼 수 없게 돼요.`)) return;

    try {
      await blockChatMember(memberId, room.roomId, msg.memberId);
      window.alert("차단했어요.");
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (currentMember === undefined) {
    return (
      <Layout hideSubnav hideFooter>
        <div className="open-chat-page">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  return (
    <Layout hideSubnav hideFooter>
      {showRulesModal && (
        <ChatRulesModal
          roomName={room?.roomName}
          onClose={() => setShowRulesModal(false)}
          onHideToday={handleHideRulesToday}
        />
      )}
      <div className="open-chat-page">
        {loadError && <p className="open-chat-page__error">{loadError}</p>}

        {!loadError && (
          <div className="open-chat-page__card">
            <div className="open-chat-page__card-head">
              <div className="open-chat-page__card-head-row">
                <button type="button" className="open-chat-page__back" onClick={() => navigate(-1)}>
                  <BackIcon />
                </button>
                <div className="open-chat-page__title-col">
                  <div className="open-chat-page__eyebrow">FESTLOG · LIVE ROOM</div>
                  <p className="open-chat-page__title">{room ? room.roomName : "오픈채팅"}</p>
                  {participantCount != null && (
                    <div className="open-chat-page__participant">
                      <PeopleIcon />
                      참여자 {participantCount}명
                    </div>
                  )}
                </div>
                <span className={`open-chat-page__status${connected ? " open-chat-page__status--live" : ""}`}>
                  <span className="open-chat-page__status-pulse" />
                  {connected ? "실시간" : "연결 중"}
                </span>
                <button type="button" className="open-chat-page__leave" onClick={handleLeave} aria-label="채팅방 나가기">
                  <LeaveIcon />
                </button>
              </div>
            </div>

            {actionError && <p className="open-chat-page__error open-chat-page__error--inline">{actionError}</p>}

            <div className="open-chat-page__messages" ref={messagesRef} onScroll={handleMessagesScroll}>
              {messages.length === 0 && (
                <p className="open-chat-page__empty">아직 메시지가 없어요. 첫 메시지를 남겨보세요!</p>
              )}
              {messages.map((msg, index) => {
                if (msg.system) {
                  return (
                    <div key={msg.messageId} className="open-chat-page__system-msg">
                      <b>{msg.nickname}</b>님이 {msg.systemType === "JOIN" ? "입장했어요" : "퇴장했어요"}
                    </div>
                  );
                }

                const prev = messages[index - 1];
                const isMine = msg.memberId === memberId;
                const showDateDivider = !prev || !isSameDay(prev.createdAt, msg.createdAt);
                const grouped = !showDateDivider && prev && prev.memberId === msg.memberId;
                const cutoff = unreadCutoffRef.current;
                const showUnreadDivider =
                  cutoff != null &&
                  new Date(msg.createdAt).getTime() > new Date(cutoff).getTime() &&
                  (!prev || new Date(prev.createdAt).getTime() <= new Date(cutoff).getTime());

                return (
                  <Fragment key={msg.messageId}>
                    {showDateDivider && (
                      <div className="open-chat-page__date-divider">
                        <span>{formatDateDivider(msg.createdAt)}</span>
                      </div>
                    )}
                    {showUnreadDivider && (
                      <div className="open-chat-page__unread-divider">
                        <span>여기부터 새 메시지</span>
                      </div>
                    )}
                    <div
                      className={`open-chat-page__message${isMine ? " open-chat-page__message--mine" : ""}${
                        grouped ? " open-chat-page__message--grouped" : ""
                      }`}
                    >
                      <span
                        className="open-chat-page__avatar"
                        style={isMine || msg.profileImage ? undefined : { background: colorForMember(msg.memberId) }}
                      >
                        {msg.profileImage ? <img src={msg.profileImage} alt="" /> : getInitial(msg.nickname)}
                      </span>
                      <div className="open-chat-page__message-col">
                        <span className="open-chat-page__nickname">{msg.nickname}</span>
                        <div className="open-chat-page__bubble-wrap">
                          <div className="open-chat-page__bubble-line">
                            <div className="open-chat-page__bubble">
                              <span
                                className={
                                  msg.message.length > BUBBLE_TRUNCATE_LENGTH
                                    ? "open-chat-page__bubble-text open-chat-page__bubble-text--clamped"
                                    : "open-chat-page__bubble-text"
                                }
                              >
                                {msg.message}
                              </span>
                              {msg.message.length > BUBBLE_TRUNCATE_LENGTH && (
                                <button
                                  type="button"
                                  className="open-chat-page__full-view-btn"
                                  onClick={() => setFullViewMessage(msg)}
                                >
                                  전체 보기
                                  <ChevronRightIcon />
                                </button>
                              )}
                            </div>
                          </div>
                          {!isMine && (
                            <>
                              <button
                                type="button"
                                className={`open-chat-page__more-btn${
                                  menuOpenFor === msg.messageId ? " open-chat-page__more-btn--active" : ""
                                }`}
                                aria-label="메시지 더보기"
                                onClick={() => setMenuOpenFor((cur) => (cur === msg.messageId ? null : msg.messageId))}
                              >
                                <MoreIcon />
                              </button>
                              {menuOpenFor === msg.messageId && (
                                <div className="open-chat-page__menu">
                                  <button type="button" className="open-chat-page__menu-item" onClick={() => handleReport(msg)}>
                                    <ReportIcon />
                                    신고
                                  </button>
                                  <div className="open-chat-page__menu-divider" />
                                  <button
                                    type="button"
                                    className="open-chat-page__menu-item open-chat-page__menu-item--danger"
                                    onClick={() => handleBlock(msg)}
                                  >
                                    <BlockIcon />
                                    차단
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <span className="open-chat-page__time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
              <button
                type="button"
                className="open-chat-page__scroll-bottom"
                onClick={scrollToBottom}
                aria-label="맨 아래로"
              >
                <ScrollDownIcon />
              </button>
            )}

            {room?.blocked ? (
              <p className="open-chat-page__blocked-notice">이 채팅방에서 차단되어 메시지를 보낼 수 없어요.</p>
            ) : (
              <form className="open-chat-page__input-row" onSubmit={handleSend}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder={connected ? "메시지를 입력하세요" : "연결 중..."}
                  disabled={!connected}
                  maxLength={1000}
                />
                <button type="submit" className="open-chat-page__send-btn" disabled={!connected || !input.trim()}>
                  <SendIcon />
                </button>
              </form>
            )}
          </div>
        )}

        {fullViewMessage && (
          <div className="open-chat-page__full-view-backdrop" onClick={() => setFullViewMessage(null)}>
            <div className="open-chat-page__full-view-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="open-chat-page__full-view-head">
                <span className="open-chat-page__full-view-nickname">{fullViewMessage.nickname}</span>
                <span className="open-chat-page__full-view-time">{formatTime(fullViewMessage.createdAt)}</span>
                <button
                  type="button"
                  className="open-chat-page__full-view-close"
                  onClick={() => setFullViewMessage(null)}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <p className="open-chat-page__full-view-body">{fullViewMessage.message}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default OpenChatRoomPage;
