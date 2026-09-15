import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  MessageCircle,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
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
  MapPin,
  ExternalLink,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  Smile,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

/* =========================================================
   HELPERS
========================================================= */

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser);

    if (!user || typeof user !== "object") {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    return null;
  }
}

function getUserId(user) {
  return user?._id || user?.id || null;
}

function getLikeUserId(like) {
  if (!like) {
    return null;
  }

  if (typeof like === "string") {
    return like;
  }

  return like?._id || like?.id || null;
}

function hasUserLikedPost(post, userId) {
  if (!post || !userId || !Array.isArray(post.likes)) {
    return false;
  }

  return post.likes.some((like) => {
    const likeUserId = getLikeUserId(like);

    return (
      likeUserId &&
      String(likeUserId) === String(userId)
    );
  });
}

/* =========================================================
   SAVE / BOOKMARK HELPERS
========================================================= */

function hasUserSavedPost(post, userId) {
  if (
    !post ||
    !userId ||
    !Array.isArray(post.savedBy)
  ) {
    return false;
  }

  return post.savedBy.some((savedUser) => {
    const savedUserId =
      getLikeUserId(savedUser);

    return (
      savedUserId &&
      String(savedUserId) ===
        String(userId)
    );
  });
}

function getSavedCount(post) {
  if (
    typeof post?.savedCount ===
    "number"
  ) {
    return post.savedCount;
  }

  if (
    Array.isArray(post?.savedBy)
  ) {
    return post.savedBy.length;
  }

  return 0;
}

/* =========================================================
   COMMENT LIKE HELPERS
========================================================= */

function hasUserLikedComment(comment, userId) {
  if (
    !comment ||
    !userId ||
    !Array.isArray(comment.likes)
  ) {
    return false;
  }

  return comment.likes.some((like) => {
    const likeUserId =
      getLikeUserId(like);

    return (
      likeUserId &&
      String(likeUserId) ===
        String(userId)
    );
  });
}

function getCommentLikesCount(comment) {
  if (
    typeof comment?.likesCount ===
    "number"
  ) {
    return comment.likesCount;
  }

  if (Array.isArray(comment?.likes)) {
    return comment.likes.length;
  }

  return 0;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
}

