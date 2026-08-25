import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import { getArtist } from "../api/artistApi";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import {
  fetchInterestedArtistStatus,
  addInterestedArtist,
  removeInterestedArtist,
} from "../features/profile/api/profileApi";
import "./ArtistDetailPage.css";

const ARTIST_TYPE_LABEL = {
  SOLO: "솔로",
  GROUP: "그룹",
  BAND: "밴드",
};

function formatDebutDate(debutDate) {
  if (!debutDate) return null;
  const [year, month, day] = debutDate.split("-");
  return `${year}.${month}.${day} 데뷔`;
}

/**
 * 아티스트 상세페이지
 * - GET /api/artists/{artistId} 로 데이터를 받아온다.
 * - 공연 상세페이지 라인업에서 아티스트를 누르면 이 페이지로 이동한다.
 */
function ArtistDetailPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;
  const [artist, setArtist] = useState(undefined);
  const [error, setError] = useState(null);
  const [interested, setInterested] = useState(false);
  const [heartBusy, setHeartBusy] = useState(false);
  const [heartError, setHeartError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getArtist(artistId)
      .then((data) => {
        if (!cancelled) setArtist(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [artistId]);

  useEffect(() => {
    if (!memberId) {
      setInterested(false);
      return undefined;
    }

    let cancelled = false;

    fetchInterestedArtistStatus(memberId, artistId)
      .then((data) => {
        if (!cancelled) setInterested(Boolean(data?.interested));
      })
      .catch(() => {
        if (!cancelled) setInterested(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, artistId]);

  async function handleToggleInterest() {
    if (!memberId) {
      navigate("/login");
      return;
    }
    if (heartBusy) return;

    setHeartBusy(true);
    setHeartError(null);
    try {
      if (interested) {
        await removeInterestedArtist(memberId, artistId);
        setInterested(false);
      } else {
        await addInterestedArtist(memberId, artistId);
        setInterested(true);
      }
    } catch (err) {
      setHeartError(err.message);
    } finally {
      setHeartBusy(false);
    }
  }

  if (error) {
    return (
      <Layout>
        <div className="artist-detail artist-detail--message">{error}</div>
      </Layout>
    );
  }

  if (artist === undefined) {
    return (
      <Layout>
        <div className="artist-detail artist-detail--message">불러오는 중...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="artist-detail">
        <div className="artist-detail__photo">
          {artist.profileImage ? (
            <img src={artist.profileImage} alt={artist.name} />
          ) : (
            "예시 이미지"
          )}
        </div>

        <div className="artist-detail__info">
          {artist.artistType && (
            <span className="artist-detail__type">
              {ARTIST_TYPE_LABEL[artist.artistType] || artist.artistType}
            </span>
          )}
          <h1 className="artist-detail__name">{artist.name}</h1>

          <button
            type="button"
            className={`artist-detail__heart-btn${interested ? " artist-detail__heart-btn--active" : ""}`}
            aria-label={interested ? "관심 가수 해제" : "관심 가수 추가"}
            aria-pressed={interested}
            disabled={heartBusy}
            onClick={handleToggleInterest}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2">
              <path
                d="M12 21s-7.5-4.8-10-9.5C0.3 8 1.7 4.5 5 3.6c2.1-0.6 4.3 0.3 5.6 2.1L12 7.5l1.4-1.8c1.3-1.8 3.5-2.7 5.6-2.1 3.3 0.9 4.7 4.4 3 7.9C19.5 16.2 12 21 12 21z"
                fill={interested ? "currentColor" : "none"}
              />
            </svg>
          </button>

          {heartError && <p className="artist-detail__heart-error">{heartError}</p>}

          {artist.debutDate && (
            <p className="artist-detail__debut">{formatDebutDate(artist.debutDate)}</p>
          )}

          {artist.description ? (
            <p className="artist-detail__description">{artist.description}</p>
          ) : (
            <p className="artist-detail__description artist-detail__description--empty">
              아직 등록된 소개가 없어요.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ArtistDetailPage;
