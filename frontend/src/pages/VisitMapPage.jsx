import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { getVisitPins } from "../api/visitApi";
import { loadKakaoMapSdk } from "../utils/loadKakaoMapSdk";
import { onVisitsUpdatedElsewhere } from "../utils/visitsChannel";
import "./VisitMapPage.css";

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

function formatRange(startDate, endDate) {
  if (!startDate) return "";
  const [, sm, sd] = startDate.split("-");
  if (!endDate || endDate === startDate) return `${Number(sm)}월 ${Number(sd)}일`;
  const [, em, ed] = endDate.split("-");
  return `${Number(sm)}.${Number(sd)} ~ ${Number(em)}.${Number(ed)}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

function MapPinIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function TicketIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M9 20l-5.5 2V6L9 4m0 16l6 2m-6-2V4m6 18l5.5-2V4L15 6m0 14V4m0 0L9 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VisitMapPage() {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!memberId) return undefined;
    let cancelled = false;

    function load() {
      getVisitPins(memberId)
        .then((data) => {
          if (!cancelled) setPins(data);
        })
        .catch((err) => {
          if (!cancelled) setLoadError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    window.addEventListener("visits:updated", load);
    const stopListeningElsewhere = onVisitsUpdatedElsewhere(load);
    return () => {
      cancelled = true;
      window.removeEventListener("visits:updated", load);
      stopListeningElsewhere();
    };
  }, [memberId]);

  useEffect(() => {
    if (!KAKAO_JS_KEY || !mapContainerRef.current) return undefined;
    const pinsWithCoords = pins.filter((p) => p.latitude != null && p.longitude != null);
    if (pinsWithCoords.length === 0) return undefined;

    let cancelled = false;

    loadKakaoMapSdk(KAKAO_JS_KEY).then((kakao) => {
      if (cancelled || !mapContainerRef.current) return;

      const bounds = new kakao.maps.LatLngBounds();
      const map = new kakao.maps.Map(mapContainerRef.current, {
        center: new kakao.maps.LatLng(pinsWithCoords[0].latitude, pinsWithCoords[0].longitude),
        level: 7,
      });

      const infoWindow = new kakao.maps.InfoWindow({ removable: true });

      pinsWithCoords.forEach((pin) => {
        const position = new kakao.maps.LatLng(pin.latitude, pin.longitude);
        const marker = new kakao.maps.Marker({ map, position, title: pin.eventName });
        bounds.extend(position);

        kakao.maps.event.addListener(marker, "click", () => {
          infoWindow.setContent(
            `<div class="nearby-map__infowindow">
              <strong>${pin.eventName}</strong><br/>
              ${pin.venueName} · ${formatRange(pin.startDate, pin.endDate)}
            </div>`
          );
          infoWindow.open(map, marker);
          map.setLevel(1);
          map.panTo(position);
        });
      });

      map.setBounds(bounds);
    });

    return () => {
      cancelled = true;
    };
  }, [pins]);

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="visit-map-page">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  return (
    <Layout>
      <div className="visit-map-page">
        <div className="visit-map-page__head">
          <span className="visit-map-page__eyebrow">
            <MapPinIcon />
            FESTLOG · MY MAP
          </span>
          <h1 className="visit-map-page__title">
            <TicketIcon color="var(--color-primary)" />
            내 방문 지도
          </h1>
          <p className="visit-map-page__desc">
            GPS로 체크인한 페스티벌들을 지도에서 <span className="visit-map-page__hl">한눈에 확인하세요.</span>
          </p>
        </div>

        {loading && <p className="visit-map-page__message">불러오는 중...</p>}
        {loadError && <p className="visit-map-page__message">방문 기록을 불러오지 못했어요: {loadError}</p>}

        {!loading && !loadError && pins.length === 0 && (
          <div className="empty-card">
            <div className="empty-card__bg">
              <svg viewBox="0 0 640 260" fill="none">
                <path
                  d="M-20 40 C 100 10, 180 90, 300 60 S 480 10, 660 50"
                  stroke="#e4ece2"
                  strokeWidth="2"
                  strokeDasharray="1 10"
                  strokeLinecap="round"
                />
                <path
                  d="M-20 210 C 120 240, 220 170, 340 200 S 520 250, 660 210"
                  stroke="#e4ece2"
                  strokeWidth="2"
                  strokeDasharray="1 10"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="empty-card__pin">
              <MapPinIcon color="var(--color-primary)" />
            </div>

            <p className="empty-card__title">아직 GPS로 체크인한 공연이 없어요</p>
            <p className="empty-card__sub">첫 방문을 기록하고 나만의 페스티벌 지도를 채워보세요</p>

            <div className="steps">
              <div className="step">
                <span className="step__line" />
                <span className="step__num">1</span>
                <p className="step__text">
                  가고 싶은 공연 <b>상세페이지</b>로 들어가세요
                </p>
              </div>
              <div className="step">
                <span className="step__line" />
                <span className="step__num">2</span>
                <p className="step__text">
                  공연 기간 중, 공연장 근처에서{" "}
                  <span className="badge-inline">
                    <MapPinIcon />
                    방문 체크인
                  </span>{" "}
                  버튼을 누르세요
                </p>
              </div>
              <div className="step">
                <span className="step__num">3</span>
                <p className="step__text">
                  위치 권한을 허용하면 <b>체크인 완료!</b>
                </p>
              </div>
            </div>

            <button type="button" className="empty-card__cta" onClick={() => navigate("/program")}>
              공연일정 보러가기
              <ArrowRightIcon />
            </button>
          </div>
        )}

        {!loading && !loadError && pins.length > 0 && (
          <>
            <div className="map-card">
              <div className="map-card__frame">
                <div ref={mapContainerRef} className="map-card__map" />

                <div className="map-card__legend">
                  <MapPinIcon />
                  방문한 페스티벌
                </div>

                <div className="map-card__stat">
                  <span className="map-card__stat-icon">
                    <TicketIcon color="#fff" />
                  </span>
                  <span className="map-card__stat-text">
                    총 <b>{pins.length}</b>번 방문했어요
                  </span>
                </div>
              </div>
            </div>

            <div className="visits">
              <div className="visits__head">
                <h3>방문 기록</h3>
                <span className="visits__sort">최근 순</span>
              </div>

              <div className="visit-panel">
                {pins.map((pin, index) => (
                  <div
                    key={pin.eventId}
                    className="visit-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/program/event/${pin.eventId}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/program/event/${pin.eventId}`);
                    }}
                  >
                    <span className="visit-row__badge">{String(index + 1).padStart(2, "0")}</span>
                    <div className="visit-row__body">
                      <p className="visit-row__title">{pin.eventName}</p>
                      <p className="visit-row__meta">
                        {pin.venueName} <span className="sep">·</span> {formatRange(pin.startDate, pin.endDate)}
                      </p>
                    </div>
                    <span className="visit-row__date">{formatShortDate(pin.startDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default VisitMapPage;
