export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ReactionSummary {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  total: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  followers: string[]; // array of user IDs
  following: string[]; // array of user IDs
  createdAt: string;
}

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
}

export interface PostReaction {
  userId: string;
  type: ReactionType;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  image?: string;
  likes: string[]; // array of user IDs
  reactions?: PostReaction[];
  userReaction?: ReactionType | null;
  reactionsSummary?: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt?: string;
  isLiked?: boolean;
  isAuthor?: boolean;
}

export interface CommentReaction {
  userId: string;
  type: ReactionType;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  replyToUser?: {
    id: string;
    name: string;
    username: string;
  } | null;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  reactions?: CommentReaction[];
  userReaction?: ReactionType | null;
  reactionsSummary?: ReactionSummary;
  replies?: Comment[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
