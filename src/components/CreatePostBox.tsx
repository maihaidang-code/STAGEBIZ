import React, { useState, useRef } from "react";
import { Image as ImageIcon, Sparkles, X, Upload, Link as LinkIcon, Send, Smile } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Post } from "../types";

interface CreatePostBoxProps {
  onPostCreated: (newPost: Post) => void;
  onShowToast: (text: string, type?: "success" | "error" | "info") => void;
}

const PRESET_IMAGES = [
  { label: "Lập trình", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80" },
  { label: "Cà phê & Setup", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80" },
  { label: "Biển & Hoàng hôn", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80" },
  { label: "Phố cổ", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&fit=crop&q=80" },
  { label: "Núi tuyết", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80" },
];

const EMOJIS = ["🔥", "🚀", "☕️", "✨", "🎉", "💡", "❤️", "🙌", "🌅"];

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ onPostCreated, onShowToast }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!content.trim() && !imageUrl) {
      onShowToast("Vui lòng nhập nội dung bài viết hoặc đính kèm ảnh", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const newPost = await api.createPost(content.trim(), imageUrl || undefined);
      setContent("");
      setImageUrl("");
      setShowImagePicker(false);
      setShowEmojiPicker(false);
      onPostCreated(newPost);
      onShowToast("Đã đăng bài viết mới thành công!", "success");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Đăng bài thất bại";
      onShowToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast("Kích thước ảnh tối đa là 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setShowImagePicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
      <div className="flex gap-3.5 items-start">
        <img
          src={
            user?.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
          }
          alt={user?.name || "Khách"}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              id="create-post-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isAuthenticated
                  ? `${user?.name || "Bạn"} ơi, bạn đang nghĩ gì thế? Chia sẻ ngay...`
                  : "Đăng nhập để chia sẻ bài viết, hình ảnh và kết nối bạn bè..."
              }
              rows={3}
              className="w-full text-sm sm:text-base bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-all"
            />

            {/* Attached Image Preview */}
            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-72 group">
                <img src={imageUrl} alt="Ảnh đính kèm" className="w-full h-full object-cover max-h-72" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                  title="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Image Picker Panel */}
            {showImagePicker && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn hoặc tải ảnh lên:</span>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload from file */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-indigo-500" />
                    <span>Tải ảnh từ máy tính (JPG, PNG)</span>
                  </button>
                </div>

                {/* Direct URL input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="Hoặc dán đường dẫn ảnh (URL)..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setImageUrl(customUrlInput.trim());
                        setCustomUrlInput("");
                        setShowImagePicker(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Thêm
                  </button>
                </div>

                {/* Preset image suggestions */}
                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5">Ảnh mẫu đẹp sẵn có:</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          setShowImagePicker(false);
                        }}
                        className="group relative rounded-lg overflow-hidden h-14 border border-slate-200 hover:border-indigo-500 transition-all"
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 text-[9px] font-medium text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Emoji Quick Bar */}
            {showEmojiPicker && (
              <div className="p-2 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 flex-wrap">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-base hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-post-photo-toggle"
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showImagePicker || imageUrl
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>Hình ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    showEmojiPicker
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Smile className="w-4 h-4 text-amber-500" />
                  <span>Biểu cảm</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  id="btn-submit-create-post"
                  disabled={isSubmitting || (!content.trim() && !imageUrl)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? "Đang đăng..." : "Đăng bài"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
