import React from 'react';
import { Heart, Search, UserPlus, LogIn, MessageCircle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, setActiveTab }) => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-rose-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors">
      
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-96 h-96 bg-rose-200/40 dark:bg-rose-950/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/80 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>منصة وصال الرسمية للزواج الجاد والاستقرار الأسري</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white font-serif tracking-tight leading-tight">
            «خطوتك نحو <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 dark:from-rose-400 dark:via-pink-400 dark:to-indigo-400">شريك حياة مناسب</span>»
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            منصة آمنة للتعارف الجاد بهدف الزواج، تساعدك على العثور على شريك حياة مناسب وفق اهتماماتك ومواصفاتك مع كامل الخصوصية والسرية.
          </p>

          {/* Action Buttons Grid */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              إنشاء حساب
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200/80 dark:border-slate-700 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <LogIn className="w-4 h-4 text-rose-500" />
              تسجيل الدخول
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200/80 dark:border-indigo-800 hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-4 h-4" />
              تصفح الأعضاء
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              تواصل معنا
            </button>
          </div>

          {/* Quick Value Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>خصوصية تامة 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>مراجعة إدارية لطلبات التواصل</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>لا يتم عرض أرقام الهواتف أو البيانات الشخصية</span>
            </div>
          </div>

          {/* Statistics Grid Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-5 rounded-3xl border border-rose-100 dark:border-slate-700 shadow-xs">
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-serif">+15,000</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">عضو مسجل باهتمام جاد</div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-5 rounded-3xl border border-rose-100 dark:border-slate-700 shadow-xs">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-serif">+3,200</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">إعجاب ومطابقة ناجحة</div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-5 rounded-3xl border border-rose-100 dark:border-slate-700 shadow-xs">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-serif">100%</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">أمان وحماية للخصوصية</div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-5 rounded-3xl border border-rose-100 dark:border-slate-700 shadow-xs">
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-serif">24/7</div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">مراجعة إدارية مستمرة</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
