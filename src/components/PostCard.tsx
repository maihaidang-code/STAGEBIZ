import React, { useState } from "react";
import { 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Image as ImageIcon 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Post, ReactionType, ReactionSummary } from "../types";
import { formatTimeAgo } from "../utils/timeAgo";
import { CommentSection } from "./CommentSection";
import { VerifiedBadge } from "./VerifiedBadge";
import { PostReactionButton, ReactionSummaryBadge } from "./Reactions";

interface PostCardProps {
  post: Post;
  onPostUpdated: (updated: Post) => void;
  onPostDeleted: (postId: string) => void;
  onSelectUser: (userId: string) => void;
  onFilterHashtag: (tag: string) => void;
  onShowImageModal: (url: string) => void;
  onShowToast: (text: string, type?: "success" | "error" | "info") => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostUpdated,
  onPostDeleted,
  onSelectUser,
  onFilterHashtag,
  onShowImageModal,
  onShowToast,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  
  // Reactions state
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    post.userReaction || (user && post.likes.includes(user.id) ? "like" : null)
  );
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [reactionsSummary, setReactionsSummary] = useState<ReactionSummary | undefined>(post.reactionsSummary);

  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Edit post state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.image || "");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isAuthor = user?.id === post.authorId;

  // Handle specific reaction (from floating picker)
  const handleSelectReaction = async (type: ReactionType) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    try {
      const res = await api.reactToPost(post.id, type);
      setUserReaction(res.userReaction);
      setLikesCount(res.likesCount);
      setReactionsSummary(res.reactionsSummary);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Thao tác bày tỏ cảm xúc thất bại";
      onShowToast(errorMsg, "error");
    }
  };

  // Handle quick click toggle on like button
  const handleQuickToggleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    // Toggle: if currently reacted, remove reaction (or toggle like)
    const nextType: ReactionType = userReaction ? userReaction : "like";
    try {
      const res = await api.reactToPost(post.id, nextType);
      setUserReaction(res.userReaction);
      setLikesCount(res.likesCount);
      setReactionsSummary(res.reactionsSummary);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Thao tác thích thất bại";
      onShowToast(errorMsg, "error");
    }
  };

  const handleShare = async () => {
    try {
      const res = await api.sharePost(post.id);
      setSharesCount(res.sharesCount);

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}?post=${post.id}`;
      await navigator.clipboard.writeText(shareUrl);
      onShowToast("Đã sao chép liên kết bài viết vào clipboard!", "success");
    } catch {
      onShowToast("Đã ghi nhận lượt chia sẻ bài viết!", "info");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await api.deletePost(post.id);
      onPostDeleted(post.id);
      onShowToast("Đã xóa bài viết thành công", "info");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Xóa bài viết thất bại";
      onShowToast(errorMsg, "error");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() && !editImageUrl) {
      onShowToast("Nội dung bài viết không được để trống", "error");
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await api.updatePost(post.id, editContent.trim(), editImageUrl || undefined);
      onPostUpdated(updated);
      setIsEditing(false);
      onShowToast("Đã cập nhật bài viết thành công!", "success");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Cập nhật thất bại";
      onShowToast(errorMsg, "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Helper to render text with clickable hashtags
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith("#") && part.length > 1) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onFilterHashtag(part);
            }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const totalReactions = reactionsSummary?.total || likesCount;

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col gap-3.5 transition-all"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectUser(post.authorId)}
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.author.name}
              </h3>
              {post.author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>@{post.author.username}</span>
              <span>•</span>
              <time dateTime={post.createdAt} title={post.createdAt}>
                {formatTimeAgo(post.createdAt)}
              </time>
              {post.updatedAt && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  (đã chỉnh sửa)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Options Menu for Author */}
        {isAuthor && (
          <div className="relative">
            <button
              id={`btn-post-menu-${post.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-full transition-colors"
              title="Tùy chọn bài viết"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Chỉnh sửa bài viết</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Xóa bài viết</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Content / Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 py-1">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-indigo-300 dark:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            placeholder="Nội dung bài viết..."
          />
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              placeholder="URL hình ảnh đính kèm (tùy chọn)..."
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Hủy
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingEdit ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          {post.content && (
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed break-words whitespace-pre-line">
              {renderFormattedContent(post.content)}
            </p>
          )}

          {post.image && (
            <div
              className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[420px] bg-slate-950/5 cursor-pointer group relative"
              onClick={() => onShowImageModal(post.image!)}
            >
              <img
                src={post.image}
                alt="Hình ảnh bài đăng"
                className="w-full h-full object-cover max-h-[420px] group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Phóng to
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Interaction Summary Counters (Top summary bar) */}
      {(totalReactions > 0 || commentsCount > 0 || sharesCount > 0) && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
          <div>
            <ReactionSummaryBadge
              summary={reactionsSummary}
              total={totalReactions}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {commentsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                {commentsCount} bình luận
              </button>
            )}
            {sharesCount > 0 && (
              <span>{sharesCount} lượt chia sẻ</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons: React / Comment / Share */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reaction Button with Floating Picker */}
          <PostReactionButton
            userReaction={userReaction}
            likesCount={likesCount}
            reactionsSummary={reactionsSummary}
            onReact={handleSelectReaction}
            onQuickToggle={handleQuickToggleLike}
            idPrefix={post.id}
          />

          {/* Comment Button */}
          <button
            id={`btn-toggle-comments-${post.id}`}
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showComments
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Bình luận</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          id={`btn-share-${post.id}`}
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          title="Chia sẻ liên kết"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden xs:inline">{sharesCount > 0 ? sharesCount : "Chia sẻ"}</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <CommentSection
          postId={post.id}
          postAuthorId={post.authorId}
          onCommentsCountChange={setCommentsCount}
          onSelectUser={onSelectUser}
          onShowToast={onShowToast}
        />
      )}
    </article>
  );
};
