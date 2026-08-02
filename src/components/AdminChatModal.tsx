import React, { useState, useEffect, useRef } from "react";
import { X, Send, ShieldAlert, MessageSquare, AlertCircle } from "lucide-react";
import { AdminDirectMessage } from "../types";
import { sendAdminDirectMessage, subscribeToAdminMessages } from "../services/firestoreService";
import { useAuth } from "../contexts/AuthContext";

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminChatModal: React.FC<AdminChatModalProps> = ({ isOpen, onClose }) => {
  const { firebaseUser, profile } = useAuth();
  const [messages, setMessages] = useState<AdminDirectMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !firebaseUser) return;

    const unsubscribe = subscribeToAdminMessages(firebaseUser.uid, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [isOpen, firebaseUser]);

  if (!isOpen || !firebaseUser) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setSending(true);
    setErrorMsg(null);
    try {
      await sendAdminDirectMessage(
        firebaseUser.uid,
        "user",
        text,
        profile?.photoURL || ""
      );
      setInputText("");
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء إرسال الرسالة إلى الإدارة.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 h-[80vh] flex flex-col">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-rose-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">مراسلة إدارة منصة وصال</h3>
              <p className="text-[11px] text-rose-100">تواصل مباشر وسري مع فريق إدارة الموقع</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* تنبيه الأمان */}
        <div className="bg-rose-50 border-b border-rose-100 p-3 text-right text-xs text-rose-900 shrink-0">
          هذه القناة مخصصة للاستفسارات الخاصة، الشكاوى، وطلب مساعدة الإدارة في مراجعة الملفات أو الإبلاغات.
        </div>

        {errorMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* قائمة الرسائل */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-rose-300" />
              <p className="text-xs font-bold text-gray-600">مرحباً بك في خدمة الدعم المباشر</p>
              <p className="text-[11px] max-w-xs mx-auto">
                اكتب رسالتك أو استفسارك هنا، وسيقوم أحد مسؤولي الإدارة بالرد عليك في أقرب وقت.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === "user";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isMe
                        ? "bg-rose-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {!isMe && (
                      <span className="block text-[10px] font-bold text-rose-600 mb-0.5">
                        فريق إدارة وصال
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 ${
                        isMe ? "text-rose-200 text-left" : "text-gray-400 text-right"
                      }`}
                    >
                      {msg.createdAt
                        ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "الآن"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* نموذج الإرسال */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك للإدارة هنا..."
            disabled={sending}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500 text-right"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
