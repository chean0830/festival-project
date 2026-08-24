import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import { categoryLabel } from "../data/communityCategories";
import {
  createComment,
  deleteComment,
  deletePost,
  getComments,
  getPost,
  likeComment,
  likePost,
  reportContent,
  unlikeComment,
  unlikePost,
} from "../api/communityApi";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import "./CommunityPostDetailPage.css";

const COMMENTS_PAGE_SIZE = 10;
const REPLIES_PREVIEW_SIZE = 2;

function CommentLikeButton({ comment, onToggle }) {
  return (
    <button
      type="button"
      className={`community-comment__like-btn${comment.liked ? " community-comment__like-btn--active" : ""}`}
      onClick={() => onToggle(comment)}
    >
      ♥ {comment.likeCount}
    </button>
  );
}

function CommentAvatar({ nickname, imageUrl }) {
  if (imageUrl) {
    return <img className="community-comment__avatar" src={imageUrl} alt={nickname} />;
  }
  return (
    <span className="community-comment__avatar community-comment__avatar--fallback" aria-hidden="true">
      {nickname ? nickname.charAt(0) : "?"}
    </span>
  );
}

/**
 * 게시글 상세 + 댓글(대댓글 포함) + 좋아요.
 */
function CommunityPostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_PAGE_SIZE);
  const [expandedReplies, setExpandedReplies] = useState({});

  function loadPost() {
    return getPost(postId, currentMember?.memberId).then(setPost);
  }

  function loadComments() {
    return getComments(postId, currentMember?.memberId).then(setComments);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVisibleCommentCount(COMMENTS_PAGE_SIZE);
    setExpandedReplies({});

    Promise.all([loadPost(), loadComments()])
      .catch(() => {
        if (!cancelled) setPost(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function handleToggleLike() {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    const result = post.liked
        ? await unlikePost(currentMember.memberId, postId)
        : await likePost(currentMember.memberId, postId);
    setPost((prev) => ({ ...prev, liked: result.liked, likeCount: result.likeCount }));
  }

  async function handleDeletePost() {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    await deletePost(currentMember.memberId, postId);
    navigate("/community");
  }

  async function handleSubmitComment(event) {
    event.preventDefault();
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    if (!commentInput.trim()) return;

    await createComment(currentMember.memberId, postId, {
      content: commentInput.trim(),
      parentId: replyTarget,
    });
    setCommentInput("");
    setReplyTarget(null);
    await loadComments();
  }

  async function handleToggleCommentLike(comment) {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    const result = comment.liked
      ? await unlikeComment(currentMember.memberId, postId, comment.id)
      : await likeComment(currentMember.memberId, postId, comment.id);
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id ? { ...c, liked: result.liked, likeCount: result.likeCount } : c
      )
    );
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      await deleteComment(currentMember.memberId, postId, commentId);
      await loadComments();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleReport(targetType, targetId) {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    const reason = window.prompt("신고 사유를 입력해주세요 (선택 입력 가능)");
    if (reason === null) return;

    try {
      await reportContent(currentMember.memberId, { targetType, targetId, reason });
      window.alert("신고가 접수됐어요.");
    } catch (err) {
      window.alert(err.message);
    }
  }

  if (loading) {
    return (
      <Layout>
        <section className="community-detail-page">
          <p>불러오는 중이에요...</p>
        </section>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <section className="community-detail-page">
          <p>게시글을 찾을 수 없어요.</p>
          <Link to="/community" className="community-detail-page__back">
            ‹ 커뮤니티
          </Link>
        </section>
      </Layout>
    );
  }

  const commentForm = (
    <form className="community-comment-form" onSubmit={handleSubmitComment}>
      <input
        type="text"
        value={commentInput}
        onChange={(event) => setCommentInput(event.target.value)}
        placeholder={
          currentMember?.memberId
            ? replyTarget
              ? "답글을 입력해주세요"
              : "댓글을 입력해주세요"
            : "로그인 후 댓글을 남길 수 있어요"
        }
        autoFocus={replyTarget !== null}
      />
      <button type="submit">등록</button>
      {replyTarget && (
        <button
          type="button"
          className="community-comment-form__cancel"
          onClick={() => setReplyTarget(null)}
        >
          취소
        </button>
      )}
    </form>
  );

  const topLevelComments = comments.filter((c) => c.parentId === null);
  const repliesByParent = comments.reduce((map, c) => {
    if (c.parentId === null) return map;
    if (!map[c.parentId]) map[c.parentId] = [];
    map[c.parentId].push(c);
    return map;
  }, {});
  const isOwner = currentMember?.memberId === post.authorId;
  const visibleTopLevelComments = topLevelComments.slice(0, visibleCommentCount);
  const hasMoreComments = visibleCommentCount < topLevelComments.length;

  return (
    <Layout>
      <section className="community-detail-page">
        <Link to="/community" className="community-detail-page__back">
          ‹ 커뮤니티
        </Link>

        <div className="community-detail-page__header">
          <span className="community-detail-page__category">{categoryLabel(post.category)}</span>
          <h1>{post.title}</h1>
          <div className="community-detail-page__meta">
            <span>{post.authorNickname}</span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>

        {post.imageUrl && (
          <img className="community-detail-page__image" src={post.imageUrl} alt="" />
        )}
        <p className="community-detail-page__content">{post.content}</p>

        <div className="community-detail-page__actions">
          <button
            type="button"
            className={`community-detail-page__like-btn${post.liked ? " community-detail-page__like-btn--active" : ""}`}
            onClick={handleToggleLike}
          >
            ♥ 좋아요 {post.likeCount}
          </button>

          {isOwner ? (
            <div className="community-detail-page__owner-actions">
              <button
                type="button"
                className="community-detail-page__edit-btn"
                onClick={() => navigate(`/community/${postId}/edit`)}
              >
                수정
              </button>
              <button type="button" className="community-detail-page__delete-btn" onClick={handleDeletePost}>
                삭제
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="community-detail-page__report-btn"
              onClick={() => handleReport("POST", post.id)}
            >
              신고
            </button>
          )}
        </div>

        <div className="community-detail-page__comments">
          <h2>댓글 {comments.length}</h2>

          {visibleTopLevelComments.map((comment) => {
            const replies = repliesByParent[comment.id] ?? [];
            const repliesExpanded = expandedReplies[comment.id] ?? false;
            const visibleReplies = repliesExpanded ? replies : replies.slice(0, REPLIES_PREVIEW_SIZE);
            const hiddenReplyCount = replies.length - visibleReplies.length;

            return (
            <div key={comment.id} className="community-comment">
              <div className="community-comment__row">
                <CommentAvatar nickname={comment.authorNickname} imageUrl={comment.authorProfileImage} />
                <div className="community-comment__content">
                  <p className="community-comment__body">
                    <span className="community-comment__author">{comment.authorNickname}</span>
                    {comment.content}
                  </p>
                  <div className="community-comment__actions">
                    <button type="button" onClick={() => setReplyTarget(comment.id)}>
                      답글
                    </button>
                    {currentMember?.memberId === comment.authorId ? (
                      <button type="button" onClick={() => handleDeleteComment(comment.id)}>
                        삭제
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleReport("COMMENT", comment.id)}>
                        신고
                      </button>
                    )}
                  </div>
                </div>
                <CommentLikeButton comment={comment} onToggle={handleToggleCommentLike} />
              </div>

              {visibleReplies.map((reply) => (
                <div key={reply.id} className="community-comment community-comment--reply">
                  <div className="community-comment__row">
                    <CommentAvatar nickname={reply.authorNickname} imageUrl={reply.authorProfileImage} />
                    <div className="community-comment__content">
                      <p className="community-comment__body">
                        <span className="community-comment__author">{reply.authorNickname}</span>
                        {reply.content}
                      </p>
                      <div className="community-comment__actions">
                        {currentMember?.memberId === reply.authorId ? (
                          <button type="button" onClick={() => handleDeleteComment(reply.id)}>
                            삭제
                          </button>
                        ) : (
                          <button type="button" onClick={() => handleReport("COMMENT", reply.id)}>
                            신고
                          </button>
                        )}
                      </div>
                    </div>
                    <CommentLikeButton comment={reply} onToggle={handleToggleCommentLike} />
                  </div>
                </div>
              ))}

              {replies.length > REPLIES_PREVIEW_SIZE && (
                <button
                  type="button"
                  className="community-comment__replies-toggle"
                  onClick={() =>
                    setExpandedReplies((prev) => ({ ...prev, [comment.id]: !repliesExpanded }))
                  }
                >
                  {repliesExpanded ? "답글 접기" : `답글 ${hiddenReplyCount}개 더보기`}
                </button>
              )}

              {replyTarget === comment.id && (
                <div className="community-comment__reply-form">
                  <span className="community-comment__reply-target">
                    @{comment.authorNickname}님에게 답글
                  </span>
                  {commentForm}
                </div>
              )}
            </div>
            );
          })}

          {hasMoreComments && (
            <button
              type="button"
              className="community-comments__load-more"
              onClick={() => setVisibleCommentCount((prev) => prev + COMMENTS_PAGE_SIZE)}
            >
              댓글 {topLevelComments.length - visibleCommentCount}개 더보기
            </button>
          )}

          {replyTarget === null && commentForm}
        </div>
      </section>
    </Layout>
  );
}

export default CommunityPostDetailPage;
