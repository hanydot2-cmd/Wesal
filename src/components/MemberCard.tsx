import React from "react";
import {
  Heart,
  Sparkles,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { UserProfile, InteractionType } from "../types";

interface MemberCardProps {
  member: UserProfile;
  isMutual: boolean;
  onSendInteraction: (member: UserProfile, type: InteractionType) => void;
  onRequestCommunication: (member: UserProfile) => void;
  onOpenDetail: (member: UserProfile) => void;
  currentUserId?: string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isMutual,
  onSendInteraction,
  onRequestCommunication,
  onOpenDetail,
  currentUserId
}) => {
  const isMe = currentUserId === member.uid;
  const isOnline = member.isOnline === true;
  const showApprovedPhoto = member.photoURL && member.photoStatus === "approved";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      {/* الجزء العلوي: الصورة والشارة والحالة */}
      <div
        onClick={() => onOpenDetail(member)}
        className="relative h-60 bg-gradient-to-br from-rose-50 to-rose-100/50 cursor-pointer overflow-hidden"
      >
        {showApprovedPhoto ? (
          <img
            src={member.photoURL}
            alt={member.displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-rose-300 bg-gradient-to-b from-rose-50/80 to-rose-100/50">
            <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-4xl font-extrabold text-rose-600 mb-2 border-4 border-rose-100">
              {member.displayName?.charAt(0) || "ع"}
            </div>
            <span className="text-xs font-bold text-gray-500 bg-white/80 px-3 py-1 rounded-full shadow-xs">
              صورة خاصة أو قيد الاعتماد 🔒
            </span>
          </div>
        )}

        {/* مؤشر الأونلاين (أخضر / أحمر) */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-red-400"
            }`}
          />
          <span className="text-[11px] font-bold text-gray-800">
            {isOnline ? "متصل الآن" : "غير متصل"}
          </span>
        </div>

        {/* شارة التحقق */}
        <div className="absolute top-4 left-4 bg-rose-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>عضو موثق</span>
        </div>

        {/* شريط الاسم والعمر أدناه */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-950/80 via-gray-900/40 to-transparent p-4 pt-10 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight truncate max-w-[180px]">
              {member.displayName}
            </h3>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              {member.age ? `${member.age} سنة` : "سن غير محدد"}
            </span>
          </div>
        </div>
      </div>

      {/* بيانات مختصرة عن العضو */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-right">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">
              {member.country} - {member.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{member.job || "عمل خاص"}</span>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">
              {member.education || "جامعي"} • {member.maritalStatus || "أعزب/عزباء"}
            </span>
          </div>

          {member.bio && (
            <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 pt-1 border-t border-gray-100">
              « {member.bio} »
            </p>
          )}
        </div>

        {/* أزرار التفاعل أو التواصل */}
        {!isMe && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {isMutual ? (
              <button
                onClick={() => onRequestCommunication(member)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black shadow-md shadow-rose-100 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إعجاب متبادل! طلب بدء التواصل 💬</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSendInteraction(member, "like")}
                  className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-rose-200"
                  title="إعجاب ❤️"
                >
                  <span>❤️</span>
                  <span className="text-[11px]">إعجاب</span>
                </button>

                <button
                  onClick={() => onSendInteraction(member, "heart")}
                  className="py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-pink-200"
                  title="قلب 💖"
                >
                  <span>💖</span>
                  <span className="text-[11px]">قلب</span>
                </button>

                <button
                  onClick={() => onSendInteraction(member, "rose")}
                  className="py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-200"
                  title="وردة 🌹"
                >
                  <span>🌹</span>
                  <span className="text-[11px]">وردة</span>
                </button>
              </div>
            )}

            <button
              onClick={() => onOpenDetail(member)}
              className="w-full py-1.5 text-center text-[11px] font-bold text-gray-500 hover:text-rose-600 transition-colors"
            >
              عرض التفاصيل الكاملة ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
