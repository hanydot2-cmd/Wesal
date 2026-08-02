import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  ShieldAlert,
  Lock,
  AlertTriangle,
  MessageCircle,
  Ban,
  AlertCircle
} from "lucide-react";
import { ChatMessage, CommunicationRequest } from "../types";
import { sendChatMessage, subscribeToMessages, blockMember } from "../services/firestoreService";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CommunicationRequest | null;
  currentUserId: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  request,
  currentUserId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSenderMe = request ? request.fromUid === currentUserId : false;
  const partnerName = request ? (isSenderMe ? request.toName : request.fromName) : "";
  const partnerId = request ? (isSenderMe ? request.toUid : request.fromUid) : "";

  useEffect(() => {
    if (!isOpen || !request) return;

    const unsubscribe = subscribeToMessages(request.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const text = inputText.trim();
    if (!text) return;

    setSending(true);
    try {
      const res = await sendChatMessage(request.id, currentUserId, partnerId, text);
      if (!res.success) {
        setErrorMsg(res.error || "تم حظر الرسالة لمخالفتها قواعد الخصوصية والأمان في وصال.");
      } else {
        setInputText("");
      }
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.");
    } finally {
      setSending(false);
    }
  };

  const handleBlock = async () => {
    const confirmBlock = window.confirm(`هل أنت متأكد من رغبتك في حظر (${partnerName}) وإنهاء التواصل معه؟`);
    if (!confirmBlock) return;
    try {
      await blockMember(currentUserId, partnerId);
      alert("تم حظر العضو وإيقاف التواصل.");
      onClose();
      window.location.reload();
    } catch (err) {
      alert("حدث خطأ أثناء الحظر.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 h-[85vh] flex flex-col">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-rose-700 flex items-center justify-center font-bold text-lg shadow-sm">
              {partnerName.charAt(0) || "ع"}
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>محادثة آمنة مع: {partnerName}</span>
                <span className="bg-green-500 w-2 h-2 rounded-full inline-block" />
              </h3>
              <p className="text-[11px] text-rose-100 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>مراقبة ومحمية بنظام فلترة الخصوصية</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBlock}
              className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-white text-xs font-bold transition-colors flex items-center gap-1"
              title="حظر العضو"
            >
              <Ban className="w-4 h-4" />
              <span className="hidden sm:inline">حظر</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* تنبيه الأمان والخصوصية في أعلى المحادثة */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-right flex items-center gap-2 text-xs text-amber-900 shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="leading-relaxed">
            <strong>تنبيه هام للخصوصية:</strong> يُمنع إرسال أرقام الهواتف أو أرقام الواتساب أو البريد الإلكتروني أو الروابط أو العناوين التفصيلية. أي محاولة تبادل اتصال ستُحظر آلياً وتُسجل كمخالفة لدى الإدارة.
          </p>
        </div>

        {/* رسالة الخطأ أو الحظر إن وجدت */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold">×</button>
          </div>
        )}

        {/* قائمة الرسائل */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <MessageCircle className="w-12 h-12 mx-auto text-rose-300" />
              <p className="text-sm font-bold text-gray-600">بدء محادثة آمنة مع {partnerName}</p>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                تفضل بطرح الأسئلة الجادة حول طبيعة الشخصية والحياة والمستقبل بهدف التفاهم للزواج الشرعي.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-rose-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
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

        {/* حقل إرسال الرسالة */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك الآمنة هنا (بدون أرقام هواتف أو روابط)..."
            disabled={sending}
            className="flex-1 py-3 px-4 rounded-2xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-right"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 transition-all disabled:opacity-50"
            title="إرسال"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
