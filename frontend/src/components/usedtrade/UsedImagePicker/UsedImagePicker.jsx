import { useRef, useState } from "react";
import "./UsedImagePicker.css";

const MIN_IMAGES = 2;

/**
 * 매물 사진 여러 장 선택/업로드. 파일 선택 즉시 서버에 업로드하고,
 * 반환된 URL을 부모(등록/수정 폼)의 imageUrls 배열 상태에 추가한다. 최소 2장이 필요하다.
 * 첫 번째 사진이 대표 사진(목록 카드 썸네일)이라, ‹/› 버튼으로 순서를 바꿀 수 있다.
 */
function UsedImagePicker({ imageUrls, onUpload, onRemove, onMove }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="used-image-picker">
      <div className="used-image-picker__grid">
        {imageUrls.map((url, index) => (
          <div key={url + index} className="used-image-picker__thumb">
            {index === 0 && <span className="used-image-picker__badge">대표</span>}
            <img src={url} alt={`매물 사진 ${index + 1}`} />
            <button type="button" className="used-image-picker__remove" onClick={() => onRemove(index)}>
              ×
            </button>
            <div className="used-image-picker__move">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
                aria-label="앞으로 이동"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={index === imageUrls.length - 1}
                onClick={() => onMove(index, 1)}
                aria-label="뒤로 이동"
              >
                ›
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="used-image-picker__add"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          {busy ? "업로드 중..." : "+ 사진 추가"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleFileChange}
        />
      </div>

      <p className="used-image-picker__hint">
        사진을 최소 {MIN_IMAGES}장 등록해주세요. ({imageUrls.length}/{MIN_IMAGES}
        {imageUrls.length >= MIN_IMAGES ? " 완료" : ""}) 첫 번째 사진이 목록에 보이는 대표 사진이에요.
      </p>
      {error && <p className="used-listing-create__error">{error}</p>}
    </div>
  );
}

export default UsedImagePicker;
