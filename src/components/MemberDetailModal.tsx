import React, { useState } from 'react';
import {
  UserProfile,
  InteractionType,
  ReportReason
} from '../types';
import { store } from '../services/store';
import {
  X,
  Heart,
  MessageSquarePlus,
  Ban,
  AlertTriangle,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessagesSquare
} from 'lucide-react';

interface MemberDetailModalProps {
  member: UserProfile | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenChat: (memberId: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  currentUser,
  onClose,
  onOpenChat,
  onOpenAuth
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('إساءة أو ألفاظ غير مناسبة');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  if (!member) return null;

  const isApproved = member.photoReviewStatus === 'approved';
  const isSelf = currentUser?.id === member.id;

  const isMutual = currentUser ? store.isMutualMatch(currentUser.id, member.id) : false;
  const contactReq = currentUser ? store.getContactRequestBetween(currentUser.id, member.id) : undefined;
  const isBlocked = currentUser ? store.isUserBlocked(currentUser.id, member.id) : false;

  const handleInteraction = (type: InteractionType) => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    store.sendInteraction(member.id, type);
    setActionFeedback(`تم إرسال ${type === 'like' ? 'الإعجاب' : type === 'flower' ? 'باقة الورد' : 'القلب'} بنجاح!`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleSendContactRequest = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    store.sendContactRequest(member.id);
    setActionFeedback('تم إرسال طلب بدء التواصل للإدارة بنجاح!');
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleBlock = () => {
    if (!currentUser) return;
    if (confirm(`هل أنت أأكد من حظر المستخدم (${member.displayName})؟`)) {
      store.blockUser(member.id);
      onClose();
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    store.reportUser(member.id, reportReason, reportDetails);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setShowReportModal(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-100 dark:border-slate-800 relative my-auto flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Sticky Header with Close Button and Mobile Drag Handle */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-serif">
                بطاقة العضو التفصيلية
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {member.displayName} • {member.age} سنة ({member.city})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700"
            title="إغلاق النافذة"
          >
            <span>إغلاق</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 touch-pan-y">
          
          {/* Mobile Drag Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-3 mb-1 sm:hidden shrink-0" />

          {/* Feedback Banner */}
          {actionFeedback && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{actionFeedback}</span>
            </div>
          )}

        {/* Header Profile Photo & Title */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div className="relative">
            <img
              src={isApproved ? member.photoUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={member.displayName}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-rose-500/20 ${
                !isApproved ? 'blur-md opacity-80' : ''
              }`}
            />
            {!isApproved && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-3xl text-white text-[10px] font-bold text-center px-2">
                الصورة قيد المراجعة الإدارية
              </div>
            )}
          </div>

          <div className="text-center sm:text-right space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif">
                {member.displayName}
              </h2>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                ({member.age} سنة)
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200">
                {member.gender === 'male' ? 'رجل' : 'سيدة'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              الجنسية: {member.nationality} • الإقامة: {member.city} ({member.country})
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {member.maritalStatus}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {member.occupation}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {member.education}
              </span>
            </div>
          </div>
        </div>

        {/* MUTUAL MATCH BANNER */}
        {isMutual && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg space-y-2 text-center animate-pulse">
            <div className="text-lg font-black font-serif flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 fill-white" />
              <span>❤️ «تم الإعجاب المتبادل»</span>
            </div>
            <p className="text-xs font-medium text-rose-100">
              يوجد اهتمام متبادل. يمكنك الآن إرسال طلب بدء التواصل إلى الإدارة لمراجعة المحادثة وفتحها.
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
          
          {/* Personal Specs */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              المواصفات الشخصية والتفاصيل
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">طبيعة العمل:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.jobNature || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">وجود أبناء:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {member.hasChildren ? `نعم (${member.childrenCount || 1})` : 'لا يوجد'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الرغبة في الإنجاب:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.desiresChildren}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">حالة التدخين:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.smoking}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الصفات الشخصية:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.personalTraits || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الاهتمامات والهوايات:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.hobbies || 'غير محدد'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] mb-1">نبذة عن نفسه/عنها:</span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                "{member.bio || 'لا توجد نبذة مدونة'}"
              </p>
            </div>
          </div>

          {/* Partner Specifications Wanted */}
          <div className="bg-rose-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-rose-100 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              مواصفات شريك الحياة المطلوب
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">العمر المطلوب:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  من {member.partnerMinAge} إلى {member.partnerMaxAge} سنة
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الجنسية المفضلة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.partnerNationality || 'الكل'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المستوى التعليمي:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.partnerEducation || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">قبول وجود أبناء:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.partnerAcceptsChildren}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الحالة الاجتماعية:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{member.partnerMaritalStatus || 'الكل'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-100 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] mb-1">تفاصيل ومواصفات الشريك المطلوب:</span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                "{member.partnerSpecs || 'غير محدد'}"
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons Footer */}
        {!isSelf && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleInteraction('like')}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                إرسال إعجاب ❤️
              </button>

              <button
                onClick={() => handleInteraction('flower')}
                className="py-3 px-4 rounded-xl bg-pink-100 dark:bg-pink-950/80 hover:bg-pink-200 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors"
                title="إرسال باقة ورد 🌹"
              >
                إرسال ورد 🌹
              </button>

              <button
                onClick={() => handleInteraction('heart')}
                className="py-3 px-4 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                title="إرسال قلب 💖"
              >
                إرسال قلب 💖
              </button>
            </div>

            {/* Request Communication or Open Chat */}
            {contactReq?.status === 'approved' ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(member.id);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <MessagesSquare className="w-4 h-4" />
                موافقة الإدارة تامة - فتح المحادثة الخاصة الآمنة الآن
              </button>
            ) : contactReq?.status === 'pending' ? (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold text-center">
                ⏳ طلب بدء التواصل قيد مراجعة الإدارة حالياً...
              </div>
            ) : (
              <button
                onClick={handleSendContactRequest}
                className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <MessageSquarePlus className="w-4 h-4 text-rose-400" />
                طلب بدء التواصل (إرسال الطلب للإدارة للمراجعة)
              </button>
            )}

            {/* Block & Report Buttons */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                onClick={handleBlock}
                className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                حظر المستخدم
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="text-slate-400 hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                الإبلاغ عن مخالفة
              </button>
            </div>

          </div>
        )}

        {/* Bottom Explicit Close Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>إغلاق بطاقة العضو</span>
          </button>
        </div>

        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  الإبلاغ عن المستخدم ({member.displayName})
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center">
                  تم تقديم البلاغ للإدارة وسوف يتم اتخاذ الإجراء اللازم.
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سبب البلاغ *
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as ReportReason)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                    >
                      <option value="إساءة أو ألفاظ غير مناسبة">إساءة أو ألفاظ غير مناسبة</option>
                      <option value="طلب بيانات شخصية">طلب بيانات شخصية</option>
                      <option value="محاولة مشاركة رقم هاتف">محاولة مشاركة رقم هاتف</option>
                      <option value="حساب مزيف">حساب مزيف</option>
                      <option value="صورة غير مناسبة">صورة غير مناسبة</option>
                      <option value="مضايقة">مضايقة</option>
                      <option value="احتيال">احتيال</option>
                      <option value="سبب آخر">سبب آخر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تفاصيل إضافية *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="اشرح المشكلة بالتفصيل لمساعدة فريق الإدارة..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                  >
                    إرسال البلاغ للإدارة
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
