import { Link } from 'react-router-dom'
import { relativeTime } from '../../../utils/relativeTime'

export default function ProfileCommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return <p className="profile-empty-text">아직 작성한 댓글이 없어요.</p>
  }

  return (
    <ul className="profile-post-list">
      {comments.map((comment) => (
        <li key={comment.id} className="profile-post-item">
          <Link to={`/community/${comment.postId}`} className="profile-post-link">
            <span className="profile-post-title">{comment.content}</span>
            <span className="profile-post-meta">
              「{comment.postTitle}」에 남긴 댓글 · {relativeTime(comment.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
