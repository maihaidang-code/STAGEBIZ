import { AuthResponse, Post, User, Comment, ReactionType, ReactionSummary, VerificationRequest } from "../types";

const TOKEN_KEY = "mini_social_jwt_token";

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (hasBody = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || "Đã xảy ra lỗi không xác định");
  }
  return json.data as T;
}

export const api = {
  // Authentication
  async register(data: { username: string; email: string; password: string; name: string; bio?: string; avatar?: string }): Promise<AuthResponse> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ identifier, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch("/api/auth/me", {
      headers: getHeaders(false),
    });
    return handleResponse<User>(res);
  },

  async getDemoUsers(): Promise<(User & { defaultPassword: string })[]> {
    const res = await fetch("/api/auth/demo-users", {
      headers: getHeaders(false),
    });
    return handleResponse<(User & { defaultPassword: string })[]>(res);
  },

  // Users & Social Graph
  async getUserProfile(idOrUsername: string): Promise<User & { followersCount: number; followingCount: number; postsCount: number; isFollowing: boolean; isSelf: boolean }> {
    const res = await fetch(`/api/users/${encodeURIComponent(idOrUsername)}`, {
      headers: getHeaders(false),
    });
    return handleResponse<User & { followersCount: number; followingCount: number; postsCount: number; isFollowing: boolean; isSelf: boolean }>(res);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await fetch("/api/users/profile", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  async toggleFollow(userId: string): Promise<{ isFollowing: boolean; targetFollowersCount: number; currentFollowingCount: number }> {
    const res = await fetch(`/api/users/${userId}/follow`, {
      method: "POST",
      headers: getHeaders(false),
    });
    return handleResponse<{ isFollowing: boolean; targetFollowersCount: number; currentFollowingCount: number }>(res);
  },

  async getFollowers(userId: string): Promise<(User & { isFollowing: boolean })[]> {
    const res = await fetch(`/api/users/${userId}/followers`, {
      headers: getHeaders(false),
    });
    return handleResponse<(User & { isFollowing: boolean })[]>(res);
  },

  async getFollowing(userId: string): Promise<(User & { isFollowing: boolean })[]> {
    const res = await fetch(`/api/users/${userId}/following`, {
      headers: getHeaders(false),
    });
    return handleResponse<(User & { isFollowing: boolean })[]>(res);
  },

  async getSuggestedUsers(): Promise<(User & { followersCount: number; isFollowing: boolean })[]> {
    const res = await fetch("/api/users/suggested", {
      headers: getHeaders(false),
    });
    return handleResponse<(User & { followersCount: number; isFollowing: boolean })[]>(res);
  },

  async searchUsers(query: string): Promise<User[]> {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(false),
    });
    return handleResponse<User[]>(res);
  },

  // Verification Requests
  async submitVerificationRequest(): Promise<VerificationRequest> {
    const res = await fetch("/api/verification-requests", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse<VerificationRequest>(res);
  },

  async getVerificationRequests(): Promise<VerificationRequest[]> {
    const res = await fetch("/api/verification-requests", {
      headers: getHeaders(false),
    });
    return handleResponse<VerificationRequest[]>(res);
  },

  async getUserVerificationRequest(): Promise<VerificationRequest | null> {
    const res = await fetch("/api/verification-requests/my", {
      headers: getHeaders(false),
    });
    return handleResponse<VerificationRequest | null>(res);
  },

  async approveVerificationRequest(requestId: string): Promise<{ isVerified: boolean; user: User }> {
    const res = await fetch(`/api/verification-requests/${requestId}/approve`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse<{ isVerified: boolean; user: User }>(res);
  },

  async rejectVerificationRequest(requestId: string, reason?: string): Promise<{ user: User }> {
    const res = await fetch(`/api/verification-requests/${requestId}/reject`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ user: User }>(res);
  },

  // Posts
  async getPosts(params?: { tab?: "for-you" | "following"; userId?: string; search?: string }): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.userId) query.append("userId", params.userId);
    if (params?.search) query.append("search", params.search);

    const res = await fetch(`/api/posts?${query.toString()}`, {
      headers: getHeaders(false),
    });
    return handleResponse<Post[]>(res);
  },

  async getPostById(id: string): Promise<Post> {
    const res = await fetch(`/api/posts/${id}`, {
      headers: getHeaders(false),
    });
    return handleResponse<Post>(res);
  },

  async createPost(content: string, image?: string): Promise<Post> {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content, image }),
    });
    return handleResponse<Post>(res);
  },

  async updatePost(id: string, content: string, image?: string): Promise<Post> {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ content, image }),
    });
    return handleResponse<Post>(res);
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });
    await handleResponse<{ success: boolean }>(res);
  },

  async toggleLike(postId: string): Promise<{ isLiked: boolean; likesCount: number; userReaction?: ReactionType | null; reactionsSummary?: ReactionSummary }> {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: getHeaders(false),
    });
    return handleResponse<{ isLiked: boolean; likesCount: number; userReaction?: ReactionType | null; reactionsSummary?: ReactionSummary }>(res);
  },

  async reactToPost(postId: string, type: ReactionType): Promise<{ isLiked: boolean; likesCount: number; userReaction: ReactionType | null; reactionsSummary: ReactionSummary }> {
    const res = await fetch(`/api/posts/${postId}/react`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ type }),
    });
    return handleResponse<{ isLiked: boolean; likesCount: number; userReaction: ReactionType | null; reactionsSummary: ReactionSummary }>(res);
  },

  async sharePost(postId: string): Promise<{ sharesCount: number }> {
    const res = await fetch(`/api/posts/${postId}/share`, {
      method: "POST",
      headers: getHeaders(false),
    });
    return handleResponse<{ sharesCount: number }>(res);
  },

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      headers: getHeaders(false),
    });
    return handleResponse<Comment[]>(res);
  },

  async addComment(postId: string, content: string, parentId?: string, replyToUserId?: string): Promise<Comment> {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content, parentId, replyToUserId }),
    });
    return handleResponse<Comment>(res);
  },

  async reactToComment(postId: string, commentId: string, type: ReactionType): Promise<{ userReaction: ReactionType | null; reactionsSummary: ReactionSummary; totalReactions: number }> {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}/react`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ type }),
    });
    return handleResponse<{ userReaction: ReactionType | null; reactionsSummary: ReactionSummary; totalReactions: number }>(res);
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });
    await handleResponse<{ success: boolean }>(res);
  },
};
