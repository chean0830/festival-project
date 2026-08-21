import { Link } from 'react-router-dom'
import { categoryLabel, categoryColor } from '../../../data/communityCategories'
import { relativeTime } from '../../../utils/relativeTime'

export default function ProfilePostList({ posts, emptyText }) {
  if (!posts || posts.length === 0) {
    return <p className="profile-empty-text">{emptyText}</p>
  }

  return (
    <ul className="profile-post-list">
      {posts.map((post) => (
        <li key={post.id} className="profile-post-item">
          <Link to={`/community/${post.id}`} className="profile-post-link">
            <span
              className="profile-post-category"
              style={{ color: categoryColor(post.category), borderColor: categoryColor(post.category) }}
            >
              {categoryLabel(post.category)}
            </span>
            <span className="profile-post-title">{post.title}</span>
            <span className="profile-post-meta">
              좋아요 {post.likeCount} · 댓글 {post.commentCount} · {relativeTime(post.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
