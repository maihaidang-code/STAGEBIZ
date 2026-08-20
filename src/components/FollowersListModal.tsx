import React, { useState, useEffect } from "react";
import { X, UserCheck, UserPlus, Users } from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { VerifiedBadge } from "./VerifiedBadge";

interface FollowersListModalProps {
  userId: string;
  userName: string;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (id: string) => void;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
  userId,
  userName,
  type,
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const { user: currentUser, isAuthenticated, openAuthModal } = useAuth();
  const [usersList, setUsersList] = useState<(User & { isFollowing: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const fetchFunc = type === "followers" ? api.getFollowers(userId) : api.getFollowing(userId);

    fetchFunc
      .then((data) => {
        setUsersList(data);
        const map: Record<string, boolean> = {};
        data.forEach((u) => {
          map[u.id] = u.isFollowing;
        });
        setFollowingMap(map);
      })
      .catch((err) => console.error("Error fetching list:", err))
      .finally(() => setIsLoading(false));
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  const handleToggleFollow = async (targetUser: User) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    try {
      const res = await api.toggleFollow(targetUser.id);
      setFollowingMap((prev) => ({ ...prev, [targetUser.id]: res.isFollowing }));
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {type === "followers" ? `Người theo dõi ${userName}` : `Đang theo dõi bởi ${userName}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-700/50">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách...</div>
          ) : usersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {type === "followers" ? "Chưa có ai theo dõi người dùng này." : "Chưa theo dõi người dùng nào."}
            </div>
          ) : (
            usersList.map((u) => {
              const isFollowed = followingMap[u.id] ?? false;
              const isMe = currentUser?.id === u.id;

              return (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0 group"
                    onClick={() => {
                      onSelectUser(u.id);
                      onClose();
                    }}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                          {u.name}
                        </p>
                        {u.isVerified && <VerifiedBadge size="xs" />}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">@{u.username}</p>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => handleToggleFollow(u)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isFollowed
                          ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      }`}
                    >
                      {isFollowed ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
