import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  ShieldCheck,
  Lock,
  AlertTriangle,
  HeartHandshake,
  Trash2,
  BookOpen,
  CheckCircle2
} from "lucide-react";

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onOpenContactUs?: () => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  initialTab = "about",
  onOpenContactUs
}) => {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 max-h-[90vh] flex flex-col">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">منصة وصال – السياسات والضوابط</h2>
              <p className="text-xs text-rose-100">«خطوتك نحو شريك حياة مناسب» للزواج الشرعي الجاد</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* أزرار التبويبات */}
        <div className="flex items-center gap-1.5 p-3 bg-gray-50 border-b border-gray-200 overflow-x-auto shrink-0">
          <button
            onClick={() => setTab("about")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              tab === "about"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>من نحن وضوابط الزواج</span>
          </button>

          <button
            onClick={() => setTab("terms")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "terms"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>شروط الاستخدام</span>
          </button>

          <button
            onClick={() => setTab("privacy")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "privacy"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>سياسة الخصوصية</span>
          </button>

          <button
            onClick={() => setTab("rules")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "rules"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>قواعد الاستخدام</span>
          </button>

          <button
            onClick={() => setTab("content_photo")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "content_photo"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>سياسة الصور والمحتوى</span>
          </button>

          <button
            onClick={() => setTab("no_share")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "no_share"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>منع مشاركة البيانات</span>
          </button>

          <button
            onClick={() => setTab("block_report")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "block_report"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>الحظر والإبلاغ</span>
          </button>

          <button
            onClick={() => setTab("delete_account")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              tab === "delete_account"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>حذف الحساب والبيانات</span>
          </button>
        </div>

        {/* المحتوى النصي للتبويبات */}
        <div className="p-6 overflow-y-auto space-y-5 text-right flex-1 leading-relaxed text-gray-800">
          {tab === "about" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                من نحن وضوابط الزواج في وصال («خطوتك نحو شريك حياة مناسب»)
              </h3>
              <p className="text-sm">
                <strong>وصال</strong> هي منصة عربية إسلامية مخصصة ومصممة بعناية فائقة لتيسير التعارف الجاد بهدف <strong>الزواج الشرعي فقط</strong> في بيئة آمنة، محترمة، وتحفظ خصوصية جميع الأعضاء.
              </p>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 space-y-2">
                <h4 className="font-bold text-rose-900 text-sm">رسالتنا وقيمنا الأساسية:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                  <li>الجدية التامة: المنصة ليست للتعارف العابر أو التسلية أو تكوين الصداقات.</li>
                  <li>الأمان والخصوصية: حجب تبادل أرقام الهواتف أو روابط التواصل الخارجي حتى التأكد من التوافق.</li>
                  <li>الإشراف الفعال: جميع طلبات بدء التواصل والصور الشخصية تخضع لمراجعة إدارة وصال.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === "terms" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                شروط الاستخدام العام لمنصة وصال
              </h3>
              <p className="text-sm">
                باستخدامك لمنصة وصال، فإنك تقر وتوافق بالكامل على الالتزام بالشروط والبنود التالية:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700">
                <li>يجب أن يبلغ عمر المستخدم 18 عاماً فما فوق ليتمكن من إنشاء حساب.</li>
                <li>يُشترط أن يكون الهدف الوحيد من الاستخدام هو الزواج الشرعي الجاد.</li>
                <li>يجب تقديم بيانات صحيحة وغير مضللة في الملف الشخصي.</li>
                <li>يحق لإدارة المنصة إيقاف أو حظر أي حساب يخالف الآداب العامة أو شروط الاستخدام دون إنذار مسبق.</li>
              </ol>
            </div>
          )}

          {tab === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                سياسة الخصوصية وحماية بياناتك
              </h3>
              <p className="text-sm">
                نحن في <strong>وصال</strong> ندرك تماماً حساسية وأهمية الخصوصية في رحلة البحث عن شريك الحياة، ولذلك نلتزم بأعلى معايير الأمان:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-gray-700">
                <li>لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي أطراف ثالثة تجارية.</li>
                <li>يتم تخزين كلمات المرور مشفرة بأحدث خوارزميات الأمان في خوادم Google Firebase.</li>
                <li>يتم إخفاء بيانات الاتصال المباشرة (مثل رقم الهاتف والبريد) لمنع الإزعاج أو التطفل.</li>
              </ul>
            </div>
          )}

          {tab === "rules" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                قواعد الاستخدام وضوابط التعارف الآمن
              </h3>
              <p className="text-sm">
                لضمان بيئة نظيفة ومحترمة تليق بالمقبلين على الزواج، يُمنع منعاً باتاً ما يلي:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <strong className="block text-red-800 mb-1">❌ محادثات غير لائقة</strong>
                  <span>يُمنع استخدام أي ألفاظ خادشة للحياء أو طرح أسئلة تنتهك الآداب العامة.</span>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <strong className="block text-red-800 mb-1">❌ الاستغلال المادي</strong>
                  <span>يُمنع طلب تحويلات مالية أو مساعدات مادية تحت أي ظرف أو مسمى.</span>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <strong className="block text-red-800 mb-1">❌ انتحال الشخصية</strong>
                  <span>يُمنع استخدام صور أو أسماء أو بيانات لشخص آخر غير صاحب الحساب.</span>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <strong className="block text-red-800 mb-1">❌ تعدد الحسابات</strong>
                  <span>يُمنع إنشاء أكثر من حساب للشخص الواحد داخل المنصة.</span>
                </div>
              </div>
            </div>
          )}

          {tab === "content_photo" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                سياسة المحتوى والصور الشخصية
              </h3>
              <p className="text-sm">
                تخضع جميع الصور المرفوعة في وصال لمراجعة واعتماد فريق الإشراف قبل عرضها للعامة:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-gray-700">
                <li>يجب أن تكون الصورة شخصية، واضحة، ومناسبة (لا يُسمح بصور المشاهير أو الرموز التعبيرية).</li>
                <li>يُمنع رفع صور تحتوي على أرقام هواتف أو معرفات تواصل اجتماعي مكتوبة عليها.</li>
                <li>يحق للإدارة رفض أي صورة لا تتوافق مع معايير اللياقة العامة مع إبداء سبب الرفض للعضو.</li>
              </ul >
            </div>
          )}

          {tab === "no_share" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                سياسة منع مشاركة البيانات الشخصية وأرقام التواصل
              </h3>
              <p className="text-sm">
                لحمايتك من المتطفلين والاحتيال، يعتمد موقع <strong>وصال</strong> نظام فلترة ذكي يمنع كتابة أو إرسال:
              </p>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-900">
                <p>
                  • أرقام الهواتف (بجميع صيغها سواء أرقام متصلة أو متقطعة أو مكتوبة بالحروف العربية).
                </p>
                <p>
                  • معرفات أو أسماء حسابات التواصل الاجتماعي (واتساب، فيسبوك، انستجرام، سناب شات، تليجرام...).
                </p>
                <p>
                  • العناوين التفصيلية للمنازل أو العمل أو أرقام الهوية الوطنية.
                </p>
                <p className="font-bold pt-1 border-t border-amber-300/50">
                  ملاحظة: أي محاولة لتجاوز الفلتر ستؤدي لحظر الرسالة وتسجيل المخالفة لدى إدارة الموقع.
                </p>
              </div>
            </div>
          )}

          {tab === "block_report" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                سياسة الحظر والإبلاغ عن المخالفات
              </h3>
              <p className="text-sm">
                نحرص على تمكين جميع الأعضاء من حماية أنفسهم بضغطة زر واحدة:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-gray-700">
                <li>
                  <strong>الحظر الفوري (Block):</strong> يمكنك حظر أي عضو في أي وقت، وبذلك لن يتمكن من مراسلتك أو رؤية ملفك الشخصي مجدداً.
                </li>
                <li>
                  <strong>الإبلاغ (Report):</strong> يتم إرسال البلاغ مباشرة إلى الإدارة مع تحديد السبب والتفاصيل، ويتم التحقيق فيه خلال 24 ساعة لاتخاذ الإجراء الحاسم.
                </li>
              </ul>
            </div>
          )}

          {tab === "delete_account" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-rose-700 border-b pb-2">
                طلب حذف الحساب والبيانات نهائياً
              </h3>
              <p className="text-sm">
                نحن نحترم حقك الكامل في مسح بياناتك في أي وقت تريده (مثلاً عند إتمام الزواج المبارك أو لعدم الرغبة في الاستمرار):
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs text-gray-700">
                <p>
                  <strong>خطوات حذف الحساب:</strong> يمكنك التوجه إلى <em>(حسابي / تعديل الملف الشخصي)</em> والنقر على <strong>طلب حذف الحساب</strong> أسفل الصفحة، وكتابة كلمة <strong>حذف</strong> للتأكيد.
                </p>
                <p>
                  بمجرد تأكيد الطلب، يتم إيقاف عرض ملفك الشخصي فوراً، وتُمسح جميع صورك وبياناتك ومحادثاتك من قاعدة البيانات.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* تذيل النافذة */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">© جميع سياسات وصال مطابقة لضوابط الخصوصية والأمان.</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
          >
            إغلاق نافذة السياسات
          </button>
        </div>
      </div>
    </div>
  );
};
