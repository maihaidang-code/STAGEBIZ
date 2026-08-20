// Notification Types & Interfaces
export type NotificationType = 
  | 'like' 
  | 'love' 
  | 'comment' 
  | 'reply' 
  | 'follow' 
  | 'mention' 
  | 'share';

export interface Notification {
  id: string;
  recipientId: string; // User nhận thông báo
  senderId: string; // User gửi thông báo
  type: NotificationType; // Loại thông báo
  postId?: string; // ID bài viết (nếu liên quan)
  commentId?: string; // ID bình luận (nếu liên quan)
  content: string; // Nội dung thông báo
  message: string; // Tin nhắn chi tiết
  isRead: boolean; // Đã đọc hay chưa
  createdAt: string; // Thời gian tạo
  senderInfo: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  relatedContent?: {
    postContent?: string;
    commentContent?: string;
  };
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: {
    like: number;
    love: number;
    comment: number;
    reply: number;
    follow: number;
    mention: number;
    share: number;
  };
}
