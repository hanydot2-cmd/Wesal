import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserReport,
  ContactRequest,
  SupportTicket,
  ModerationLog,
  ContactRequestStatus,
  UserStatus
} from '../types';
import { store } from '../services/store';
import {
  ShieldCheck,
  Users,
  Camera,
  MessageSquare,
  AlertTriangle,
  LifeBuoy,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Ban,
  Trash2,
  Send,
  Sparkles,
  TrendingUp,
  Heart
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'stats' | 'users' | 'photos' | 'requests' | 'reports' | 'tickets'
  >('stats');

  const [stats, setStats] = useState(store.getAdminStats());
  const [profiles, setProfiles] = useState<UserProfile[]>(store.getProfiles());
  const [reports, setReports] = useState<UserReport[]>(store.getReports());
  const [requests, setRequests] = useState<ContactRequest[]>(store.getContactRequests());
  const [tickets, setTickets] = useState<SupportTicket[]>(store.getSupportTickets());
  const [logs, setLogs] = useState<ModerationLog[]>(store.getModerationLogs());

  // Search and filter states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Rejection modal
  const [photoToReject, setPhotoToReject] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('الصورة غير صريحة أو غير واضحة.');

  useEffect(() => {
    const update = () => {
      setStats(store.getAdminStats());
      setProfiles(store.getProfiles());
      setReports(store.getReports());
      setRequests(store.getContactRequests());
      setTickets(store.getSupportTickets());
      setLogs(store.getModerationLogs());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const pendingPhotos = profiles.filter((p) => p.photoReviewStatus === 'pending');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleApprovePhoto = (userId: string) => {
    store.reviewPhoto(userId, true);
  };

  const handleConfirmRejectPhoto = () => {
    if (photoToReject) {
      store.reviewPhoto(photoToReject.id, false, rejectReason);
      setPhotoToReject(null);
    }
  };

  const handleReviewRequest = (reqId: string, status: ContactRequestStatus) => {
    store.adminReviewContactRequest(reqId, status);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    store.sendSupportMessage(selectedTicket.id, ticketReplyText, true);
    setTicketReplyText('');
    const updated = store.getSupportTickets().find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const filteredProfiles = profiles.filter((p) =>
    p.displayName.includes(userSearchQuery) || p.email.includes(userSearchQuery) || p.city.includes(userSearchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full h-[92vh] max-h-[95vh] my-auto flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Mobile Slide Indicator */}
        <div className="pt-2 pb-1 bg-slate-900 sm:hidden flex justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black font-serif">لوحة تحكم الإدارة – وصال</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold hidden sm:inline-block">
                  صلاحيات مدير النظام
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">
                إدارة الأعضاء، مراجعة الصور، طلبات التواصل، الشكاوى، والدعم الفني
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold transition-all border border-slate-700 shrink-0"
            title="إغلاق لوحة التحكم"
          >
            <span>إغلاق اللوحة</span>
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-slate-100 dark:bg-slate-800/80 p-2 gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            الإحصائيات الشاملة
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            إدارة الأعضاء ({stats.totalMembers})
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
              activeTab === 'photos'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            مراجعة الصور المعلقة
            {pendingPhotos.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingPhotos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            طلبات التواصل
            {pendingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            المخالفات والبلاغات ({reports.length + logs.length})
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            رسائل Contact Us والدعم ({tickets.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                مؤشرات الأداء وإحصائيات منصة وصال
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">إجمالي الأعضاء</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white font-serif mt-1">
                    {stats.totalMembers}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    👨 {stats.menCount} رجال • 👩 {stats.womenCount} سيدات
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">المتصلون الآن</div>
                  <div className="text-3xl font-black text-emerald-600 font-serif mt-1">
                    🟢 {stats.onlineCount}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-2 font-bold">نشطون في الوقت الحالي</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">الصور المعلقة</div>
                  <div className="text-3xl font-black text-amber-500 font-serif mt-1">
                    📷 {stats.pendingPhotos}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-2 font-bold">تتطلب مراجعة واعتماد</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">الإعجابات والتفاعلات</div>
                  <div className="text-3xl font-black text-rose-500 font-serif mt-1">
                    ❤️ {stats.likesCount + stats.heartsCount + stats.flowersCount}
                  </div>
                  <div className="text-[10px] text-rose-600 mt-2 font-bold">
                    🌹 {stats.flowersCount} ورود • 💖 {stats.heartsCount} قلوب
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">الإعجابات المتبادلة</div>
                  <div className="text-3xl font-black text-indigo-600 font-serif mt-1">
                    🎉 {stats.mutualMatchesCount}
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-2 font-bold">اهتمام متبادل بين الطرفين</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">طلبات التواصل الإدارية</div>
                  <div className="text-3xl font-black text-amber-600 font-serif mt-1">
                    💬 {stats.contactRequestsCount}
                  </div>
                  <div className="text-[10px] text-amber-600 mt-2 font-bold">طلبات لفتح المراسلة</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">المحادثات النشطة</div>
                  <div className="text-3xl font-black text-blue-600 font-serif mt-1">
                    💬 {stats.activeChatsCount}
                  </div>
                  <div className="text-[10px] text-blue-600 mt-2 font-bold">محادثات خاصة مفتوحة</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-slate-400 text-xs font-medium">تذاكر الدعم والاتصال</div>
                  <div className="text-3xl font-black text-purple-600 font-serif mt-1">
                    📩 {stats.supportTicketsCount}
                  </div>
                  <div className="text-[10px] text-purple-600 mt-2 font-bold">استفسارات وشكاوى</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  قائمة جميع الأعضاء ({filteredProfiles.length})
                </h3>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="البحث بالاسم أو البريد..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">العضو</th>
                      <th className="p-3">النوع</th>
                      <th className="p-3">العمر/الجنسية</th>
                      <th className="p-3">الدولة والمدينة</th>
                      <th className="p-3">الصورة الشخصية</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">المخالفات</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 flex items-center gap-2">
                          <img
                            src={p.photoUrl}
                            alt={p.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold">{p.displayName}</div>
                            <div className="text-[10px] text-slate-400">{p.email}</div>
                          </div>
                        </td>
                        <td className="p-3 font-semibold">
                          {p.gender === 'male' ? '👨 رجل' : '👩 سيدة'}
                        </td>
                        <td className="p-3">{p.age} سنة / {p.nationality}</td>
                        <td className="p-3">{p.city} ({p.country})</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.photoReviewStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : p.photoReviewStatus === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {p.photoReviewStatus === 'approved'
                              ? 'معتمدة ✅'
                              : p.photoReviewStatus === 'pending'
                              ? 'معلقة ⏳'
                              : 'مرفوضة ❌'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {p.status === 'active' ? 'نشط' : 'موقوف'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-rose-600">
                          {p.violationCount || 0}
                        </td>
                        <td className="p-3 text-center space-x-1 space-x-reverse">
                          {p.status === 'active' ? (
                            <button
                              onClick={() => store.updateUserStatus(p.id, 'suspended')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold"
                            >
                              إيقاف
                            </button>
                          ) : (
                            <button
                              onClick={() => store.updateUserStatus(p.id, 'active')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-bold"
                            >
                              تفعيل
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTO MODERATION */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                مراجعة الصور المعلقة للموافقة أو الرفض ({pendingPhotos.length})
              </h3>

              {pendingPhotos.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center text-slate-400 text-xs">
                  ✅ لا توجد صور معلقة للمراجعة حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl}
                          alt={p.displayName}
                          className="w-12 h-12 rounded-2xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {p.displayName} ({p.age} سنة)
                          </div>
                          <div className="text-xs text-slate-400">
                            {p.gender === 'male' ? 'رجل' : 'سيدة'} • {p.country}
                          </div>
                        </div>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square">
                        <img
                          src={p.photoUrl}
                          alt={p.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprovePhoto(p.id)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          قبول الصورة
                        </button>

                        <button
                          onClick={() => setPhotoToReject(p)}
                          className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1 border border-rose-200"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض الصورة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMUNICATION REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                طلبات التواصل المعلقة للمراجعة والموافقة الإدارية ({pendingRequests.length})
              </h3>

              {pendingRequests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center text-slate-400 text-xs">
                  ✅ لا توجد طلبات تواصل معلقة حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((r) => {
                    const sender = store.getProfileById(r.senderId);
                    const receiver = store.getProfileById(r.receiverId);
                    return (
                      <div
                        key={r.id}
                        className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            الطرف الأول: <span className="text-rose-600">{sender?.displayName}</span> ({sender?.country})
                          </div>
                          <span className="text-slate-400">➡️</span>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            الطرف الثاني: <span className="text-rose-600">{receiver?.displayName}</span> ({receiver?.country})
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewRequest(r.id, 'approved')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                          >
                            الموافقة وفتح المحادثة ✅
                          </button>
                          <button
                            onClick={() => handleReviewRequest(r.id, 'rejected')}
                            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200"
                          >
                            رفض الطلب ❌
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VIOLATIONS AND REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  محاولات إرسال أرقام هواتف أو بيانات ممنوعة ({logs.length})
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 max-h-60 overflow-y-auto text-xs">
                  {logs.length === 0 ? (
                    <p className="text-slate-400 text-center">لا توجد محاولات مخالفات مسجلة.</p>
                  ) : (
                    logs.map((log) => {
                      const u = store.getProfileById(log.userId);
                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-rose-700 dark:text-rose-300">
                              {u?.displayName || 'عضو'}:
                            </span>{' '}
                            <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  البلاغات والشكاوى المقدمة من الأعضاء ({reports.length})
                </h3>
                <div className="space-y-2">
                  {reports.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl text-center text-slate-400 text-xs">
                      لا توجد بلاغات حالياً.
                    </div>
                  ) : (
                    reports.map((rep) => {
                      const reporter = store.getProfileById(rep.reporterId);
                      const reported = store.getProfileById(rep.reportedUserId);
                      return (
                        <div
                          key={rep.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>
                              مُقَدّم البلاغ: {reporter?.displayName} ➡️ المشتكى عليه: {reported?.displayName}
                            </span>
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              السبب: {rep.reason}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">{rep.details}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Ticket List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 max-h-[70vh] overflow-y-auto">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  تذاكر التواصل للدعم ({tickets.length})
                </h3>

                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3 rounded-2xl border transition-colors cursor-pointer text-xs space-y-1 ${
                      selectedTicket?.id === t.id
                        ? 'bg-rose-50 dark:bg-slate-800 border-rose-300 dark:border-slate-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white truncate">{t.subject}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full ${
                          t.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.status === 'replied' ? 'تم الرد' : 'معلقة'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      المرسل: {t.name} ({t.type})
                    </div>
                  </div>
                ))}
              </div>

              {/* Ticket Detail & Reply */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
                {selectedTicket ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedTicket.subject}
                          </h3>
                          <div className="text-xs text-slate-400">
                            المرسل: {selectedTicket.name} ({selectedTicket.email})
                          </div>
                        </div>

                        <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 px-3 py-1 rounded-full">
                          {selectedTicket.type}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                        {selectedTicket.message}
                      </div>

                      {/* Reply Stream */}
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400">سجل الردود:</h4>
                        {store.getSupportMessagesForTicket(selectedTicket.id).map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-2xl text-xs font-medium ${
                              m.isAdmin ? 'bg-indigo-600 text-white mr-6' : 'bg-slate-100 dark:bg-slate-800 ml-6'
                            }`}
                          >
                            <div className="text-[10px] opacity-80 mb-1">{m.senderName}</div>
                            {m.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendTicketReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        placeholder="اكتب رد الإدارة الرسمي للمستخدم..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                      >
                        إرسال الرد
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center my-auto text-slate-400 text-xs">
                    اختر تذكرة من القائمة لمراجعتها والرد عليها.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Rejection Reason Modal */}
        {photoToReject && (
          <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  سبب رفض الصورة الشخصية ({photoToReject.displayName})
                </h3>
                <button
                  onClick={() => setPhotoToReject(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800"
                  title="إغلاق"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs font-medium bg-slate-50 dark:bg-slate-800 dark:text-white"
              >
                <option value="الصورة غير صريحة أو غير واضحة.">الصورة غير صريحة أو غير واضحة.</option>
                <option value="الصورة تحتوي على نظارة شمسية أو فلتر مفرط.">الصورة تحتوي على نظارة شمسية أو فلتر مفرط.</option>
                <option value="الصورة ليست لعضو حقيقي أو شخصية مشهورة.">الصورة ليست لعضو حقيقي أو شخصية مشهورة.</option>
                <option value="الصورة مخالفة للضوابط الشرعية والشخصية.">الصورة مخالفة للضوابط الشرعية والشخصية.</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmRejectPhoto}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  تأكيد الرفض
                </button>
                <button
                  onClick={() => setPhotoToReject(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
