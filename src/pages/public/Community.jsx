import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  MessageCircle,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  UserPlus,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  CalendarDays,
  Briefcase,
  Award,
  GraduationCap,
  Send,
  X,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  Link as LinkIcon,
  FileText,
  Music,
  Smile,
  Loader2,
  Trash2,
  Reply,
  User,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

/* =========================================================
   HELPERS
========================================================= */

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getUserId(user) {
  return user?._id || user?.id || user?.userId || "";
}

function getUserName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User"
  );
}

function getUserImage(user) {
  return (
    user?.profileImage ||
    user?.avatar ||
    user?.profilePicture ||
    user?.photo ||
    ""
  );
}

function formatDate(date) {
  if (!date) return "";

  const created = new Date(date);
  const now = new Date();

  const diff = Math.floor(
    (now.getTime() - created.getTime()) / 1000
  );

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  return created.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPostAuthor(post) {
  return post?.author || {};
}

function getPostAuthorId(post) {
  const author = getPostAuthor(post);

  if (typeof author === "string") {
    return author;
  }

  return author?._id || author?.id || "";
}

function isLikedByCurrentUser(post, currentUser) {
  const currentUserId = getUserId(currentUser);

  if (!currentUserId) return false;

  const likes = Array.isArray(post?.likes) ? post.likes : [];

  return likes.some((like) => {
    if (typeof like === "string") {
      return String(like) === String(currentUserId);
    }

    return (
      String(like?._id) === String(currentUserId) ||
      String(like?.id) === String(currentUserId)
    );
  });
}

function isSavedByCurrentUser(post, currentUser) {
  const currentUserId = getUserId(currentUser);

  if (!currentUserId) return false;

  const savedBy = Array.isArray(post?.savedBy) ? post.savedBy : [];

  return savedBy.some((item) => {
    if (typeof item === "string") {
      return String(item) === String(currentUserId);
    }

    return (
      String(item?._id) === String(currentUserId) ||
      String(item?.id) === String(currentUserId)
    );
  });
}

function isAddedToProfile(post) {
  if (!post?._id) {
    return false;
  }

  try {
    const profilePosts = JSON.parse(
      localStorage.getItem("profilePosts") || "[]"
    );

    return profilePosts.some(
      (id) => String(id) === String(post._id)
    );
  } catch {
    return false;
  }
}

function getCommentUser(comment) {
  return (
    comment?.user ||
    comment?.author ||
    comment?.createdBy ||
    {}
  );
}

function getCommentUserId(comment) {
  const user = getCommentUser(comment);

  if (typeof user === "string") {
    return user;
  }

  return user?._id || user?.id || "";
}

function getCommentUserName(comment) {
  const user = getCommentUser(comment);

  return getUserName(user);
}

function getCommentUserImage(comment) {
  const user = getCommentUser(comment);

  return getUserImage(user);
}

/* =========================================================
   POST MEDIA
========================================================= */

function PostMedia({ media }) {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-4 grid gap-2 ${
        media.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {media.slice(0, 6).map((item, index) => {
        const url =
          typeof item === "string"
            ? item
            : item?.url ||
              item?.src ||
              item?.secure_url ||
              "";

        const type =
          typeof item === "string"
            ? "image"
            : item?.type ||
              item?.mediaType ||
              "image";

        const name =
          typeof item === "string"
            ? "Media"
            : item?.name || "Attached file";

        if (!url) return null;

        if (type === "video") {
          return (
            <div
              key={`${url}-${index}`}
              className={`overflow-hidden rounded-xl border border-slate-200 bg-black ${
                media.length === 1
                  ? "max-h-[520px]"
                  : "h-64"
              }`}
            >
              <video
                src={url}
                controls
                playsInline
                className="h-full w-full object-contain"
              />
            </div>
          );
        }

        if (type === "audio") {
          return (
            <div
              key={`${url}-${index}`}
              className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Music size={20} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {name}
                  </p>

                  <p className="text-xs text-slate-500">
                    Audio attachment
                  </p>
                </div>
              </div>

              <audio
                src={url}
                controls
                className="w-full"
              />
            </div>
          );
        }

        if (type === "document") {
          return (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="col-span-full flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <FileText size={22} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {name}
                </p>

                <p className="text-xs text-slate-500">
                  Open document
                </p>
              </div>

              <ExternalLink
                size={16}
                className="ml-auto shrink-0 text-slate-400"
              />
            </a>
          );
        }

        return (
          <div
            key={`${url}-${index}`}
            className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${
              media.length === 1
                ? "max-h-[600px]"
                : "h-64"
            }`}
          >
            <img
              src={url}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   LIKE PEOPLE MODAL
========================================================= */

function LikePeopleModal({ post, onClose }) {
  const likes = Array.isArray(post?.likes)
    ? post.likes
    : [];

  const people = likes.filter(
    (like) => typeof like === "object" && like !== null
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h3 className="font-bold text-slate-900">
              People who liked this post
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {likes.length}{" "}
              {likes.length === 1 ? "person" : "people"} liked
              this post
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {likes.length === 0 ? (
            <div className="py-8 text-center">
              <Heart
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No likes yet.
              </p>
            </div>
          ) : people.length > 0 ? (
            <div className="space-y-2">
              {people.map((person, index) => {
                const name = getUserName(person);
                const image = getUserImage(person);
                const id =
                  person?._id ||
                  person?.id ||
                  index;

                return (
                  <div
                    key={`${id}-${index}`}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                        {name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {name}
                      </p>

                      {person?.role && (
                        <p className="truncate text-xs text-slate-500">
                          {person.role}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Users
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                {likes.length}{" "}
                {likes.length === 1
                  ? "person"
                  : "people"}{" "}
                liked this post.
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your backend currently returns like IDs instead
                of complete user information, so names cannot be
                displayed yet.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   COMMENT ITEM
========================================================= */

function CommentItem({
  comment,
  currentUser,
  onReply,
  onDelete,
  depth = 0,
}) {
  const [showReplyBox, setShowReplyBox] =
    useState(false);

  const [replyText, setReplyText] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const user = getCommentUser(comment);
  const userName = getCommentUserName(comment);
  const userImage = getCommentUserImage(comment);
  const commentUserId = getCommentUserId(comment);
  const currentUserId = getUserId(currentUser);

  const canDelete =
    currentUserId &&
    commentUserId &&
    String(currentUserId) ===
      String(commentUserId);

  const replies = Array.isArray(comment?.replies)
    ? comment.replies
    : [];

  const submitReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        `/comments/post/${comment.post}`,
        {
          content: replyText.trim(),
          parentComment: comment._id,
        }
      );

      const newReply =
        response?.data?.data ||
        response?.data?.comment ||
        response?.data;

      if (newReply) {
        onReply(comment._id, newReply);
      }

      setReplyText("");
      setShowReplyBox(false);
    } catch (error) {
      console.error(
        "Reply error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to add reply."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`${
        depth > 0
          ? "ml-6 border-l-2 border-slate-100 pl-3 sm:ml-10"
          : ""
      }`}
    >
      <div className="flex gap-3">
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {userName}
                </p>

                {user?.role && (
                  <p className="text-[11px] text-slate-500">
                    {user.role}
                  </p>
                )}
              </div>

              {canDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(comment._id)
                  }
                  className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {comment?.content || ""}
            </p>
          </div>

          <div className="mt-1 flex items-center gap-4 px-2">
            <span className="text-[11px] text-slate-400">
              {formatDate(comment?.createdAt)}
            </span>

            <button
              type="button"
              onClick={() =>
                setShowReplyBox((prev) => !prev)
              }
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              <Reply size={13} />
              Reply
            </button>
          </div>

          {showReplyBox && (
            <form
              onSubmit={submitReply}
              className="mt-3 flex gap-2"
            >
              <input
                autoFocus
                value={replyText}
                onChange={(e) =>
                  setReplyText(e.target.value)
                }
                placeholder={`Reply to ${userName}...`}
                className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="submit"
                disabled={
                  submitting ||
                  !replyText.trim()
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </form>
          )}

          {replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUser={currentUser}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMMENT MODAL
========================================================= */

function CommentModal({
  post,
  currentUser,
  onClose,
  onCommentAdded,
}) {
  const [comment, setComment] =
    useState("");

  const [comments, setComments] =
    useState([]);

  const [loadingComments, setLoadingComments] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const loadComments = async () => {
    if (!post?._id) {
      return;
    }

    try {
      setLoadingComments(true);

      const response = await api.get(
        `/comments/post/${post._id}`
      );

      const data =
        response?.data?.data ||
        response?.data?.comments ||
        response?.data;

      if (Array.isArray(data)) {
        const topLevel = data.filter(
          (item) =>
            !item?.parentComment
        );

        const replies = data.filter(
          (item) =>
            item?.parentComment
        );

        const nested = topLevel.map(
          (item) => ({
            ...item,
            replies: replies.filter(
              (reply) =>
                String(
                  reply.parentComment?._id ||
                    reply.parentComment
                ) ===
                String(item._id)
            ),
          })
        );

        setComments(nested);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error(
        "Load comments error:",
        error
      );

      setComments([]);

      if (
        error?.response?.status !== 404
      ) {
        console.error(
          "Comment API response:",
          error?.response?.data
        );
      }
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [post?._id]);

  const submitComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        `/comments/post/${post._id}`,
        {
          content: comment.trim(),
        }
      );

      const newComment =
        response?.data?.data ||
        response?.data?.comment ||
        response?.data;

      if (newComment) {
        const normalizedComment = {
          ...newComment,
          post:
            newComment.post ||
            post._id,
          replies: [],
        };

        setComments((prev) => [
          ...prev,
          normalizedComment,
        ]);

        onCommentAdded(
          post._id,
          normalizedComment
        );
      } else {
        await loadComments();

        onCommentAdded(
          post._id,
          null
        );
      }

      setComment("");
    } catch (error) {
      console.error(
        "Comment error:",
        error
      );

      console.error(
        "Comment backend response:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (
    parentCommentId,
    newReply
  ) => {
    if (!newReply) {
      loadComments();
      return;
    }

    setComments((prev) =>
      prev.map((item) => {
        if (
          String(item._id) !==
          String(parentCommentId)
        ) {
          return item;
        }

        return {
          ...item,
          replies: [
            ...(item.replies || []),
            {
              ...newReply,
              post:
                newReply.post ||
                post._id,
            },
          ],
        };
      })
    );

    onCommentAdded(
      post._id,
      newReply,
      true
    );
  };

  const handleDeleteComment = async (
    commentId
  ) => {
    if (!commentId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this comment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/comments/${commentId}`
      );

      setComments((prev) =>
        prev
          .filter(
            (item) =>
              String(item._id) !==
              String(commentId)
          )
          .map((item) => ({
            ...item,
            replies: (item.replies || []).filter(
              (reply) =>
                String(reply._id) !==
                String(commentId)
            ),
          }))
      );

      await loadComments();
    } catch (error) {
      console.error(
        "Delete comment error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete comment."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h3 className="font-bold text-slate-900">
              Comments
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Join the conversation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loadingComments ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-indigo-600"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading comments...
                </p>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare
                size={38}
                className="mx-auto text-slate-300"
              />

              <h4 className="mt-3 font-semibold text-slate-800">
                No comments yet
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Be the first person to comment on this post.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((item) => (
                <CommentItem
                  key={item._id}
                  comment={item}
                  currentUser={currentUser}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={submitComment}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="flex items-end gap-3">
            {getUserImage(currentUser) ? (
              <img
                src={getUserImage(currentUser)}
                alt={getUserName(currentUser)}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {getUserName(currentUser)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="flex min-w-0 flex-1 gap-2">
              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                rows={2}
                placeholder="Write a comment..."
                className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="submit"
                disabled={
                  submitting ||
                  !comment.trim()
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   POST CARD
========================================================= */

function PostCard({
  post,
  currentUser,
  onLike,
  onSave,
  onShare,
  onAddToProfile,
  onDelete,
  onComment,
  onShowLikes,
  onOpenProfile,
}) {
  const author = getPostAuthor(post);

  const authorName =
    author?.name ||
    author?.fullName ||
    author?.username ||
    author?.email?.split("@")[0] ||
    "AlumniConnect User";

  const authorImage = getUserImage(author);

  const liked = isLikedByCurrentUser(
    post,
    currentUser
  );

  const saved = isSavedByCurrentUser(
    post,
    currentUser
  );

  const addedToProfile =
    isAddedToProfile(post);

  const likeCount = Array.isArray(
    post?.likes
  )
    ? post.likes.length
    : Number(post?.likeCount || 0);

  const commentCount = Number(
    post?.comments ||
      post?.commentCount ||
      0
  );

  const shareCount = Number(
    post?.shares || 0
  );

  const currentUserId =
    getUserId(currentUser);

  const postAuthorId =
    getPostAuthorId(post);

  const canDelete =
    currentUserId &&
    postAuthorId &&
    String(currentUserId) ===
      String(postAuthorId);

  const postType =
    post?.type || "post";

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onOpenProfile(
                  postAuthorId
                )
              }
              className="shrink-0"
            >
              {authorImage ? (
                <img
                  src={authorImage}
                  alt={authorName}
                  className="h-11 w-11 rounded-full object-cover transition hover:ring-2 hover:ring-indigo-300"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 transition hover:ring-2 hover:ring-indigo-300">
                  {authorName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </button>

            <div className="min-w-0">
              <button
                type="button"
                onClick={() =>
                  onOpenProfile(
                    postAuthorId
                  )
                }
                className="block max-w-full truncate text-left font-semibold text-slate-900 hover:text-indigo-600"
              >
                {authorName}
              </button>

              <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                {author?.role && (
                  <span>{author.role}</span>
                )}

                {author?.company && (
                  <>
                    {author?.role && (
                      <span>•</span>
                    )}

                    <span>
                      {author.company}
                    </span>
                  </>
                )}

                <span>•</span>

                <span>
                  {formatDate(
                    post?.createdAt
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-1">
            {postType !== "post" && (
              <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700 sm:inline-flex">
                {postType}
              </span>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() =>
                  onDelete(post._id)
                }
                className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                title="Delete post"
              >
                <Trash2 size={18} />
              </button>
            )}

            {!canDelete && (
              <button
                type="button"
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <MoreHorizontal size={19} />
              </button>
            )}
          </div>
        </div>

        {post?.content && (
          <div className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-6 text-slate-700">
            {post.content}
          </div>
        )}

        {Array.isArray(post?.hashtags) &&
          post.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.hashtags.map(
                (tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="text-sm font-medium text-indigo-600"
                  >
                    {tag.startsWith("#")
                      ? tag
                      : `#${tag}`}
                  </span>
                )
              )}
            </div>
          )}

        {post?.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-indigo-700 transition hover:bg-indigo-100"
          >
            <LinkIcon size={20} />

            <span className="min-w-0 truncate text-sm font-medium">
              {post.link}
            </span>
          </a>
        )}

        {post?.job && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Briefcase size={22} />
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900">
                  {post.job.title ||
                    "Job Opportunity"}
                </p>

                {post.job.company && (
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {post.job.company}
                  </p>
                )}

                {post.job.location && (
                  <p className="mt-1 text-xs text-slate-500">
                    {post.job.location}
                  </p>
                )}

                {post.job.experience && (
                  <p className="mt-1 text-xs text-slate-500">
                    Experience:{" "}
                    {post.job.experience}
                  </p>
                )}
              </div>
            </div>

            {post.job.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {post.job.description}
              </p>
            )}

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              View Opportunity
            </button>
          </div>
        )}

        {post?.event && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <CalendarDays size={22} />
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900">
                  {post.event.title ||
                    "Event"}
                </p>

                {post.event.date && (
                  <p className="mt-1 text-sm text-slate-600">
                    {post.event.date}
                  </p>
                )}

                {post.event.location && (
                  <p className="mt-1 text-xs text-slate-500">
                    {post.event.location}
                  </p>
                )}
              </div>
            </div>

            {post.event.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {post.event.description}
              </p>
            )}
          </div>
        )}

        {post?.poll &&
          Array.isArray(
            post.poll.options
          ) && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <BarChart3 size={20} />
                </div>

                <p className="font-semibold text-slate-900">
                  {post.poll.question}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {post.poll.options.map(
                  (option, index) => (
                    <button
                      type="button"
                      key={`${option.text}-${index}`}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <span>
                        {option.text}
                      </span>

                      <span className="text-xs text-slate-400">
                        {option.votes ||
                          0}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

        <PostMedia media={post?.media} />

        <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
          <button
            type="button"
            onClick={() =>
              likeCount > 0 &&
              onShowLikes(post)
            }
            className={`font-medium ${
              likeCount > 0
                ? "cursor-pointer hover:text-indigo-600"
                : "cursor-default"
            }`}
          >
            {likeCount}{" "}
            {likeCount === 1
              ? "like"
              : "likes"}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onComment(post)
              }
              className="hover:text-indigo-600"
            >
              {commentCount}{" "}
              {commentCount === 1
                ? "comment"
                : "comments"}
            </button>

            <span>
              {shareCount}{" "}
              {shareCount === 1
                ? "share"
                : "shares"}
            </span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-5">
          <button
            type="button"
            onClick={() =>
              onLike(post)
            }
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              liked
                ? "bg-red-50 text-red-600"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Heart
              size={18}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            <span>Like</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onComment(post)
            }
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <MessageSquare size={18} />

            <span>Comment</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onShare(post)
            }
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <Share2 size={18} />

            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onSave(post)
            }
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              saved
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bookmark
              size={18}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {saved
                ? "Saved"
                : "Save"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onAddToProfile(post)
            }
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              addedToProfile
                ? "bg-green-50 text-green-600"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserPlus size={18} />

            <span>
              {addedToProfile
                ? "Added"
                : "Add to Profile"}
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   CREATE POST MODAL
========================================================= */

function CreatePostModal({
  onClose,
  onCreated,
}) {
  const [content, setContent] =
    useState("");

  const [postType, setPostType] =
    useState("post");

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  const [link, setLink] =
    useState("");

  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    experience: "",
    description: "",
  });

  const [event, setEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });

  const [pollQuestion, setPollQuestion] =
    useState("");

  const [pollOptions, setPollOptions] =
    useState(["", ""]);

  const [uploading, setUploading] =
    useState(false);

  const photoInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  const documentInputRef =
    useRef(null);

  const audioInputRef =
    useRef(null);

  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(
            item.preview
          );
        }
      });
    };
  }, [previews]);

  const addFiles = (
    fileList,
    allowedType
  ) => {
    const files = Array.from(
      fileList || []
    );

    if (!files.length) {
      return;
    }

    const MAX_FILE_SIZE =
      500 * 1024 * 1024;

    const validFiles =
      files.filter((file) => {
        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          alert(
            `${file.name} is larger than 500 MB. Please select a smaller file.`
          );

          return false;
        }

        if (
          allowedType ===
          "image"
        ) {
          return file.type.startsWith(
            "image/"
          );
        }

        if (
          allowedType ===
          "video"
        ) {
          return file.type.startsWith(
            "video/"
          );
        }

        if (
          allowedType ===
          "audio"
        ) {
          return file.type.startsWith(
            "audio/"
          );
        }

        return true;
      });

    if (!validFiles.length) {
      alert(
        `Please select a valid ${allowedType} file.`
      );

      return;
    }

    const newFiles =
      validFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        type: allowedType,
        preview:
          file.type.startsWith(
            "image/"
          ) ||
          file.type.startsWith(
            "video/"
          ) ||
          file.type.startsWith(
            "audio/"
          )
            ? URL.createObjectURL(
                file
              )
            : "",
      }));

    setSelectedFiles((prev) => [
      ...prev,
      ...newFiles,
    ]);

    setPreviews((prev) => [
      ...prev,
      ...newFiles,
    ]);
  };

  const removeFile = (id) => {
    const target =
      previews.find(
        (item) =>
          item.id === id
      );

    if (target?.preview) {
      URL.revokeObjectURL(
        target.preview
      );
    }

    setSelectedFiles((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );

    setPreviews((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const handlePhotoChange = (
    event
  ) => {
    addFiles(
      event.target.files,
      "image"
    );

    event.target.value = "";
  };

  const handleVideoChange = (
    event
  ) => {
    addFiles(
      event.target.files,
      "video"
    );

    event.target.value = "";
  };

  const handleAudioChange = (
    event
  ) => {
    addFiles(
      event.target.files,
      "audio"
    );

    event.target.value = "";
  };

  const handleDocumentChange = (
    event
  ) => {
    addFiles(
      event.target.files,
      "document"
    );

    event.target.value = "";
  };

  const uploadFiles = async () => {
    const uploadedMedia = [];

    for (
      let index = 0;
      index <
      selectedFiles.length;
      index++
    ) {
      const item =
        selectedFiles[index];

      const MAX_FILE_SIZE =
        500 * 1024 * 1024;

      if (
        item.file.size >
        MAX_FILE_SIZE
      ) {
        throw new Error(
          `${item.file.name}: File size must be 500 MB or less.`
        );
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        item.file,
        item.file.name
      );

      try {
        const response =
          await api.post(
            "/posts/upload-media",
            formData,
            {
              timeout: 600000,
            }
          );

        const data =
          response?.data?.media ||
          response?.data?.data ||
          response?.data?.file ||
          response?.data;

        if (!data?.url) {
          throw new Error(
            `Server did not return a media URL for ${item.file.name}`
          );
        }

        uploadedMedia.push({
          type:
            data.type ||
            item.type,

          url: data.url,

          name:
            data.name ||
            item.file.name,
        });
      } catch (error) {
        console.error(
          "Media upload error:",
          error
        );

        const backendMessage =
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.error ||
          error?.message ||
          `Failed to upload ${item.file.name}`;

        throw new Error(
          `${item.file.name}: ${backendMessage}`
        );
      }
    }

    return uploadedMedia;
  };

  const handleSubmit = async (
    eventSubmit
  ) => {
    eventSubmit.preventDefault();

    if (
      !content.trim() &&
      selectedFiles.length === 0 &&
      !link.trim() &&
      postType !== "job" &&
      postType !== "event" &&
      postType !== "poll"
    ) {
      alert(
        "Please write something or attach a file."
      );

      return;
    }

    if (
      postType === "job" &&
      !job.title.trim()
    ) {
      alert(
        "Please enter the job title."
      );

      return;
    }

    if (
      postType === "event" &&
      !event.title.trim()
    ) {
      alert(
        "Please enter the event title."
      );

      return;
    }

    if (postType === "poll") {
      const validOptions =
        pollOptions.filter(
          (option) =>
            option.trim()
        );

      if (!pollQuestion.trim()) {
        alert(
          "Please enter the poll question."
        );

        return;
      }

      if (
        validOptions.length < 2
      ) {
        alert(
          "Please add at least two poll options."
        );

        return;
      }
    }

    try {
      setUploading(true);

      let uploadedMedia = [];

      if (
        selectedFiles.length >
        0
      ) {
        uploadedMedia =
          await uploadFiles();
      }

      const payload = {
        content:
          content.trim(),

        type: postType,

        media: uploadedMedia,

        link:
          link.trim() || null,
      };

      if (postType === "job") {
        payload.job = {
          title:
            job.title.trim(),

          company:
            job.company.trim(),

          location:
            job.location.trim(),

          experience:
            job.experience.trim(),

          description:
            job.description.trim(),
        };
      }

      if (
        postType === "event"
      ) {
        payload.event = {
          title:
            event.title.trim(),

          date: event.date,

          location:
            event.location.trim(),

          description:
            event.description.trim(),
        };
      }

      if (postType === "poll") {
        payload.poll = {
          question:
            pollQuestion.trim(),

          options:
            pollOptions
              .filter((option) =>
                option.trim()
              )
              .map((option) => ({
                text:
                  option.trim(),

                votes: 0,
              })),
        };
      }

      const response =
        await api.post(
          "/posts",
          payload
        );

      const createdPost =
        response?.data?.data ||
        response?.data?.post ||
        response?.data;

      onCreated(createdPost);

      onClose();
    } catch (error) {
      console.error(
        "Create post error:",
        error
      );

      const message =
        error?.response?.data
          ?.message ||
        error?.response?.data
          ?.error ||
        error?.message ||
        "Failed to create post.";

      alert(message);
    } finally {
      setUploading(false);
    }
  };

  const updatePollOption = (
    index,
    value
  ) => {
    setPollOptions((prev) =>
      prev.map(
        (
          option,
          optionIndex
        ) =>
          optionIndex ===
          index
            ? value
            : option
      )
    );
  };

  const addPollOption = () => {
    if (
      pollOptions.length >= 5
    ) {
      return;
    }

    setPollOptions((prev) => [
      ...prev,
      "",
    ]);
  };

  const removePollOption = (
    index
  ) => {
    if (
      pollOptions.length <= 2
    ) {
      return;
    }

    setPollOptions((prev) =>
      prev.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
        onMouseDown={(e) => {
          if (
            e.target ===
              e.currentTarget &&
            !uploading
          ) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.97,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.97,
            y: 20,
          }}
          className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create a post
              </h2>

              <p className="text-xs text-slate-500">
                Share your knowledge,
                career journey or
                opportunity
              </p>
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="overflow-y-auto"
          >
            <div className="p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  {
                    value: "post",
                    label: "Post",
                    icon: MessageCircle,
                  },
                  {
                    value: "career",
                    label: "Career",
                    icon: TrendingUp,
                  },
                  {
                    value: "job",
                    label: "Job",
                    icon: Briefcase,
                  },
                  {
                    value:
                      "achievement",
                    label:
                      "Achievement",
                    icon: Award,
                  },
                  {
                    value: "event",
                    label: "Event",
                    icon: CalendarDays,
                  },
                  {
                    value: "poll",
                    label: "Poll",
                    icon: BarChart3,
                  },
                ].map((item) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      type="button"
                      key={
                        item.value
                      }
                      onClick={() =>
                        setPostType(
                          item.value
                        )
                      }
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        postType ===
                        item.value
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                      }`}
                    >
                      <Icon
                        size={15}
                      />

                      {item.label}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(
                    e.target.value
                  )
                }
                rows={6}
                maxLength={5000}
                placeholder="What do you want to share with the AlumniConnect community?"
                className="w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <div className="mt-2 text-right text-xs text-slate-400">
                {content.length}/5000
              </div>

              {postType ===
                "job" && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-4 font-semibold text-slate-900">
                    Job Details
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={
                        job.title
                      }
                      onChange={(e) =>
                        setJob({
                          ...job,
                          title:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Job title"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <input
                      value={
                        job.company
                      }
                      onChange={(e) =>
                        setJob({
                          ...job,
                          company:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Company"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <input
                      value={
                        job.location
                      }
                      onChange={(e) =>
                        setJob({
                          ...job,
                          location:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Location"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <input
                      value={
                        job.experience
                      }
                      onChange={(e) =>
                        setJob({
                          ...job,
                          experience:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Experience"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>

                  <textarea
                    value={
                      job.description
                    }
                    onChange={(e) =>
                      setJob({
                        ...job,
                        description:
                          e.target
                            .value,
                      })
                    }
                    rows={4}
                    placeholder="Job description"
                    className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {postType ===
                "event" && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-4 font-semibold text-slate-900">
                    Event Details
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={
                        event.title
                      }
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          title:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Event title"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <input
                      type="date"
                      value={
                        event.date
                      }
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          date:
                            e.target
                              .value,
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                    <input
                      value={
                        event.location
                      }
                      onChange={(e) =>
                        setEvent({
                          ...event,
                          location:
                            e.target
                              .value,
                        })
                      }
                      placeholder="Location"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 sm:col-span-2"
                    />
                  </div>

                  <textarea
                    value={
                      event.description
                    }
                    onChange={(e) =>
                      setEvent({
                        ...event,
                        description:
                          e.target
                            .value,
                      })
                    }
                    rows={4}
                    placeholder="Event description"
                    className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {postType ===
                "poll" && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-4 font-semibold text-slate-900">
                    Create Poll
                  </h3>

                  <input
                    value={
                      pollQuestion
                    }
                    onChange={(e) =>
                      setPollQuestion(
                        e.target
                          .value
                      )
                    }
                    placeholder="Ask a question..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  />

                  <div className="mt-3 space-y-2">
                    {pollOptions.map(
                      (
                        option,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="flex gap-2"
                        >
                          <input
                            value={
                              option
                            }
                            onChange={(
                              e
                            ) =>
                              updatePollOption(
                                index,
                                e.target
                                  .value
                              )
                            }
                            placeholder={`Option ${
                              index +
                              1
                            }`}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                          />

                          {pollOptions.length >
                            2 && (
                            <button
                              type="button"
                              onClick={() =>
                                removePollOption(
                                  index
                                )
                              }
                              className="rounded-lg px-3 text-red-500 hover:bg-red-50"
                            >
                              <X
                                size={
                                  18
                                }
                              />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {pollOptions.length <
                    5 && (
                    <button
                      type="button"
                      onClick={
                        addPollOption
                      }
                      className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-600"
                    >
                      <Plus
                        size={16}
                      />
                      Add option
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <LinkIcon
                    size={17}
                    className="text-slate-500"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Add link
                  </span>
                </div>

                <input
                  value={link}
                  onChange={(e) =>
                    setLink(
                      e.target.value
                    )
                  }
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {previews.length >
                0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Attachments
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previews.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        >
                          {item.type ===
                            "image" &&
                            item.preview && (
                              <img
                                src={
                                  item.preview
                                }
                                alt={
                                  item
                                    .file
                                    .name
                                }
                                className="h-36 w-full object-cover"
                              />
                            )}

                          {item.type ===
                            "video" &&
                            item.preview && (
                              <video
                                src={
                                  item.preview
                                }
                                controls
                                className="h-36 w-full object-cover"
                              />
                            )}

                          {item.type ===
                            "audio" && (
                            <div className="flex h-36 flex-col items-center justify-center gap-3 p-3">
                              <Music
                                size={
                                  32
                                }
                                className="text-indigo-600"
                              />

                              <p className="w-full truncate text-center text-xs text-slate-600">
                                {
                                  item
                                    .file
                                    .name
                                }
                              </p>
                            </div>
                          )}

                          {item.type ===
                            "document" && (
                            <div className="flex h-36 flex-col items-center justify-center gap-3 p-3">
                              <FileText
                                size={
                                  32
                                }
                                className="text-red-600"
                              />

                              <p className="w-full truncate text-center text-xs text-slate-600">
                                {
                                  item
                                    .file
                                    .name
                                }
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              removeFile(
                                item.id
                              )
                            }
                            disabled={
                              uploading
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black disabled:opacity-50"
                          >
                            <X
                              size={
                                15
                              }
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Add to your post
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={
                      uploading
                    }
                    onClick={() =>
                      photoInputRef.current?.click()
                    }
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-green-600 disabled:opacity-50"
                  >
                    <ImageIcon
                      size={19}
                      className="text-green-600"
                    />
                    Photo
                  </button>

                  <button
                    type="button"
                    disabled={
                      uploading
                    }
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-purple-600 disabled:opacity-50"
                  >
                    <Video
                      size={19}
                      className="text-purple-600"
                    />
                    Video
                  </button>

                  <button
                    type="button"
                    disabled={
                      uploading
                    }
                    onClick={() =>
                      audioInputRef.current?.click()
                    }
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-blue-600 disabled:opacity-50"
                  >
                    <Music
                      size={19}
                      className="text-blue-600"
                    />
                    Audio
                  </button>

                  <button
                    type="button"
                    disabled={
                      uploading
                    }
                    onClick={() =>
                      documentInputRef.current?.click()
                    }
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                  >
                    <FileText
                      size={19}
                      className="text-red-600"
                    />
                    Document
                  </button>

                  <button
                    type="button"
                    disabled={
                      uploading
                    }
                    onClick={() =>
                      setContent(
                        (prev) =>
                          `${prev} 😊`
                      )
                    }
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-yellow-600 disabled:opacity-50"
                  >
                    <Smile
                      size={19}
                      className="text-yellow-500"
                    />
                    Emoji
                  </button>
                </div>

                <input
                  ref={
                    photoInputRef
                  }
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={
                    handlePhotoChange
                  }
                />

                <input
                  ref={
                    videoInputRef
                  }
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={
                    handleVideoChange
                  }
                />

                <input
                  ref={
                    audioInputRef
                  }
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={
                    handleAudioChange
                  }
                />

                <input
                  ref={
                    documentInputRef
                  }
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  multiple
                  className="hidden"
                  onChange={
                    handleDocumentChange
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  uploading
                }
                className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send
                      size={17}
                    />
                    Post
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   MAIN COMMUNITY
========================================================= */

export default function Community() {
  const navigate =
    useNavigate();

  const [currentUser, setCurrentUser] =
    useState(
      getUserFromStorage()
    );

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    showCreatePost,
    setShowCreatePost,
  ] = useState(false);

  const [commentPost, setCommentPost] =
    useState(null);

  const [likesPost, setLikesPost] =
    useState(null);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const storedUser =
      getUserFromStorage();

    if (storedUser) {
      setCurrentUser(
        storedUser
      );
    }

    loadPosts();
  }, []);

  /* =========================================================
     PROFILE NAVIGATION
  ========================================================= */

  const openProfile = (userId) => {
    if (!userId) {
      return;
    }

    if (
      String(userId) ===
      String(getUserId(currentUser))
    ) {
      navigate("/profile");
      return;
    }

    navigate(
      `/profile/${userId}`
    );
  };

  const openCurrentUserProfile =
    () => {
      navigate("/profile");
    };

  /* =========================================================
     LOAD POSTS
  ========================================================= */

  const loadPosts = async () => {
    try {
      setLoading(true);

      const response =
        await api.get(
          "/posts"
        );

      const data =
        response?.data?.data ||
        response?.data?.posts ||
        response?.data;

      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error(
        "Load posts error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Failed to load community posts."
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts =
    async () => {
      try {
        setRefreshing(true);

        const response =
          await api.get(
            "/posts"
          );

        const data =
          response?.data?.data ||
          response?.data?.posts ||
          response?.data;

        if (Array.isArray(data)) {
          setPosts(data);
        }
      } catch (error) {
        console.error(
          "Refresh posts error:",
          error
        );
      } finally {
        setRefreshing(false);
      }
    };

  /* =========================================================
     CREATE POST
  ========================================================= */

  const handleCreatedPost =
    (newPost) => {
      if (!newPost) {
        refreshPosts();
        return;
      }

      setPosts((prev) => [
        newPost,
        ...prev,
      ]);
    };

  /* =========================================================
     LIKE
  ========================================================= */

  const handleLike = async (
    post
  ) => {
    if (!post?._id) {
      return;
    }

    const currentUserId =
      getUserId(
        currentUser
      );

    if (!currentUserId) {
      alert(
        "Please login to like a post."
      );

      return;
    }

    try {
      const liked =
        isLikedByCurrentUser(
          post,
          currentUser
        );

      if (liked) {
        await api.delete(
          `/posts/${post._id}/like`
        );
      } else {
        await api.post(
          `/posts/${post._id}/like`
        );
      }

      setPosts((prev) =>
        prev.map((item) => {
          if (
            String(item._id) !==
            String(post._id)
          ) {
            return item;
          }

          const currentLikes =
            Array.isArray(
              item.likes
            )
              ? [
                  ...item.likes,
                ]
              : [];

          if (liked) {
            return {
              ...item,

              likes:
                currentLikes.filter(
                  (like) => {
                    const likeId =
                      typeof like ===
                      "string"
                        ? like
                        : like?._id ||
                          like?.id;

                    return (
                      String(
                        likeId
                      ) !==
                      String(
                        currentUserId
                      )
                    );
                  }
                ),
            };
          }

          const alreadyExists =
            currentLikes.some(
              (like) => {
                const likeId =
                  typeof like ===
                  "string"
                    ? like
                    : like?._id ||
                      like?.id;

                return (
                  String(
                    likeId
                  ) ===
                  String(
                    currentUserId
                  )
                );
              }
            );

          if (
            alreadyExists
          ) {
            return item;
          }

          return {
            ...item,

            likes: [
              ...currentLikes,
              currentUserId,
            ],
          };
        })
      );
    } catch (error) {
      console.error(
        "Like error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Failed to update like."
      );
    }
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async (
    post
  ) => {
    if (!post?._id) {
      return;
    }

    const currentUserId =
      getUserId(
        currentUser
      );

    if (!currentUserId) {
      alert(
        "Please login to save a post."
      );

      return;
    }

    try {
      const saved =
        isSavedByCurrentUser(
          post,
          currentUser
        );

      if (saved) {
        await api.delete(
          `/posts/${post._id}/save`
        );
      } else {
        await api.post(
          `/posts/${post._id}/save`
        );
      }

      setPosts((prev) =>
        prev.map((item) => {
          if (
            String(item._id) !==
            String(post._id)
          ) {
            return item;
          }

          const currentSaved =
            Array.isArray(
              item.savedBy
            )
              ? [
                  ...item.savedBy,
                ]
              : [];

          if (saved) {
            return {
              ...item,

              savedBy:
                currentSaved.filter(
                  (savedUser) => {
                    const savedId =
                      typeof savedUser ===
                      "string"
                        ? savedUser
                        : savedUser?._id ||
                          savedUser?.id;

                    return (
                      String(
                        savedId
                      ) !==
                      String(
                        currentUserId
                      )
                    );
                  }
                ),
            };
          }

          const alreadyExists =
            currentSaved.some(
              (savedUser) => {
                const savedId =
                  typeof savedUser ===
                  "string"
                    ? savedUser
                    : savedUser?._id ||
                      savedUser?.id;

                return (
                  String(
                    savedId
                  ) ===
                  String(
                    currentUserId
                  )
                );
              }
            );

          if (
            alreadyExists
          ) {
            return item;
          }

          return {
            ...item,

            savedBy: [
              ...currentSaved,
              currentUserId,
            ],
          };
        })
      );
    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Failed to update saved post."
      );
    }
  };

  /* =========================================================
     SHARE
  ========================================================= */

  const handleShare = async (
    post
  ) => {
    if (!post?._id) {
      return;
    }

    const shareUrl =
      `${window.location.origin}/community/post/${post._id}`;

    const shareText =
      post?.content?.slice(
        0,
        150
      ) ||
      "Check out this post on AlumniConnect.";

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "AlumniConnect Post",

          text: shareText,

          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        alert(
          "Post link copied to clipboard."
        );
      }

      setPosts((prev) =>
        prev.map((item) =>
          String(item._id) ===
          String(post._id)
            ? {
                ...item,

                shares:
                  Number(
                    item.shares ||
                      0
                  ) + 1,
              }
            : item
        )
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          shareUrl
        );

        alert(
          "Post link copied to clipboard."
        );
      } catch {
        alert(
          "Unable to share this post."
        );
      }
    }
  };

  /* =========================================================
     ADD TO PROFILE
  ========================================================= */

  const handleAddToProfile =
    async (post) => {
      if (!post?._id) {
        return;
      }

      const currentUserId =
        getUserId(
          currentUser
        );

      if (!currentUserId) {
        alert(
          "Please login to add a post to your profile."
        );

        return;
      }

      try {
        const existing =
          JSON.parse(
            localStorage.getItem(
              "profilePosts"
            ) || "[]"
          );

        const alreadyAdded =
          existing.some(
            (id) =>
              String(id) ===
              String(post._id)
          );

        let updated;

        if (alreadyAdded) {
          updated =
            existing.filter(
              (id) =>
                String(id) !==
                String(
                  post._id
                )
            );
        } else {
          updated = [
            ...existing,
            post._id,
          ];
        }

        localStorage.setItem(
          "profilePosts",
          JSON.stringify(
            updated
          )
        );

        setPosts((prev) =>
          prev.map((item) =>
            String(item._id) ===
            String(post._id)
              ? {
                  ...item,

                  addedToProfile:
                    !alreadyAdded,
                }
              : item
          )
        );

        alert(
          alreadyAdded
            ? "Post removed from your profile."
            : "Post added to your profile."
        );
      } catch (error) {
        console.error(
          "Add to profile error:",
          error
        );

        alert(
          "Failed to update profile post."
        );
      }
    };

  /* =========================================================
     DELETE POST
  ========================================================= */

  const handleDelete =
    async (postId) => {
      if (!postId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this post?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          `/posts/${postId}`
        );

        setPosts((prev) =>
          prev.filter(
            (post) =>
              String(post._id) !==
              String(postId)
          )
        );
      } catch (error) {
        console.error(
          "Delete post error:",
          error
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed to delete post."
        );
      }
    };

  /* =========================================================
     COMMENT COUNT
  ========================================================= */

  const handleCommentAdded =
    (
      postId,
      newComment,
      isReply = false
    ) => {
      setPosts((prev) =>
        prev.map((post) => {
          if (
            String(post._id) !==
            String(postId)
          ) {
            return post;
          }

          return {
            ...post,

            comments:
              Number(
                post.comments ||
                  0
              ) + 1,
          };
        })
      );
    };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredPosts =
    posts.filter((post) => {
      if (!search.trim()) {
        return true;
      }

      const query =
        search.toLowerCase();

      const author =
        getPostAuthor(post);

      const searchableText = [
        post?.content,
        post?.type,
        ...(post?.hashtags ||
          []),
        author?.name,
        author?.company,
        post?.job?.title,
        post?.job?.company,
        post?.event?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query
      );
    });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap
                size={22}
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900">
                AlumniConnect
              </h1>

              <p className="text-[11px] text-slate-500">
                Community
              </p>
            </div>
          </div>

          <div className="relative mx-auto hidden max-w-md flex-1 md:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search posts, people, companies..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <Search
                size={20}
                className="md:hidden"
              />
            </button>

            <button
              type="button"
              className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <Bell size={20} />
            </button>

            <button
              type="button"
              className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100"
            >
              <MessageCircle
                size={20}
              />
            </button>

            <button
              type="button"
              onClick={
                openCurrentUserProfile
              }
              title="My Profile"
            >
              {getUserImage(
                currentUser
              ) ? (
                <img
                  src={getUserImage(
                    currentUser
                  )}
                  alt={getUserName(
                    currentUser
                  )}
                  className="h-9 w-9 rounded-full object-cover transition hover:ring-2 hover:ring-indigo-300"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition hover:ring-2 hover:ring-indigo-300">
                  {getUserName(
                    currentUser
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search community..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,640px)_260px]">
          {/* =================================================
              LEFT SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={
                    openCurrentUserProfile
                  }
                  className="flex w-full items-center gap-3 text-left"
                >
                  {getUserImage(
                    currentUser
                  ) ? (
                    <img
                      src={getUserImage(
                        currentUser
                      )}
                      alt={getUserName(
                        currentUser
                      )}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {getUserName(
                        currentUser
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {getUserName(
                        currentUser
                      )}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {currentUser?.role ||
                        "Member"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={
                    openCurrentUserProfile
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <User size={15} />
                  View Profile
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Users
                    size={19}
                  />
                  Alumni Directory
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Briefcase
                    size={19}
                  />
                  Jobs
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <TrendingUp
                    size={19}
                  />
                  Career Roadmaps
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <CalendarDays
                    size={19}
                  />
                  Events
                </button>
              </div>
            </div>
          </aside>

          {/* =================================================
              FEED
          ================================================= */}

          <section className="min-w-0">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={
                    openCurrentUserProfile
                  }
                  className="shrink-0"
                >
                  {getUserImage(
                    currentUser
                  ) ? (
                    <img
                      src={getUserImage(
                        currentUser
                      )}
                      alt={getUserName(
                        currentUser
                      )}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {getUserName(
                        currentUser
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(
                      true
                    )
                  }
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-white"
                >
                  Start a post...
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(
                      true
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:text-sm"
                >
                  <ImageIcon
                    size={18}
                    className="text-green-600"
                  />
                  Photo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(
                      true
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:text-sm"
                >
                  <Video
                    size={18}
                    className="text-purple-600"
                  />
                  Video
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(
                      true
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:text-sm"
                >
                  <Briefcase
                    size={18}
                    className="text-indigo-600"
                  />
                  Job
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(
                      true
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:text-sm"
                >
                  <CalendarDays
                    size={18}
                    className="text-orange-600"
                  />
                  Event
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Community Feed
                </h2>

                <p className="text-xs text-slate-500">
                  Career advice,
                  opportunities and
                  alumni stories
                </p>
              </div>

              <button
                type="button"
                onClick={
                  refreshPosts
                }
                disabled={
                  refreshing
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <TrendingUp
                    size={15}
                  />
                )}

                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                    />
                  )
                )}
              </div>
            ) : filteredPosts.length ===
              0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <MessageCircle
                    size={28}
                  />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  No posts found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Be the first person
                  to share something
                  with the community.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePost(
                      true
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(
                  (post) => (
                    <PostCard
                      key={
                        post._id
                      }
                      post={post}
                      currentUser={
                        currentUser
                      }
                      onLike={
                        handleLike
                      }
                      onSave={
                        handleSave
                      }
                      onShare={
                        handleShare
                      }
                      onAddToProfile={
                        handleAddToProfile
                      }
                      onDelete={
                        handleDelete
                      }
                      onComment={(
                        selectedPost
                      ) =>
                        setCommentPost(
                          selectedPost
                        )
                      }
                      onShowLikes={(
                        selectedPost
                      ) =>
                        setLikesPost(
                          selectedPost
                        )
                      }
                      onOpenProfile={
                        openProfile
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={19}
                    className="text-indigo-600"
                  />

                  <h3 className="font-bold text-slate-900">
                    Trending
                  </h3>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      #AlumniConnect
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Career community
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      #MERNStack
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Technology
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      #CareerGrowth
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Career advice
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-bold text-slate-900">
                  Build your network
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Connect with alumni,
                  discover opportunities
                  and learn from experienced
                  professionals.
                </p>

                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <Users size={17} />
                  Explore Alumni
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* =====================================================
          CREATE POST
      ===================================================== */}

      {showCreatePost && (
        <CreatePostModal
          onClose={() =>
            setShowCreatePost(
              false
            )
          }
          onCreated={
            handleCreatedPost
          }
        />
      )}

      {/* =====================================================
          COMMENTS
      ===================================================== */}

      <AnimatePresence>
        {commentPost && (
          <CommentModal
            post={commentPost}
            currentUser={
              currentUser
            }
            onClose={() =>
              setCommentPost(
                null
              )
            }
            onCommentAdded={
              handleCommentAdded
            }
          />
        )}
      </AnimatePresence>

      {/* =====================================================
          LIKE PEOPLE
      ===================================================== */}

      <AnimatePresence>
        {likesPost && (
          <LikePeopleModal
            post={likesPost}
            onClose={() =>
              setLikesPost(null)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}