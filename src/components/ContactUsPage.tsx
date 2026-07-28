import React, { useState, useEffect } from 'react';
import { UserProfile, TicketType, SupportTicket } from '../types';
import { store } from '../services/store';
import {
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  MessageCircle,
  FileText,
  LifeBuoy
} from 'lucide-react';

interface ContactUsPageProps {
  currentUser: UserProfile | null;
  onOpenAdminChat: (ticketId: string) => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({
  currentUser,
  onOpenAdminChat
}) => {
  const [name, setName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<TicketType>('استفسار عام');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName);
      setEmail(currentUser.email);
      const tickets = store.getSupportTickets().filter((t) => t.userId === currentUser.id || t.email === currentUser.email);
      setMyTickets(tickets);
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    store.createSupportTicket({
      name,
      email,
      subject,
      type,
      message
    });

    setIsSubmitted(true);
    setSubject('');
    setMessage('');

    if (currentUser) {
      const tickets = store.getSupportTickets().filter((t) => t.userId === currentUser.id || t.email === currentUser.email);
      setMyTickets(tickets);
    }

    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-serif">
          تواصل معنا – Contact Us
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          فريق خدمة العملاء والإدارة والدعم الفني في وصال مستعد لمساعدتك والإجابة على كافة استفساراتك باهتمام وسرية.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            نموذج إرسال الرسالة أو الطلب
          </h2>

          {isSubmitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>تم إرسال رسالتك بنجاح إلى إدارة منصة وصال! سوف يتم الرد عليك في أقرب وقت.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل أو المستعار *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white dir-ltr text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الطلب *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="استفسار عام">استفسار عام</option>
                  <option value="طلب مساعدة">طلب مساعدة</option>
                  <option value="مشكلة في تسجيل الدخول">مشكلة في تسجيل الدخول</option>
                  <option value="مشكلة في الحساب">مشكلة في الحساب</option>
                  <option value="مشكلة في الصورة الشخصية">مشكلة في الصورة الشخصية</option>
                  <option value="شكوى أو بلاغ">شكوى أو بلاغ</option>
                  <option value="طلب حذف الحساب">طلب حذف الحساب</option>
                  <option value="اقتراح أو ملاحظة">اقتراح أو ملاحظة</option>
                  <option value="استفسار عن الخصوصية">استفسار عن الخصوصية</option>
                  <option value="طلب التواصل مع الإدارة">طلب التواصل مع الإدارة</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الرسالة *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: استفسار عن موافقة طلب التواصل"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نص الرسالة أو الطلب التفصيلي *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب استفسارك أو مشكلتك بالتفصيل هنا..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 rotate-180" />
              إرسال الرسالة إلى إدارة وصال
            </button>

          </form>
        </div>

        {/* Sidebar Status & Previous Tickets */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-slate-800">
            <h3 className="text-sm font-bold font-serif flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-rose-400" />
              خدمة الدعم الفني المباشر
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              تتم مراجعة طلبات الدعم الفني والاستفسارات يومياً، ويتم الرد مباشرة عبر حسابك أو بريدك الإلكتروني.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>⏱️ أوقات العمل: 24/7 طوال الأسبوع</div>
              <div>🔒 سرية تامة لكافة البيانات والمرسلات</div>
            </div>
          </div>

          {/* User's Previous Tickets List */}
          {currentUser && myTickets.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-md space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>تذاكر واستفساراتك السابقة</span>
                <span className="text-rose-500">({myTickets.length})</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {myTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onOpenAdminChat(t.id)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.subject}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.status === 'replied' ? 'تم الرد ✅' : 'قيد المراجعة ⏳'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{t.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
