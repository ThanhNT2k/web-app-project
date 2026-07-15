import { useCallback, useEffect, useState } from 'react';

import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReportModal from './ReportModal';
import { FontAwesomeIcon, faBan, faThumbsDown, faThumbsUp } from '../lib/icons';

function buildCommentTree(comments) {
  const nodes = new Map();
  const roots = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    const current = nodes.get(comment.id);
    const parentId = comment.parent_comment_id;
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId).replies.push(current);
      return;
    }
    roots.push(current);
  });

  return roots;
}

function CommentSection({ storyId, chapterId = null, mode = 'story' }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replySubmittingMap, setReplySubmittingMap] = useState({});
  const [voteSubmittingMap, setVoteSubmittingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reportTarget, setReportTarget] = useState(null);

  const numericStoryId = storyId ? Number(storyId) : null;
  const numericChapterId = chapterId ? Number(chapterId) : null;
  const isChapterMode = mode === 'chapter' && numericChapterId;

  const loadComments = useCallback(async () => {
    if (!numericStoryId && !numericChapterId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = isChapterMode
        ? await API.comments.getByChapter(numericChapterId, numericStoryId)
        : await API.comments.getByStory(numericStoryId);

      setComments(response.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [numericStoryId, numericChapterId, isChapterMode]);

  const commentTree = buildCommentTree(comments);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để bình luận.');
      return;
    }
    if (!numericStoryId) {
      setError('Không xác định được truyện.');
      return;
    }
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      await API.comments.create({
        story_id: numericStoryId,
        chapter_id: isChapterMode ? numericChapterId : null,
        content: content.trim(),
      });
      setContent('');
      await loadComments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Không gửi được bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await API.comments.delete(id);
      await loadComments();
    } catch {
      setError('Không xóa được bình luận.');
    }
  };

  const handleVote = async (id, voteValue) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để bình chọn bình luận.');
      return;
    }

    const previousComments = comments;
    setComments((items) => items.map((comment) => {
      if (comment.id !== id) return comment;
      const previousVote = Number(comment.my_vote) || 0;
      const nextVote = Number(voteValue) || 0;
      const upvoteCount = Number(comment.upvote_count) || 0;
      const downvoteCount = Number(comment.downvote_count) || 0;
      return {
        ...comment,
        my_vote: nextVote || null,
        upvote_count: Math.max(0, upvoteCount - (previousVote === 1 ? 1 : 0) + (nextVote === 1 ? 1 : 0)),
        downvote_count: Math.max(0, downvoteCount - (previousVote === -1 ? 1 : 0) + (nextVote === -1 ? 1 : 0)),
        vote_score: (Number(comment.vote_score) || 0) - previousVote + nextVote,
      };
    }));

    try {
      setVoteSubmittingMap((prev) => ({ ...prev, [id]: true }));
      setError('');
      await API.comments.vote(id, voteValue);
      await loadComments();
    } catch (err) {
      setComments(previousComments);
      setError(err?.response?.data?.message || 'Không thể bình chọn lúc này.');
    } finally {
      setVoteSubmittingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReplySubmit = async (event, parentCommentId) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để trả lời bình luận.');
      return;
    }

    const draft = (replyDrafts[parentCommentId] || '').trim();
    if (!draft) return;

    try {
      setReplySubmittingMap((prev) => ({ ...prev, [parentCommentId]: true }));
      setError('');
      await API.comments.create({
        story_id: numericStoryId,
        chapter_id: isChapterMode ? numericChapterId : null,
        parent_comment_id: parentCommentId,
        content: draft,
      });

      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: '' }));
      setActiveReplyId(null);
      await loadComments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Không gửi được phản hồi.');
    } finally {
      setReplySubmittingMap((prev) => ({ ...prev, [parentCommentId]: false }));
    }
  };

  const renderComment = (comment, depth = 0) => {
    const isFlagged = comment.status === 'flagged';
    const isRejected = comment.status === 'rejected';
    const isSpecial = isFlagged || isRejected;
    const isReplying = activeReplyId === comment.id;
    const isVoteSubmitting = Boolean(voteSubmittingMap[comment.id]);

    // Bóc tách số lượng Like và Dislike riêng biệt để không hiện số âm
    const likesCount = comment.upvote_count !== undefined 
      ? comment.upvote_count 
      : Math.max(0, comment.vote_score || 0);

    const dislikesCount = comment.downvote_count !== undefined 
      ? comment.downvote_count 
      : Math.max(0, -(comment.vote_score || 0));

    return (
      <div
        key={comment.id}
        className={`comment-item ${depth > 0 ? 'comment-reply-item' : ''} ${isFlagged ? 'is-spam' : ''} ${isRejected ? 'is-rejected' : ''}`}
      >
        {isRejected && (
          <span className="rejected-badge">
            <FontAwesomeIcon icon={faBan} />
            Bình luận đã bị từ chối
          </span>
        )}

        <div className="comment-heading-row mb-1">
          <div className="comment-author-block">
            {comment.avatar_url ? (
              <img
                src={comment.avatar_url}
                alt={`Avatar của ${comment.full_name || comment.username || 'độc giả'}`}
                className="comment-avatar"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                  event.currentTarget.nextElementSibling.hidden = false;
                }}
              />
            ) : null}
            <span className="comment-avatar comment-avatar-fallback" hidden={Boolean(comment.avatar_url)}>
              {(comment.full_name || comment.username || 'Đ').charAt(0).toUpperCase()}
            </span>
            <strong>{comment.full_name || comment.username || 'Độc giả'}</strong>
          </div>
          <span className="text-muted small">
            {new Date(comment.created_at).toLocaleString('vi-VN')}
          </span>
        </div>

        <p className={`mb-1 ${isSpecial ? 'special-content-text' : ''}`}>
          {comment.display_content || comment.content}
        </p>

        <div className="comment-actions-row">
          <div className="d-flex align-items-center" aria-label="Bình chọn bình luận" style={{ gap: '1rem', marginRight: '1rem' }}>
            
            {/* Nút Like */}
            <button
              type="button"
              className="d-flex align-items-center"
              style={{ background: 'none', border: 'none', padding: 0, opacity: comment.my_vote === 1 ? 1 : 0.5, gap: '0.25rem' }}
              // Nếu đang Like mà nhấn lại -> Gửi tiếp 1 hoặc 0 để Backend kích hoạt xóa
              onClick={() => handleVote(comment.id, comment.my_vote === 1 ? null : 1)}
              disabled={isVoteSubmitting}
              title="Thích"
            >
              <FontAwesomeIcon
                className="comment-vote-icon"
                icon={faThumbsUp}
                style={{ transform: comment.my_vote === 1 ? 'scale(1.15)' : 'scale(1)' }}
              />
              {likesCount > 0 && <span className="small fw-bold text-muted">{likesCount}</span>}
            </button>
            
            {/* Nút Dislike */}
            <button
              type="button"
              className="d-flex align-items-center"
              style={{ background: 'none', border: 'none', padding: 0, opacity: comment.my_vote === -1 ? 1 : 0.5, gap: '0.25rem' }}
              // Nếu đang Dislike mà nhấn lại -> Gửi tiếp -1 hoặc 0 để Backend kích hoạt xóa
              onClick={() => handleVote(comment.id, comment.my_vote === -1 ? null : -1)}
              disabled={isVoteSubmitting}
              title="Không thích"
            >
              <FontAwesomeIcon
                className="comment-vote-icon"
                icon={faThumbsDown}
                style={{ transform: comment.my_vote === -1 ? 'scale(1.15)' : 'scale(1)' }}
              />
              {dislikesCount > 0 && <span className="small fw-bold text-muted">{dislikesCount}</span>}
            </button>

          </div>

          {isAuthenticated && (
            <button
              type="button"
              className="btn-link btn-sm"
              onClick={() => setActiveReplyId((prev) => (prev === comment.id ? null : comment.id))}
            >
              Trả lời
            </button>
          )}

          {(user?.id === comment.user_id || user?.role === 'Admin') && (
            <button type="button" className="btn-link-danger btn-sm" onClick={() => handleDelete(comment.id)}>
              Xóa
            </button>
          )}

          <button
            type="button"
            className="btn-link-danger btn-sm"
            onClick={() => setReportTarget({
              commentId: comment.id,
              reportedUserId: comment.user_id,
              targetLabel: `bình luận của ${comment.full_name || comment.username || 'độc giả'}`,
            })}
          >
            Báo cáo vi phạm
          </button>
        </div>

        {isReplying && (
          <form className="comment-reply-form" onSubmit={(event) => handleReplySubmit(event, comment.id)}>
            <textarea
              className="form-control-cmc form-control-cmc-sm"
              rows={2}
              placeholder="Viết phản hồi..."
              value={replyDrafts[comment.id] || ''}
              onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
              disabled={Boolean(replySubmittingMap[comment.id])}
            />
            <div className="d-flex gap-2 mt-2">
              <button
                type="submit"
                className="btn-cmc btn-cmc-primary btn-sm"
                disabled={Boolean(replySubmittingMap[comment.id])}
              >
                {replySubmittingMap[comment.id] ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
              <button
                type="button"
                className="btn-cmc btn-cmc-outline btn-sm"
                onClick={() => setActiveReplyId(null)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {comment.replies?.length > 0 && (
          <div className="comment-replies-list">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const title = isChapterMode ? 'Bình luận chương này' : 'Bình luận truyện';

  return (
    <section className="panel-card">
      <h4 className="panel-title">
        {title} ({comments.length})
      </h4>

      {loading ? <div className="loading-text" aria-label="Đang tải bình luận" /> : null}

      {error ? <p className="text-danger small mb-2">{error}</p> : null}

      <form className="mb-4" onSubmit={handleSubmit}>
        <textarea
          className="form-control-cmc"
          rows={3}
          placeholder={isAuthenticated ? 'Viết bình luận...' : 'Đăng nhập để bình luận'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isAuthenticated}
        />
        <button
          type="submit"
          className="btn-cmc btn-cmc-primary mt-2"
          disabled={!isAuthenticated || submitting}
        >
          {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
      </form>

      {!loading && comments.length === 0 ? (
        <p className="text-muted small mb-3">Chưa có bình luận. Hãy là người đầu tiên!</p>
      ) : null}

      <div className="comment-list">
        {commentTree.map((comment) => renderComment(comment))}
      </div>

      {reportTarget ? (
        <ReportModal
          storyId={storyId}
          chapterId={chapterId}
          commentId={reportTarget.commentId}
          reportedUserId={reportTarget.reportedUserId}
          targetLabel={reportTarget.targetLabel}
          onClose={() => setReportTarget(null)}
        />
      ) : null}
    </section>
  );
}

export default CommentSection;
