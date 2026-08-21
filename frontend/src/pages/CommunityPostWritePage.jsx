import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import { COMMUNITY_CATEGORIES } from "../data/communityCategories";
import { createPost, getPost, updatePost, uploadPostImage } from "../api/communityApi";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import "./CommunityPostWritePage.css";

/**
 * 게시글 작성/수정 페이지.
 * URL에 postId가 있으면 수정 모드(기존 글 불러와서 채워두고 저장 시 PATCH),
 * 없으면 새 글 작성 모드(POST). 로그인 안 되어 있으면 로그인 페이지로 보낸다.
 */
function CommunityPostWritePage() {
  const { postId } = useParams();
  const isEditMode = Boolean(postId);
  const navigate = useNavigate();
  const currentMember = useCurrentMember();

  const [category, setCategory] = useState(COMMUNITY_CATEGORIES[0].key);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentMember === null) {
      navigate("/login");
    }
  }, [currentMember, navigate]);

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;
    getPost(postId)
      .then((post) => {
        if (cancelled) return;
        setCategory(post.category);
        setTitle(post.title);
        setContent(post.content ?? "");
        setImageUrl(post.imageUrl ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditMode, postId]);

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // 업로드가 끝나기 전에도 바로 내 사진이 보이도록 로컬 미리보기부터 띄운다.
    setPreviewUrl(URL.createObjectURL(file));
    setImageUrl(null);

    setUploadingImage(true);
    setError("");
    try {
      const result = await uploadPostImage(currentMember.memberId, file);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  function handleRemoveImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageUrl(null);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = { category, title: title.trim(), content, imageUrl };
      const post = isEditMode
        ? await updatePost(currentMember.memberId, postId, payload)
        : await createPost(currentMember.memberId, payload);
      navigate(`/community/${post.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <section className="community-write-page">
          <p>불러오는 중이에요...</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="community-write-page">
        <Link to={isEditMode ? `/community/${postId}` : "/community"} className="community-write-page__back">
          ‹ {isEditMode ? "게시글로" : "커뮤니티"}
        </Link>
        <h1>{isEditMode ? "게시글 수정" : "글쓰기"}</h1>

        <form onSubmit={handleSubmit} className="community-write-page__form">
          <div className="community-write-page__field">
            <label htmlFor="category">카테고리</label>
            <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {COMMUNITY_CATEGORIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="community-write-page__field">
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력해주세요"
              maxLength={200}
            />
          </div>

          <div className="community-write-page__field">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="내용을 입력해주세요"
              rows={12}
            />
          </div>

          <div className="community-write-page__field">
            {(previewUrl || imageUrl) && (
              <div className="community-write-page__image-preview">
                <img src={previewUrl || imageUrl} alt="첨부 이미지 미리보기" />
                <button type="button" onClick={handleRemoveImage}>
                  이미지 삭제
                </button>
              </div>
            )}

            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="community-write-page__image-input"
            />
            <label htmlFor="image" className="community-write-page__image-btn">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="9" cy="10.5" r="1.6" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4.5 17.5 9 13l3 3 4-4.5 3.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {uploadingImage ? "업로드 중..." : previewUrl || imageUrl ? "사진 변경" : "사진 추가"}
            </label>
          </div>

          {error && <p className="community-write-page__error">{error}</p>}

          <div className="community-write-page__actions">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/community/${postId}` : "/community")}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="community-write-page__submit"
              disabled={submitting || uploadingImage}
            >
              {submitting ? "저장 중..." : isEditMode ? "수정 완료" : "등록"}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
}

export default CommunityPostWritePage;
