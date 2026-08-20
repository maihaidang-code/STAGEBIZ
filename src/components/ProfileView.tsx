import React, { useState, useEffect, useCallback } from "react";
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Edit3, 
  UserPlus, 
  UserCheck, 
  Grid, 
  FileText, 
  Heart,
  Share2,
  BadgeCheck
} from "lucide-react";
import { User, Post } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PostCard } from "./PostCard";
import { EditProfileModal } from "./EditProfileModal";
import { FollowersListModal } from "./FollowersListModal";
import { VerifiedBadge } from "./VerifiedBadge";

interface ProfileViewProps {
  userId: string;
  onSelectUser: (userId: string) => void;
  onFilterHashtag: (tag: string) => void;
  onShowImageModal: (url: string) => void;
  onShowToast: (text: string, type?: "success" | "error" | "info") => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onSelectUser,
  onFilterHashtag,
  onShowImageModal,
  onShowToast,
}) => {
  const { user: currentUser, isAuthenticated, openAuthModal, updateUserLocally } = useAuth();
  const [profileData, setProfileData] = useState<(User & { followersCount: number; followingCount: number; postsCount: number; isFollowing: boolean; isSelf: boolean }) | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "photos" | "likes">("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [followersModalState, setFollowersModalState] = useState<{ isOpen: boolean; type: "followers" | "following" }>({
    isOpen: false,
    type: "followers",
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profile, posts] = await Promise.all([
        api.getUserProfile(userId),
        api.getPosts({ userId }),
      ]);
      setProfileData(profile);
      setUserPosts(posts);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Tải thông tin thất bại";
      onShowToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [userId, onShowToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!profileData) return;

    setIsFollowLoading(true);
    try {
      const res = await api.toggleFollow(profileData.id);
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isFollowing: res.isFollowing,
          followersCount: res.targetFollowersCount,
        };
      });
      onShowToast(res.isFollowing ? `Đang theo dõi @${profileData.username}` : `Đã bỏ theo dõi @${profileData.username}`, "info");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Thao tác thất bại";
      onShowToast(errorMsg, "error");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!profileData) return;

    try {
      const res = await api.toggleUserVerification(profileData.id);
      setProfileData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isVerified: res.isVerified,
        };
      });
      if (currentUser?.id === profileData.id) {
        updateUserLocally({ ...currentUser, isVerified: res.isVerified });
      }
      onShowToast(
        res.isVerified
          ? `Đã cấp tick xanh xác minh cho @${profileData.username}`
          : `Đã thu hồi tick xanh xác minh của @${profileData.username}`,
        "success"
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Thao tác thất bại";
      onShowToast(errorMsg, "error");
    }
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setProfileData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedUser,
      };
    });
    updateUserLocally(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-500">Đang tải trang cá nhân...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy người dùng này</p>
      </div>
    );
  }

  const isSelf = currentUser?.id === profileData.id;
  const mediaPosts = userPosts.filter((p) => Boolean(p.image));

  return (
    <div className="flex flex-col gap-4">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-xs">
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-56 w-full bg-slate-900 overflow-hidden">
          <img
            src={profileData.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Profile Info Container */}
        <div className="px-5 sm:px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md bg-white"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {/* Quick Verified Badge Toggle Button */}
              <button
                id="btn-toggle-profile-verification"
                onClick={handleToggleVerification}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  profileData.isVerified
                    ? "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300"
                }`}
                title="Điều chỉnh cấp hoặc thu hồi tick xanh xác minh"
              >
                <BadgeCheck className={`w-4 h-4 ${profileData.isVerified ? "text-sky-500 fill-sky-500 text-white" : "text-slate-400"}`} />
                <span className="hidden sm:inline">{profileData.isVerified ? "Đã có tick xanh" : "Cấp tick xanh"}</span>
              </button>

              {isSelf ? (
                <button
                  id="btn-edit-profile-open"
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa trang cá nhân</span>
                </button>
              ) : (
                <button
                  id="btn-profile-follow"
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    profileData.isFollowing
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                  }`}
                >
                  {profileData.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Theo dõi</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  onShowToast("Đã sao chép liên kết trang cá nhân!", "success");
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                title="Chia sẻ trang cá nhân"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Name & Bio */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {profileData.name}
              </h2>
              {profileData.isVerified && <VerifiedBadge size="md" showText={true} />}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium -mt-0.5">
              @{profileData.username}
            </p>

            {profileData.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed max-w-2xl whitespace-pre-line">
                {profileData.bio}
              </p>
            )}

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4">
              {profileData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.website && (
                <a
                  href={profileData.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{profileData.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Tham gia{" "}
                  {new Date(profileData.createdAt).toLocaleDateString("vi-VN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Followers & Following Counters */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <button
                onClick={() => setFollowersModalState({ isOpen: true, type: "following" })}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {profileData.followingCount}
                </span>
                <span className="text-xs text-slate-400">Đang theo dõi</span>
              </button>

              <button
                onClick={() => setFollowersModalState({ isOpen: true, type: "followers" })}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {profileData.followersCount}
                </span>
                <span className="text-xs text-slate-400">Người theo dõi</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {userPosts.length}
                </span>
                <span className="text-xs text-slate-400">Bài viết</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-4">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "posts"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Bài viết ({userPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "photos"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Hình ảnh ({mediaPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "posts" && (
        <div className="flex flex-col gap-4">
          {userPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <p className="text-sm text-slate-400">Người dùng này chưa có bài viết nào.</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdated={(updated) => {
                  setUserPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                }}
                onPostDeleted={(postId) => {
                  setUserPosts((prev) => prev.filter((p) => p.id !== postId));
                }}
                onSelectUser={onSelectUser}
                onFilterHashtag={onFilterHashtag}
                onShowImageModal={onShowImageModal}
                onShowToast={onShowToast}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "photos" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          {mediaPosts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Chưa có hình ảnh nào được đăng tải.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {mediaPosts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onShowImageModal(p.image!)}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={p.image}
                    alt="Media post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-white" /> {p.likes.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={profileData}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
          onShowToast={onShowToast}
        />
      )}

      {/* Followers / Following List Modal */}
      {followersModalState.isOpen && (
        <FollowersListModal
          userId={profileData.id}
          userName={profileData.name}
          type={followersModalState.type}
          isOpen={followersModalState.isOpen}
          onClose={() => setFollowersModalState({ ...followersModalState, isOpen: false })}
          onSelectUser={onSelectUser}
        />
      )}
    </div>
  );
};
