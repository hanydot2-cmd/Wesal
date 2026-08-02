import React, { useEffect, useState } from "react";
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { AppNotification } from "../types";
import { subscribeToUserNotifications, markNotificationAsRead } from "../services/firestoreService";
import { useAuth } from "../contexts/AuthContext";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectNotification
}) => {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!isOpen || !firebaseUser) return;

    const unsubscribe = subscribeToUserNotifications(firebaseUser.uid, (items) => {
      setNotifications(items);
    });

    return () => unsubscribe();
  }, [isOpen, firebaseUser]);

  if (!isOpen || !firebaseUser) return null;

  const handleRead = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "mutual":
        return <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />;
      case "heart":
      case "like":
      case "rose":
        return <Heart className="w-5 h-5 text-rose-500" />;
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 max-h-[80vh] flex flex-col">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <h3 className="text-base font-bold">الإشعارات والتنبيهات</h3>
              <p className="text-[11px] text-rose-100">آخر التفاعلات وطلبات التواصل</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* قائمة الإشعارات */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-right">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-500">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  n.read
                    ? "bg-white border-gray-100 hover:bg-gray-50 text-gray-600"
                    : "bg-rose-50/70 border-rose-200 hover:bg-rose-100 text-gray-900 font-semibold"
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold">{n.title}</h4>
                    <span className="text-[10px] text-gray-400">
                      {n.createdAt
                        ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("ar-EG")
                        : "اليوم"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            إغلاق الإشعارات
          </button>
        </div>
      </div>
    </div>
  );
};
