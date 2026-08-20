import React, { useState } from "react";
import { 
  X, 
  Database, 
  Server, 
  ShieldCheck, 
  Code2, 
  Layers, 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink 
} from "lucide-react";

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"database" | "backend" | "frontend" | "sql_examples">("database");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="architecture-docs-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Kiến trúc Hệ thống & Hướng dẫn Code Mini Social Network
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chi tiết thiết kế Database, API RESTful Backend, Bảo mật JWT & Bcrypt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 gap-2 overflow-x-auto">
          {[
            { id: "database", label: "1. Thiết kế Database", icon: Database },
            { id: "backend", label: "2. API Backend & JWT", icon: Server },
            { id: "frontend", label: "3. Kiến trúc Frontend", icon: Layers },
            { id: "sql_examples", label: "4. Mẫu SQL & MongoDB", icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 dark:text-slate-200 space-y-6 text-sm">
          {/* TAB 1: DATABASE DESIGN */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Sơ đồ Thực thể Quan hệ (Entity Relationship Schema)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Hệ thống được thiết kế theo chuẩn 3 thực thể cốt lõi: <strong>Users (Người dùng)</strong>, <strong>Posts (Bài viết)</strong>, <strong>Comments (Bình luận)</strong> cùng 2 quan hệ nhiều - nhiều: <strong>Follows (Theo dõi)</strong> và <strong>Likes (Thích bài viết)</strong>.
                </p>
              </div>

              {/* Grid of Database Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table: Users */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">TABLE: users</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 px-2 py-0.5 rounded font-medium">Core Entity</span>
                  </div>
                  <ul className="text-xs space-y-1.5 mt-3 font-mono">
                    <li><span className="font-bold text-sky-600">id</span>: STRING (Primary Key)</li>
                    <li><span className="font-bold text-sky-600">username</span>: VARCHAR(50) (UNIQUE)</li>
                    <li><span className="font-bold text-sky-600">email</span>: VARCHAR(100) (UNIQUE)</li>
                    <li><span className="font-bold text-rose-500">passwordHash</span>: VARCHAR(255) (Bcrypt)</li>
                    <li><span className="font-bold">name</span>: VARCHAR(100)</li>
                    <li><span className="font-bold text-sky-500">isVerified</span>: BOOLEAN DEFAULT FALSE (Tick xanh)</li>
                    <li><span className="font-bold">avatar</span>: TEXT (URL)</li>
                    <li><span className="font-bold">coverImage</span>: TEXT (URL)</li>
                    <li><span className="font-bold">bio</span>: TEXT</li>
                    <li><span className="font-bold">createdAt</span>: TIMESTAMP</li>
                  </ul>
                </div>

                {/* Table: Posts */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">TABLE: posts</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded font-medium">Feed Item</span>
                  </div>
                  <ul className="text-xs space-y-1.5 mt-3 font-mono">
                    <li><span className="font-bold text-sky-600">id</span>: STRING (Primary Key)</li>
                    <li><span className="font-bold text-purple-600">authorId</span>: STRING (FK -&gt; users.id)</li>
                    <li><span className="font-bold">content</span>: TEXT</li>
                    <li><span className="font-bold">image</span>: TEXT (Optional URL/Base64)</li>
                    <li><span className="font-bold">sharesCount</span>: INTEGER DEFAULT 0</li>
                    <li><span className="font-bold">createdAt</span>: TIMESTAMP</li>
                    <li><span className="font-bold">updatedAt</span>: TIMESTAMP (Nullable)</li>
                  </ul>
                </div>

                {/* Table: Comments */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">TABLE: comments</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 px-2 py-0.5 rounded font-medium">Interaction</span>
                  </div>
                  <ul className="text-xs space-y-1.5 mt-3 font-mono">
                    <li><span className="font-bold text-sky-600">id</span>: STRING (Primary Key)</li>
                    <li><span className="font-bold text-purple-600">postId</span>: STRING (FK -&gt; posts.id)</li>
                    <li><span className="font-bold text-purple-600">authorId</span>: STRING (FK -&gt; users.id)</li>
                    <li><span className="font-bold">content</span>: TEXT</li>
                    <li><span className="font-bold">createdAt</span>: TIMESTAMP</li>
                  </ul>
                </div>

                {/* Table: Follows & Likes (Relationships) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">TABLE: follows & likes</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded font-medium">M:N Relations</span>
                  </div>
                  <div className="space-y-2 mt-3 font-mono text-xs">
                    <div>
                      <p className="font-bold text-slate-500">follows:</p>
                      <p className="pl-2">- <span className="text-purple-600">followerId</span> (FK -&gt; users.id)</p>
                      <p className="pl-2">- <span className="text-purple-600">followingId</span> (FK -&gt; users.id)</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500">likes:</p>
                      <p className="pl-2">- <span className="text-purple-600">userId</span> (FK -&gt; users.id)</p>
                      <p className="pl-2">- <span className="text-purple-600">postId</span> (FK -&gt; posts.id)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKEND & JWT */}
          {activeTab === "backend" && (
            <div className="space-y-6">
              {/* JWT Explanation */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 text-sm">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  Cơ chế Xác thực JWT (JSON Web Token) & Mã hóa Bcrypt
                </h4>
                <div className="text-xs text-indigo-950 dark:text-indigo-200/90 mt-2 space-y-1.5 leading-relaxed">
                  <p>
                    • <strong>Mã hóa mật khẩu:</strong> Khi người dùng đăng ký, mật khẩu dạng thô (plaintext) được băm 1 chiều bằng thuật toán <code>bcryptjs</code> với hệ số Salt rounds = 10. Mật khẩu không bao giờ lưu dưới dạng văn bản rõ.
                  </p>
                  <p>
                    • <strong>Cấp phát Token:</strong> Khi đăng nhập thành công, Server tạo 1 JWT có payload <code>&#123; userId, username, email &#125;</code> được ký bởi <code>JWT_SECRET</code> với thời hạn 7 ngày.
                  </p>
                  <p>
                    • <strong>Xác thực Middleware:</strong> Mọi request bảo mật (đăng bài, thả tim, follow, sửa profile) gửi kèm header <code>Authorization: Bearer &lt;token&gt;</code>. Middleware <code>authenticateToken</code> giải mã và gán <code>req.userId</code> trước khi thực thi handler.
                  </p>
                </div>
              </div>

              {/* RESTful API Endpoints Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  Danh mục API Endpoints RESTful
                </h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Endpoint</th>
                        <th className="p-2.5">Auth?</th>
                        <th className="p-2.5">Mô tả chức năng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                        <td className="p-2.5 font-bold">/api/auth/register</td>
                        <td className="p-2.5 text-slate-400">Không</td>
                        <td className="p-2.5 font-sans">Đăng ký tài khoản mới &amp; trả về JWT</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                        <td className="p-2.5 font-bold">/api/auth/login</td>
                        <td className="p-2.5 text-slate-400">Không</td>
                        <td className="p-2.5 font-sans">Đăng nhập bằng email/username &amp; mật khẩu</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">GET</span></td>
                        <td className="p-2.5 font-bold">/api/auth/me</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Lấy thông tin người dùng đang đăng nhập</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">GET</span></td>
                        <td className="p-2.5 font-bold">/api/posts</td>
                        <td className="p-2.5 text-slate-400">Tùy chọn</td>
                        <td className="p-2.5 font-sans">Lấy bảng tin (hỗ trợ tab=for-you | following, search, userId)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                        <td className="p-2.5 font-bold">/api/posts</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Tạo bài viết mới (chứa text, ảnh)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">PUT</span></td>
                        <td className="p-2.5 font-bold">/api/posts/:id</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Sửa bài viết (chỉ tác giả)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">DELETE</span></td>
                        <td className="p-2.5 font-bold">/api/posts/:id</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Xóa bài viết (chỉ tác giả)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                        <td className="p-2.5 font-bold">/api/posts/:id/like</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Thả tim / Bỏ tim bài viết</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                        <td className="p-2.5 font-bold">/api/posts/:id/comments</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Thêm bình luận mới vào bài viết</td>
                      </tr>
                      <tr>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                        <td className="p-2.5 font-bold">/api/users/:id/follow</td>
                        <td className="p-2.5 text-indigo-600 font-bold">Bearer JWT</td>
                        <td className="p-2.5 font-sans">Theo dõi / Bỏ theo dõi người dùng</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRONTEND ARCHITECTURE */}
          {activeTab === "frontend" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Cấu trúc Modules & Luồng Dữ liệu Frontend
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">1. AuthContext & State</h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Quản lý phiên đăng nhập toàn cục, lưu token vào <code>localStorage</code>, tự động đồng bộ trạng thái khi reload và hỗ trợ chuyển tài khoản nhanh (demo switch).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">2. Optimistic UI Updates</h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nút thả tim (Like) và theo dõi (Follow) cập nhật trạng thái giao diện ngay lập tức trong 0ms trước khi API phản hồi, đem lại trải nghiệm mượt mà.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">3. Modular Components</h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tách biệt rõ ràng các component: <code>CreatePostBox</code>, <code>PostCard</code>, <code>CommentSection</code>, <code>ProfileView</code>, <code>FollowersListModal</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">4. Responsive Mobile-First</h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Giao diện bố trí 3 cột trên Desktop (Menu trái, Feed trung tâm, Gợi ý phải) và chuyển thành 1 cột tối ưu trên thiết bị di động.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SQL & MONGODB MIGRATION SCRIPTS */}
          {activeTab === "sql_examples" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Mẫu DDL tạo bảng PostgreSQL / MySQL:</h4>
                  <button
                    onClick={() => copyToClipboard(POSTGRESQL_DDL, "postgres")}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    {copiedKey === "postgres" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "postgres" ? "Đã chép" : "Sao chép SQL"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto font-mono">
                  {POSTGRESQL_DDL}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Mẫu Mongoose Schemas (MongoDB):</h4>
                  <button
                    onClick={() => copyToClipboard(MONGOOSE_SCHEMA, "mongo")}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    {copiedKey === "mongo" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "mongo" ? "Đã chép" : "Sao chép Mongoose"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs overflow-x-auto font-mono">
                  {MONGOOSE_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <span className="text-xs text-slate-500">
            Hệ thống sẵn sàng mở rộng sang PostgreSQL, MySQL, MongoDB hoặc Redis Cache.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Đóng tài liệu
          </button>
        </div>
      </div>
    </div>
  );
};

const POSTGRESQL_DDL = `-- 1. Bảng Người dùng
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  cover_image TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Bài viết
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  shares_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Bảng Bình luận
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Likes (Thích bài viết)
CREATE TABLE post_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 5. Bảng Follows (Mối quan hệ theo dõi)
CREATE TABLE user_follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);`;

const MONGOOSE_SCHEMA = `// Mongoose Schemas (MongoDB)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  avatar: String,
  coverImage: String,
  bio: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sharesCount: { type: Number, default: 0 }
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }
}, { timestamps: true });`;
