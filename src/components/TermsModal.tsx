import React from 'react';
import { X, ShieldCheck, Lock, Heart, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 dark:border-slate-800 relative my-auto flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Sticky Header with Close Button and Title */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-serif">
              شروط الاستخدام وسياسة الخصوصية
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700"
            title="إغلاق النافذة"
          >
            <span>إغلاق</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 touch-pan-y">
          
          {/* Mobile Drag Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2 sm:hidden shrink-0" />

          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
              شروط الاستخدام وسياسة الخصوصية – وصال
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>أستوعب وأوافق على الشروط والسياسات (إغلاق النافذة)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>إغلاق النافذة</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
