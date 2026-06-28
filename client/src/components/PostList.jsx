import { Edit3, Heart, MessageCircle, Repeat2, Trash2 } from "lucide-react";
import { useState } from "react";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function getInitials(name) {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getCommentTree(comments = []) {
  const commentsById = new Map();
  const rootComments = [];

  comments.forEach((comment) => {
    commentsById.set(comment._id, { ...comment, replies: [] });
  });

  commentsById.forEach((comment) => {
    const parentId = comment.parentComment?.toString();

    if (parentId && commentsById.has(parentId)) {
      commentsById.get(parentId).replies.push(comment);
      return;
    }

    rootComments.push(comment);
  });

  return rootComments;
}

function CommentThread({
  comment,
  depth = 0,
  postId,
  drafts,
  replyingCommentId,
  onDraftChange,
  onReply,
  onToggleReply,
  onViewProfile
}) {
  const initials = getInitials(comment.author?.name);
  const draft = drafts[comment._id] || "";
  const isReplying = replyingCommentId === comment._id;

  async function submitReply(event) {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    await onReply(postId, draft, comment._id);
  }

  return (
    <div className="comment-thread" style={{ "--reply-depth": depth }}>
      <div className="comment">
        <button
          type="button"
          className="comment-avatar"
          onClick={() => onViewProfile(comment.author)}
          aria-label={`View ${comment.author?.name || "user"} profile`}
        >
          {comment.author?.avatarUrl ? <img src={comment.author.avatarUrl} alt="" /> : initials || "JP"}
        </button>
        <div className="comment-main">
          <div className="comment-meta">
            <button
              type="button"
              className="comment-author"
              onClick={() => onViewProfile(comment.author)}
            >
              {comment.author?.name || "JustPost user"}
            </button>
            <span>@{comment.author?.username || comment.author?.email?.split("@")[0] || "justpost"}</span>
          </div>
          <p>{comment.content}</p>
          <button type="button" className="reply-link" onClick={() => onToggleReply(comment._id)}>
            Reply
          </button>
          {isReplying && (
            <form className="comment-form nested-reply-form" onSubmit={submitReply}>
              <input
                value={draft}
                onChange={(event) => onDraftChange(comment._id, event.target.value)}
                placeholder={`Reply to ${comment.author?.name || "this post"}`}
                maxLength={280}
              />
              <button type="submit" className="primary-button" disabled={!draft.trim()}>
                Reply
              </button>
            </form>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentThread
          key={reply._id}
          comment={reply}
          depth={depth + 1}
          postId={postId}
          drafts={drafts}
          replyingCommentId={replyingCommentId}
          onDraftChange={onDraftChange}
          onReply={onReply}
          onToggleReply={onToggleReply}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
}

export function PostList({
  currentUser,
  posts,
  onEdit,
  onDelete,
  onLike,
  onRepost,
  onComment,
  onViewProfile
}) {
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [replyingTo, setReplyingTo] = useState({});

  if (!posts.length) {
    return (
      <section className="empty-state">
        <h2>No posts yet</h2>
        <p>Your first JustPost entry will appear here once published.</p>
      </section>
    );
  }

  return (
    <section className="timeline" aria-label="Timeline">
      {posts.map((post) => {
        const canManage = post.author?._id === currentUser?.id;
        const likedByUser = post.likes?.some((user) => user._id === currentUser?.id);
        const repostedByUser = post.reposts?.some((user) => user._id === currentUser?.id);
        const initials = getInitials(post.author?.name);
        const commentDraft = commentDrafts[post._id] || "";
        const commentTree = getCommentTree(post.comments);

        async function submitComment(event, parentCommentId = null) {
          event.preventDefault();
          const draftKey = parentCommentId || post._id;
          const draft = commentDrafts[draftKey] || "";

          if (!draft.trim()) {
            return;
          }

          await onComment(post._id, draft, parentCommentId);
          setCommentDrafts((current) => ({ ...current, [draftKey]: "" }));
          setReplyingTo((current) => ({ ...current, [post._id]: null }));
          setOpenComments((current) => ({ ...current, [post._id]: true }));
        }

        function updateDraft(key, value) {
          setCommentDrafts((current) => ({
            ...current,
            [key]: value
          }));
        }

        return (
          <article className="post-card timeline-post" key={post._id}>
            <button
              type="button"
              className="avatar avatar-button"
              onClick={() => onViewProfile(post.author)}
              aria-label={`View ${post.author?.name || "user"} profile`}
            >
              {post.author?.avatarUrl ? <img src={post.author.avatarUrl} alt="" /> : initials || "JP"}
            </button>
            <div className="post-body">
              {repostedByUser && (
                <div className="repost-label">
                  <Repeat2 size={14} />
                  You reposted
                </div>
              )}
              <div className="post-meta">
                <button type="button" className="author-name" onClick={() => onViewProfile(post.author)}>
                  {post.author?.name || "JustPost user"}
                </button>
                <span>@{post.author?.username || post.author?.email?.split("@")[0] || "justpost"}</span>
                <span>{formatDate(post.updatedAt)}</span>
              </div>
              <p>{post.content}</p>
              <div className="post-actions social-actions">
                <button
                  type="button"
                  onClick={() =>
                    setOpenComments((current) => ({ ...current, [post._id]: !current[post._id] }))
                  }
                  aria-label={`Comment on ${post.title}`}
                >
                  <MessageCircle size={16} />
                  {post.comments?.length || 0}
                </button>
                <button
                  type="button"
                  className={repostedByUser ? "reposted" : ""}
                  onClick={() => onRepost(post._id)}
                  aria-label={`${repostedByUser ? "Undo repost" : "Repost"} ${post.title}`}
                >
                  <Repeat2 size={16} />
                  {post.reposts?.length || 0}
                </button>
                <button
                  type="button"
                  className={likedByUser ? "liked" : ""}
                  onClick={() => onLike(post._id)}
                  aria-label={`${likedByUser ? "Unlike" : "Like"} ${post.title}`}
                >
                  <Heart size={16} />
                  {post.likes?.length || 0}
                </button>
                {canManage && (
                  <>
                    <button type="button" onClick={() => onEdit(post)} aria-label={`Edit ${post.title}`}>
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(post._id)} aria-label={`Delete ${post.title}`}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}
              </div>
              {openComments[post._id] && (
                <div className="comments-panel">
                  <form className="comment-form" onSubmit={submitComment}>
                    <input
                      value={commentDraft}
                      onChange={(event) => updateDraft(post._id, event.target.value)}
                      placeholder="Post your reply"
                      maxLength={280}
                    />
                    <button type="submit" className="primary-button" disabled={!commentDraft.trim()}>
                      Reply
                    </button>
                  </form>
                  <div className="comment-list">
                    {commentTree.map((comment) => (
                      <CommentThread
                        key={comment._id}
                        comment={comment}
                        postId={post._id}
                        drafts={commentDrafts}
                        replyingCommentId={replyingTo[post._id]}
                        onDraftChange={updateDraft}
                        onReply={(_replyPostId, _draft, parentCommentId) =>
                          submitComment({ preventDefault: () => {} }, parentCommentId)
                        }
                        onToggleReply={(commentId) =>
                          setReplyingTo((current) => ({
                            ...current,
                            [post._id]: current[post._id] === commentId ? null : commentId
                          }))
                        }
                        onViewProfile={onViewProfile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
