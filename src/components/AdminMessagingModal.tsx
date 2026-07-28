import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SupportTicket, SupportMessage } from '../types';
import { store } from '../services/store';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Paperclip
} from 'lucide-react';

interface AdminMessagingModalProps {
  currentUser: UserProfile;
  ticketId?: string;
  onClose: () => void;
}

export const AdminMessagingModal: React.FC<AdminMessagingModalProps> = ({
  currentUser,
  ticketId,
  onClose
}) => {
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let t: SupportTicket | undefined;
    const tickets = store.getSupportTickets();

    if (ticketId) {
      t = tickets.find((x) => x.id === ticketId);
    } else {
      t = tickets.find((x) => x.userId === currentUser.id);
    }

    if (!t) {
      // Create default private ticket
      t = store.createSupportTicket({
        name: currentUser.displayName,
        email: currentUser.email,
        subject: 'محادثة خاصة مع إدارة منصة وصال',
        type: 'طلب التواصل مع الإدارة',
        message: 'مرحباً إدارة وصال، أود التواصل معكم بخصوص حسابي.'
      });
    }

    setActiveTicket(t);

    const loadMsgs = () => {
      if (t) {
        setMessages(store.getSupportMessagesForTicket(t.id));
      }
    };

    loadMsgs();
    const unsub = store.subscribe(loadMsgs);
    return unsub;
  }, [ticketId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeTicket) return;

    store.sendSupportMessage(activeTicket.id, inputText, false);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full h-[88vh] max-h-[92vh] my-auto flex flex-col shadow-2xl border border-indigo-100 dark:border-slate-800 relative overflow-hidden">
        
        {/* Mobile Slide Indicator */}
        <div className="pt-2 pb-1 bg-slate-900 sm:hidden flex justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold font-serif">
                  مراسلة الإدارة والدعم الفني
                </h3>
                <span className="text-[10px] bg-indigo-800 px-2 py-0.5 rounded-full font-bold hidden sm:inline-block">
                  خاص ومحمي 🔒
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300">
                قناة تواصل خاصة ومباشرة بينك وبين إدارة منصة وصال
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition-colors border border-slate-700"
            title="إغلاق النافذة"
          >
            <span>إغلاق</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        {activeTicket && (
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-slate-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center justify-between">
            <span>الموضوع: {activeTicket.subject}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px]">
              الحالة: {activeTicket.status === 'replied' ? 'تم الرد ✅' : 'قيد المراجعة ⏳'}
            </span>
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((m) => {
            const isMe = !m.isAdmin;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
              >
                <div className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                  {m.senderName} {m.isAdmin && '🛡️ (إدارة وصال)'}
                </div>
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-rose-500 text-white rounded-tr-none'
                      : 'bg-indigo-600 text-white rounded-tl-none font-semibold'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك للإدارة هنا..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>

      </div>
    </div>
  );
};
