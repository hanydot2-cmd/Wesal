import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Gender,
  EducationLevel,
  MaritalStatus,
  SmokingStatus
} from '../types';
import { store } from '../services/store';
import { MemberCard } from './MemberCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Users,
  Home
} from 'lucide-react';

interface MemberSearchProps {
  currentUser: UserProfile | null;
  onSelectMember: (member: UserProfile) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onGoHome?: () => void;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({
  currentUser,
  onSelectMember,
  onOpenAuth,
  onGoHome
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>(
    currentUser ? (currentUser.gender === 'male' ? 'female' : 'male') : 'all'
  );
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(70);
  const [countryFilter, setCountryFilter] = useState<string>('الكل');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [maritalStatusFilter, setMaritalStatusFilter] = useState<string>('الكل');
  const [educationFilter, setEducationFilter] = useState<string>('الكل');
  const [smokingFilter, setSmokingFilter] = useState<string>('الكل');
  const [hasChildrenFilter, setHasChildrenFilter] = useState<string>('الكل');
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'online' | 'age'>('newest');

  useEffect(() => {
    const load = () => {
      setProfiles(store.getProfiles());
    };
    load();
    const unsub = store.subscribe(load);
    return unsub;
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setGenderFilter(currentUser ? (currentUser.gender === 'male' ? 'female' : 'male') : 'all');
    setMinAge(18);
    setMaxAge(70);
    setCountryFilter('الكل');
    setCityFilter('');
    setMaritalStatusFilter('الكل');
    setEducationFilter('الكل');
    setSmokingFilter('الكل');
    setHasChildrenFilter('الكل');
    setOnlineOnly(false);
    setSortBy('newest');
  };

  // Filter & Sort Logic
  const filtered = profiles.filter((p) => {
    // Hide self if logged in
    if (currentUser && p.id === currentUser.id) return false;

    // Hide suspended users
    if (p.status === 'suspended') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.displayName.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchOccupation = p.occupation.toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchOccupation) return false;
    }

    // Gender
    if (genderFilter !== 'all' && p.gender !== genderFilter) return false;

    // Age
    if (p.age < minAge || p.age > maxAge) return false;

    // Country
    if (countryFilter !== 'الكل' && p.country !== countryFilter) return false;

    // City
    if (cityFilter.trim() && !p.city.includes(cityFilter.trim())) return false;

    // Marital Status
    if (maritalStatusFilter !== 'الكل' && p.maritalStatus !== maritalStatusFilter) return false;

    // Education
    if (educationFilter !== 'الكل' && p.education !== educationFilter) return false;

    // Smoking
    if (smokingFilter !== 'الكل' && p.smoking !== smokingFilter) return false;

    // Has Children
    if (hasChildrenFilter === 'yes' && !p.hasChildren) return false;
    if (hasChildrenFilter === 'no' && p.hasChildren) return false;

    // Online Only
    if (onlineOnly && !p.isOnline) return false;

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'online') {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
    }
    if (sortBy === 'age' && currentUser) {
      const diffA = Math.abs(a.age - currentUser.age);
      const diffB = Math.abs(b.age - currentUser.age);
      return diffA - diffB;
    }
    // Newest default
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <Users className="w-7 h-7 text-rose-500" />
            تصفح الأعضاء والبحث المتقدم
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            ابحث عن شريك / شريكة الحياة بالمواصفات والخيارات التي تناسب تطلعاتك
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية 🏠</span>
            </button>
          )}

          <span className="px-3.5 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800">
            نتائج البحث: {sorted.length} عضو
          </span>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 font-bold text-xs hover:bg-slate-800 flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'إخفاء الفلاتر' : 'الفلاتر المتقدمة'}
          </button>
        </div>
      </div>

      {/* Main Search Bar & Quick Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم المستعار، المهنة، أو النبذة الشخصية..."
              className="w-full pr-11 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="all">الكل (رجال وسيدات)</option>
              <option value="male">رجال فقط 👨</option>
              <option value="female">سيدات فقط 👩</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="newest">الأحدث تسجيلًا</option>
              <option value="online">المتصلون حاليًا</option>
              {currentUser && <option value="age">الأقرب لعُمري ({currentUser.age} سنة)</option>}
            </select>
          </div>

        </div>

        {/* EXPANDABLE ADVANCED FILTERS */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نطاق العمر (من {minAge} إلى {maxAge} سنة)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-center"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                دولة الإقامة
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="الكل">جميع الدول</option>
                <option value="المملكة العربية السعودية">المملكة العربية السعودية</option>
                <option value="الإمارات العربية المتحدة">الإمارات العربية المتحدة</option>
                <option value="قطر">قطر</option>
                <option value="الكويت">الكويت</option>
                <option value="سلطنة عمان">سلطنة عمان</option>
                <option value="مصر">مصر</option>
                <option value="الأردن">الأردن</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المدينة
              </label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="اسم المدينة..."
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الحالة الاجتماعية
              </label>
              <select
                value={maritalStatusFilter}
                onChange={(e) => setMaritalStatusFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="الكل">الكل</option>
                <option value="أعزب">أعزب / عزباء</option>
                <option value="مطلق">مطلق / مطلقة</option>
                <option value="أرمل">أرمل / أرملة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المستوى التعليمي
              </label>
              <select
                value={educationFilter}
                onChange={(e) => setEducationFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="الكل">جميع المؤهلات</option>
                <option value="دراسات عليا">دراسات عليا</option>
                <option value="جامعي">جامعي</option>
                <option value="فوق متوسط">فوق متوسط</option>
                <option value="متوسط">متوسط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                التدخين
              </label>
              <select
                value={smokingFilter}
                onChange={(e) => setSmokingFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="الكل">الكل</option>
                <option value="غير مدخن">غير مدخن / غير مدخنة</option>
                <option value="مدخن">مدخن / مدخنة</option>
                <option value="أقلعت عن التدخين">أقلعت عن التدخين</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                وجود أبناء
              </label>
              <select
                value={hasChildrenFilter}
                onChange={(e) => setHasChildrenFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="الكل">الكل</option>
                <option value="no">بدون أبناء</option>
                <option value="yes">يوجد أبناء</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span>🟢 المتصلون الآن فقط</span>
              </label>

              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة ضبط
              </button>
            </div>

          </div>
        )}

      </div>

      {/* MEMBER GRID */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Sparkles className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            لم نجد نتائج مطابقة لخيارات البحث
          </h3>
          <p className="text-xs text-slate-500">
            جرب توسيع نطاق العمر أو تغيير الفلاتر للحصول على نتائج أكثر.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              currentUser={currentUser}
              onSelectMember={onSelectMember}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}

    </div>
  );
};
