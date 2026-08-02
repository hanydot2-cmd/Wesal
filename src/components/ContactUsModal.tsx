import React, { useState } from "react";
import { X, HelpCircle, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { sendContactTicket } from "../services/firestoreService";
import { ContactRequestType } from "../types";

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({ isOpen, onClose }) => {
  const { profile, firebaseUser } = useAuth();
  const [name, setName] = useState(profile?.displayName || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [subject, setSubject] = useState("");
  const [requestType, setRequestType] = useState<ContactRequestType>("استفسار عام");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setLoading(true);
    try {
      await sendContactTicket(
        name.trim(),
        email.trim(),
        subject.trim(),
        requestType,
        message.trim()
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSubject("");
        setMessage("");
      }, 2500);
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء إرسال الرسالة. يرجى إعادة المحاولة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-black">تواصل معنا (Contact Us)</h3>
              <p className="text-xs text-rose-100">فريق الدعم الفني وإدارة منصة وصال</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج الإرسال */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>تم إرسال رسالتك إلى إدارة وصال بنجاح! سيتم الرد عليك في أقرب وقت.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكريم"
                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني للرد</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">نوع الطلب</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as ContactRequestType)}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              >
                <option value="استفسار عام">استفسار عام</option>
                <option value="مشكلة تقنية">مشكلة تقنية</option>
                <option value="إبلاغ عن مخالفة">إبلاغ عن مخالفة</option>
                <option value="طلب حذف الحساب والبيانات">طلب حذف الحساب والبيانات</option>
                <option value="اقتراح تطوير">اقتراح تطوير</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">عنوان الرسالة (الموضوع)</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="موضوع رسالتك..."
                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">نص الرسالة أو الاستفسار</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب تفاصيل استفسارك أو مشكلتك بوضوح..."
              className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-200 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>{loading ? "جارٍ الإرسال..." : "إرسال الرسالة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
