import React from 'react';
import { Heart, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenTerms }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-black text-white font-serif tracking-tight"> وصال </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              منصة آمنة وموثوقة مخصصة للتعارف الجاد بهدف الزواج الشرعي والاستقرار الأسري وفق أرقى معايير الخصوصية والأمان.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/50">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>بيئة آمنة 100% خالية من العلاقات غير الجادة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-rose-400 transition-colors"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="hover:text-rose-400 transition-colors"
                >
                  تصفح الأعضاء
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className="hover:text-rose-400 transition-colors"
                >
                  طريقة عمل المنصة
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('safety')}
                  className="hover:text-rose-400 transition-colors"
                >
                  الأمان والخصوصية
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Help */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">الدعم والشروط</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="hover:text-rose-400 transition-colors"
                >
                  تواصل معنا – Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-rose-400 transition-colors"
                >
                  شروط الاستخدام وسياسة الخصوصية
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="hover:text-rose-400 transition-colors"
                >
                  طلب حذف البيانات أو الحساب
                </button>
              </li>
            </ul>
          </div>

          {/* Security Standards */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">ضوابط وصال</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>مراجعة إدارية لجميع طلبات التواصل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>منع مشاركة أرقام الهواتف أو الروابط</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>اعتماد بشري للصور الشخصية</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>تشفير كامل للبيانات والمحادثات</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} وصال – جميع الحقوق محفوظة. للتعارف والزواج الجاد فقط.</p>
          <div className="flex items-center gap-4">
            <span>النسخة 1.0.0</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span className="text-emerald-400 font-semibold">الموقع متصل وآمن</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
