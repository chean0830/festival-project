import { useEffect, useRef, useState } from "react";
import { getNearbyPlaces } from "../api/nearbyApi";

// 위치가 이만큼(미터) 이상 움직였을 때만 주변 장소를 다시 조회한다.
const REFRESH_DISTANCE_METERS = 50;

function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 브라우저 GPS로 위치를 실시간으로 추적하면서 주변 음식점/카페 목록을 불러온다.
 * 위치가 REFRESH_DISTANCE_METERS 이상 바뀌었을 때만 다시 검색해서, API를 과도하게 호출하지 않는다.
 * 홈 화면 미리보기 섹션과 "내 주변 음식점" 전체 페이지가 함께 사용한다.
 */
export default function useNearbyPlaces() {
  const [status, setStatus] = useState("loading"); // loading | denied | error | unsupported | ready
  const [places, setPlaces] = useState([]);
  const [center, setCenter] = useState(null);
  const lastQueriedRef = useRef(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return undefined;
    }

    function handlePosition(position) {
      const next = { lat: position.coords.latitude, lng: position.coords.longitude };
      setCenter(next);

      const last = lastQueriedRef.current;
      if (fetchingRef.current || (last && distanceMeters(last, next) < REFRESH_DISTANCE_METERS)) {
        return;
      }

      fetchingRef.current = true;
      lastQueriedRef.current = next;
      getNearbyPlaces(next.lat, next.lng)
        .then((data) => {
          setPlaces(data);
          setStatus("ready");
        })
        .catch(() => setStatus("error"))
        .finally(() => {
          fetchingRef.current = false;
        });
    }

    function handleError(err) {
      setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
    }

    const watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { status, places, center };
}
