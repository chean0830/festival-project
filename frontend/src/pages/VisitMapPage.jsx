import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { getVisitPins } from "../api/visitApi";
import { loadKakaoMapSdk } from "../utils/loadKakaoMapSdk";
import "./VisitMapPage.css";

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

function VisitMapPage() {
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!memberId) return undefined;
    let cancelled = false;

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

    return () => {
      cancelled = true;
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

      pinsWithCoords.forEach((pin) => {
        const position = new kakao.maps.LatLng(pin.latitude, pin.longitude);
        new kakao.maps.Marker({ map, position, title: pin.eventName });
        bounds.extend(position);
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
      <section className="visit-map-page">
        <Link to="/" className="visit-map-page__back">
          ‹ 홈
        </Link>
        <h1>내 방문 지도</h1>
        <p className="visit-map-page__desc">GPS로 체크인한 페스티벌들을 지도에서 한눈에 확인하세요.</p>

        {loading && <p className="visit-map-page__message">불러오는 중...</p>}
        {loadError && <p className="visit-map-page__message">방문 기록을 불러오지 못했어요: {loadError}</p>}

        {!loading && !loadError && pins.length === 0 && (
          <p className="visit-map-page__message">아직 GPS로 체크인한 공연이 없어요. 공연장에 가서 체크인해보세요!</p>
        )}

        {!loading && !loadError && pins.length > 0 && (
          <>
            <div ref={mapContainerRef} className="visit-map-page__map" />

            <p className="visit-map-page__count">
              총 <strong>{pins.length}</strong>번 방문했어요
            </p>

            <ul className="visit-map-page__list">
              {pins.map((pin) => (
                <li key={pin.eventId} className="visit-map-page__item">
                  <span className="visit-map-page__item-name">{pin.eventName}</span>
                  <span className="visit-map-page__item-meta">
                    {pin.venueName} · {formatDate(pin.startDate)} - {formatDate(pin.endDate)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </Layout>
  );
}

export default VisitMapPage;
