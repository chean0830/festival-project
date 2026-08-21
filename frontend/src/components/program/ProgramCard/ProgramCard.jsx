import { useNavigate } from "react-router-dom";
import "./ProgramCard.css";

/**
 * 공연/페스티벌 포스터형 카드
 * item: { id, name, time }
 * 누르면 해당 공연 상세페이지(/program/event/:eventId)로 이동한다.
 */
function ProgramCard({ item }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="program-card"
      onClick={() => navigate(`/program/event/${item.id}`)}
    >
      <div className="program-card__poster">
        {item.poster ? <img src={item.poster} alt={item.name} /> : "예시 이미지"}
      </div>
      <p className="program-card__name">{item.name}</p>
      <p className="program-card__time">{item.time}</p>
    </button>
  );
}

export default ProgramCard;
