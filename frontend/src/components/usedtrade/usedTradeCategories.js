export const USED_TRADE_CATEGORIES = [
  "CLOTHING",
  "ALBUM",
  "FASHION_GOODS",
  "POSTER_PRINT",
  "CHARACTER_GOODS",
  "LIVING_GOODS",
  "ACCESSORY",
  "SLOGAN_TOWEL",
];

export const CATEGORY_LABEL = {
  CLOTHING: "의류",
  ALBUM: "음반",
  FASHION_GOODS: "패션잡화",
  POSTER_PRINT: "포스터/인쇄물",
  CHARACTER_GOODS: "캐릭터/굿즈",
  LIVING_GOODS: "생활용품",
  ACCESSORY: "액세서리",
  SLOGAN_TOWEL: "슬로건/타월",
};

export const STATUS_LABEL = {
  ON_SALE: "판매중",
  RESERVED: "예약중",
  SOLD: "거래완료",
  CANCELED: "거래취소",
};

export const SORT_OPTIONS = ["NEWEST", "PRICE_ASC", "PRICE_DESC", "POPULAR"];

export const SORT_LABEL = {
  NEWEST: "최신순",
  PRICE_ASC: "가격 낮은순",
  PRICE_DESC: "가격 높은순",
  POPULAR: "인기순",
};

// "#넬 #후드티" 같은 자유 입력 문자열을 칩으로 보여줄 때 쓰는 파서.
export function parseTags(tags) {
  if (!tags) return [];
  return tags
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}
