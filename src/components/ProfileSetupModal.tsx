import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Upload,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  RefreshCw,
  LogOut
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfileData, uploadProfilePhoto, logoutUser } from "../services";
import {
  Gender,
  EducationLevel,
  MaritalStatusType,
  SmokingStatus,
  WantChildrenType
} from "../types";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose }) => {
  const { firebaseUser, profile, refreshProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.reload();
    } catch (err) {
      console.error(err);
      window.location.reload();
    }
  };

  const [gender, setGender] = useState<Gender>(profile?.gender || "male");
  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [age, setAge] = useState<number>(profile?.age || 25);
  const [birthDate, setBirthDate] = useState(profile?.birthDate || "");
  const [nationality, setNationality] = useState(profile?.nationality || "مصر");
  const [country, setCountry] = useState(profile?.country || "مصر");
  const [city, setCity] = useState(profile?.city || "القاهرة");
  const [job, setJob] = useState(profile?.job || "");
  const [workType, setWorkType] = useState(profile?.workType || "عمل مستقر");
  const [education, setEducation] = useState<EducationLevel>(profile?.education || "جامعي");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatusType>(profile?.maritalStatus || "أعزب أو عزباء");
  const [hasChildren, setHasChildren] = useState<"yes" | "no">(profile?.hasChildren || "no");
  const [childrenCount, setChildrenCount] = useState<number>(profile?.childrenCount || 0);
  const [wantChildren, setWantChildren] = useState<WantChildrenType>(profile?.wantChildren || "يريد الإنجاب");
  const [smoking, setSmoking] = useState<SmokingStatus>(profile?.smoking || "غير مدخن");
  const [bio, setBio] = useState(profile?.bio || "");
  const [qualities, setQualities] = useState(profile?.qualities || "");
  const [interestsStr, setInterestsStr] = useState(profile?.interests?.join("، ") || "القراءة، السفر، الرياضة");

  // مواصفات الشريك
  const [partnerNationality, setPartnerNationality] = useState(profile?.partnerNationality || "أي جنسية مناسبة");
  const [partnerAgeFrom, setPartnerAgeFrom] = useState<number>(profile?.partnerAgeFrom || 20);
  const [partnerAgeTo, setPartnerAgeTo] = useState<number>(profile?.partnerAgeTo || 40);
  const [partnerEducation, setPartnerEducation] = useState<EducationLevel>(profile?.partnerEducation || "جامعي");
  const [partnerMaritalStatus, setPartnerMaritalStatus] = useState<MaritalStatusType>(profile?.partnerMaritalStatus || "أعزب أو عزباء");
  const [partnerAcceptChildren, setPartnerAcceptChildren] = useState<"yes" | "no" | "any">(profile?.partnerAcceptChildren || "any");

  // رفع الصورة
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(profile?.photoURL || "");

  // حالة الحفظ
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // حذف الحساب
  const [deleteWord, setDeleteWord] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setGender(profile.gender || "male");
      setFirstName(profile.firstName || profile.displayName || "");
      setAge(profile.age || 25);
      setBirthDate(profile.birthDate || "");
      setNationality(profile.nationality || "مصر");
      setCountry(profile.country || "مصر");
      setCity(profile.city || "القاهرة");
      setJob(profile.job || "");
      setWorkType(profile.workType || "عمل مستقر");
      setEducation(profile.education || "جامعي");
      setMaritalStatus(profile.maritalStatus || "أعزب أو عزباء");
      setHasChildren(profile.hasChildren || "no");
      setChildrenCount(profile.childrenCount || 0);
      setWantChildren(profile.wantChildren || "يريد الإنجاب");
      setSmoking(profile.smoking || "غير مدخن");
      setBio(profile.bio || "");
      setQualities(profile.qualities || "");
      setInterestsStr(profile.interests?.join("، ") || "");
      setPartnerNationality(profile.partnerNationality || "أي جنسية مناسبة");
      setPartnerAgeFrom(profile.partnerAgeFrom || 20);
      setPartnerAgeTo(profile.partnerAgeTo || 40);
      setPartnerEducation(profile.partnerEducation || "جامعي");
      setPartnerMaritalStatus(profile.partnerMaritalStatus || "أعزب أو عزباء");
      setPartnerAcceptChildren(profile.partnerAcceptChildren || "any");
      setPhotoPreview(profile.photoURL || "");
    }
  }, [profile]);

  if (!isOpen || !firebaseUser) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (age < 18) {
      setErrorMsg("يجب أن يكون العمر 18 عاماً أو أكثر للتسجيل في وصال.");
      return;
    }
    if (!firstName.trim()) {
      setErrorMsg("يرجى إدخال الاسم أو الاسم المستعار.");
      return;
    }
    if (!job.trim()) {
      setErrorMsg("يرجى إدخال الوظيفة الحالية.");
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUrl = profile?.photoURL || "";
      let photoStatus = profile?.photoStatus || "pending";

      if (photoFile) {
        finalPhotoUrl = await uploadProfilePhoto(firebaseUser.uid, photoFile, (pct) => {
          setUploadProgress(pct);
        });
        photoStatus = "pending"; // الصورة الجديدة تحتاج مراجعة الإدارة
      }

      const interestsArray = interestsStr
        .split("،")
        .map((x) => x.trim())
        .filter(Boolean);

      await updateProfileData(firebaseUser.uid, {
        displayName: firstName.trim(),
        firstName: firstName.trim(),
        gender,
        age,
        birthDate,
        nationality,
        country,
        city,
        job: job.trim(),
        workType,
        education,
        maritalStatus,
        hasChildren,
        childrenCount: hasChildren === "yes" ? childrenCount : 0,
        wantChildren,
        smoking,
        bio: bio.trim(),
        qualities: qualities.trim(),
        interests: interestsArray,
        photoURL: finalPhotoUrl,
        photoStatus,
        profileCompleted: true,
        partnerNationality,
        partnerAgeFrom,
        partnerAgeTo,
        partnerEducation,
        partnerMaritalStatus,
        partnerAcceptChildren
      });

      await refreshProfile();
      setSuccessMsg("تم حفظ الملف الشخصي بنجاح! سيتم إغلاق النافذة الآن...");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || "حدث خطأ أثناء الحفظ. يرجى إعادة المحاولة.");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteWord !== "حذف") {
      setErrorMsg("يرجى كتابة كلمة (حذف) لتأكيد عملية حذف الحساب.");
      return;
    }
    setSaving(true);
    try {
      // إيقاف الحساب وإرسال طلب الإزالة للإدارة
      await updateProfileData(firebaseUser.uid, {
        accountStatus: "suspended",
        bio: "تم طلب حذف الحساب نهائياً من قبل المستخدم"
      });
      alert("تم إرسال طلب حذف الحساب وإيقاف عرضه فوراً. سيتم مسح بياناتك نهائياً.");
      window.location.reload();
    } catch (err: any) {
      setErrorMsg("تعذر تنفيذ طلب الحذف: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 max-h-[90vh] flex flex-col">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-black">الملف الشخصي في وصال</h2>
              <p className="text-xs text-rose-100">بياناتك الشخصية ومواصفات شريك الحياة المطلوب</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج التعديل */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-8 text-right">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. الصورة الشخصية */}
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-rose-600" />
              <span>الصورة الشخصية (تخضع لمراجعة وموافقة الإدارة قبل الظهور للعامة)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white border-2 border-rose-200 shadow-sm shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="معاينة" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <User className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">بدون صورة</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="block w-full text-xs text-gray-600 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-700"
                />
                <p className="text-[11px] text-gray-500">
                  صيغ الصور المدعومة: JPG, PNG, WEBP (الحد الأقصى 5 ميجابايت).
                </p>
                {profile?.photoStatus === "pending" && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    ⏳ صورتك قيد مراجعة الإدارة
                  </span>
                )}
                {profile?.photoStatus === "approved" && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                    ✅ تم اعتماد الصورة
                  </span>
                )}
                {profile?.photoStatus === "rejected" && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                    ❌ تم رفض الصورة: {profile.photoRejectReason || "يرجى رفع صورة لائقة وواضحة"}
                  </span>
                )}
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-rose-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>

          {/* 2. البيانات الشخصية الأساسية */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2">
              البيانات الشخصية الأساسية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">النوع</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="male">رجل</option>
                  <option value="female">سيدة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الأول أو اسم مستعار</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: أحمد"
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العمر (18 سنة أو أكثر)</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  تاريخ الميلاد (للتحقق من العمر فقط دون عرضه)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الجنسية</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الدولة</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المدينة (بشكل عام فقط)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: الرياض"
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوظيفة</label>
                <input
                  type="text"
                  required
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="مثال: مهندس برمجيات"
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">طبيعة العمل الحالية</label>
                <input
                  type="text"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  placeholder="مثال: دوام كامل، عمل حر"
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* 3. الحالة الاجتماعية والمؤهل */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2">
              المؤهل والحالة الاجتماعية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المؤهل الدراسي</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value as EducationLevel)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="دراسات عليا">دراسات عليا</option>
                  <option value="جامعي">جامعي</option>
                  <option value="فوق متوسط">فوق متوسط</option>
                  <option value="متوسط">متوسط</option>
                  <option value="بدون مؤهل">بدون مؤهل</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الحالة الاجتماعية</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatusType)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="أعزب أو عزباء">أعزب أو عزباء</option>
                  <option value="مطلق أو مطلقة">مطلق أو مطلقة</option>
                  <option value="أرمل أو أرملة">أرمل أو أرملة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">هل يوجد أبناء؟</label>
                <select
                  value={hasChildren}
                  onChange={(e) => setHasChildren(e.target.value as "yes" | "no")}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="no">لا يوجد أبناء</option>
                  <option value="yes">نعم، يوجد أبناء</option>
                </select>
              </div>

              {hasChildren === "yes" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عدد الأبناء</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الرغبة في الإنجاب</label>
                <select
                  value={wantChildren}
                  onChange={(e) => setWantChildren(e.target.value as WantChildrenType)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="يريد الإنجاب">يريد الإنجاب</option>
                  <option value="لا يريد الإنجاب">لا يريد الإنجاب</option>
                  <option value="غير محدد">غير محدد</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">حالة التدخين</label>
                <select
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value as SmokingStatus)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="غير مدخن">غير مدخن</option>
                  <option value="مدخن">مدخن</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. النبذة والصفات والاهتمامات */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2">
              النبذة والصفات الشخصية
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">نبذة مختصرة عنك</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="تحدث بصدق عن نفسك وأسلوب حياتك وما تطمح إليه في الزواج..."
                className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">أهم صفاتك الشخصية</label>
              <input
                type="text"
                value={qualities}
                onChange={(e) => setQualities(e.target.value)}
                placeholder="مثال: هادئ، محب للأسرة، طموح..."
                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                الاهتمامات (افصل بينها بفاصلة)
              </label>
              <input
                type="text"
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
                placeholder="مثال: القراءة، السفر، ممارسة الرياضة..."
                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* 5. مواصفات شريك الحياة المطلوب */}
          <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 space-y-4">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>مواصفات شريك الحياة المطلوب</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">جنسية الشريك المطلوبة</label>
                <input
                  type="text"
                  value={partnerNationality}
                  onChange={(e) => setPartnerNationality(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العمر المطلوب (من)</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={partnerAgeFrom}
                  onChange={(e) => setPartnerAgeFrom(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العمر المطلوب (إلى)</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={partnerAgeTo}
                  onChange={(e) => setPartnerAgeTo(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المؤهل المطلوب</label>
                <select
                  value={partnerEducation}
                  onChange={(e) => setPartnerEducation(e.target.value as EducationLevel)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="جامعي">جامعي</option>
                  <option value="دراسات عليا">دراسات عليا</option>
                  <option value="فوق متوسط">فوق متوسط</option>
                  <option value="متوسط">متوسط</option>
                  <option value="بدون مؤهل">بدون مؤهل</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الحالة الاجتماعية المقبولة</label>
                <select
                  value={partnerMaritalStatus}
                  onChange={(e) => setPartnerMaritalStatus(e.target.value as MaritalStatusType)}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="أعزب أو عزباء">أعزب أو عزباء</option>
                  <option value="مطلق أو مطلقة">مطلق أو مطلقة</option>
                  <option value="أرمل أو أرملة">أرمل أو أرملة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">قبول وجود أبناء</label>
                <select
                  value={partnerAcceptChildren}
                  onChange={(e) => setPartnerAcceptChildren(e.target.value as "yes" | "no" | "any")}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="any">لا مانع</option>
                  <option value="no">لا أقبل وجود أبناء</option>
                  <option value="yes">أقبل وجود أبناء</option>
                </select>
              </div>
            </div>
          </div>

          {/* زر الحفظ */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-200 flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>حفظ الملف الشخصي</span>
            </button>
          </div>
        </form>

        {/* قسم تسجيل الخروج وتبديل الحساب */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0 text-right flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-800">تسجيل الخروج أو تبديل الحساب</h4>
            <p className="text-[11px] text-gray-500">
              يمكنك الخروج الآن لتجربة الدخول بحساب Google آخر أو بريد إلكتروني مختلف.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* 6. قسم حذف الحساب (Section 25) */}
        <div className="p-5 bg-red-50/50 border-t border-red-100 shrink-0 text-right">
          {!confirmDeleteOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-red-800">حذف الحساب نهائياً</h4>
                <p className="text-[11px] text-red-600">
                  حذف الحساب سيؤدي لإزالة صورك وبياناتك ومحادثاتك من منصة وصال.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>طلب حذف الحساب</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-700 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>تأكيد حذف الحساب نهائياً</span>
              </div>
              <p className="text-xs text-red-600">
                يرجى كتابة كلمة <strong>حذف</strong> لتأكيد رغبتك في إيقاف حسابك وحذف جميع بياناتك.
              </p>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="اكتب كلمة (حذف)"
                  value={deleteWord}
                  onChange={(e) => setDeleteWord(e.target.value)}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-red-300 text-xs focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  تأكيد الحذف
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold"
                >
                  تراجع
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
