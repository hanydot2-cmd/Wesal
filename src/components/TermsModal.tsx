import React from 'react';
import { X, ShieldCheck, Lock, Heart, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            شروط الاستخدام وسياسة الخصوصية – وصال
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            وثيقة الشروط والضوابط المنظمة لاستخدام منصة وصال للتعارف والزواج الجاد
          </p>
        </div>

        <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. الهدف من المنصة</h3>
            <p>
              تأسست منصة وصال بغرض حصري وهو التعارف الجاد بهدف الزواج الشرعي فقط. يمنع منعاً باتاً استخدام المنصة للتسلية، العلاقات غير الجادة، أهداف تجارية، أو الترويج لأي خدمات خارج نطاق الزواج.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. شرط السن القانونية (18 عاماً فأكثر)</h3>
            <p>
              يشترط للتسجيل واستخدام خدمات وصال أن يكون عمر المستخدم 18 عاماً شمسية أو أكثر. يتم التحقق من تاريخ الميلاد أثناء التسجيل.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. حظر مشاركة وسائل الاتصال الخارجية</h3>
            <p>
              يمنع إرسال أرقام الهواتف، أرقام الواتساب، العناوين التفصيلية، عناوين البريد الإلكتروني، أو روابط منصات التواصل الاجتماعي (فيسبوك، إنستجرام، تلجرام، إلخ) داخل المحادثات أو الملفات الشخصية.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. مراجعة الصور الشخصية والبيانات</h3>
            <p>
              تخضع جميع الصور الشخصية المرفوعة لمراجعة إدارية بشرية قبل نشرها على نتائج البحث للعامة. يحق للإدارة قبول الصورة أو رفضها مع بيان السبب.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">5. مراجعة طلبات التواصل</h3>
            <p>
              لا تفتح المحادثة تلقائياً إلا بعد موافقة الإدارة على "طلب بدء التواصل" المقدم بعد الإعجاب المتبادل لضمان الأمان والجدية.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">6. سياسة الخصوصية وحذف الحساب</h3>
            <p>
              بيانات الدعم والبريد الإلكتروني وأرقام الهاتف السرية محفوظة ولا تظهر للأعضاء نهائياً. يحق لأي عضو تقديم طلب لحذف حسابه أو مسح بياناته بالكامل في أي وقت عبر صفحة "تواصل معنا".
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
        >
          أستوعب وأوافق على الشروط والسياسات
        </button>

      </div>
    </div>
  );
};
