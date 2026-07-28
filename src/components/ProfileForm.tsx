import React, { useState } from 'react';
import {
  UserProfile,
  EducationLevel,
  MaritalStatus,
  SmokingStatus,
  DesiresChildren,
  AcceptsChildren
} from '../types';
import { store } from '../services/store';
import {
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  Heart,
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

interface ProfileFormProps {
  currentUser: UserProfile;
  onSaved: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ currentUser, onSaved }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [age, setAge] = useState(currentUser.age || 25);
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '2000-01-01');
  const [nationality, setNationality] = useState(currentUser.nationality || 'سعودي');
  const [country, setCountry] = useState(currentUser.country || 'المملكة العربية السعودية');
  const [city, setCity] = useState(currentUser.city || 'الرياض');
  const [occupation, setOccupation] = useState(currentUser.occupation || '');
  const [jobNature, setJobNature] = useState(currentUser.jobNature || '');
  const [education, setEducation] = useState<EducationLevel>(currentUser.education || 'جامعي');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    currentUser.maritalStatus || (currentUser.gender === 'male' ? 'أعزب' : 'عزباء')
  );
  const [hasChildren, setHasChildren] = useState(currentUser.hasChildren || false);
  const [childrenCount, setChildrenCount] = useState(currentUser.childrenCount || 0);
  const [desiresChildren, setDesiresChildren] = useState<DesiresChildren>(currentUser.desiresChildren || 'نعم');
  const [smoking, setSmoking] = useState<SmokingStatus>(
    currentUser.smoking || (currentUser.gender === 'male' ? 'غير مدخن' : 'غير مدخنة')
  );
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [personalTraits, setPersonalTraits] = useState(currentUser.personalTraits || '');
  const [hobbies, setHobbies] = useState(currentUser.hobbies || '');

  // Partner Preferences
  const [partnerBio, setPartnerBio] = useState(currentUser.partnerBio || '');
  const [partnerSpecs, setPartnerSpecs] = useState(currentUser.partnerSpecs || '');
  const [partnerNationality, setPartnerNationality] = useState(currentUser.partnerNationality || 'الكل');
  const [partnerMinAge, setPartnerMinAge] = useState(currentUser.partnerMinAge || 20);
  const [partnerMaxAge, setPartnerMaxAge] = useState(currentUser.partnerMaxAge || 35);
  const [partnerEducation, setPartnerEducation] = useState<EducationLevel | 'الكل'>(currentUser.partnerEducation || 'جامعي');
  const [partnerMaritalStatus, setPartnerMaritalStatus] = useState(currentUser.partnerMaritalStatus || 'الكل');
  const [partnerAcceptsChildren, setPartnerAcceptsChildren] = useState<AcceptsChildren>(currentUser.partnerAcceptsChildren || 'نعم');
  const [partnerPreferencesNotes, setPartnerPreferencesNotes] = useState(currentUser.partnerPreferencesNotes || '');

  const [isSuccess, setIsSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Sample Avatar Collection for Easy Preset Choice
  const sampleAvatars = [
    currentUser.gender === 'male'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    currentUser.gender === 'male'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
      : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    currentUser.gender === 'male'
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
      : 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400'
  ];

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالحة (JPG, PNG, WEBP)');
        return;
      }
      setPhotoUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setPhotoUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    store.updateProfile(currentUser.id, {
      displayName,
      age: Number(age),
      birthDate,
      nationality,
      country,
      city,
      occupation,
      jobNature,
      education,
      maritalStatus,
      hasChildren,
      childrenCount: Number(childrenCount),
      desiresChildren,
      smoking,
      photoUrl,
      bio,
      personalTraits,
      hobbies,
      partnerBio,
      partnerSpecs,
      partnerNationality,
      partnerMinAge: Number(partnerMinAge),
      partnerMaxAge: Number(partnerMaxAge),
      partnerEducation,
      partnerMaritalStatus,
      partnerAcceptsChildren,
      partnerPreferencesNotes,
      isProfileComplete: true
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSaved();
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100 dark:border-slate-800 transition-colors">
      
      {/* Form Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {currentUser.gender === 'male' ? '👨' : '👩'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif">
              استكمال وصيانة الملف الشخصي
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            خصص ملفك بشكل شامل وصادق للمساعدة في مطابقة شريك الحياة المناسب
          </p>
        </div>

        <div className="hidden sm:block">
          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800">
            {currentUser.gender === 'male' ? 'بيانات رجل' : 'بيانات سيدة'}
          </span>
        </div>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>تم حفظ الملف الشخصي والمواصفات بنجاح! الصورة قيد المراجعة الإدارية.</span>
        </div>
      )}

      {/* Photo Status Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={photoUrl || sampleAvatars[0]}
              alt="صورة شخصية"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-500/30"
            />
            {currentUser.photoReviewStatus === 'pending' && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                قيد المراجعة
              </span>
            )}
            {currentUser.photoReviewStatus === 'approved' && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                معتمدة ✅
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              الصورة الشخصية الحالية
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تخضع الصورة لمراجعة الإدارة ولا تظهر للعامة إلا بعد الاعتماد.
            </p>
            {currentUser.photoReviewStatus === 'rejected' && (
              <p className="text-xs font-bold text-rose-600 mt-1">
                سبب الرفض السابق: {currentUser.photoRejectionReason}
              </p>
            )}
          </div>
        </div>

        <label className="cursor-pointer px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors flex items-center gap-2">
          <Camera className="w-4 h-4" />
          {photoUploading ? 'جاري التحميل...' : 'رفع صورة من الجهاز'}
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomPhotoUpload}
            className="hidden"
          />
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        
        {/* SECTION 1: Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-rose-500" />
            1. البيانات الشخصية الأساسية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الاسم الأول أو المستعار *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                العمر (سنوات) *
              </label>
              <input
                type="number"
                min="18"
                max="90"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تاريخ الميلاد (للتحقق الداخلي فقط) *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الجنسية *
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="سعودي">سعودي / سعودية</option>
                <option value="إماراتي">إماراتي / إماراتية</option>
                <option value="قطري">قطري / قطرية</option>
                <option value="كويتي">كويتي / كويتية</option>
                <option value="عماني">عماني / عمانية</option>
                <option value="بحريني">بحريني / بحرينية</option>
                <option value="مصري">مصري / مصرية</option>
                <option value="أردني">أردني / أردنية</option>
                <option value="مغربي">مغربي / مغربية</option>
                <option value="جنسية أخرى">جنسية أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                دولة الإقامة *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المدينة / المنطقة العامة فقط *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: الرياض، جدة، القاهرة"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الوظيفة *
              </label>
              <input
                type="text"
                required
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="مثال: مهندس، معلمة، طبيب، أعمال حرّة"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                طبيعة العمل
              </label>
              <input
                type="text"
                value={jobNature}
                onChange={(e) => setJobNature(e.target.value)}
                placeholder="مثال: قطاع حكومي، شركة خاصة"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المستوى التعليمي *
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value as EducationLevel)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="دراسات عليا">دراسات عليا</option>
                <option value="جامعي">جامعي</option>
                <option value="فوق متوسط">فوق متوسط</option>
                <option value="متوسط">متوسط</option>
                <option value="بدون مؤهل">بدون مؤهل</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الحالة الاجتماعية *
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                {currentUser.gender === 'male' ? (
                  <>
                    <option value="أعزب">أعزب</option>
                    <option value="مطلق">مطلق</option>
                    <option value="أرمل">أرمل</option>
                  </>
                ) : (
                  <>
                    <option value="عزباء">عزباء</option>
                    <option value="مطلقة">مطلقة</option>
                    <option value="أرملة">أرملة</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                هل يوجد أبناء؟ *
              </label>
              <select
                value={hasChildren ? 'yes' : 'no'}
                onChange={(e) => setHasChildren(e.target.value === 'yes')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="no">لا</option>
                <option value="yes">نعم</option>
              </select>
            </div>

            {hasChildren && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عدد الأبناء
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                هل ترغب / ترغبين في الإنجاب؟ *
              </label>
              <select
                value={desiresChildren}
                onChange={(e) => setDesiresChildren(e.target.value as DesiresChildren)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="نعم">نعم</option>
                <option value="لا">لا</option>
                <option value="غير محدد">غير محدد</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                حالة التدخين *
              </label>
              <select
                value={smoking}
                onChange={(e) => setSmoking(e.target.value as SmokingStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                {currentUser.gender === 'male' ? (
                  <>
                    <option value="غير مدخن">غير مدخن</option>
                    <option value="مدخن">مدخن</option>
                    <option value="أقلعت عن التدخين">أقلعت عن التدخين</option>
                  </>
                ) : (
                  <>
                    <option value="غير مدخنة">غير مدخنة</option>
                    <option value="مدخنة">مدخنة</option>
                    <option value="أقلعت عن التدخين">أقلعت عن التدخين</option>
                  </>
                )}
              </select>
            </div>

          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نبذة مختصرة عن نفسك *
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="تحدث بإيجاز وصراحة عن شخصيتك، أسلوب حياتك، وما تميل إليه..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الصفات الشخصية
              </label>
              <input
                type="text"
                value={personalTraits}
                onChange={(e) => setPersonalTraits(e.target.value)}
                placeholder="مثال: هادئ، طموح، كريم، يحب النظام"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الاهتمامات والهوايات
              </label>
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="مثال: القراءة، السفر، الرياضة، الطهي"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Partner Requirements */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Heart className="w-4 h-4 text-rose-500" />
            2. مواصفات شريك / شريكة الحياة المطلوبة
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                العمر المطلوب من
              </label>
              <input
                type="number"
                min="18"
                max="80"
                value={partnerMinAge}
                onChange={(e) => setPartnerMinAge(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                العمر المطلوب إلى
              </label>
              <input
                type="number"
                min="18"
                max="80"
                value={partnerMaxAge}
                onChange={(e) => setPartnerMaxAge(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الجنسية المفضلة
              </label>
              <input
                type="text"
                value={partnerNationality}
                onChange={(e) => setPartnerNationality(e.target.value)}
                placeholder="مثال: سعودي، أردني، الكل"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المستوى التعليمي المطلوب
              </label>
              <select
                value={partnerEducation}
                onChange={(e) => setPartnerEducation(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="الكل">غير محدد (الكل)</option>
                <option value="دراسات عليا">دراسات عليا</option>
                <option value="جامعي">جامعي</option>
                <option value="فوق متوسط">فوق متوسط</option>
                <option value="متوسط">متوسط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الحالة الاجتماعية المقبولة
              </label>
              <input
                type="text"
                value={partnerMaritalStatus}
                onChange={(e) => setPartnerMaritalStatus(e.target.value)}
                placeholder="مثال: أعزب/عزباء، مطلق/مطلقة، لا يهم"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                هل تقبل / تقبلين أن يكون لديه أبناء؟
              </label>
              <select
                value={partnerAcceptsChildren}
                onChange={(e) => setPartnerAcceptsChildren(e.target.value as AcceptsChildren)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="نعم">نعم</option>
                <option value="لا">لا</option>
                <option value="حسب الحالة">حسب الحالة</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نبذة ومواصفات إضافية في شريك الحياة المطلوب
            </label>
            <textarea
              rows={3}
              value={partnerSpecs}
              onChange={(e) => setPartnerSpecs(e.target.value)}
              placeholder="اكتب الصفات والمواصفات والأخلاق التي تبحث عنها بالتفصيل..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:opacity-95 transition-all"
          >
            <Save className="w-4 h-4" />
            حفظ وتحديث الملف الشخصي
          </button>
        </div>

      </form>

    </div>
  );
};
