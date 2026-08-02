import React from "react";
import { HeartHandshake, ShieldCheck, Lock, AlertTriangle, FileText } from "lucide-react";

interface FooterProps {
  onOpenLegal: (tab: string) => void;
  onOpenContactUs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenContactUs }) => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* قسم الشعار ونبذة */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">وصال</h3>
                <p className="text-xs text-rose-300 font-semibold">للتعارف والزواج الجاد</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              «خطوتك نحو شريك حياة مناسب» – منصة وصال مخصصة للتعارف الجاد بهدف الزواج الشرعي فقط، وفق ضوابط محترمة وآمنة تحمي خصوصيتك.
            </p>
          </div>

          {/* روابط سريعة والصفحات القانونية */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>الصفحات القانونية والسياسات</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onOpenLegal("terms")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • شروط الاستخدام
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("privacy")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • سياسة الخصوصية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("rules")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • قواعد الاستخدام
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("content_photo")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • سياسة المحتوى والصور
                </button>
              </li>
            </ul>
          </div>

          {/* سياسات الأمان والحظر */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>الأمان وحماية الخصوصية</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onOpenLegal("no_share")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • سياسة منع مشاركة البيانات الشخصية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("block_report")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • سياسة الحظر والإبلاغ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("delete_account")}
                  className="hover:text-rose-400 transition-all text-right"
                >
                  • طلب حذف الحساب والبيانات
                </button>
              </li>
            </ul>
          </div>

          {/* تواصل معنا والدعم */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>الدعم الفني والمساعدة</span>
            </h4>
            <p className="text-sm text-gray-400">
              فريق وصال متاح للرد على جميع استفساراتك ومساعدتك في حل أي مشكلة تواجهك.
            </p>
            <button
              onClick={onOpenContactUs}
              className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold border border-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <span>تواصل معنا (Contact Us)</span>
            </button>
          </div>
        </div>

        {/* الحقوق */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} وصال – للتعارف والزواج الجاد. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-2 text-rose-400">
            <span>منصة مخصصة للزواج الشرعي فقط</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
