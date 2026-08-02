import React, { useState } from "react";
import {
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  ShieldAlert,
  Ban,
  CheckCircle2,
  AlertTriangle,
  User
} from "lucide-react";
import { UserProfile, InteractionType, ReportTicket } from "../types";
import { sendReportTicket, blockMember } from "../services/firestoreService";

interface MemberDetailModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isMutual: boolean;
  onSendInteraction: (member: UserProfile, type: InteractionType) => void;
  onRequestCommunication: (member: UserProfile) => void;
  currentUserId?: string;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  isMutual,
  onSendInteraction,
  onRequestCommunication,
  currentUserId
}) => {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [blockSent, setBlockSent] = useState(false);

  if (!isOpen || !member) return null;

  const isMe = currentUserId === member.uid;
  const isOnline = member.isOnline === true;
  const showApprovedPhoto = member.photoURL && member.photoStatus === "approved";

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason || !currentUserId) return;

    try {
      await sendReportTicket({
        reporterId: currentUserId,
        reportedId: member.uid,
        reportedName: member.displayName || "عضو",
        reason: reportReason,
        details: reportDetails
      });
      setReportSent(true);
      setTimeout(() => {
        setReportOpen(false);
        setReportSent(false);
        setReportReason("");
        setReportDetails("");
      }, 2000);
    } catch (err) {
      alert("حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.");
    }
  };

  const handleBlock = async () => {
    if (!currentUserId) return;
    const confirmBlock = window.confirm(`هل أنت متأكد من رغبتك في حظر (${member.displayName})؟ لن تتمكن من رؤيته مرة أخرى.`);
    if (!confirmBlock) return;

    try {
      await blockMember(currentUserId, member.uid);
      setBlockSent(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      alert("حدث خطأ أثناء الحظر.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 max-h-[90vh] flex flex-col">
        {/* الهيدر العلوي */}
        <div className="relative h-48 bg-gradient-to-br from-rose-600 to-rose-800 text-white p-6 flex items-end justify-between shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg shrink-0">
              {showApprovedPhoto ? (
                <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-50 text-rose-600 font-extrabold text-3xl">
                  {member.displayName?.charAt(0) || "ع"}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{member.displayName}</h2>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {member.age ? `${member.age} سنة` : ""}
                </span>
              </div>
              <p className="text-xs text-rose-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{member.country} - {member.city}</span>
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className="text-[11px] font-bold">
                  {isOnline ? "متصل الآن" : "غير متصل"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* جسم النافذة والتفاصيل */}
        <div className="p-6 overflow-y-auto space-y-6 text-right flex-1">
          {blockSent && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
              🚫 تم حظر العضو بنجاح. لن يظهر لك في نتائج البحث مجدداً.
            </div>
          )}

          {/* 1. البيانات الأساسية */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
              البيانات والمؤهل
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">الوظيفة</span>
                <span className="font-bold text-gray-800">{member.job || "غير محدد"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">طبيعة العمل</span>
                <span className="font-bold text-gray-800">{member.workType || "عمل مستقر"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">المؤهل</span>
                <span className="font-bold text-gray-800">{member.education || "جامعي"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">الحالة الاجتماعية</span>
                <span className="font-bold text-gray-800">{member.maritalStatus || "أعزب/عزباء"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">الأبناء</span>
                <span className="font-bold text-gray-800">
                  {member.hasChildren === "yes" ? `نعم (${member.childrenCount || 1})` : "لا يوجد"}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">التدخين</span>
                <span className="font-bold text-gray-800">{member.smoking || "غير مدخن"}</span>
              </div>
            </div>
          </div>

          {/* 2. النبذة والصفات والاهتمامات */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
              نبذة عن العضو وصفاته
            </h3>
            <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 space-y-3">
              <div>
                <span className="block text-[11px] font-bold text-rose-900 mb-1">النبذة الشخصية:</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {member.bio || "لم يكتب نبذة بعد."}
                </p>
              </div>
              {member.qualities && (
                <div>
                  <span className="block text-[11px] font-bold text-rose-900 mb-1">أهم الصفات:</span>
                  <p className="text-xs text-gray-700">{member.qualities}</p>
                </div>
              )}
              {member.interests && member.interests.length > 0 && (
                <div>
                  <span className="block text-[11px] font-bold text-rose-900 mb-1">الاهتمامات:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.interests.map((x, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white text-rose-700 text-[11px] font-bold border border-rose-200"
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. مواصفات شريك الحياة المطلوب */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
              مواصفات شريك الحياة المطلوب
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">الجنسية</span>
                <span className="font-bold text-gray-800">{member.partnerNationality || "أي جنسية"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">العمر المطلوب</span>
                <span className="font-bold text-gray-800">
                  {member.partnerAgeFrom || 20} - {member.partnerAgeTo || 40} سنة
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">المؤهل المطلوب</span>
                <span className="font-bold text-gray-800">{member.partnerEducation || "جامعي"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">الحالة الاجتماعية</span>
                <span className="font-bold text-gray-800">{member.partnerMaritalStatus || "أعزب/عزباء"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-gray-400 text-[10px]">قبول وجود أبناء</span>
                <span className="font-bold text-gray-800">
                  {member.partnerAcceptChildren === "yes"
                    ? "يقبل أبناء"
                    : member.partnerAcceptChildren === "no"
                    ? "لا يقبل"
                    : "لا مانع"}
                </span>
              </div>
            </div>
          </div>

          {/* 4. قسم الإبلاغ والحظر */}
          {!isMe && (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(!reportOpen)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>إبلاغ عن مخالفة</span>
                </button>

                <button
                  type="button"
                  onClick={handleBlock}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 border border-red-200"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>حظر العضو</span>
                </button>
              </div>
            </div>
          )}

          {/* نافذة الإبلاغ الفرعية */}
          {reportOpen && (
            <form onSubmit={handleSendReport} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>إبلاغ عن محتوى أو سلوك مخالف</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">سبب البلاغ</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs"
                >
                  <option value="">اختر السبب...</option>
                  <option value="صورة غير لائقة">صورة غير لائقة أو غير حقيقية</option>
                  <option value="معلومات مضللة">معلومات مضللة أو كاذبة</option>
                  <option value="سلوك غير جاد">سلوك غير جاد أو عبثي</option>
                  <option value="طلب بيانات اتصال خارج المنصة">طلب بيانات اتصال أو أرقام هواتف</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">تفاصيل إضافية</label>
                <textarea
                  rows={2}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="اكتب تفاصيل البلاغ هنا لمساعدة الإدارة في اتخاذ القرار..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                >
                  إرسال البلاغ
                </button>
              </div>
              {reportSent && (
                <p className="text-xs text-green-700 font-bold">✅ تم إرسال البلاغ إلى الإدارة بنجاح.</p>
              )}
            </form>
          )}
        </div>

        {/* تذيل النافذة: أزرار التفاعل أو طلب التواصل */}
        {!isMe && (
          <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
            {isMutual ? (
              <button
                onClick={() => {
                  onClose();
                  onRequestCommunication(member);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-sm font-black shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>إعجاب متبادل! طلب بدء التواصل الآمن 💬</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-3 w-full">
                <button
                  onClick={() => {
                    onSendInteraction(member, "like");
                    onClose();
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-100"
                >
                  <span>❤️</span>
                  <span>إعجاب</span>
                </button>

                <button
                  onClick={() => {
                    onSendInteraction(member, "heart");
                    onClose();
                  }}
                  className="py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-100"
                >
                  <span>💖</span>
                  <span>قلب</span>
                </button>

                <button
                  onClick={() => {
                    onSendInteraction(member, "rose");
                    onClose();
                  }}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-100"
                >
                  <span>🌹</span>
                  <span>وردة</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
