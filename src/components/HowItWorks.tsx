import React from 'react';
import {
  UserPlus,
  FileText,
  Camera,
  Search,
  Heart,
  MessageSquarePlus,
  ShieldCheck,
  MessagesSquare
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: 1,
      title: 'إنشاء حساب',
      desc: 'سجل حسابك بسهولة باستخدام البريد الإلكتروني أو حسابات التواصل الاجتماعي.',
      icon: UserPlus,
      color: 'bg-rose-500'
    },
    {
      num: 2,
      title: 'استكمال الملف الشخصي',
      desc: 'أدخل بياناتك الشخصية ومواصفات شريك الحياة المطلوب بكل دقة وصدق.',
      icon: FileText,
      color: 'bg-indigo-500'
    },
    {
      num: 3,
      title: 'رفع الصورة الشخصية',
      desc: 'ارفع صورة شخصية لينة ومناسبة تخضع للمراجعة الإدارية للتحقق والموافقة.',
      icon: Camera,
      color: 'bg-pink-500'
    },
    {
      num: 4,
      title: 'تصفح الأعضاء',
      desc: 'استكشف قائمة الأعضاء واستخدم فلاتر البحث المتقدمة للوصول للمطابقين.',
      icon: Search,
      color: 'bg-amber-500'
    },
    {
      num: 5,
      title: 'إرسال إعجاب أو قلب أو باقة ورد',
      desc: 'عبر عن اهتمامك بالطرف الآخر بإرسال إعجاب ❤️ أو قلب 💖 أو باقة ورد 🌹.',
      icon: Heart,
      color: 'bg-rose-600'
    },
    {
      num: 6,
      title: 'طلب بدء التواصل',
      desc: 'عند حدوث إعجاب متبادل بين الطرفين، يمكن إرسال طلب بدء تواصل رسمي.',
      icon: MessageSquarePlus,
      color: 'bg-purple-500'
    },
    {
      num: 7,
      title: 'مراجعة الإدارة',
      desc: 'تقوم إدارة المنصة بمراجعة الطلب وحسابات الطرفين لضمان الجدية والسلامة.',
      icon: ShieldCheck,
      color: 'bg-emerald-500'
    },
    {
      num: 8,
      title: 'فتح المحادثة الآمنة',
      desc: 'بعد موافقة الإدارة يتم فتح المحادثة الخاصة والمشفرة داخل الموقع مباشرة.',
      icon: MessagesSquare,
      color: 'bg-blue-600'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-b border-rose-100/60 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            خطوات بسيطة وآمنة
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
            طريقة استخدام موقع وصال
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            صممت المنصة بآلية منضبطة تضمن الجدية وتحفظ كرامة وخصوصية جميع الأعضاء
          </p>
        </div>

        {/* 8-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${step.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-600 font-serif">
                    #{step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
