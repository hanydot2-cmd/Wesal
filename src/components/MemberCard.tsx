import React from 'react';
import { UserProfile, InteractionType } from '../types';
import { store } from '../services/store';
import { Heart, Sparkles, MapPin, Briefcase, GraduationCap, Eye } from 'lucide-react';

interface MemberCardProps {
  member: UserProfile;
  currentUser: UserProfile | null;
  onSelectMember: (member: UserProfile) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUser,
  onSelectMember,
  onOpenAuth
}) => {
  const isApproved = member.photoReviewStatus === 'approved';
  const isSelf = currentUser?.id === member.id;

  const handleInteraction = (e: React.MouseEvent, type: InteractionType) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (isSelf) return;

    store.sendInteraction(member.id, type);
  };

  return (
    <div
      onClick={() => onSelectMember(member)}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-100/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-3">
        {/* Connection status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
          <span
            className={`w-2 h-2 rounded-full ${
              member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'
            }`}
          ></span>
          <span className={member.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
            {member.isOnline ? 'متصل الآن' : 'غير متصل'}
          </span>
        </div>

        {/* Gender Badge */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
          {member.gender === 'male' ? '👨 رجل' : '👩 سيدة'}
        </span>
      </div>

      {/* Member Main Image & Pseudonym */}
      <div className="text-center space-y-3 my-2">
        <div className="relative inline-block mx-auto">
          <img
            src={isApproved ? member.photoUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
            alt={member.displayName}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-rose-500/10 group-hover:scale-105 transition-transform ${
              !isApproved ? 'blur-md opacity-80' : ''
            }`}
          />
          {!isApproved && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-3xl text-white text-[10px] font-bold text-center px-2">
              الصورة قيد المراجعة الإدارية
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white font-serif">
            {member.displayName}، <span className="text-rose-600 dark:text-rose-400">{member.age} سنة</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {member.nationality} • {member.city} ({member.country})
          </p>
        </div>
      </div>

      {/* Details Pills */}
      <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 truncate">
          <Briefcase className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">{member.occupation}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 truncate">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">{member.education}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 mb-3">
        <span>الحالة: {member.maritalStatus}</span>
        <span>التدخين: {member.smoking}</span>
      </div>

      {/* Short Bio Snippet */}
      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-4 bg-rose-50/50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
        "{member.bio || 'لم يكتب نبذة مختصرة بعد...'}"
      </p>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
        <button
          onClick={(e) => handleInteraction(e, 'like')}
          className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-1"
          title="إرسال إعجاب"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>إعجاب</span>
        </button>

        <button
          onClick={(e) => handleInteraction(e, 'flower')}
          className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 text-pink-600 dark:text-pink-400 text-xs font-bold transition-colors"
          title="إرسال باقة ورد 🌹"
        >
          🌹
        </button>

        <button
          onClick={(e) => handleInteraction(e, 'heart')}
          className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors"
          title="إرسال قلب 💖"
        >
          💖
        </button>

        <button
          onClick={() => onSelectMember(member)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          title="عرض الملف الكامل"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