function getRelativeTime(date) {
  if (!date) {
    return "Just now";
  }

  const createdAt = new Date(date);

  if (Number.isNaN(createdAt.getTime())) {
    return "Just now";
  }

  const now = new Date();

  const difference = Math.floor(
    (now.getTime() -
      createdAt.getTime()) /
      1000
  );

  if (difference < 10) {
    return "Just now";
  }

  if (difference < 60) {
    return `${difference}s`;
  }

  const minutes = Math.floor(
    difference / 60
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d`;
  }

  return createdAt.toLocaleDateString();
}

function getPostId(post) {
  return (
    post?._id ||
    post?.id ||
    post?.postId ||
    null
  );
}

function getLikesCount(post) {
  if (
    typeof post?.likesCount ===
    "number"
  ) {
    return post.likesCount;
  }

  if (Array.isArray(post?.likes)) {
    return post.likes.length;
  }

  return 0;
}

function getCommentsCount(post) {
  if (
    typeof post?.commentsCount ===
    "number"
  ) {
    return post.commentsCount;
  }

  if (
    typeof post?.comments ===
    "number"
  ) {
    return post.comments;
  }

  if (
    Array.isArray(post?.comments)
  ) {
    return post.comments.length;
  }

  return 0;
}

function getSharesCount(post) {
  if (
    typeof post?.sharesCount ===
    "number"
  ) {
    return post.sharesCount;
  }

  if (
    typeof post?.shares ===
    "number"
  ) {
    return post.shares;
  }

  return 0;
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  initials = "?",
  image = "",
  size = "md",
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white ${
        sizeClasses[size] ||
        sizeClasses.md
      }`}
    >
      {image ? (
        <img
          src={image}
          alt="Profile"
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

/* =========================================================
   POST TYPE
========================================================= */

function getPostTypeLabel(type) {
  switch (type) {
    case "career":
      return "Career Advice";

    case "job":
      return "Job Opportunity";

    case "achievement":
      return "Achievement";

    case "event":
      return "Event";

    case "poll":
      return "Poll";

    default:
      return "Post";
  }
}

function getPostIcon(type) {
  switch (type) {
    case "career":
      return <TrendingUp size={14} />;

    case "job":
      return <Briefcase size={14} />;

    case "achievement":
      return <Award size={14} />;

    case "event":
      return (
        <CalendarDays size={14} />
      );

    case "poll":
      return <Users size={14} />;

    default:
      return <FileText size={14} />;
  }
}

/* =========================================================
   MEDIA
========================================================= */

function PostMedia({ media }) {
  if (
    !Array.isArray(media) ||
    media.length === 0
  ) {
    return null;
  }

  return (
    <div
      className={`mt-4 grid gap-2 ${
        media.length === 1
          ? "grid-cols-1"
          : "grid-cols-2"
      }`}
    >
      {media
        .slice(0, 4)
        .map((item, index) => {
          const url =
            typeof item === "string"
              ? item
              : item?.url ||
                item?.src ||
                "";

          if (!url) {
            return null;
          }

          return (
            <div
              key={`${url}-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <img
                src={url}
                alt={`Post media ${
                  index + 1
                }`}
                className="max-h-[420px] w-full object-cover"
                loading="lazy"
              />
            </div>
          );
        })}
    </div>
  );
}

/* =========================================================
   POLL
========================================================= */

function PollCard({ poll }) {
  if (!poll) {
    return null;
  }

  const options = Array.isArray(
    poll?.options
  )
    ? poll.options
    : [];

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {poll?.question && (
        <p className="mb-3 font-semibold text-slate-900">
          {poll.question}
        </p>
      )}

      <div className="space-y-2">
        {options.map(
          (option, index) => {
            const label =
              typeof option ===
              "string"
                ? option
                : option?.text ||
                  option?.label ||
                  "Option";

            const votes =
              typeof option?.votes ===
              "number"
                ? option.votes
                : 0;

            return (
              <button
                type="button"
                key={`${label}-${index}`}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <span>{label}</span>

                {votes > 0 && (
                  <span className="text-xs text-slate-500">
                    {votes} vote
                    {votes === 1
                      ? ""
                      : "s"}
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

function JobCard({ job }) {
  if (!job) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
          <Briefcase size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900">
            {job?.title ||
              job?.role ||
              "Job Opportunity"}
          </h4>

          {job?.company && (
            <p className="mt-1 text-sm font-medium text-indigo-600">
              {job.company}
            </p>
          )}

          {job?.location && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={13} />
              {job.location}
            </div>
          )}

          {job?.description && (
            <p className="mt-3 line-clamp-3 text-sm text-slate-600">
              {job.description}
            </p>
          )}
        </div>
      </div>

      {job?.applyUrl && (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Apply Now
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({ event }) {
  if (!event) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <CalendarDays size={20} />
        </div>

        <div>
          <h4 className="font-semibold text-slate-900">
            {event?.title ||
              "Upcoming Event"}
          </h4>

          {event?.date && (
            <p className="mt-1 text-sm text-emerald-700">
              {new Date(
                event.date
              ).toLocaleDateString()}
            </p>
          )}

          {event?.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={13} />
              {event.location}
            </p>
          )}

          {event?.description && (
            <p className="mt-3 text-sm text-slate-600">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LINK PREVIEW
========================================================= */

function LinkPreview({ link }) {
  if (!link) {
    return null;
  }

  const url =
    typeof link === "string"
      ? link
      : link?.url ||
        link?.href ||
        "";

  if (!url) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
        <LinkIcon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {link?.title ||
            "Open link"}
        </p>

        <p className="truncate text-xs text-slate-500">
          {url}
        </p>
      </div>

      <ExternalLink
        size={16}
        className="shrink-0 text-slate-400"
      />
    </a>
  );
}

/* =========================================================
   COMMENT ITEM
========================================================= */

function CommentItem({
  comment,
  currentUser,
  onDelete,
  onLike,
  isDeleting,
}) {
  const author =
    comment?.author || {};

  const authorName =
    author?.name ||
    author?.fullName ||
    "AlumniConnect User";

  const authorImage =
    author?.profileImage ||
    author?.avatar ||
    author?.photo ||
    author?.profilePhoto ||
    "";

  const authorRole =
    author?.jobTitle ||
    author?.designation ||
    author?.role ||
    "Member";

  const authorInitials =
    getInitials(authorName);

  const currentUserId =
    getUserId(currentUser);

  const commentAuthorId =
    author?._id ||
    author?.id ||
    comment?.author?._id ||
    comment?.author;

  const isOwnComment =
    currentUserId &&
    commentAuthorId &&
    String(currentUserId) ===
      String(commentAuthorId);

  const isLiked =
    Boolean(comment?.isLiked) ||
    Boolean(
      comment?.likedByCurrentUser
    ) ||
    hasUserLikedComment(
      comment,
      currentUserId
    );

  const likesCount =
    getCommentLikesCount(comment);

  return (
    <div className="group flex gap-3">
      <Avatar
        initials={authorInitials}
        image={authorImage}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {authorName}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {authorRole}
              </p>
            </div>

            {isOwnComment && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  onDelete(comment)
                }
                className="shrink-0 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                title="Delete comment"
              >
                {isDeleting ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            )}
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-slate-700">
            {comment?.content}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-4 px-2 text-[11px]">
          <span className="text-slate-400">
            {getRelativeTime(
              comment?.createdAt
            )}
          </span>

          <button
            type="button"
            disabled={
              comment?.isLikeLoading
            }
            onClick={() =>
              onLike(comment)
            }
            className={`inline-flex items-center gap-1.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isLiked
                ? "text-indigo-600"
                : "text-slate-400 hover:text-indigo-600"
            }`}
          >
            {comment?.isLikeLoading ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : (
              <Heart
                size={13}
                fill={
                  isLiked
                    ? "currentColor"
                    : "none"
                }
              />
            )}

            <span>
              Like
              {likesCount > 0
                ? ` ${likesCount}`
                : ""}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMMENTS SECTION
========================================================= */

function CommentsSection({
  postId,
  currentUser,
  comments,
  isLoading,
  isSubmitting,
  error,
  commentText,
  setCommentText,
  onSubmit,
  onDelete,
  onLike,
}) {
  const currentUserName =
    currentUser?.name ||
    currentUser?.fullName ||
    "You";

  const currentUserImage =
    currentUser?.profileImage ||
    currentUser?.avatar ||
    currentUser?.photo ||
    currentUser?.profilePhoto ||
    "";

  const currentUserInitials =
    getInitials(currentUserName);

  const [
    deletingCommentId,
    setDeletingCommentId,
  ] = useState(null);

  const handleDelete = async (
    comment
  ) => {
    const commentId =
      comment?._id || comment?.id;

    if (!commentId) {
      return;
    }

    try {
      setDeletingCommentId(
        commentId
      );

      await onDelete(comment);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      exit={{
        opacity: 0,
        height: 0,
      }}
      className="overflow-hidden border-t border-slate-100"
    >
      <div className="bg-white px-4 py-4 sm:px-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-sm text-slate-500">
            <Loader2
              size={18}
              className="mr-2 animate-spin text-indigo-600"
            />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
            <MessageSquare
              size={22}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-sm font-medium text-slate-500">
              No comments yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Be the first person to comment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(
              (comment, index) => (
                <CommentItem
                  key={
                    comment?._id ||
                    comment?.id ||
                    `comment-${index}`
                  }
                  comment={comment}
                  currentUser={
                    currentUser
                  }
                  onDelete={
                    handleDelete
                  }
                  onLike={onLike}
                  isDeleting={
                    String(
                      deletingCommentId
                    ) ===
                    String(
                      comment?._id ||
                        comment?.id
                    )
                  }
                />
              )
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4"
        >
          <Avatar
            initials={currentUserInitials}
            image={currentUserImage}
            size="sm"
          />

          <div className="flex min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
            <input
              type="text"
              value={commentText}
              onChange={(event) =>
                setCommentText(
                  event.target.value
                )
              }
              placeholder="Write a comment..."
              maxLength={1000}
              disabled={isSubmitting}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !commentText.trim()
              }
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              title="Send comment"
            >
              {isSubmitting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>

        <p className="mt-2 text-right text-[10px] text-slate-400">
          {commentText.length}/1000
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   POST CARD
========================================================= */

function PostCard({
  post,
  onLike,
  onSave,
  currentUser,
  onToggleComments,
  onSubmitComment,
  onDeleteComment,
  onLikeComment,
  commentState,
}) {
  const currentUserId =
    getUserId(currentUser);

  const isLiked =
    Boolean(post?.isLiked) ||
    Boolean(
      post?.likedByCurrentUser
    ) ||
    Boolean(post?.userHasLiked) ||
    hasUserLikedPost(
      post,
      currentUserId
    );

  /* =======================================================
     SAVE STATE
  ======================================================= */

  const isSaved =
    Boolean(post?.isSaved) ||
    Boolean(
      post?.savedByCurrentUser
    ) ||
    hasUserSavedPost(
      post,
      currentUserId
    );

  const savedCount =
    getSavedCount(post);

  const author =
    post?.author || {};

  const authorName =
    author?.name ||
    author?.fullName ||
    post?.authorName ||
    "AlumniConnect User";

  const authorImage =
    author?.profileImage ||
    author?.avatar ||
    author?.photo ||
    author?.profilePhoto ||
    "";

  const authorRole =
    author?.jobTitle ||
    author?.designation ||
    author?.role ||
    post?.authorRole ||
    "Alumni";

  const authorCompany =
    author?.company ||
    post?.company ||
    "";

  const currentUserName =
    currentUser?.name ||
    currentUser?.fullName ||
    "You";

  const currentUserImage =
    currentUser?.profileImage ||
    currentUser?.avatar ||
    currentUser?.photo ||
    currentUser?.profilePhoto ||
    "";

  const currentUserInitials =
    getInitials(currentUserName);

  const authorInitials =
    getInitials(authorName);

  const postType =
    post?.type || "post";

  const postId =
    getPostId(post);

  const isCommentsOpen =
    commentState?.isOpen || false;

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}

      <div className="flex items-start gap-3 p-4 sm:p-5">
        <Avatar
          initials={authorInitials}
          image={authorImage}
          size="lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate font-bold text-slate-900">
                  {authorName}
                </h3>

                {author?.isVerified && (
                  <CheckCircle2
                    size={15}
                    className="text-indigo-600"
                    fill="currentColor"
                  />
                )}
              </div>

              <p className="mt-0.5 text-sm text-slate-500">
                {authorRole}
                {authorCompany
                  ? ` • ${authorCompany}`
                  : ""}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <span>
                  {getRelativeTime(
                    post?.createdAt ||
                      post?.date ||
                      post?.updatedAt
                  )}
                </span>

                <span>•</span>

                <span>Public</span>
              </div>
            </div>

            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreHorizontal
                size={19}
              />
            </button>
          </div>

          {postType !== "post" && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {getPostIcon(
                postType
              )}
              {getPostTypeLabel(
                postType
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}

      <div className="px-4 pb-4 sm:px-5">
        {post?.content && (
          <div className="whitespace-pre-wrap text-[15px] leading-6 text-slate-700">
            {post.content}
          </div>
        )}

        {Array.isArray(
          post?.hashtags
        ) &&
          post.hashtags.length >
            0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.hashtags.map(
                (tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="text-sm font-medium text-indigo-600"
                  >
                    #
                    {String(
                      tag
                    ).replace(
                      /^#/,
                      ""
                    )}
                  </span>
                )
              )}
            </div>
          )}

        <PostMedia
          media={post?.media}
        />

        <LinkPreview
          link={post?.link}
        />

        {postType === "poll" && (
          <PollCard
            poll={post?.poll}
          />
        )}

        {postType === "job" && (
          <JobCard
            job={post?.job}
          />
        )}

        {postType === "event" && (
          <EventCard
            event={post?.event}
          />
        )}
      </div>

      {/* Statistics */}

      <div className="mx-4 flex items-center justify-between border-t border-slate-100 py-3 text-xs text-slate-500 sm:mx-5">
        <div className="flex items-center gap-1">
          {getLikesCount(post) >
            0 && (
            <>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Heart
                  size={10}
                  fill="currentColor"
                />
              </div>

              <span>
                {getLikesCount(
                  post
                )}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {getCommentsCount(
            post
          ) > 0 && (
            <button
              type="button"
              onClick={() =>
                onToggleComments(
                  postId
                )
              }
              className="hover:text-indigo-600"
            >
              {getCommentsCount(
                post
              )}{" "}
              comment
              {getCommentsCount(
                post
              ) === 1
                ? ""
                : "s"}
            </button>
          )}

          {getSharesCount(
            post
          ) > 0 && (
            <span>
              {getSharesCount(
                post
              )}{" "}
              share
              {getSharesCount(
                post
              ) === 1
                ? ""
                : "s"}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}

      <div className="mx-4 grid grid-cols-4 border-t border-slate-100 sm:mx-5">
        {/* Like */}

        <button
          type="button"
          disabled={
            post?.isLikeLoading
          }
          onClick={() =>
            onLike(post)
          }
          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isLiked
              ? "text-indigo-600"
              : "text-slate-500 hover:text-indigo-600"
          }`}
        >
          {post?.isLikeLoading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Heart
              size={18}
              fill={
                isLiked
                  ? "currentColor"
                  : "none"
              }
            />
          )}

          <span>Like</span>
        </button>

        {/* Comment */}

        <button
          type="button"
          onClick={() =>
            onToggleComments(
              postId
            )
          }
          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
            isCommentsOpen
              ? "text-indigo-600"
              : "text-slate-500 hover:text-indigo-600"
          }`}
        >
          <MessageSquare
            size={18}
          />
          <span>Comment</span>
        </button>

        {/* Share */}

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>

        {/* Save */}

        <button
          type="button"
          disabled={
            post?.isSaveLoading
          }
          onClick={() =>
            onSave(post)
          }
          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isSaved
              ? "text-indigo-600"
              : "text-slate-500 hover:text-indigo-600"
          }`}
        >
          {post?.isSaveLoading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Bookmark
              size={18}
              fill={
                isSaved
                  ? "currentColor"
                  : "none"
              }
            />
          )}

          <span>
            {isSaved
              ? "Saved"
              : "Save"}
            {savedCount > 0
              ? ` ${savedCount}`
              : ""}
          </span>
        </button>
      </div>

      {/* Comments */}

      <AnimatePresence
        initial={false}
      >
        {isCommentsOpen && (
          <CommentsSection
            postId={postId}
            currentUser={
              currentUser
            }
            comments={
              commentState?.comments ||
              []
            }
            isLoading={
              commentState?.isLoading ||
              false
            }
            isSubmitting={
              commentState?.isSubmitting ||
              false
            }
            error={
              commentState?.error ||
              ""
            }
            commentText={
              commentState?.commentText ||
              ""
            }
            setCommentText={
              commentState?.setCommentText
            }
            onSubmit={(event) =>
              onSubmitComment(
                event,
                postId
              )
            }
            onDelete={(comment) =>
              onDeleteComment(
                postId,
                comment
              )
            }
            onLike={
              onLikeComment
            }
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   CREATE POST MODAL
========================================================= */

function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [content, setContent] =
    useState("");

  const [type, setType] =
    useState("post");

  const [link, setLink] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setType("post");
      setLink("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!content.trim()) {
      setError(
        "Please write something before posting."
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await onSubmit({
        content:
          content.trim(),
        type,
        link:
          link.trim() || null,
        media: [],
        hashtags: [],
        mentions: [],
        poll: null,
        job: null,
        event: null,
      });
    } catch (submitError) {
      console.error(
        "Create post modal error:",
        submitError
      );

      setError(
        submitError?.message ||
          "Unable to create post."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        onMouseDown={(
          event
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 25,
            scale: 0.97,
          }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create a post
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Share knowledge,
                opportunities and
                career updates.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5"
          >
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              rows={7}
              placeholder="Share your career advice, experience, job opportunity or achievement..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                {
                  value: "post",
                  label: "Post",
                  icon: (
                    <FileText
                      size={15}
                    />
                  ),
                },
                {
                  value: "career",
                  label:
                    "Career Advice",
                  icon: (
                    <TrendingUp
                      size={15}
                    />
                  ),
                },
                {
                  value: "job",
                  label: "Job",
                  icon: (
                    <Briefcase
                      size={15}
                    />
                  ),
                },
                {
                  value:
                    "achievement",
                  label:
                    "Achievement",
                  icon: (
                    <Award
                      size={15}
                    />
                  ),
                },
                {
                  value: "event",
                  label: "Event",
                  icon: (
                    <CalendarDays
                      size={15}
                    />
                  ),
                },
                {
                  value: "poll",
                  label: "Poll",
                  icon: (
                    <Users
                      size={15}
                    />
                  ),
                },
              ].map(
                (item) => (
                  <button
                    type="button"
                    key={
                      item.value
                    }
                    onClick={() =>
                      setType(
                        item.value
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      type ===
                      item.value
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              )}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Optional link
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <LinkIcon
                  size={16}
                  className="text-slate-400"
                />

                <input
                  type="url"
                  value={link}
                  onChange={(event) =>
                    setLink(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com"
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  type="button"
                  className="rounded-full p-2 transition hover:bg-slate-100 hover:text-indigo-600"
                >
                  <ImageIcon
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  className="rounded-full p-2 transition hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Video
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  className="rounded-full p-2 transition hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Smile
                    size={19}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send
                      size={16}
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
   MAIN COMMUNITY PAGE
========================================================= */

export default function Community() {
  const [posts, setPosts] =
    useState([]);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    isLoadingUser,
    setIsLoadingUser,
  ] = useState(true);

  const [
    isLoadingPosts,
    setIsLoadingPosts,
  ] = useState(true);

  const [
    isCreatePostOpen,
    setIsCreatePostOpen,
  ] = useState(false);

  const [
    fetchError,
    setFetchError,
  ] = useState("");

  const [
    activeSidebar,
    setActiveSidebar,
  ] = useState("Community");

  const [
    commentStates,
    setCommentStates,
  ] = useState({});

  /* =======================================================
     LOAD USER
  ======================================================= */

  const loadCurrentUser =
    () => {
      setIsLoadingUser(true);

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const storedUser =
          getStoredUser();

        if (
          !token ||
          !storedUser
        ) {
          setCurrentUser(null);
          return null;
        }

        setCurrentUser(
          storedUser
        );

        return storedUser;
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        );

        setCurrentUser(null);

        return null;
      } finally {
        setIsLoadingUser(false);
      }
    };

  /* =======================================================
     FETCH POSTS
  ======================================================= */

  const fetchPosts = async (
    user = currentUser
  ) => {
    try {
      setIsLoadingPosts(true);
      setFetchError("");

      const response =
        await api.get("/posts");

      if (!response.data?.success) {
        setPosts([]);

        setFetchError(
          response.data?.message ||
            "Unable to load community posts."
        );

        return;
      }

      const serverPosts =
        Array.isArray(
          response.data.posts
        )
          ? response.data.posts
          : [];

      const currentUserId =
        getUserId(user);

      const formattedPosts =
        serverPosts.map(
          (post) => {
            const isLiked =
              hasUserLikedPost(
                post,
                currentUserId
              );

            const isSaved =
              hasUserSavedPost(
                post,
                currentUserId
              );

            return {
              ...post,

              likes:
                Array.isArray(
                  post?.likes
                )
                  ? post.likes
                  : [],

              savedBy:
                Array.isArray(
                  post?.savedBy
                )
                  ? post.savedBy
                  : [],

              isLiked,

              likedByCurrentUser:
                isLiked,

              isLikeLoading:
                false,

              isSaved,

              savedByCurrentUser:
                isSaved,

              isSaveLoading:
                false,
            };
          }
        );

      setPosts(
        formattedPosts
      );
    } catch (error) {
      console.error(
        "Failed to fetch posts:",
        error
      );

      setPosts([]);

      setFetchError(
        error.response?.data
          ?.message ||
          "Unable to load community posts. Please check your backend server."
      );
    } finally {
      setIsLoadingPosts(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const user =
      loadCurrentUser();

    fetchPosts(user);
  }, []);

  /* =======================================================
     LOAD COMMENTS
  ======================================================= */

  const loadComments = async (
    postId
  ) => {
    if (!postId) {
      return;
    }

    setCommentStates(
      (previousStates) => ({
        ...previousStates,

        [postId]: {
          ...(previousStates[
            postId
          ] || {}),
          isLoading: true,
          error: "",
        },
      })
    );

    try {
      const response =
        await api.get(
          `/comments/post/${postId}`
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to load comments."
        );
      }

      const comments =
        Array.isArray(
          response.data.comments
        )
          ? response.data.comments.map(
              (comment) => {
                const currentUserId =
                  getUserId(
                    currentUser
                  );

                const isLiked =
                  hasUserLikedComment(
                    comment,
                    currentUserId
                  );

                return {
                  ...comment,

                  likes:
                    Array.isArray(
                      comment?.likes
                    )
                      ? comment.likes
                      : [],

                  likesCount:
                    getCommentLikesCount(
                      comment
                    ),

                  isLiked,

                  likedByCurrentUser:
                    isLiked,

                  isLikeLoading:
                    false,
                };
              }
            )
          : [];

      setCommentStates(
        (previousStates) => ({
          ...previousStates,

          [postId]: {
            ...(previousStates[
              postId
            ] || {}),
            isLoading: false,
            comments,
            error: "",
          },
        })
      );

      if (
        typeof response.data
          ?.commentsCount ===
        "number"
      ) {
        setPosts(
          (previousPosts) =>
            previousPosts.map(
              (post) => {
                if (
                  String(
                    getPostId(post)
                  ) !==
                  String(postId)
                ) {
                  return post;
                }

                return {
                  ...post,

                  comments:
                    response
                      .data
                      .commentsCount,

                  commentsCount:
                    response
                      .data
                      .commentsCount,
                };
              }
            )
        );
      }
    } catch (error) {
      console.error(
        "Failed to load comments:",
        error
      );

      setCommentStates(
        (previousStates) => ({
          ...previousStates,

          [postId]: {
            ...(previousStates[
              postId
            ] || {}),
            isLoading: false,
            error:
              error.response?.data
                ?.message ||
              error.message ||
              "Unable to load comments.",
          },
        })
      );
    }
  };

  /* =======================================================
     TOGGLE COMMENTS
  ======================================================= */

  const handleToggleComments =
    async (postId) => {
      if (!postId) {
        setFetchError(
          "Unable to open comments because the Post ID is missing."
        );

        return;
      }

      const existingState =
        commentStates[postId];

      const shouldOpen =
        !existingState?.isOpen;

      if (!shouldOpen) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              isOpen: false,
            },
          })
        );

        return;
      }

      setCommentStates(
        (previousStates) => ({
          ...previousStates,

          [postId]: {
            ...(previousStates[
              postId
            ] || {}),
            isOpen: true,

            commentText:
              previousStates[
                postId
              ]?.commentText || "",
          },
        })
      );

      if (
        !Array.isArray(
          existingState?.comments
        )
      ) {
        await loadComments(
          postId
        );
      }
    };

  /* =======================================================
     COMMENT TEXT CHANGE
  ======================================================= */

  const setCommentText = (
    postId,
    value
  ) => {
    setCommentStates(
      (previousStates) => ({
        ...previousStates,

        [postId]: {
          ...(previousStates[
            postId
          ] || {}),
          commentText: value,
        },
      })
    );
  };

  /* =======================================================
     CREATE COMMENT
  ======================================================= */

  const handleSubmitComment =
    async (event, postId) => {
      event.preventDefault();

      if (!postId) {
        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              error:
                "Please login before commenting.",
            },
          })
        );

        return;
      }

      if (!currentUser) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              error:
                "Unable to identify your account. Please login again.",
            },
          })
        );

        return;
      }

      const commentText =
        commentStates[postId]
          ?.commentText || "";

      const cleanContent =
        commentText.trim();

      if (!cleanContent) {
        return;
      }

      if (
        cleanContent.length >
        1000
      ) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              error:
                "Comment cannot exceed 1000 characters.",
            },
          })
        );

        return;
      }

      setCommentStates(
        (previousStates) => ({
          ...previousStates,

          [postId]: {
            ...(previousStates[
              postId
            ] || {}),
            isSubmitting: true,
            error: "",
          },
        })
      );

      try {
        const response =
          await api.post(
            `/comments/post/${postId}`,
            {
              content:
                cleanContent,
            }
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data
              ?.message ||
              "Unable to add comment."
          );
        }

        let newComment =
          response.data?.comment;

        if (newComment) {
          const currentUserId =
            getUserId(
              currentUser
            );

          const isLiked =
            hasUserLikedComment(
              newComment,
              currentUserId
            );

          newComment = {
            ...newComment,

            likes:
              Array.isArray(
                newComment?.likes
              )
                ? newComment.likes
                : [],

            likesCount:
              getCommentLikesCount(
                newComment
              ),

            isLiked,

            likedByCurrentUser:
              isLiked,

            isLikeLoading:
              false,
          };

          setCommentStates(
            (previousStates) => ({
              ...previousStates,

              [postId]: {
                ...(previousStates[
                  postId
                ] || {}),

                isSubmitting:
                  false,

                error: "",

                commentText:
                  "",

                comments: [
                  newComment,
                  ...(previousStates[
                    postId
                  ]?.comments || []),
                ],

                isOpen: true,
              },
            })
          );
        } else {
          await loadComments(
            postId
          );

          setCommentStates(
            (previousStates) => ({
              ...previousStates,

              [postId]: {
                ...(previousStates[
                  postId
                ] || {}),

                isSubmitting:
                  false,

                error: "",

                commentText:
                  "",

                isOpen: true,
              },
            })
          );
        }

        if (
          typeof response.data
            ?.commentsCount ===
          "number"
        ) {
          const newCount =
            response.data
              .commentsCount;

          setPosts(
            (previousPosts) =>
              previousPosts.map(
                (post) => {
                  if (
                    String(
                      getPostId(
                        post
                      )
                    ) !==
                    String(postId)
                  ) {
                    return post;
                  }

                  return {
                    ...post,

                    comments:
                      newCount,

                    commentsCount:
                      newCount,
                  };
                }
              )
          );
        } else {
          setPosts(
            (previousPosts) =>
              previousPosts.map(
                (post) => {
                  if (
                    String(
                      getPostId(
                        post
                      )
                    ) !==
                    String(postId)
                  ) {
                    return post;
                  }

                  const currentCount =
                    getCommentsCount(
                      post
                    );

                  return {
                    ...post,

                    comments:
                      currentCount +
                      1,

                    commentsCount:
                      currentCount +
                      1,
                  };
                }
              )
          );
        }
      } catch (error) {
        console.error(
          "Failed to create comment:",
          error
        );

        console.error(
          "Create comment backend response:",
          error.response?.data
        );

        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),

              isSubmitting:
                false,

              error:
                error.response
                  ?.data
                  ?.message ||
                error.message ||
                "Unable to add comment. Please try again.",
            },
          })
        );

        if (
          error.response
            ?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setCurrentUser(null);
        }
      }
    };

  /* =======================================================
     DELETE COMMENT
  ======================================================= */

  const handleDeleteComment =
    async (postId, comment) => {
      const commentId =
        comment?._id ||
        comment?.id;

      if (!commentId) {
        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              error:
                "Please login again before deleting a comment.",
            },
          })
        );

        return;
      }

      try {
        const response =
          await api.delete(
            `/comments/${commentId}`
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data
              ?.message ||
              "Unable to delete comment."
          );
        }

        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),

              comments: (
                previousStates[
                  postId
                ]?.comments || []
              ).filter(
                (item) =>
                  String(
                    item?._id ||
                      item?.id
                  ) !==
                  String(
                    commentId
                  )
              ),

              error: "",
            },
          })
        );

        if (
          typeof response.data
            ?.commentsCount ===
          "number"
        ) {
          const newCount =
            response.data
              .commentsCount;

          setPosts(
            (previousPosts) =>
              previousPosts.map(
                (post) => {
                  if (
                    String(
                      getPostId(
                        post
                      )
                    ) !==
                    String(postId)
                  ) {
                    return post;
                  }

                  return {
                    ...post,

                    comments:
                      newCount,

                    commentsCount:
                      newCount,
                  };
                }
              )
          );
        } else {
          setPosts(
            (previousPosts) =>
              previousPosts.map(
                (post) => {
                  if (
                    String(
                      getPostId(
                        post
                      )
                    ) !==
                    String(postId)
                  ) {
                    return post;
                  }

                  const currentCount =
                    getCommentsCount(
                      post
                    );

                  const newCount =
                    Math.max(
                      currentCount -
                        1,
                      0
                    );

                  return {
                    ...post,

                    comments:
                      newCount,

                    commentsCount:
                      newCount,
                  };
                }
              )
          );
        }
      } catch (error) {
        console.error(
          "Failed to delete comment:",
          error
        );

        console.error(
          "Delete comment backend response:",
          error.response?.data
        );

        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),

              error:
                error.response
                  ?.data
                  ?.message ||
                error.message ||
                "Unable to delete comment.",
            },
          })
        );
      }
    };

  /* =========================================================
     LIKE / UNLIKE COMMENT
  ========================================================= */

  const handleLikeComment =
    async (postId, comment) => {
      const commentId =
        comment?._id ||
        comment?.id;

      if (
        !postId ||
        !commentId
      ) {
        console.error(
          "Cannot like comment because Post ID or Comment ID is missing."
        );

        return;
      }

      if (
        comment?.isLikeLoading
      ) {
        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              error:
                "Please login before liking a comment.",
            },
          })
        );

        return;
      }

      const currentUserId =
        getUserId(
          currentUser
        );

      if (!currentUserId) {
        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),
              error:
                "Unable to identify your account. Please login again.",
            },
          })
        );

        return;
      }

      const wasLiked =
        hasUserLikedComment(
          comment,
          currentUserId
        ) ||
        Boolean(
          comment?.isLiked
        ) ||
        Boolean(
          comment?.likedByCurrentUser
        );

      const originalComment =
        {
          ...comment,

          likes:
            Array.isArray(
              comment?.likes
            )
              ? [
                  ...comment.likes,
                ]
              : [],

          isLiked:
            wasLiked,

          likedByCurrentUser:
            wasLiked,

          isLikeLoading:
            false,

          likesCount:
            getCommentLikesCount(
              comment
            ),
        };

      setCommentStates(
        (previousStates) => ({
          ...previousStates,

          [postId]: {
            ...(previousStates[
              postId
            ] || {}),

            comments: (
              previousStates[
                postId
              ]?.comments || []
            ).map((item) => {
              if (
                String(
                  item?._id ||
                    item?.id
                ) !==
                String(
                  commentId
                )
              ) {
                return item;
              }

              const currentLikes =
                Array.isArray(
                  item?.likes
                )
                  ? [
                      ...item.likes,
                    ]
                  : [];

              let updatedLikes;

              if (wasLiked) {
                updatedLikes =
                  currentLikes.filter(
                    (like) =>
                      String(
                        getLikeUserId(
                          like
                        )
                      ) !==
                      String(
                        currentUserId
                      )
                  );
              } else {
                updatedLikes =
                  [
                    ...currentLikes,
                    currentUserId,
                  ];
              }

              return {
                ...item,

                likes:
                  updatedLikes,

                likesCount:
                  updatedLikes.length,

                isLiked:
                  !wasLiked,

                likedByCurrentUser:
                  !wasLiked,

                isLikeLoading:
                  true,
              };
            }),

            error: "",
          },
        })
      );

      try {
        let response;

        if (wasLiked) {
          console.log(
            "Unliking comment:",
            commentId
          );

          response =
            await api.delete(
              `/comments/${commentId}/like`
            );
        } else {
          console.log(
            "Liking comment:",
            commentId
          );

          response =
            await api.post(
              `/comments/${commentId}/like`
            );
        }

        console.log(
          "Comment like API response:",
          response.data
        );

        const responseData =
          response?.data || {};

        const updatedComment =
          responseData?.comment ||
          responseData?.data
            ?.comment ||
          null;

        if (
          updatedComment
        ) {
          const updatedLikes =
            Array.isArray(
              updatedComment.likes
            )
              ? updatedComment.likes
              : [];

          const updatedIsLiked =
            hasUserLikedComment(
              updatedComment,
              currentUserId
            );

          const backendLikesCount =
            typeof responseData?.likesCount ===
            "number"
              ? responseData.likesCount
              : updatedLikes.length;

          setCommentStates(
            (previousStates) => ({
              ...previousStates,

              [postId]: {
                ...(previousStates[
                  postId
                ] || {}),

                comments: (
                  previousStates[
                    postId
                  ]?.comments || []
                ).map((item) => {
                  if (
                    String(
                      item?._id ||
                        item?.id
                    ) !==
                    String(
                      commentId
                    )
                  ) {
                    return item;
                  }

                  return {
                    ...item,

                    ...updatedComment,

                    likes:
                      updatedLikes,

                    likesCount:
                      backendLikesCount,

                    isLiked:
                      updatedIsLiked,

                    likedByCurrentUser:
                      updatedIsLiked,

                    isLikeLoading:
                      false,
                  };
                }),

                error: "",
              },
            })
          );

          return;
        }

        const likesCount =
          responseData?.likesCount;

        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),

              comments: (
                previousStates[
                  postId
                ]?.comments || []
              ).map((item) => {
                if (
                  String(
                    item?._id ||
                      item?.id
                  ) !==
                  String(
                    commentId
                  )
                ) {
                  return item;
                }

                return {
                  ...item,

                  isLiked:
                    !wasLiked,

                  likedByCurrentUser:
                    !wasLiked,

                  isLikeLoading:
                    false,

                  ...(typeof likesCount ===
                  "number"
                    ? {
                        likesCount,
                      }
                    : {}),
                };
              }),

              error: "",
            },
          })
        );
      } catch (error) {
        console.error(
          "Failed to like/unlike comment:",
          error
        );

        console.error(
          "Comment like backend response:",
          error.response?.data
        );

        const rollbackError =
          error.response?.data
            ?.message ||
          error.message ||
          "Unable to update comment like. Please try again.";

        setCommentStates(
          (previousStates) => ({
            ...previousStates,

            [postId]: {
              ...(previousStates[
                postId
              ] || {}),

              comments: (
                previousStates[
                  postId
                ]?.comments || []
              ).map((item) => {
                if (
                  String(
                    item?._id ||
                      item?.id
                  ) !==
                  String(
                    commentId
                  )
                ) {
                  return item;
                }

                return {
                  ...originalComment,

                  isLikeLoading:
                    false,
                };
              }),

              error:
                rollbackError,
            },
          })
        );

        if (
          error.response
            ?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setCurrentUser(null);

          setCommentStates(
            (previousStates) => ({
              ...previousStates,

              [postId]: {
                ...(previousStates[
                  postId
                ] || {}),

                error:
                  "Your login session has expired. Please login again.",
              },
            })
          );
        }
      }
    };

  /* =======================================================
     LIKE / UNLIKE POST
  ======================================================= */

  const handleLike = async (
    post
  ) => {
    const postId =
      getPostId(post);

    if (!postId) {
      console.error(
        "Cannot like post because Post ID is missing."
      );

      setFetchError(
        "Unable to like this post because the Post ID is missing."
      );

      return;
    }

    if (post?.isLikeLoading) {
      return;
    }

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      setFetchError(
        "Please login before liking a post."
      );

      return;
    }

    const currentUserId =
      getUserId(
        currentUser
      );

    if (!currentUserId) {
      setFetchError(
        "Unable to identify your account. Please login again."
      );

      return;
    }

    const wasLiked =
      hasUserLikedPost(
        post,
        currentUserId
      ) ||
      Boolean(
        post?.isLiked
      ) ||
      Boolean(
        post?.likedByCurrentUser
      );

    const originalPost = {
      ...post,

      likes:
        Array.isArray(
          post.likes
        )
          ? [...post.likes]
          : [],

      isLiked: wasLiked,

      likedByCurrentUser:
        wasLiked,

      isLikeLoading:
        false,
    };

    setPosts(
      (previousPosts) =>
        previousPosts.map(
          (item) => {
            if (
              String(
                getPostId(item)
              ) !==
              String(postId)
            ) {
              return item;
            }

            return {
              ...item,

              isLiked:
                !wasLiked,

              likedByCurrentUser:
                !wasLiked,

              isLikeLoading:
                true,
            };
          }
        )
    );

    try {
      let response;

      if (wasLiked) {
        console.log(
          "Unliking post:",
          postId
        );

        response =
          await api.delete(
            `/posts/${postId}/like`
          );
      } else {
        console.log(
          "Liking post:",
          postId
        );

        response =
          await api.post(
            `/posts/${postId}/like`
          );
      }

      console.log(
        "Like API response:",
        response.data
      );

      const responseData =
        response?.data || {};

      const updatedPost =
        responseData?.post ||
        responseData?.data?.post ||
        null;

      if (updatedPost) {
        const updatedIsLiked =
          hasUserLikedPost(
            updatedPost,
            currentUserId
          );

        setPosts(
          (previousPosts) =>
            previousPosts.map(
              (item) => {
                if (
                  String(
                    getPostId(
                      item
                    )
                  ) !==
                  String(postId)
                ) {
                  return item;
                }

                return {
                  ...item,

                  ...updatedPost,

                  likes:
                    Array.isArray(
                      updatedPost.likes
                    )
                      ? updatedPost.likes
                      : [],

                  isLiked:
                    updatedIsLiked,

                  likedByCurrentUser:
                    updatedIsLiked,

                  isLikeLoading:
                    false,
                };
              }
            )
        );

        return;
      }

      const likesCount =
        responseData?.likesCount;

      setPosts(
        (previousPosts) =>
          previousPosts.map(
            (item) => {
              if (
                String(
                  getPostId(item)
                ) !==
                String(postId)
              ) {
                return item;
              }

              return {
                ...item,

                isLiked:
                  !wasLiked,

                likedByCurrentUser:
                  !wasLiked,

                isLikeLoading:
                  false,

                ...(typeof likesCount ===
                "number"
                  ? {
                      likes: Array(
                        likesCount
                      ).fill(null),
                    }
                  : {}),
              };
            }
          )
      );
    } catch (error) {
      console.error(
        "Failed to like/unlike post:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setPosts(
        (previousPosts) =>
          previousPosts.map(
            (item) => {
              if (
                String(
                  getPostId(item)
                ) !==
                String(postId)
              ) {
                return item;
              }

              return {
                ...originalPost,

                isLikeLoading:
                  false,
              };
            }
          )
      );

      if (
        error.response
          ?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setCurrentUser(null);

        setFetchError(
          "Your login session has expired. Please login again."
        );

        return;
      }

      if (
        error.response
          ?.status === 400
      ) {
        setFetchError(
          error.response?.data
            ?.message ||
            "The server rejected this like request."
        );

        return;
      }

      setFetchError(
        error.response?.data
          ?.message ||
          "Unable to update like. Please try again."
      );
    }
  };

  /* =======================================================
     SAVE / UNSAVE POST
  ======================================================= */

  const handleSavePost =
    async (post) => {
      const postId =
        getPostId(post);

      if (!postId) {
        console.error(
          "Cannot save post because Post ID is missing."
        );

        setFetchError(
          "Unable to save this post because the Post ID is missing."
        );

        return;
      }

      if (post?.isSaveLoading) {
        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setFetchError(
          "Please login before saving a post."
        );

        return;
      }

      const currentUserId =
        getUserId(
          currentUser
        );

      if (!currentUserId) {
        setFetchError(
          "Unable to identify your account. Please login again."
        );

        return;
      }

      const wasSaved =
        hasUserSavedPost(
          post,
          currentUserId
        ) ||
        Boolean(
          post?.isSaved
        ) ||
        Boolean(
          post?.savedByCurrentUser
        );

      const originalPost = {
        ...post,

        savedBy:
          Array.isArray(
            post?.savedBy
          )
            ? [
                ...post.savedBy,
              ]
            : [],

        isSaved: wasSaved,

        savedByCurrentUser:
          wasSaved,

        isSaveLoading:
          false,
      };

      /* =====================================================
         OPTIMISTIC UPDATE
      ===================================================== */

      setPosts(
        (previousPosts) =>
          previousPosts.map(
            (item) => {
              if (
                String(
                  getPostId(item)
                ) !==
                String(postId)
              ) {
                return item;
              }

              const currentSavedBy =
                Array.isArray(
                  item?.savedBy
                )
                  ? [
                      ...item.savedBy,
                    ]
                  : [];

              let updatedSavedBy;

              if (wasSaved) {
                updatedSavedBy =
                  currentSavedBy.filter(
                    (savedUser) => {
                      const savedUserId =
                        getLikeUserId(
                          savedUser
                        );

                      return (
                        String(
                          savedUserId
                        ) !==
                        String(
                          currentUserId
                        )
                      );
                    }
                  );
              } else {
                updatedSavedBy = [
                  ...currentSavedBy,
                  currentUserId,
                ];
              }

              return {
                ...item,

                savedBy:
                  updatedSavedBy,

                isSaved:
                  !wasSaved,

                savedByCurrentUser:
                  !wasSaved,

                isSaveLoading:
                  true,
              };
            }
          )
      );

      try {
        let response;

        if (wasSaved) {
          console.log(
            "Unsaving post:",
            postId
          );

          response =
            await api.delete(
              `/posts/${postId}/save`
            );
        } else {
          console.log(
            "Saving post:",
            postId
          );

          response =
            await api.post(
              `/posts/${postId}/save`
            );
        }

        console.log(
          "Save API response:",
          response.data
        );

        const responseData =
          response?.data || {};

        const updatedPost =
          responseData?.post ||
          responseData?.data
            ?.post ||
          null;

        /* ===================================================
           BACKEND RETURNED COMPLETE POST
        =================================================== */

        if (updatedPost) {
          const updatedIsSaved =
            hasUserSavedPost(
              updatedPost,
              currentUserId
            );

          setPosts(
            (previousPosts) =>
              previousPosts.map(
                (item) => {
                  if (
                    String(
                      getPostId(
                        item
                      )
                    ) !==
                    String(postId)
                  ) {
                    return item;
                  }

                  return {
                    ...item,

                    ...updatedPost,

                    savedBy:
                      Array.isArray(
                        updatedPost.savedBy
                      )
                        ? updatedPost.savedBy
                        : [],

                    isSaved:
                      updatedIsSaved,

                    savedByCurrentUser:
                      updatedIsSaved,

                    isSaveLoading:
                      false,
                  };
                }
              )
          );

          return;
        }

        /* ===================================================
           BACKEND RETURNED ONLY SAVED COUNT
        =================================================== */

        const savedCount =
          responseData?.savedCount;

        setPosts(
          (previousPosts) =>
            previousPosts.map(
              (item) => {
                if (
                  String(
                    getPostId(
                      item
                    )
                  ) !==
                  String(postId)
                ) {
                  return item;
                }

                return {
                  ...item,

                  isSaved:
                    !wasSaved,

                  savedByCurrentUser:
                    !wasSaved,

                  isSaveLoading:
                    false,

                  ...(typeof savedCount ===
                  "number"
                    ? {
                        savedCount,
                      }
                    : {}),
                };
              }
            )
        );
      } catch (error) {
        console.error(
          "Failed to save/unsave post:",
          error
        );

        console.error(
          "Save backend response:",
          error.response?.data
        );

        /* ===================================================
           ROLLBACK
        =================================================== */

        setPosts(
          (previousPosts) =>
            previousPosts.map(
              (item) => {
                if (
                  String(
                    getPostId(item)
                  ) !==
                  String(postId)
                ) {
                  return item;
                }

                return {
                  ...originalPost,

                  isSaveLoading:
                    false,
                };
              }
            )
        );

        if (
          error.response
            ?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setCurrentUser(null);

          setFetchError(
            "Your login session has expired. Please login again."
          );

          return;
        }

        setFetchError(
          error.response?.data
            ?.message ||
            error.message ||
            "Unable to save this post. Please try again."
        );
      }
    };

  /* =======================================================
     CREATE POST
  ======================================================= */

  const handleCreatePost =
    async (newPost) => {
      if (!newPost) {
        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setFetchError(
          "Please login before creating a post."
        );

        return;
      }

      if (!currentUser) {
        setFetchError(
          "Unable to identify your account. Please login again."
        );

        return;
      }

      try {
        setFetchError("");

        const payload = {
          content:
            newPost?.content ||
            "",

          type:
            newPost?.type ||
            "post",

          media:
            Array.isArray(
              newPost?.media
            )
              ? newPost.media
              : [],

          link:
            newPost?.link ||
            null,

          hashtags:
            Array.isArray(
              newPost?.hashtags
            )
              ? newPost.hashtags
              : [],

          mentions:
            Array.isArray(
              newPost?.mentions
            )
              ? newPost.mentions
              : [],

          poll:
            newPost?.poll ||
            null,

          job:
            newPost?.job ||
            null,

          event:
            newPost?.event ||
            null,
        };

        console.log(
          "Creating post:",
          payload
        );

        const response =
          await api.post(
            "/posts",
            payload
          );

        console.log(
          "Create post response:",
          response.data
        );

        if (
          response.data?.success &&
          response.data?.post
        ) {
          const createdPost =
            response.data.post;

          const currentUserId =
            getUserId(
              currentUser
            );

          const isLiked =
            hasUserLikedPost(
              createdPost,
              currentUserId
            );

          const isSaved =
            hasUserSavedPost(
              createdPost,
              currentUserId
            );

          const formattedPost =
            {
              ...createdPost,

              likes:
                Array.isArray(
                  createdPost.likes
                )
                  ? createdPost.likes
                  : [],

              savedBy:
                Array.isArray(
                  createdPost.savedBy
                )
                  ? createdPost.savedBy
                  : [],

              isLiked,

              likedByCurrentUser:
                isLiked,

              isLikeLoading:
                false,

              isSaved,

              savedByCurrentUser:
                isSaved,

              isSaveLoading:
                false,
            };

          setPosts(
            (previousPosts) => [
              formattedPost,
              ...previousPosts,
            ]
          );

          setIsCreatePostOpen(
            false
          );

          return;
        }

        setFetchError(
          response.data
            ?.message ||
            "Post could not be created."
        );
      } catch (error) {
        console.error(
          "Failed to create post:",
          error
        );

        console.error(
          "Create post backend response:",
          error.response?.data
        );

        setFetchError(
          error.response?.data
            ?.message ||
            "Unable to create post. Please try again."
        );

        throw error;
      }
    };

  /* =======================================================
     CURRENT USER DATA
  ======================================================= */

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    "AlumniConnect User";

  const userImage =
    currentUser?.profileImage ||
    currentUser?.avatar ||
    currentUser?.photo ||
    currentUser?.profilePhoto ||
    "";

  const userInitials =
    getInitials(userName);

  const userRole =
    currentUser?.role ||
    "Member";

  /* =======================================================
     TRENDING
  ======================================================= */

  const trendingTopics =
    useMemo(
      () => [
        "#CareerGrowth",
        "#MERNStack",
        "#JavaDeveloper",
        "#AlumniConnect",
        "#JobOpportunities",
        "#InterviewPreparation",
      ],
      []
    );

  const upcomingEvents =
    useMemo(
      () => [
        {
          title:
            "Alumni Career Guidance Session",
          date: "2026-09-20",
          type: "Career",
        },
        {
          title:
            "Technical Interview Workshop",
          date: "2026-09-24",
          type: "Workshop",
        },
        {
          title:
            "Campus Alumni Networking",
          date: "2026-09-28",
          type: "Networking",
        },
      ],
      []
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
              <GraduationCap
                size={22}
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-base font-extrabold tracking-tight text-slate-900">
                Alumni
                <span className="text-indigo-600">
                  Connect
                </span>
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                College Community
              </p>
            </div>
          </Link>

          <div className="hidden max-w-md flex-1 md:block">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                type="text"
                placeholder="Search alumni, jobs, posts..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 md:hidden"
            >
              <Search size={20} />
            </button>

            <button
              type="button"
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
              type="button"
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
            >
              <MessageCircle
                size={20}
              />
            </button>

            <div className="ml-1 hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
              <Avatar
                initials={userInitials}
                image={userImage}
                size="sm"
              />

              <div className="hidden lg:block">
                <p className="max-w-[130px] truncate text-sm font-semibold text-slate-800">
                  {userName}
                </p>

                <p className="text-[11px] capitalize text-slate-400">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <AnimatePresence>
          {fetchError && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1">
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-1">
                  {fetchError}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFetchError(
                    ""
                  )
                }
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          {/* LEFT SIDEBAR */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3 px-3 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Community
                  </p>
                </div>

                <div className="space-y-1">
                  <SidebarLink
                    active={
                      activeSidebar ===
                      "Community"
                    }
                    onClick={() =>
                      setActiveSidebar(
                        "Community"
                      )
                    }
                    icon={
                      <Users
                        size={18}
                      />
                    }
                    label="Community"
                  />

                  <SidebarLink
                    active={
                      activeSidebar ===
                      "Alumni"
                    }
                    onClick={() =>
                      setActiveSidebar(
                        "Alumni"
                      )
                    }
                    icon={
                      <GraduationCap
                        size={18}
                      />
                    }
                    label="Alumni Directory"
                  />

                  <SidebarLink
                    active={
                      activeSidebar ===
                      "Jobs"
                    }
                    onClick={() =>
                      setActiveSidebar(
                        "Jobs"
                      )
                    }
                    icon={
                      <Briefcase
                        size={18}
                      />
                    }
                    label="Jobs & Internships"
                  />

                  <SidebarLink
                    active={
                      activeSidebar ===
                      "Mentorship"
                    }
                    onClick={() =>
                      setActiveSidebar(
                        "Mentorship"
                      )
                    }
                    icon={
                      <UserPlus
                        size={18}
                      />
                    }
                    label="Mentorship"
                  />

                  <SidebarLink
                    active={
                      activeSidebar ===
                      "Events"
                    }
                    onClick={() =>
                      setActiveSidebar(
                        "Events"
                      )
                    }
                    icon={
                      <CalendarDays
                        size={18}
                      />
                    }
                    label="Events"
                  />

                  <SidebarLink
                    active={
                      activeSidebar ===
                      "Success Stories"
                    }
                    onClick={() =>
                      setActiveSidebar(
                        "Success Stories"
                      )
                    }
                    icon={
                      <Award size={18} />
                    }
                    label="Success Stories"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={userInitials}
                    image={userImage}
                    size="md"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {userName}
                    </p>

                    <p className="text-xs capitalize text-slate-400">
                      {userRole}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  View Profile
                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>
            </div>
          </aside>

          {/* CENTER FEED */}

          <section className="min-w-0">
            <div className="mb-4 lg:hidden">
              <h1 className="text-xl font-extrabold text-slate-900">
                Community
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Connect, learn and grow with your alumni network.
              </p>
            </div>

            {/* CREATE POST */}

            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={userInitials}
                  image={userImage}
                  size="md"
                />

                <button
                  type="button"
                  onClick={() =>
                    setIsCreatePostOpen(
                      true
                    )
                  }
                  className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-400 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  Share a career update, opportunity or advice...
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setIsCreatePostOpen(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ImageIcon
                    size={18}
                  />
                  Photo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsCreatePostOpen(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Briefcase
                    size={18}
                  />
                  Job
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsCreatePostOpen(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <CalendarDays
                    size={18}
                  />
                  Event
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsCreatePostOpen(
                      true
                    )
                  }
                  className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create
                </button>
              </div>
            </div>

            {/* LOADING */}

            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-200" />

                        <div className="flex-1">
                          <div className="h-4 w-40 rounded bg-slate-200" />
                          <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
                        </div>
                      </div>

                      <div className="mt-5 h-4 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
                      <div className="mt-4 h-40 rounded-xl bg-slate-100" />
                    </div>
                  )
                )}
              </div>
            ) : posts.length ===
              0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Users size={26} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  No posts yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Be the first alumni or student to share a career experience, job opportunity or useful advice.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setIsCreatePostOpen(
                      true
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={17} />
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(
                  (
                    post,
                    index
                  ) => {
                    const postId =
                      getPostId(
                        post
                      );

                    const state =
                      commentStates[
                        postId
                      ] || {};

                    return (
                      <PostCard
                        key={
                          postId ||
                          `post-fallback-${index}`
                        }
                        post={post}
                        onLike={
                          handleLike
                        }
                        onSave={
                          handleSavePost
                        }
                        currentUser={
                          currentUser
                        }
                        onToggleComments={
                          handleToggleComments
                        }
                        onSubmitComment={
                          handleSubmitComment
                        }
                        onDeleteComment={
                          handleDeleteComment
                        }
                        onLikeComment={
                          (
                            comment
                          ) =>
                            handleLikeComment(
                              postId,
                              comment
                            )
                        }
                        commentState={{
                          ...state,

                          setCommentText:
                            (
                              value
                            ) =>
                              setCommentText(
                                postId,
                                value
                              ),
                        }}
                      />
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">
                    Trending Topics
                  </h2>

                  <TrendingUp
                    size={18}
                    className="text-indigo-600"
                  />
                </div>

                <div className="mt-4 space-y-1">
                  {trendingTopics.map(
                    (topic) => (
                      <button
                        type="button"
                        key={topic}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span>
                          {topic}
                        </span>

                        <ChevronRight
                          size={15}
                          className="text-slate-300"
                        />
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">
                    Upcoming Events
                  </h2>

                  <CalendarDays
                    size={18}
                    className="text-indigo-600"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {upcomingEvents.map(
                    (
                      event,
                      index
                    ) => (
                      <div
                        key={`${event.title}-${index}`}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                            <span className="text-[9px] font-bold uppercase">
                              {new Date(
                                event.date
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  month:
                                    "short",
                                }
                              )}
                            </span>

                            <span className="text-sm font-extrabold">
                              {new Date(
                                event.date
                              ).getDate()}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-5 text-slate-800">
                              {
                                event.title
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                event.type
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  View all events
                  <ChevronRight
                    size={15}
                  />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="font-bold text-slate-900">
                  Quick Links
                </h2>

                <div className="mt-3 space-y-1">
                  <Link
                    to="/alumni"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                  >
                    Alumni Directory
                    <ChevronRight
                      size={15}
                    />
                  </Link>

                  <Link
                    to="/jobs"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                  >
                    Jobs & Internships
                    <ChevronRight
                      size={15}
                    />
                  </Link>

                  <Link
                    to="/mentorship"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                  >
                    Find a Mentor
                    <ChevronRight
                      size={15}
                    />
                  </Link>

                  <Link
                    to="/roadmaps"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                  >
                    Career Roadmaps
                    <ChevronRight
                      size={15}
                    />
                  </Link>
                </div>
              </div>

              <p className="px-2 text-center text-[11px] leading-5 text-slate-400">
                © 2026 AlumniConnect
                <br />
                College Alumni, Career Guidance & Recruitment Platform
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* CREATE POST MODAL */}

      <CreatePostModal
        isOpen={
          isCreatePostOpen
        }
        onClose={() =>
          setIsCreatePostOpen(
            false
          )
        }
        onSubmit={
          handleCreatePost
        }
      />
    </div>
  );
}