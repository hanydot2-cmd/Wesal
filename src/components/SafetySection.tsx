import React from 'react';
import {
  ShieldAlert,
  PhoneOff,
  Home,
  Mail,
  Link,
  Lock,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export const SafetySection: React.FC = () => {
  const safetyRules = [
    {
      title: 'عدم مشاركة رقم الهاتف',
      desc: 'يمنع منعاً باتاً تبادل أرقام الهواتف أو أرقام الواتساب لحماية الخصوصية ومنع المايقات.',
      icon: PhoneOff
    },
    {
      title: 'عدم مشاركة البريد الإلكتروني',
      desc: 'حافظ على سرية حساباتك ولا تقم بإرسال عناوين البريد الإلكتروني لأي طرف.',
      icon: Mail
    },
    {
      title: 'عدم مشاركة عنوان المنزل أو العمل التفصيلي',
      desc: 'يكتفي الموقع بعرض المدينة العامة فقط دون الإفصاح عن الشارع أو رقم المنزل.',
      icon: Home
    },
    {
      title: 'عدم إرسال روابط التواصل الاجتماعي',
      desc: 'يمنع إرسال روابط فيسبوك، إنستجرام، تلجرام، تيك توك، أو أي منصة خارجية.',
      icon: Link
    },
    {
      title: 'عدم إرسال أي بيانات شخصية حساسة',
      desc: 'مثل أرقام الهوية، البطاقات البنكية، أرقام الوثائق الرسمية، أو المستندات.',
      icon: Lock
    },
    {
      title: 'استخدام المحادثة داخل الموقع فقط',
      desc: 'تتم كافة المراسلات داخل منصة وصال تحت إشراف ورقابة إدارية لضمان الأمان والجدية.',
      icon: MessageSquare
    }
  ];

  return (
    <section className="py-20 bg-rose-50/50 dark:bg-slate-950/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden mb-16">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>ميثاق الأمان والخصوصية في وصال</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-white tracking-tight">
              سلامتك وخصوصيتك هي أولويتنا المطلقة
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              حرصاً على توفير بيئة زواج جادة ومحترمة خالية من الاستغلال، يطبق الموقع نظام فلترة ذكي ورقابة إدارية صكاء لمنع مشاركة أرقام الهواتف أو الوسائل الخارجية.
            </p>
          </div>

          <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
            <ShieldAlert className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Safety Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyRules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition-colors flex gap-4 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning Note */}
        <div className="mt-12 p-4 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
            <span className="font-bold">تنبيه إداري هدم:</span> يتم اكتشاف أي محاولة للتحايل أو كتابة أرقام الهواتف بالحروف أو المسافات تلقائياً، ويعرض الحساب للإنذار أو التقييد الفوري لحفظ الانضباط العام.
          </div>
        </div>

      </div>
    </section>
  );
};
