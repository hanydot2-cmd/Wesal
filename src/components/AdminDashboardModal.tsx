import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  Users,
  Image,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Trash2,
  Search,
  Check,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  UserProfile,
  CommunicationRequest,
  ContactTicket,
  ViolationLog
} from "../types";
import {
  getAllUsersForAdmin,
  getCommunicationRequestsForAdmin,
  approveCommunicationRequest,
  rejectCommunicationRequest,
  getAllContactTicketsForAdmin,
  replyToContactTicket,
  updateProfileData
} from "../services/firestoreService";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "members" | "photos" | "requests" | "tickets" | "violations" | "stats"
  >("members");

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<CommunicationRequest[]>([]);
  const [tickets, setTickets] = useState<ContactTicket[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  // رفض صورة
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingUid, setRejectingUid] = useState<string | null>(null);

  // الرد على تذكرة
  const [replyText, setReplyText] = useState("");
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allUsers, allReqs, allTickets] = await Promise.all([
        getAllUsersForAdmin(),
        getCommunicationRequestsForAdmin(),
        getAllContactTicketsForAdmin()
      ]);
      setMembers(allUsers);
      setRequests(allReqs);
      setTickets(allTickets);

      try {
        const vSnap = await getDocs(query(collection(db, "violations"), orderBy("createdAt", "desc")));
        setViolations(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {
        setViolations([]);
      }
    } catch (error) {
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchData();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen || !isAdmin) return null;

  // الموافقة على صورة
  const handleApprovePhoto = async (uid: string) => {
    await updateProfileData(uid, { photoStatus: "approved", photoRejectReason: "" });
    setMembers((prev) =>
      prev.map((m) => (m.uid === uid ? { ...m, photoStatus: "approved", photoRejectReason: "" } : m))
    );
  };

  // رفض صورة
  const handleRejectPhoto = async (uid: string) => {
    if (!rejectReason.trim()) {
      alert("يرجى كتابة سبب رفض الصورة");
      return;
    }
    await updateProfileData(uid, {
      photoStatus: "rejected",
      photoRejectReason: rejectReason.trim()
    });
    setMembers((prev) =>
      prev.map((m) =>
        m.uid === uid
          ? { ...m, photoStatus: "rejected", photoRejectReason: rejectReason.trim() }
          : m
      )
    );
    setRejectingUid(null);
    setRejectReason("");
  };

  // إيقاف أو تفعيل حساب
  const handleToggleStatus = async (uid: string, currentStatus?: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    await updateProfileData(uid, { accountStatus: newStatus });
    setMembers((prev) =>
      prev.map((m) => (m.uid === uid ? { ...m, accountStatus: newStatus } : m))
    );
  };

  // الرد على تذكرة دعم
  const handleSendTicketReply = async (tId: string) => {
    if (!replyText.trim()) return;
    await replyToContactTicket(tId, replyText.trim());
    setTickets((prev) =>
      prev.map((t) => (t.id === tId ? { ...t, status: "تم الرد", replyText: replyText.trim() } : t))
    );
    setReplyingTicketId(null);
    setReplyText("");
  };

  // صور معلقة
  const pendingPhotosMembers = members.filter((m) => m.photoStatus === "pending" && m.photoURL);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 max-h-[94vh] flex flex-col">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-amber-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">لوحة التحكم وإدارة منصة وصال</h2>
              <p className="text-xs text-amber-100">مراقبة الأعضاء، مراجعة الصور، وطلبات التواصل</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-xs flex items-center gap-1"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "members"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>جميع الأعضاء ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "photos"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Image className="w-4 h-4" />
            <span>صور قيد المراجعة ({pendingPhotosMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>طلبات التواصل ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "tickets"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>تذاكر الدعم ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("violations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "violations"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>سجل المخالفات ({violations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "stats"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>إحصائيات المنصة 📊</span>
          </button>
        </div>

        {/* جسم اللوحة */}
        <div className="flex-1 overflow-y-auto p-6 text-right space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
              <span className="text-sm font-bold">جارٍ تحميل بيانات لوحة الإدارة...</span>
            </div>
          ) : (
            <>
              {/* 1. تبويب الأعضاء */}
              {activeTab === "members" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">
                      قائمة الأعضاء المسجلين في وصال ({members.length})
                    </h3>
                    <div className="relative w-64">
                      <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-1.5 pr-9 pl-3 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                        <tr>
                          <th className="p-3">العضو</th>
                          <th className="p-3">البريد</th>
                          <th className="p-3">الجنسية والدولة</th>
                          <th className="p-3">العمر</th>
                          <th className="p-3">الحالة الاجتماعية</th>
                          <th className="p-3">حالة الصورة</th>
                          <th className="p-3">حالة الحساب</th>
                          <th className="p-3">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {members
                          .filter(
                            (m) =>
                              m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((m) => (
                            <tr key={m.uid} className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-900">{m.displayName}</td>
                              <td className="p-3 text-gray-600">{m.email}</td>
                              <td className="p-3">
                                {m.nationality} - {m.country}
                              </td>
                              <td className="p-3">{m.age || "—"}</td>
                              <td className="p-3">{m.maritalStatus || "—"}</td>
                              <td className="p-3">
                                {m.photoStatus === "approved" ? (
                                  <span className="text-green-700 font-bold">معتمدة ✅</span>
                                ) : m.photoStatus === "pending" ? (
                                  <span className="text-amber-700 font-bold">معلقة ⏳</span>
                                ) : (
                                  <span className="text-gray-400">لا يوجد</span>
                                )}
                              </td>
                              <td className="p-3">
                                {m.accountStatus === "suspended" ? (
                                  <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded">
                                    موقوف 🚫
                                  </span>
                                ) : (
                                  <span className="text-green-700 font-bold">نشط ✅</span>
                                )}
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleToggleStatus(m.uid, m.accountStatus)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    m.accountStatus === "suspended"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {m.accountStatus === "suspended" ? "تفعيل" : "إيقاف"}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. تبويب صور قيد المراجعة */}
              {activeTab === "photos" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">
                    صور الأعضاء المعلقة التي تنتظر الموافقة ({pendingPhotosMembers.length})
                  </h3>

                  {pendingPhotosMembers.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
                      <Image className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold">لا توجد صور معلقة بانتظار المراجعة.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {pendingPhotosMembers.map((m) => (
                        <div key={m.uid} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                          <div className="h-48 rounded-xl overflow-hidden bg-gray-100">
                            <img src={m.photoURL} alt={m.displayName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{m.displayName}</h4>
                              <p className="text-xs text-gray-500">
                                {m.age} سنة • {m.country}
                              </p>
                            </div>
                          </div>

                          {rejectingUid === m.uid ? (
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <input
                                type="text"
                                placeholder="سبب الرفض (مثلاً صورة غير لائقة)..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full py-1 px-2 rounded-lg border border-gray-300 text-xs"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setRejectingUid(null)}
                                  className="px-2 py-1 text-xs border rounded-lg"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => handleRejectPhoto(m.uid)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg"
                                >
                                  تأكيد الرفض
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <button
                                onClick={() => handleApprovePhoto(m.uid)}
                                className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                <span>موافقة</span>
                              </button>
                              <button
                                onClick={() => setRejectingUid(m.uid)}
                                className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200"
                              >
                                <span>رفض الصورة</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. تبويب طلبات التواصل */}
              {activeTab === "requests" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">
                    طلبات بدء التواصل الآمن بين الأعضاء ({requests.length})
                  </h3>

                  {requests.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
                      <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold">لا توجد طلبات تواصل حالياً.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs text-gray-500">من العضو</span>
                              <h4 className="text-sm font-bold text-rose-700">{r.fromName}</h4>
                            </div>
                            <span className="text-gray-300 font-bold">↔️</span>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">إلى العضو</span>
                              <h4 className="text-sm font-bold text-rose-700">{r.toName}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                r.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : r.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {r.status === "approved"
                                ? "تمت الموافقة ✅"
                                : r.status === "rejected"
                                ? "مرفوض ❌"
                                : "قيد المراجعة ⏳"}
                            </span>

                            {r.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    await approveCommunicationRequest(r.id, r);
                                    setRequests((prev) =>
                                      prev.map((x) => (x.id === r.id ? { ...x, status: "approved" } : x))
                                    );
                                  }}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold"
                                >
                                  موافقة فتح التواصل
                                </button>
                                <button
                                  onClick={async () => {
                                    await rejectCommunicationRequest(r.id, r);
                                    setRequests((prev) =>
                                      prev.map((x) => (x.id === r.id ? { ...x, status: "rejected" } : x))
                                    );
                                  }}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-bold"
                                >
                                  رفض
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. تبويب تذاكر الدعم والاتصال */}
              {activeTab === "tickets" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">
                    تذاكر الدعم والاتصال من الزوار والأعضاء ({tickets.length})
                  </h3>

                  {tickets.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
                      <HelpCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-bold">لا توجد رسائل أو تذاكر دعم.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((t) => (
                        <div key={t.id} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
                              {t.requestType}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                t.status === "تم الرد" ? "text-green-700" : "text-amber-700"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">{t.subject}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                            {t.message}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                            <span>
                              من: {t.name} ({t.email})
                            </span>
                            {t.createdAt && (
                              <span>{new Date(t.createdAt.seconds * 1000).toLocaleDateString("ar-EG")}</span>
                            )}
                          </div>

                          {t.replyText && (
                            <div className="p-3 bg-green-50 rounded-xl text-xs text-green-900 border border-green-200">
                              <strong>رد الإدارة:</strong> {t.replyText}
                            </div>
                          )}

                          {replyingTicketId === t.id ? (
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="اكتب رد الإدارة على التذكرة هنا..."
                                className="w-full p-2 rounded-xl border border-gray-300 text-xs"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setReplyingTicketId(null)}
                                  className="px-3 py-1 border rounded-lg text-xs"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => handleSendTicketReply(t.id)}
                                  className="px-4 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                                >
                                  حفظ الرد
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyingTicketId(t.id);
                                setReplyText(t.replyText || "");
                              }}
                              className="text-xs font-bold text-rose-600 hover:underline pt-1"
                            >
                              {t.replyText ? "تعديل الرد" : "← إضافة رد على الرسالة"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. تبويب سجل المخالفات */}
              {activeTab === "violations" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">
                    سجل محاولات تبادل أرقام الهواتف والتجاوزات في المحادثات ({violations.length})
                  </h3>

                  {violations.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-green-400 mb-2" />
                      <p className="text-xs font-bold text-green-700">
                        لا توجد مخالفات مسجلة. جميع المحادثات ملتزمة بضوابط الخصوصية.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {violations.map((v) => (
                        <div key={v.id} className="p-4 rounded-2xl border border-red-200 bg-red-50/50 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-red-800">سبب الحظر: {v.reason}</span>
                            <span className="text-gray-400 text-[10px]">
                              {v.createdAt &&
                                new Date(v.createdAt.seconds * 1000).toLocaleString("ar-EG")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 bg-white p-2 rounded-xl font-mono">
                            "{v.text}"
                          </p>
                          <div className="text-[11px] text-gray-500 pt-1">
                            المرسل (ID): <strong>{v.senderId}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. إحصائيات المنصة */}
              {activeTab === "stats" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-800">
                    إحصائيات منصة وصال للتعارف والزواج الجاد
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                      <span className="block text-2xl font-black text-rose-700">{members.length}</span>
                      <span className="text-xs font-bold text-gray-600">إجمالي الأعضاء</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-green-50 border border-green-100 text-center">
                      <span className="block text-2xl font-black text-green-700">
                        {members.filter((m) => m.photoStatus === "approved").length}
                      </span>
                      <span className="text-xs font-bold text-gray-600">صور معتمدة</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                      <span className="block text-2xl font-black text-amber-700">{requests.length}</span>
                      <span className="text-xs font-bold text-gray-600">طلبات التواصل</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                      <span className="block text-2xl font-black text-blue-700">{tickets.length}</span>
                      <span className="text-xs font-bold text-gray-600">رسائل الدعم</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
