import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { SidebarLeft, NavTab } from "./components/SidebarLeft";
import { SidebarRight } from "./components/SidebarRight";
import { CreatePostBox } from "./components/CreatePostBox";
import { PostCard } from "./components/PostCard";
import { ProfileView } from "./components/ProfileView";
import { AuthModal } from "./components/AuthModal";
import { ArchitectureDocsModal } from "./components/ArchitectureDocsModal";
import { ImageLightboxModal } from "./components/ImageLightboxModal";
import { Toast, ToastMessage } from "./components/Toast";
import { api } from "./services/api";
import { Post } from "./types";
import { Sparkles, RefreshCw, X, Search, Compass, AlertCircle } from "lucide-react";

function MainApp() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavTab>("for-you");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Modals & Lightbox
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Posts based on active Tab and Search Query
  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      let tabParam: "for-you" | "following" | undefined = undefined;
      if (currentTab === "following") {
        tabParam = "following";
      }

      const data = await api.getPosts({
        tab: tabParam,
        search: searchQuery.trim() || undefined,
      });
      setPosts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải bảng tin";
      showToast(msg, "error");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [currentTab, searchQuery]);

  useEffect(() => {
    if (currentTab !== "profile" && currentTab !== "docs") {
      fetchPosts();
    }
  }, [fetchPosts, currentTab]);

  const handleSelectTab = (tab: NavTab) => {
    if (tab === "docs") {
      setShowDocsModal(true);
      return;
    }
    setCurrentTab(tab);
    setSelectedUserId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentTab("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleFilterHashtag = (tag: string) => {
    setSearchQuery(tag);
    if (currentTab === "profile") {
      setCurrentTab("for-you");
      setSelectedUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenCreatePost={() => {
          if (!isAuthenticated) {
            openAuthModal("login");
            return;
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
          const textarea = document.getElementById("create-post-textarea");
          if (textarea) textarea.focus();
        }}
        onOpenArchitectureDocs={() => setShowDocsModal(true)}
        onSelectUser={handleSelectUser}
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentTab === "profile" && q.trim()) {
            setCurrentTab("for-you");
            setSelectedUserId(null);
          }
        }}
        searchQuery={searchQuery}
        onNavigateHome={() => {
          setCurrentTab("for-you");
          setSelectedUserId(null);
          setSearchQuery("");
        }}
      />

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR (Col 1-3 on desktop) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-20">
            <SidebarLeft
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              onOpenCreatePost={() => {
                if (!isAuthenticated) {
                  openAuthModal("login");
                  return;
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
                const textarea = document.getElementById("create-post-textarea");
                if (textarea) textarea.focus();
              }}
              onSelectUser={handleSelectUser}
            />
          </div>

          {/* CENTER FEED / VIEW (Col 4-8 on desktop, col 1 on mobile) */}
          <div className="col-span-1 md:col-span-9 lg:col-span-6 flex flex-col gap-4">
            
            {/* Active Search Filter Banner */}
            {searchQuery && (
              <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>
                    Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  title="Xóa bộ lọc"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Profile View Mode */}
            {currentTab === "profile" && selectedUserId ? (
              <ProfileView
                userId={selectedUserId}
                onSelectUser={handleSelectUser}
                onFilterHashtag={handleFilterHashtag}
                onShowImageModal={setLightboxImageUrl}
                onShowToast={showToast}
              />
            ) : (
              /* Newsfeed View Mode */
              <>
                {/* Create Post Box (top of feed) */}
                <CreatePostBox
                  onPostCreated={handlePostCreated}
                  onShowToast={showToast}
                />

                {/* Feed Filter Tabs */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <div className="flex items-center gap-1">
                    <button
                      id="feed-tab-for-you"
                      onClick={() => handleSelectTab("for-you")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentTab === "for-you"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      Dành cho bạn
                    </button>

                    <button
                      id="feed-tab-following"
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal("login");
                          return;
                        }
                        handleSelectTab("following");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentTab === "following"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      Đang theo dõi
                    </button>

                    <button
                      id="feed-tab-explore"
                      onClick={() => handleSelectTab("explore")}
                      className={`hidden sm:flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentTab === "explore"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Khám phá</span>
                    </button>
                  </div>

                  <button
                    onClick={fetchPosts}
                    disabled={isLoadingPosts}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Làm mới bảng tin"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingPosts ? "animate-spin text-indigo-600" : ""}`} />
                  </button>
                </div>

                {/* Posts List Feed */}
                {isLoadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-semibold text-slate-500">Đang cập nhật bảng tin mới nhất...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Chưa có bài viết nào phù hợp
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {currentTab === "following"
                          ? "Những người bạn theo dõi chưa đăng bài nào. Hãy theo dõi thêm người dùng mới!"
                          : "Hãy là người đầu tiên đăng bài viết và chia sẻ cảm nghĩ của bạn!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                        onSelectUser={handleSelectUser}
                        onFilterHashtag={handleFilterHashtag}
                        onShowImageModal={setLightboxImageUrl}
                        onShowToast={showToast}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT SIDEBAR (Col 9-12 on desktop) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-20">
            <SidebarRight
              onSelectUser={handleSelectUser}
              onFilterHashtag={handleFilterHashtag}
              onShowDocs={() => setShowDocsModal(true)}
            />
          </div>

        </div>
      </main>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal onShowToast={showToast} />

      {/* Architecture & DB Documentation Modal */}
      <ArchitectureDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />

      {/* Global Toast Alert Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
