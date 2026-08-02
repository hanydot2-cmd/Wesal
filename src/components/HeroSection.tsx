import React from "react";
import {
  HeartHandshake,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Gender, EducationLevel, MaritalStatusType, SmokingStatus, WantChildrenType } from "../types";

export interface ExploreFilters {
  gender: Gender | "all";
  ageFrom: number;
  ageTo: number;
  country: string;
  city: string;
  maritalStatus: MaritalStatusType | "all";
  education: EducationLevel | "all";
  wantChildren: WantChildrenType | "all";
  smoking: SmokingStatus | "all";
}

interface HeroSectionProps {
  filters: ExploreFilters;
  onFilterChange: (newFilters: ExploreFilters) => void;
  onResetFilters: () => void;
  totalMembersCount: number;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalMembersCount,
  onOpenAuth,
  isLoggedIn
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/80 via-white to-gray-50/50 pt-10 pb-16 border-b border-rose-100">
      {/* خلفية زخرفية */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
        {/* العناوين والشارة العليا */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>منصة التعارف الإسلامي الشرعي الموثق</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            وصال – <span className="text-rose-600">للتعارف والزواج الجاد</span>
          </h1>

          <p className="text-lg sm:text-2xl font-extrabold text-gray-700 bg-gradient-to-r from-rose-700 to-amber-700 bg-clip-text text-transparent">
            «خطوتك نحو شريك حياة مناسب»
          </p>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            منصة متخصصة توفر بيئة آمنة ومحترمة للبحث عن شريك الحياة المناسب بهدف الزواج الشرعي فقط، مع حماية كاملة لخصوصيتك وفلترة ذكية لوسائل الاتصال.
          </p>

          {/* مزايا سريعة */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>خصوصية ومراسلة آمنة</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
              <UserCheck className="w-4 h-4 text-rose-600" />
              <span>مراجعة واعتماد الصور</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>إعجاب متبادل لبدء التواصل</span>
            </span>
          </div>

          {!isLoggedIn && (
            <div className="pt-3">
              <button
                onClick={onOpenAuth}
                className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-0.5"
              >
                انضم إلى وصال الآن وابدأ رحلتك
              </button>
            </div>
          )}
        </div>

        {/* شريط البحث والفلترة المتقدم */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xl max-w-5xl mx-auto text-right space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-600" />
              <span>تصفية واستكشاف الأعضاء في وصال ({totalMembersCount} عضو متاح)</span>
            </h3>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>

          {/* شبكة الفلاتر */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* 1. النوع */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">النوع المطلوب</label>
              <select
                value={filters.gender}
                onChange={(e) => onFilterChange({ ...filters, gender: e.target.value as any })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">الجميع (رجال وسيدات)</option>
                <option value="female">سيدات فقط</option>
                <option value="male">رجال فقط</option>
              </select>
            </div>

            {/* 2. العمر من */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">العمر من</label>
              <input
                type="number"
                min="18"
                max="80"
                value={filters.ageFrom}
                onChange={(e) => onFilterChange({ ...filters, ageFrom: Number(e.target.value) })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* 3. العمر إلى */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">العمر إلى</label>
              <input
                type="number"
                min="18"
                max="80"
                value={filters.ageTo}
                onChange={(e) => onFilterChange({ ...filters, ageTo: Number(e.target.value) })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* 4. الدولة */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">الدولة</label>
              <input
                type="text"
                placeholder="مثال: مصر، السعودية..."
                value={filters.country}
                onChange={(e) => onFilterChange({ ...filters, country: e.target.value })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* 5. المدينة */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">المدينة</label>
              <input
                type="text"
                placeholder="مثال: القاهرة، الرياض..."
                value={filters.city}
                onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* 6. الحالة الاجتماعية */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">الحالة الاجتماعية</label>
              <select
                value={filters.maritalStatus}
                onChange={(e) => onFilterChange({ ...filters, maritalStatus: e.target.value as any })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">جميع الحالات الاجتماعية</option>
                <option value="أعزب أو عزباء">أعزب أو عزباء</option>
                <option value="مطلق أو مطلقة">مطلق أو مطلقة</option>
                <option value="أرمل أو أرملة">أرمل أو أرملة</option>
              </select>
            </div>

            {/* 7. المؤهل الدراسي */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">المؤهل</label>
              <select
                value={filters.education}
                onChange={(e) => onFilterChange({ ...filters, education: e.target.value as any })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">جميع المؤهلات</option>
                <option value="دراسات عليا">دراسات عليا</option>
                <option value="جامعي">جامعي</option>
                <option value="فوق متوسط">فوق متوسط</option>
                <option value="متوسط">متوسط</option>
              </select>
            </div>

            {/* 8. الرغبة في الإنجاب */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">الرغبة في الإنجاب</label>
              <select
                value={filters.wantChildren}
                onChange={(e) => onFilterChange({ ...filters, wantChildren: e.target.value as any })}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">لا يشترط</option>
                <option value="يريد الإنجاب">يريد الإنجاب</option>
                <option value="لا يريد الإنجاب">لا يريد الإنجاب</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
