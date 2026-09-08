import { useEffect, useRef, useState } from "react";
import { loadKakaoMapSdk } from "../../../utils/loadKakaoMapSdk";
import "./NearbyMap.css";

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

/**
 * 카카오맵으로 현재 위치 + 주변 장소 마커를 보여준다.
 * center: { lat, lng }, places: [{ id, name, category, latitude, longitude, placeUrl }, ...]
 */
function NearbyMap({ center, places }) {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!KAKAO_JS_KEY) {
      setLoadError(true);
      return undefined;
    }

    let cancelled = false;

    loadKakaoMapSdk(KAKAO_JS_KEY)
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;

        const centerPosition = new kakao.maps.LatLng(center.lat, center.lng);
        const map = new kakao.maps.Map(containerRef.current, {
          center: centerPosition,
          level: 4,
        });

        const centerMarker = new kakao.maps.Marker({
          map,
          position: centerPosition,
          title: "현재 위치",
        });

        const infoWindow = new kakao.maps.InfoWindow({ removable: true });

        kakao.maps.event.addListener(centerMarker, "click", () => {
          infoWindow.setContent(
            `<div class="nearby-map__infowindow"><strong>현재 위치</strong></div>`
          );
          infoWindow.open(map, centerMarker);
        });

        places.forEach((place) => {
          if (place.latitude == null || place.longitude == null) return;

          const marker = new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(place.latitude, place.longitude),
            title: place.name,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            infoWindow.setContent(
              `<div class="nearby-map__infowindow">
                <strong>${place.name}</strong><br/>
                ${place.category} · ${place.distanceMeters}m<br/>
                <a href="${place.placeUrl}" target="_blank" rel="noopener noreferrer">카카오맵에서 보기</a>
              </div>`
            );
            infoWindow.open(map, marker);
            map.setLevel(1);
            map.panTo(marker.getPosition());
          });
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [center, places]);

  if (loadError) {
    return <p className="nearby-map__error">지도를 불러오지 못했어요.</p>;
  }

  return <div ref={containerRef} className="nearby-map" />;
}

export default NearbyMap;
