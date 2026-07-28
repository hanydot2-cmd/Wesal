import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from '../types';
import { store } from '../services/store';
import {
  X,
  Send,
  ShieldAlert,
  AlertOctagon,
  Ban,
  AlertTriangle,
  Lock,
  CheckCheck
} from 'lucide-react';

interface ChatModalProps {
  partnerId: string;
  currentUser: UserProfile;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  partnerId,
  currentUser,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [filterError, setFilterError] = useState('');
  const partner = store.getProfileById(partnerId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = store.getOrCreateConversation(currentUser.id, partnerId);

  useEffect(() => {
    const load = () => {
      if (conversation) {
        const msgs = store.getMessagesForConversation(conversation.id);
        setMessages(msgs);
      }
    };
    load();
    const unsub = store.subscribe(load);
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!partner) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setFilterError('');

    const res = store.sendMessage(conversation.id, partnerId, inputText);
    if (res.success) {
      setInputText('');
    } else {
      setFilterError(res.errorReason || 'تعذر إرسال الرسالة.');
    }
  };

  const handleTerminate = () => {
    if (confirm('هل أنت أأكد من إنهاء التواصل مع هذا العضو؟')) {
      store.blockUser(partnerId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl border border-rose-100 dark:border-slate-800 relative overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={partner.photoUrl}
              alt={partner.displayName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-rose-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-serif">
                  {partner.displayName}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {partner.occupation} • {partner.city} ({partner.nationality})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTerminate}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors"
              title="إنهاء التواصل"
            >
              إنهاء التواصل
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety Warning Header Banner */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] font-medium leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">⚠️ تنبيه أمان هدم:</span> حرصًا على خصوصيتك وأمانك، يمنع منعًا باتًا إرسال أرقام الهواتف أو أرقام واتساب أو عناوين السكن أو البريد الإلكتروني أو روابط التواصل الاجتماعي أو أي بيانات شخصية. استخدم المحادثة داخل الموقع فقط.
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.length === 0 ? (
            <div className="text-center my-12 space-y-2 text-slate-400">
              <Lock className="w-10 h-10 mx-auto text-rose-300" />
              <p className="text-xs font-semibold">
                المحادثة مفتوحة وآمنة ومشفرة. ابدأ بالتحية بكل احترام وتقدير.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-rose-400" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Filter Violation Error Overlay */}
        {filterError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border-t border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between gap-2 animate-shake">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{filterError}</span>
            </div>
            <button
              onClick={() => setFilterError('')}
              className="text-rose-500 underline text-[10px]"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (filterError) setFilterError('');
            }}
            placeholder="اكتب رسالتك باحترام وجدية هنا..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold hover:opacity-95 shadow-md shadow-rose-500/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>

      </div>
    </div>
  );
};
