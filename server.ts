import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "mini_social_network_super_secret_key_2026";

type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

interface StoredReaction {
  userId: string;
  type: ReactionType;
  createdAt?: string;
}

interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  followers: string[];
  following: string[];
  createdAt: string;
  deletionRequestedAt?: string;
  markedForDeletion?: boolean;
}

interface StoredPost {
  id: string;
  authorId: string;
  content: string;
  image?: string;
  likes: string[];
  reactions?: StoredReaction[];
  sharesCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface StoredComment {
  id: string;
  postId: string;
  parentId?: string | null;
  replyToUser?: {
    id: string;
    name: string;
    username: string;
  } | null;
  authorId: string;
  content: string;
  reactions?: StoredReaction[];
  createdAt: string;
}

// Initial Database Seeding with realistic Vietnamese community users & posts
const defaultPasswordHash = bcrypt.hashSync("123456", 10);

const initialUsers: StoredUser[] = [
  {
    id: "user-1",
    username: "haidang_dev",
    email: "maihaidang.lienhe@gmail.com",
    passwordHash: defaultPasswordHash,
    name: "Mai Hải Đăng",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    bio: "Fullstack Developer đam mê React, Node.js và hệ thống phân tán. Đang xây dựng mạng xã hội StageBiz kết nối cộng đồng!",
    location: "Hà Nội, Việt Nam",
    website: "https://github.com",
    isVerified: true,
    followers: ["user-2", "user-3", "user-4"],
    following: ["user-2", "user-3"],
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "user-2",
    username: "linh_tran_art",
    email: "linh.tran@example.com",
    passwordHash: defaultPasswordHash,
    name: "Trần Mỹ Linh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    bio: "UI/UX Designer & Nhiếp ảnh gia tự do. Thích ngắm hoàng hôn, uống matcha latte và chia sẻ cảm hứng sáng tạo trên StageBiz.",
    location: "TP. Hồ Chí Minh, Việt Nam",
    website: "https://dribbble.com",
    isVerified: true,
    followers: ["user-1", "user-3", "user-5"],
    following: ["user-1", "user-4"],
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "user-3",
    username: "hoangnam_tech",
    email: "nam.hoang@example.com",
    passwordHash: defaultPasswordHash,
    name: "Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    bio: "AI Engineer & Cloud Architect. Luôn tìm tòi những công nghệ mới nhất về LLM và Web3.",
    location: "Đà Nẵng, Việt Nam",
    website: "https://linkedin.com",
    isVerified: true,
    followers: ["user-1", "user-2"],
    following: ["user-1", "user-2", "user-5"],
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "user-4",
    username: "lan_huong_travel",
    email: "huong.lan@example.com",
    passwordHash: defaultPasswordHash,
    name: "Lê Lan Hương",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    bio: "Travel Blogger khám phá 28 quốc gia. Yêu thiên nhiên, ẩm thực đường phố và những chuyến đi bất tận ✈️",
    location: "Đà Lạt, Việt Nam",
    website: "https://instagram.com",
    isVerified: false,
    followers: ["user-1", "user-2"],
    following: ["user-1"],
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "user-5",
    username: "quoc_bao_photo",
    email: "bao.quoc@example.com",
    passwordHash: defaultPasswordHash,
    name: "Vũ Quốc Bảo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
    bio: "Visual Storyteller & Coffee Enthusiast. Chia sẻ góc nhìn cuộc sống qua lăng kính máy ảnh 📸",
    location: "Hà Nội, Việt Nam",
    website: "https://unsplash.com",
    isVerified: false,
    followers: ["user-3"],
    following: ["user-2"],
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

const initialPosts: StoredPost[] = [
  {
    id: "post-1",
    authorId: "user-1",
    content: "Chào mọi người! 👋 Hôm nay mình vừa hoàn thiện xong bản dựng kiến trúc mạng xã hội StageBiz với Express API, xác thực JWT, bày tỏ cảm xúc phong phú và trả lời bình luận nhiều cấp. Mọi người cùng trải nghiệm và góp ý nhé! 🚀 #ReactJS #NodeJS #StageBiz",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80",
    likes: ["user-2", "user-3", "user-4", "user-5"],
    reactions: [
      { userId: "user-2", type: "love" },
      { userId: "user-3", type: "like" },
      { userId: "user-4", type: "wow" },
      { userId: "user-5", type: "haha" },
    ],
    sharesCount: 5,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    id: "post-2",
    authorId: "user-2",
    content: "Một buổi sáng chủ nhật an yên với ly cafe latte và bản phác thảo giao diện mới ☕️🎨 Không gian làm việc tối giản luôn giúp mình nạp lại 100% năng lượng sáng tạo.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80",
    likes: ["user-1", "user-3", "user-5"],
    reactions: [
      { userId: "user-1", type: "love" },
      { userId: "user-3", type: "like" },
      { userId: "user-5", type: "love" },
    ],
    sharesCount: 2,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "post-3",
    authorId: "user-4",
    content: "Hoàng hôn buông xuống trên bãi biển Nha Trang chiều nay thật sự đẹp ngoạn mục! Biển êm, gió nhẹ và màu trời chuyển từ cam sang tím huyền ảo 🌅",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80",
    likes: ["user-1", "user-2"],
    reactions: [
      { userId: "user-1", type: "wow" },
      { userId: "user-2", type: "love" },
    ],
    sharesCount: 7,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "post-4",
    authorId: "user-3",
    content: "Vừa đọc xong bài báo nghiên cứu về việc tối ưu hóa latency cho các ứng dụng thời gian thực. Việc thiết kế clean architecture ngay từ đầu giúp việc scale backend sau này dễ dàng hơn gấp nhiều lần 💡",
    likes: ["user-1", "user-5"],
    reactions: [
      { userId: "user-1", type: "like" },
      { userId: "user-5", type: "like" },
    ],
    sharesCount: 1,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: "post-5",
    authorId: "user-5",
    content: "Góc phố cổ Hà Nội sau cơn mưa rào. Những vệt nước phản chiếu ánh đèn vàng tạo nên vẻ đẹp trầm mặc rất riêng 🌧️✨",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&fit=crop&q=80",
    likes: ["user-2", "user-3"],
    reactions: [
      { userId: "user-2", type: "love" },
      { userId: "user-3", type: "like" },
    ],
    sharesCount: 3,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
];

const initialComments: StoredComment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    authorId: "user-2",
    content: "Dự án tuyệt vời quá Đăng ơi! Giao diện mượt mà và API chạy rất nhanh 🔥",
    reactions: [
      { userId: "user-1", type: "love" },
      { userId: "user-3", type: "like" },
    ],
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "comment-1-reply-1",
    postId: "post-1",
    parentId: "comment-1",
    replyToUser: {
      id: "user-2",
      name: "Trần Mỹ Linh",
      username: "mylinh_design",
    },
    authorId: "user-1",
    content: "Cảm ơn Linh nhé! Tính năng thả cảm xúc và trả lời bình luận hoạt động cực mượt luôn ❤️",
    reactions: [
      { userId: "user-2", type: "love" },
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "comment-2",
    postId: "post-1",
    authorId: "user-3",
    content: "Kiến trúc JWT + Express chuẩn chỉ đấy. Rất đáng để tham khảo!",
    reactions: [
      { userId: "user-1", type: "like" },
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "comment-3",
    postId: "post-2",
    authorId: "user-1",
    content: "Bức ảnh đẹp và góc chụp rất có gu Linh ạ!",
    reactions: [
      { userId: "user-2", type: "love" },
    ],
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "comment-4",
    postId: "post-3",
    authorId: "user-2",
    content: "Thèm đi biển quá Hương ơi 😍",
    reactions: [
      { userId: "user-4", type: "love" },
    ],
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

// In-memory Database Store
class Database {
  users: StoredUser[] = [...initialUsers];
  posts: StoredPost[] = [...initialPosts];
  comments: StoredComment[] = [...initialComments];

  // Helper to format user for client (exclude passwordHash)
  sanitizeUser(user: StoredUser) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  findUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByUsername(username: string) {
    return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  getReactionSummary(reactions: StoredReaction[] = []) {
    const summary = {
      like: 0,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0,
      total: reactions.length,
    };
    reactions.forEach((r) => {
      if (summary[r.type] !== undefined) {
        summary[r.type]++;
      }
    });
    return summary;
  }

  getPostWithDetails(post: StoredPost, currentUserId?: string) {
    const author = this.findUserById(post.authorId);
    const postComments = this.comments.filter((c) => c.postId === post.id);
    
    // Ensure reactions array is present
    if (!post.reactions) {
      post.reactions = (post.likes || []).map((id) => ({ userId: id, type: "like" as ReactionType }));
    }
    
    const reactions = post.reactions;
    const reactionsSummary = this.getReactionSummary(reactions);
    const userReaction = currentUserId ? reactions.find((r) => r.userId === currentUserId)?.type || null : null;

    return {
      id: post.id,
      authorId: post.authorId,
      author: {
        id: author?.id || post.authorId,
        username: author?.username || "anonym",
        name: author?.name || "Người dùng",
        avatar: author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        isVerified: author?.isVerified ?? false,
      },
      content: post.content,
      image: post.image,
      likes: reactions.map((r) => r.userId),
      reactions,
      userReaction,
      reactionsSummary,
      commentsCount: postComments.length,
      sharesCount: post.sharesCount || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked: Boolean(userReaction || (currentUserId && post.likes?.includes(currentUserId))),
      isAuthor: currentUserId === post.authorId,
    };
  }

  getCommentWithDetails(comment: StoredComment, currentUserId?: string) {
    const author = this.findUserById(comment.authorId);
    const reactions = comment.reactions || [];
    const reactionsSummary = this.getReactionSummary(reactions);
    const userReaction = currentUserId ? reactions.find((r) => r.userId === currentUserId)?.type || null : null;

    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId || null,
      replyToUser: comment.replyToUser || null,
      authorId: comment.authorId,
      author: {
        id: author?.id || comment.authorId,
        username: author?.username || "anonym",
        name: author?.name || "Người dùng",
        avatar: author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        isVerified: author?.isVerified ?? false,
      },
      content: comment.content,
      reactions,
      userReaction,
      reactionsSummary,
      createdAt: comment.createdAt,
    };
  }
}

const db = new Database();

const ACCOUNT_DELETION_GRACE_PERIOD_MS = 3 * 24 * 3600 * 1000; // 3 days
const ACCOUNT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // run every hour

// Permanently removes accounts that have been marked for deletion for
// longer than the grace period (3 days).
function cleanupDeletedAccounts() {
  const now = Date.now();
  const usersToDelete = db.users.filter((u) => {
    if (!u.markedForDeletion || !u.deletionRequestedAt) return false;
    return now - new Date(u.deletionRequestedAt).getTime() > ACCOUNT_DELETION_GRACE_PERIOD_MS;
  });

  if (usersToDelete.length === 0) return;

  const deletedIds = new Set(usersToDelete.map((u) => u.id));

  db.users = db.users.filter((u) => !deletedIds.has(u.id));

  // Clean up related data & references to the deleted users
  db.posts = db.posts.filter((p) => !deletedIds.has(p.authorId));
  db.comments = db.comments.filter((c) => !deletedIds.has(c.authorId));
  db.users.forEach((u) => {
    u.followers = u.followers.filter((id) => !deletedIds.has(id));
    u.following = u.following.filter((id) => !deletedIds.has(id));
  });

  usersToDelete.forEach((u) => {
    console.log(`🧹 Đã xóa vĩnh viễn tài khoản ${u.username} (${u.id}) sau thời gian ân hạn 3 ngày.`);
  });
}

// Auth Middleware
interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  username?: string;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, error: "Vui lòng đăng nhập để thực hiện hành động này (Missing Token)" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.username = decoded.username;
    next();
  } catch {
    res.status(403).json({ success: false, error: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ" });
    return;
  }
};

// Optional auth middleware (for feed if user is logged in vs visitor)
const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.username = decoded.username;
    } catch {
      // ignore token error in optional mode
    }
  }
  next();
};

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // 1. Register
  app.post("/api/auth/register", (req: Request, res: Response): void => {
    try {
      const { username, email, password, name, bio, avatar } = req.body;

      if (!username || !email || !password || !name) {
        res.status(400).json({ success: false, error: "Vui lòng điền đầy đủ: Tên đăng nhập, Email, Mật khẩu và Họ tên" });
        return;
      }

      // Check existing email or username
      const existingEmail = db.findUserByEmail(email);
      if (existingEmail) {
        res.status(400).json({ success: false, error: "Email này đã được sử dụng bởi tài khoản khác" });
        return;
      }

      const existingUsername = db.findUserByUsername(username);
      if (existingUsername) {
        res.status(400).json({ success: false, error: "Tên đăng nhập (username) này đã tồn tại, vui lòng chọn tên khác" });
        return;
      }

      // Hash password with bcrypt
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
        bio: bio || "Xin chào! Mình là thành viên mới của ConnectSphere.",
        followers: [],
        following: ["user-1"], // Auto follow founder Mai Hải Đăng as welcoming friend
        createdAt: new Date().toISOString(),
      };

      // Add following relationship
      const founder = db.findUserById("user-1");
      if (founder && !founder.followers.includes(newUser.id)) {
        founder.followers.push(newUser.id);
      }

      db.users.push(newUser);

      // Create JWT Token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, username: newUser.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        data: {
          token,
          user: db.sanitizeUser(newUser),
        },
      });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ success: false, error: "Đã xảy ra lỗi máy chủ trong quá trình đăng ký" });
    }
  });

  // 2. Login
  app.post("/api/auth/login", (req: Request, res: Response): void => {
    try {
      const { identifier, password } = req.body; // identifier can be email or username

      if (!identifier || !password) {
        res.status(400).json({ success: false, error: "Vui lòng nhập email/tên đăng nhập và mật khẩu" });
        return;
      }

      const user = db.findUserByEmail(identifier) || db.findUserByUsername(identifier);

      if (!user) {
        res.status(401).json({ success: false, error: "Tài khoản hoặc mật khẩu không chính xác" });
        return;
      }

      // Compare password with bcrypt
      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, error: "Tài khoản hoặc mật khẩu không chính xác" });
        return;
      }

      // If the account was marked for deletion, logging in again cancels the request
      let deletionCancelled = false;
      if (user.markedForDeletion) {
        user.markedForDeletion = false;
        user.deletionRequestedAt = undefined;
        deletionCancelled = true;
        console.log(`♻️  Yêu cầu xóa tài khoản của ${user.username} (${user.id}) đã được hủy do đăng nhập lại.`);
      }

      // Create JWT Token
      const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        message: deletionCancelled
          ? "Đăng nhập thành công! Yêu cầu xóa tài khoản của bạn đã được hủy."
          : "Đăng nhập thành công!",
        deletionCancelled,
        data: {
          token,
          user: db.sanitizeUser(user),
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, error: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập" });
    }
  });

  // 3. Get Current User Profile via Token
  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res: Response): void => {
    const user = db.findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
      return;
    }
    res.json({
      success: true,
      data: db.sanitizeUser(user),
    });
  });

  // 4. Quick Demo Users List (for fast switching and testing without re-typing)
  app.get("/api/auth/demo-users", (req: Request, res: Response): void => {
    const sanitized = db.users.map((u) => ({
      ...db.sanitizeUser(u),
      defaultPassword: "123456",
    }));
    res.json({ success: true, data: sanitized });
  });

  // 5. Change Password
  app.post("/api/auth/change-password", authenticateToken, (req: AuthRequest, res: Response): void => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({ success: false, error: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
        return;
      }

      if (String(newPassword).length < 6) {
        res.status(400).json({ success: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        return;
      }

      const user = db.findUserById(req.userId!);
      if (!user) {
        res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
        return;
      }

      const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        res.status(401).json({ success: false, error: "Mật khẩu cũ không chính xác" });
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(newPassword, salt);

      res.json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
      console.error("Change Password Error:", error);
      res.status(500).json({ success: false, error: "Đã xảy ra lỗi máy chủ trong quá trình đổi mật khẩu" });
    }
  });

  // ==========================================
  // USER PROFILE & SOCIAL GRAPH ROUTES
  // ==========================================

  // Request Account Deletion (soft delete with 3-day grace period)
  app.post("/api/users/delete-request", authenticateToken, (req: AuthRequest, res: Response): void => {
    try {
      const user = db.findUserById(req.userId!);
      if (!user) {
        res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
        return;
      }

      user.markedForDeletion = true;
      user.deletionRequestedAt = new Date().toISOString();

      console.log(`🗑️  Tài khoản ${user.username} (${user.id}) đã yêu cầu xóa lúc ${user.deletionRequestedAt}`);

      res.json({
        success: true,
        message: "Tài khoản của bạn sẽ bị xóa trong 3 ngày. Đăng nhập lại để hủy yêu cầu.",
      });
    } catch (error) {
      console.error("Delete Request Error:", error);
      res.status(500).json({ success: false, error: "Đã xảy ra lỗi máy chủ trong quá trình yêu cầu xóa tài khoản" });
    }
  });

  // Get User Profile by ID or Username
  app.get("/api/users/:id", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const { id } = req.params;
    const targetUser = db.findUserById(id) || db.findUserByUsername(id);

    if (!targetUser) {
      res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
      return;
    }

    const currentUserId = req.userId;
    const isFollowing = currentUserId ? targetUser.followers.includes(currentUserId) : false;
    const isSelf = currentUserId === targetUser.id;

    // Get user's posts count
    const postsCount = db.posts.filter((p) => p.authorId === targetUser.id).length;

    res.json({
      success: true,
      data: {
        ...db.sanitizeUser(targetUser),
        followersCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
        postsCount,
        isFollowing,
        isSelf,
      },
    });
  });

  // Update Profile
  app.put("/api/users/profile", authenticateToken, (req: AuthRequest, res: Response): void => {
    const user = db.findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
      return;
    }

    const { name, bio, avatar, coverImage, location, website, isVerified } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar) user.avatar = avatar;
    if (coverImage) user.coverImage = coverImage;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    res.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
      data: db.sanitizeUser(user),
    });
  });

  // Toggle Verified Badge (Tick Xanh) for User
  app.post("/api/users/:id/verify-toggle", authenticateToken, (req: AuthRequest, res: Response): void => {
    const targetUserId = req.params.id;
    const targetUser = db.findUserById(targetUserId);

    if (!targetUser) {
      res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
      return;
    }

    // Toggle the verified status
    targetUser.isVerified = !targetUser.isVerified;

    res.json({
      success: true,
      message: targetUser.isVerified
        ? `Đã cấp tick xanh xác minh cho @${targetUser.username}`
        : `Đã gỡ tick xanh xác minh của @${targetUser.username}`,
      data: {
        isVerified: targetUser.isVerified,
        user: db.sanitizeUser(targetUser),
      },
    });
  });

  // Toggle Follow/Unfollow
  app.post("/api/users/:id/follow", authenticateToken, (req: AuthRequest, res: Response): void => {
    const targetUserId = req.params.id;
    const currentUserId = req.userId!;

    if (targetUserId === currentUserId) {
      res.status(400).json({ success: false, error: "Bạn không thể tự theo dõi chính mình" });
      return;
    }

    const targetUser = db.findUserById(targetUserId);
    const currentUser = db.findUserById(currentUserId);

    if (!targetUser || !currentUser) {
      res.status(404).json({ success: false, error: "Người dùng không tồn tại" });
      return;
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    res.json({
      success: true,
      message: isFollowing ? `Đã bỏ theo dõi @${targetUser.username}` : `Đang theo dõi @${targetUser.username}`,
      data: {
        isFollowing: !isFollowing,
        targetFollowersCount: targetUser.followers.length,
        currentFollowingCount: currentUser.following.length,
      },
    });
  });

  // Get Followers list of a user
  app.get("/api/users/:id/followers", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ success: false, error: "Người dùng không tồn tại" });
      return;
    }

    const currentUserId = req.userId;
    const followers = targetUser.followers
      .map((id) => db.findUserById(id))
      .filter((u): u is StoredUser => Boolean(u))
      .map((u) => ({
        ...db.sanitizeUser(u),
        isFollowing: currentUserId ? u.followers.includes(currentUserId) : false,
      }));

    res.json({ success: true, data: followers });
  });

  // Get Following list of a user
  app.get("/api/users/:id/following", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ success: false, error: "Người dùng không tồn tại" });
      return;
    }

    const currentUserId = req.userId;
    const following = targetUser.following
      .map((id) => db.findUserById(id))
      .filter((u): u is StoredUser => Boolean(u))
      .map((u) => ({
        ...db.sanitizeUser(u),
        isFollowing: currentUserId ? u.followers.includes(currentUserId) : false,
      }));

    res.json({ success: true, data: following });
  });

  // Suggested Users to follow
  app.get("/api/users/suggested", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const currentUserId = req.userId;
    const currentUser = currentUserId ? db.findUserById(currentUserId) : null;

    let suggested = db.users.filter((u) => u.id !== currentUserId);

    if (currentUser) {
      // Prioritize users not yet followed
      suggested = suggested.filter((u) => !currentUser.following.includes(u.id));
    }

    const result = suggested.slice(0, 5).map((u) => ({
      ...db.sanitizeUser(u),
      followersCount: u.followers.length,
      isFollowing: false,
    }));

    res.json({ success: true, data: result });
  });

  // Search users
  app.get("/api/users/search", (req: Request, res: Response): void => {
    const query = String(req.query.q || "").toLowerCase().trim();
    if (!query) {
      res.json({ success: true, data: [] });
      return;
    }

    const matches = db.users
      .filter((u) => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query))
      .slice(0, 10)
      .map((u) => db.sanitizeUser(u));

    res.json({ success: true, data: matches });
  });

  // ==========================================
  // POSTS & INTERACTIONS ROUTES
  // ==========================================

  // Get Newsfeed / Posts
  app.get("/api/posts", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const { tab, userId, search } = req.query;
    const currentUserId = req.userId;
    const currentUser = currentUserId ? db.findUserById(currentUserId) : null;

    let filtered = [...db.posts];

    // Filter by specific user
    if (userId) {
      filtered = filtered.filter((p) => p.authorId === userId);
    }

    // Filter by following tab
    if (tab === "following" && currentUser) {
      const allowedAuthors = [currentUser.id, ...currentUser.following];
      filtered = filtered.filter((p) => allowedAuthors.includes(p.authorId));
    }

    // Filter by search keyword / hashtag
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter((p) => p.content.toLowerCase().includes(q));
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result = filtered.map((post) => {
      return db.getPostWithDetails(post, currentUserId);
    });

    res.json({ success: true, data: result });
  });

  // Get Single Post
  app.get("/api/posts/:id", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    const currentUserId = req.userId;
    res.json({
      success: true,
      data: db.getPostWithDetails(post, currentUserId),
    });
  });

  // Create Post
  app.post("/api/posts", authenticateToken, (req: AuthRequest, res: Response): void => {
    const { content, image } = req.body;

    if ((!content || !content.trim()) && !image) {
      res.status(400).json({ success: false, error: "Nội dung bài viết không được để trống" });
      return;
    }

    const newPost: StoredPost = {
      id: `post-${Date.now()}`,
      authorId: req.userId!,
      content: (content || "").trim(),
      image: image || undefined,
      likes: [],
      reactions: [],
      sharesCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.posts.unshift(newPost);

    res.status(201).json({
      success: true,
      message: "Đăng bài viết thành công!",
      data: db.getPostWithDetails(newPost, req.userId),
    });
  });

  // Edit Post
  app.put("/api/posts/:id", authenticateToken, (req: AuthRequest, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    if (post.authorId !== req.userId) {
      res.status(403).json({ success: false, error: "Bạn chỉ có thể chỉnh sửa bài viết của chính mình" });
      return;
    }

    const { content, image } = req.body;
    if ((!content || !content.trim()) && !image) {
      res.status(400).json({ success: false, error: "Nội dung bài viết không được để trống" });
      return;
    }

    post.content = (content || "").trim();
    if (image !== undefined) {
      post.image = image || undefined;
    }
    post.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Cập nhật bài viết thành công!",
      data: db.getPostWithDetails(post, req.userId),
    });
  });

  // Delete Post
  app.delete("/api/posts/:id", authenticateToken, (req: AuthRequest, res: Response): void => {
    const postIndex = db.posts.findIndex((p) => p.id === req.params.id);
    if (postIndex === -1) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    const post = db.posts[postIndex];
    if (post.authorId !== req.userId) {
      res.status(403).json({ success: false, error: "Bạn chỉ có quyền xóa bài viết của chính mình" });
      return;
    }

    // Delete post & associated comments
    db.posts.splice(postIndex, 1);
    db.comments = db.comments.filter((c) => c.postId !== post.id);

    res.json({ success: true, message: "Đã xóa bài viết thành công!" });
  });

  // Post Reaction (Like, Love, Haha, Wow, Sad, Angry)
  app.post("/api/posts/:id/react", authenticateToken, (req: AuthRequest, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    const userId = req.userId!;
    const requestedType: ReactionType = req.body.type || "like";
    const validTypes: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];
    const reactionType = validTypes.includes(requestedType) ? requestedType : "like";

    if (!post.reactions) {
      post.reactions = (post.likes || []).map((id) => ({ userId: id, type: "like" }));
    }

    const existingIndex = post.reactions.findIndex((r) => r.userId === userId);
    let userReaction: ReactionType | null = null;

    if (existingIndex > -1) {
      if (post.reactions[existingIndex].type === reactionType) {
        // Toggle off if same reaction clicked
        post.reactions.splice(existingIndex, 1);
        userReaction = null;
      } else {
        // Change reaction type
        post.reactions[existingIndex].type = reactionType;
        userReaction = reactionType;
      }
    } else {
      // Add new reaction
      post.reactions.push({ userId, type: reactionType });
      userReaction = reactionType;
    }

    // Keep post.likes array in sync
    post.likes = post.reactions.map((r) => r.userId);

    const reactionsSummary = db.getReactionSummary(post.reactions);

    res.json({
      success: true,
      message: userReaction ? `Đã bày tỏ cảm xúc` : "Đã gỡ cảm xúc",
      data: {
        userReaction,
        reactionsSummary,
        reactions: post.reactions,
        likes: post.likes,
        likesCount: post.likes.length,
        isLiked: Boolean(userReaction),
      },
    });
  });

  // Backward-compatible Like / Unlike Post
  app.post("/api/posts/:id/like", authenticateToken, (req: AuthRequest, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    const userId = req.userId!;
    if (!post.reactions) {
      post.reactions = (post.likes || []).map((id) => ({ userId: id, type: "like" }));
    }

    const existingIndex = post.reactions.findIndex((r) => r.userId === userId);
    let userReaction: ReactionType | null = null;

    if (existingIndex > -1) {
      post.reactions.splice(existingIndex, 1);
      userReaction = null;
    } else {
      post.reactions.push({ userId, type: "like" });
      userReaction = "like";
    }

    post.likes = post.reactions.map((r) => r.userId);
    const reactionsSummary = db.getReactionSummary(post.reactions);

    res.json({
      success: true,
      message: userReaction ? "Đã thích bài viết" : "Đã bỏ thích bài viết",
      data: {
        userReaction,
        reactionsSummary,
        reactions: post.reactions,
        likes: post.likes,
        likesCount: post.likes.length,
        isLiked: Boolean(userReaction),
      },
    });
  });

  // Share Post
  app.post("/api/posts/:id/share", (req: Request, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    post.sharesCount = (post.sharesCount || 0) + 1;
    res.json({
      success: true,
      message: "Đã chia sẻ bài viết",
      data: { sharesCount: post.sharesCount },
    });
  });

  // ==========================================
  // COMMENTS & REPLIES ROUTES
  // ==========================================

  // Get Comments for Post (including nested replies & user reactions)
  app.get("/api/posts/:id/comments", optionalAuthenticate, (req: AuthRequest, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    const currentUserId = req.userId;
    const postComments = db.comments
      .filter((c) => c.postId === post.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Format all comments
    const formatted = postComments.map((c) => db.getCommentWithDetails(c, currentUserId));

    // Structure with replies array for top-level comments
    const topLevelComments: (typeof formatted[0] & { replies?: typeof formatted })[] = [];
    const replyMap = new Map<string, typeof formatted>();

    formatted.forEach((c) => {
      if (c.parentId) {
        const existingReplies = replyMap.get(c.parentId) || [];
        existingReplies.push(c);
        replyMap.set(c.parentId, existingReplies);
      }
    });

    formatted.forEach((c) => {
      if (!c.parentId) {
        topLevelComments.push({
          ...c,
          replies: replyMap.get(c.id) || [],
        });
      }
    });

    res.json({
      success: true,
      data: topLevelComments,
      allComments: formatted,
    });
  });

  // Add Comment or Reply
  app.post("/api/posts/:id/comments", authenticateToken, (req: AuthRequest, res: Response): void => {
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: "Không tìm thấy bài viết" });
      return;
    }

    const { content, parentId, replyToUserId } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, error: "Nội dung bình luận không được để trống" });
      return;
    }

    let replyToUser = null;
    if (replyToUserId) {
      const targetUser = db.findUserById(replyToUserId);
      if (targetUser) {
        replyToUser = {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username,
        };
      }
    } else if (parentId) {
      const parentComment = db.comments.find((c) => c.id === parentId);
      if (parentComment) {
        const targetUser = db.findUserById(parentComment.authorId);
        if (targetUser) {
          replyToUser = {
            id: targetUser.id,
            name: targetUser.name,
            username: targetUser.username,
          };
        }
      }
    }

    const newComment: StoredComment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      parentId: parentId || null,
      replyToUser,
      authorId: req.userId!,
      content: content.trim(),
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    db.comments.push(newComment);

    const formattedComment = {
      ...db.getCommentWithDetails(newComment, req.userId),
      replies: [],
    };

    res.status(201).json({
      success: true,
      message: parentId ? "Đã gửi câu trả lời!" : "Đã thêm bình luận!",
      data: formattedComment,
    });
  });

  // React to Comment (Like, Love, Haha, Wow, Sad, Angry)
  app.post("/api/posts/:postId/comments/:commentId/react", authenticateToken, (req: AuthRequest, res: Response): void => {
    const { postId, commentId } = req.params;
    const comment = db.comments.find((c) => c.id === commentId && c.postId === postId);

    if (!comment) {
      res.status(404).json({ success: false, error: "Không tìm thấy bình luận" });
      return;
    }

    const userId = req.userId!;
    const requestedType: ReactionType = req.body.type || "like";
    const validTypes: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];
    const reactionType = validTypes.includes(requestedType) ? requestedType : "like";

    if (!comment.reactions) {
      comment.reactions = [];
    }

    const existingIndex = comment.reactions.findIndex((r) => r.userId === userId);
    let userReaction: ReactionType | null = null;

    if (existingIndex > -1) {
      if (comment.reactions[existingIndex].type === reactionType) {
        comment.reactions.splice(existingIndex, 1);
        userReaction = null;
      } else {
        comment.reactions[existingIndex].type = reactionType;
        userReaction = reactionType;
      }
    } else {
      comment.reactions.push({ userId, type: reactionType });
      userReaction = reactionType;
    }

    const reactionsSummary = db.getReactionSummary(comment.reactions);

    res.json({
      success: true,
      message: userReaction ? "Đã bày tỏ cảm xúc với bình luận" : "Đã gỡ cảm xúc bình luận",
      data: {
        userReaction,
        reactionsSummary,
        reactions: comment.reactions,
        totalReactions: comment.reactions.length,
      },
    });
  });

  // Delete Comment
  app.delete("/api/posts/:postId/comments/:commentId", authenticateToken, (req: AuthRequest, res: Response): void => {
    const { postId, commentId } = req.params;
    const commentIndex = db.comments.findIndex((c) => c.id === commentId && c.postId === postId);

    if (commentIndex === -1) {
      res.status(404).json({ success: false, error: "Không tìm thấy bình luận" });
      return;
    }

    const comment = db.comments[commentIndex];
    const post = db.posts.find((p) => p.id === postId);

    // Comment can be deleted by comment author OR post owner
    if (comment.authorId !== req.userId && post?.authorId !== req.userId) {
      res.status(403).json({ success: false, error: "Bạn không có quyền xóa bình luận này" });
      return;
    }

    // Delete this comment and any direct replies to it
    db.comments = db.comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
    res.json({ success: true, message: "Đã xóa bình luận" });
  });

  // ==========================================
  // VITE & STATIC FILES MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Run account cleanup on startup, then periodically every hour
  cleanupDeletedAccounts();
  setInterval(cleanupDeletedAccounts, ACCOUNT_CLEANUP_INTERVAL_MS);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 StageBiz Social Network server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
