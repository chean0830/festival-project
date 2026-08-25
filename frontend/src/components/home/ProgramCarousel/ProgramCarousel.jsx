import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProgramCarousel.css";

/**
 * 공연일정 캐러셀
 * - 가운데 카드가 가장 크게 보이고, 양옆으로 갈수록 작아짐
 * - 일정 시간(3초)마다 자동으로 다음 카드로 넘어감
 * - 옆에 있는 카드를 클릭하면 그 카드가 가운데로 옴
 * - 이미 가운데 있는 카드를 클릭하면 해당 공연 상세페이지로 이동함
 * - 마우스를 올리고 있으면 자동 넘김이 잠시 멈춤
 * - 카드가 옆으로 넘어갈 때 회전하며 입체적으로(코버플로우 스타일) 움직임
 *
 * items: [{ id, name, time, poster }, ...] 형태의 배열을 받는다.
 */

// activeIndex를 기준으로 이 카드가 몇 칸 떨어져 있는지 계산 (원형으로 이어져 있다고 보고
// 가장 가까운 방향으로 거리를 잼 — 예: 7개 중 마지막에서 처음으로 넘어갈 때도 자연스럽게 이어짐)
function getOffset(index, activeIndex, length) {
  let diff = index - activeIndex;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

function ProgramCarousel({ items, intervalMs = 3000 }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || items.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, items.length, intervalMs]);

  return (
    <div
      className="program-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 카드 전체를 항상 렌더링하고(key를 item.id로 고정), 위치(offset)만 바꿔서
          같은 카드가 자리를 옮기며 회전 애니메이션되게 함. */}
      {items.map((item, index) => {
        const offset = getOffset(index, activeIndex, items.length);
        // 화면에 보여줄 범위(-2 ~ 2) 밖으로 벗어난 카드는 그 방향으로 더 밀어내고
        // 투명하게 처리 — 나중에 안쪽으로 들어올 때 자연스럽게 회전하며 나타나게 하기 위함
        const clampedOffset = Math.max(-3, Math.min(3, offset));

        return (
          <div
            key={item.id}
            className={`program-carousel__card program-carousel__card--pos${clampedOffset}`}
            onClick={() =>
              offset === 0
                ? navigate(`/program/event/${item.id}`)
                : setActiveIndex(index)
            }
          >
            <div className="program-carousel__thumb">
              {item.poster && <img src={item.poster} alt={item.name} />}
            </div>
            <div className="program-carousel__label">
              <p className="program-carousel__name">{item.name}</p>
              <p className="program-carousel__time">{item.time}</p>
            </div>
          </div>
        );
      })}

      <div className="program-carousel__ground-shadow" aria-hidden="true" />
    </div>
  );
}

export default ProgramCarousel;
