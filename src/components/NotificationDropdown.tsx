import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { store } from '../services/store';
import { Bell, CheckCheck, Heart, Sparkles, MessageSquare, ShieldCheck, Camera, X } from 'lucide-react';

interface NotificationDropdownProps {
  userId: string;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const update = () => {
      setNotifications(store.getNotificationsForUser(userId));
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, [userId]);

  const handleMarkAllRead = () => {
    store.markAllNotificationsAsRead(userId);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
      case 'match':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'contact_request':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'photo_review':
        return <Camera className="w-4 h-4 text-pink-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-4 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-3">
      {/* Mobile Drag Handle */}
      <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />

      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-serif">
            مركز الإشعارات
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-lg"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            تحديد الكل كمقروء
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
            title="إغلاق الإشعارات"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto touch-pan-y">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">لا توجد إشعارات حالياً.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => store.markNotificationAsRead(n.id)}
              className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                n.isRead
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                  : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
      >
        <X className="w-3.5 h-3.5" />
        <span>إغلاق الإشعارات</span>
      </button>
    </div>
  );
};
