import "./ProgramCard.css";

/**
 * 공연/페스티벌 포스터형 카드
 * item: { name, time }
 * TODO: 티켓 예매 페이지 생기면 카드를 그 페이지로 연결하는 링크로 바꾸기
 */
function ProgramCard({ item }) {
  return (
    <button type="button" className="program-card">
      <div className="program-card__poster">예시 이미지</div>
      <p className="program-card__name">{item.name}</p>
      <p className="program-card__time">{item.time}</p>
    </button>
  );
}

export default ProgramCard;
