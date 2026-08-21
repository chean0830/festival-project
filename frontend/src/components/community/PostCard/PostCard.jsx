import { useNavigate } from "react-router-dom";
import { categoryColor, categoryLabel } from "../../../data/communityCategories";
import { relativeTime } from "../../../utils/relativeTime";
import "./PostCard.css";

/**
 * 커뮤니티 목록의 게시글 카드.
 * post: PostSummaryResponse 모양 (id, category, title, content, authorNickname, authorProfileImage,
 *        viewCount, likeCount, commentCount, createdAt)
 */
function PostCard({ post }) {
  const navigate = useNavigate();
  const color = categoryColor(post.category);

  return (
    <button type="button" className="post-card" onClick={() => navigate(`/community/${post.id}`)}>
      <span className="post-card__cat-badge" style={{ background: `${color}1f`, color }}>
        <span className="post-card__cat-dot" style={{ background: color }} />
        {categoryLabel(post.category)}
      </span>

      <h3 className="post-card__title">{post.title}</h3>
      {post.content && <p className="post-card__body">{post.content}</p>}

      <div className="post-card__meta">
        <div className="post-card__author">
          {post.authorProfileImage ? (
            <img className="post-card__avatar" src={post.authorProfileImage} alt={post.authorNickname} />
          ) : (
            <span className="post-card__avatar" aria-hidden="true">
              {post.authorNickname ? post.authorNickname.charAt(0) : "?"}
            </span>
          )}
          <span className="post-card__author-name">
            {post.authorNickname}
            <span className="post-card__author-time">· {relativeTime(post.createdAt)}</span>
          </span>
        </div>

        <div className="post-card__stats">
          <span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {post.viewCount}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 20s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            {post.likeCount}
          </span>
          <span className="post-card__comment-count">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16v12H8l-4 4V4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {post.commentCount}
          </span>
        </div>
      </div>
    </button>
  );
}

export default PostCard;
