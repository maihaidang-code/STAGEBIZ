import React, { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  AtSign,
  Trash2,
  Check,
  CheckAll,
} from 'lucide-react';
import { Notification, NotificationSummary } from '../types/notification';

interface NotificationTabProps {
  token: string;
  currentUserId: string;
}

const NotificationTab: React.FC<NotificationTabProps> = ({ token, currentUserId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications?filter=${filter}&sort=${sortBy}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification summary
  const fetchNotificationSummary = async () => {
    try {
      const response = await fetch('/api/notifications/summary', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching notification summary:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        await fetchNotificationSummary();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        await fetchNotificationSummary();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
        await fetchNotificationSummary();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tất cả thông báo?')) return;
    try {
      const response = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications([]);
        setSummary({
          total: 0,
          unread: 0,
          byType: {
            like: 0,
            love: 0,
            comment: 0,
            reply: 0,
            follow: 0,
            mention: 0,
            share: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchNotifications();
  }, [filter, sortBy]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'love':
        return <Heart className="w-4 h-4 text-red-600 fill-red-600" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get notification type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      like: 'Thích',
      love: 'Yêu thích',
      comment: 'Bình luận',
      reply: 'Trả lời',
      follow: 'Theo dõi',
      mention: 'Nhắc tên',
      share: 'Chia sẻ',
    };
    return labels[type] || type;
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}m trước`;
    if (diffHours < 24) return `${diffHours}h trước`;
    if (diffDays < 7) return `${diffDays}d trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const displayedNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            {summary?.unread! > 0 && (
              <span className="bg-red-500 text-white rounded-full px-2.5 py-0.5 text-sm font-semibold">
                {summary?.unread}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {summary?.unread! > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title="Đánh dấu tất cả là đã đọc"
              >
                <CheckAll className="w-4 h-4" />
                <span className="text-sm font-medium">Đánh dấu tất cả</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                title="Xóa tất cả thông báo"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-semibold mb-1">Tổng cộng</div>
              <div className="text-2xl font-bold text-blue-900">{summary.total}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-red-600 font-semibold mb-1">Chưa đọc</div>
              <div className="text-2xl font-bold text-red-900">{summary.unread}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-600 font-semibold mb-1">Theo dõi</div>
              <div className="text-2xl font-bold text-green-900">{summary.byType.follow}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-xs text-purple-600 font-semibold mb-1">Bình luận</div>
              <div className="text-2xl font-bold text-purple-900">
                {summary.byType.comment + summary.byType.reply}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Sort */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chưa đọc ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>
        <div className="flex gap-2 ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors font-medium"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Đang tải thông báo...</div>
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">Không có thông báo</p>
            <p className="text-gray-500 text-sm">
              {filter === 'unread'
                ? 'Tất cả thông báo đã được đọc'
                : 'Bạn chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                notification.isRead
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={notification.senderInfo.avatar}
                    alt={notification.senderInfo.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          <span className="font-bold">
                            {notification.senderInfo.name}
                          </span>
                          {notification.senderInfo.isVerified && (
                            <span className="ml-1" title="Đã xác minh">
                              ✓
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        {notification.message}
                      </p>
                      {notification.relatedContent?.postContent && (
                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-1 truncate">
                          "{notification.relatedContent.postContent}"
                        </p>
                      )}
                      {notification.relatedContent?.commentContent && (
                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-1 truncate">
                          "{notification.relatedContent.commentContent}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Đánh dấu là đã đọc"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationTab;
