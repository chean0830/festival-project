import { Link } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import NearbyMap from "../components/common/NearbyMap/NearbyMap";
import useNearbyPlaces from "../hooks/useNearbyPlaces";
import "./NearbyFoodPage.css";

const CATEGORY_GROUPS = [
  { category: "카페", label: "카페", Icon: CafeIcon },
  { category: "음식점", label: "음식점", Icon: FoodIcon },
];

const PROXIMITY_DOT_COUNT = 5;

function proximityFilledCount(distanceMeters) {
  if (distanceMeters == null) return 0;
  return Math.max(0, PROXIMITY_DOT_COUNT - Math.ceil(distanceMeters / 150));
}

function CafeIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9z" stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M17 10.5h1.6a2.3 2.3 0 010 4.6H17" stroke={color} strokeWidth="1.9" />
      <path d="M7 6c0-1 1-1 1-2M11 6c0-1 1-1 1-2M15 6c0-1 1-1 1-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FoodIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 3v6a2 2 0 002 2v10M6 3v10M9 3v6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3c-1.5 1-2 3-2 5s.7 3.5 2 4v9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="#0f5c30" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M12 5l-4 4M12 5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RestSpotIcon({ color = "currentColor" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 21c1-3 3-4 8-4s7 1 8 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 14a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth="1.8" />
      <path d="M8 4c-1 1-1 2-.3 3M16 4c1 1 1 2 .3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RadiusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlaceRow({ place, isNearest, isRestaurant, Icon }) {
  const filled = proximityFilledCount(place.distanceMeters);

  return (
    <a
      className={`place-row${isRestaurant ? " place-row--restaurant" : ""}`}
      href={place.placeUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="place-row__icon">
        <Icon color="#fff" />
        {isNearest && (
          <span className="rank-badge">
            <CheckIcon />
          </span>
        )}
      </span>
      <div className="place-row__info">
        <div className="place-row__name-line">
          <span className="place-row__name">{place.name}</span>
          {isNearest && <span className="nearest-tag">가장 가까워요</span>}
        </div>
        <p className="place-row__addr">
          <PinIcon />
          {place.address}
        </p>
      </div>
      <div className="place-row__right">
        <span className="place-row__dist">
          {place.distanceMeters}
          <span>m</span>
        </span>
        <span className="proximity">
          {Array.from({ length: PROXIMITY_DOT_COUNT }).map((_, i) => (
            <i key={i} className={i < filled ? "on" : ""} />
          ))}
        </span>
      </div>
    </a>
  );
}

function PlaceGroup({ category, label, Icon, places }) {
  if (places.length === 0) return null;
  const isRestaurant = category === "음식점";

  return (
    <div className={`section${isRestaurant ? " section--restaurant" : ""}`}>
      <div className="section__head">
        <span className="section__tile">
          <Icon color="#fff" />
        </span>
        <h2>{label}</h2>
        <span className="section__count">{places.length}곳</span>
        <span className="section__sort">
          <SortIcon />
          가까운 순
        </span>
      </div>

      <div className="panel">
        {places.map((place, index) => (
          <PlaceRow key={place.id} place={place} isNearest={index === 0} isRestaurant={isRestaurant} Icon={Icon} />
        ))}
      </div>
    </div>
  );
}

/**
 * 내 주변 쉼표 전체 페이지 (헤더 전체메뉴 / 홈 "내 주변 쉼표" 더보기로 진입).
 */
function NearbyFoodPage() {
  const { status, places, center } = useNearbyPlaces();

  return (
    <Layout>
      <div className="nearby-food-page">
        <Link to="/" className="nearby-food-page__back">
          ‹ 홈
        </Link>
        <span className="nearby-food-page__eyebrow">
          <CompassIcon />
          FESTLOG · NEARBY
        </span>
        <h1 className="nearby-food-page__title">
          <RestSpotIcon color="var(--color-secondary)" />
          내 주변 쉼표
        </h1>
        <p className="nearby-food-page__desc">
          페스티벌 다녀오느라 지친 발걸음, <span className="nearby-food-page__hl">근처 카페와 밥집에서 잠깐 쉬어가세요.</span>
        </p>

        {status === "loading" && <p className="nearby-food-page__message">현재 위치를 확인하는 중...</p>}

        {(status === "unsupported" || status === "denied" || status === "error") && (
          <p className="nearby-food-page__message">
            {status === "denied"
              ? "위치 권한을 허용하면 주변 쉼표를 볼 수 있어요."
              : "주변 정보를 불러오지 못했어요."}
          </p>
        )}

        {status === "ready" && places.length === 0 && (
          <p className="nearby-food-page__message">주변에 등록된 곳이 없어요.</p>
        )}

        {status === "ready" && center && (
          <div className="map-card">
            <div className="map-card__frame">
              <NearbyMap center={center} places={places} />

              <div className="map-card__radius">
                <RadiusIcon />
                반경 1km
              </div>

              <div className="map-card__legend">
                <span className="map-card__legend-item">
                  <span className="map-card__legend-dot cafe" />
                  카페
                </span>
                <span className="map-card__legend-sep" />
                <span className="map-card__legend-item">
                  <span className="map-card__legend-dot food" />
                  음식점
                </span>
              </div>

              <div className="map-card__me">
                <span className="map-card__me-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" fill="#fff" />
                  </svg>
                </span>
                <span className="map-card__me-text">현재 내 위치</span>
              </div>
            </div>
          </div>
        )}

        {status === "ready" &&
          CATEGORY_GROUPS.map(({ category, label, Icon }) => (
            <PlaceGroup
              key={category}
              category={category}
              label={label}
              Icon={Icon}
              places={places.filter((place) => place.category === category)}
            />
          ))}
      </div>
    </Layout>
  );
}

export default NearbyFoodPage;
