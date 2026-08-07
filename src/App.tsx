import React, { useState, useEffect, useMemo } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  Navbar,
  Footer,
  AuthModal,
  ProfileSetupModal,
  MemberCard,
  MemberDetailModal,
  ChatModal,
  ContactUsModal,
  AdminChatModal,
  NotificationsModal,
  AdminDashboardModal,
  LegalPagesModal,
  HeroSection,
  ExploreFilters
} from "./components";
import {
  UserProfile,
  InteractionType,
  CommunicationRequest,
  AppNotification
} from "./types";
import {
  getAllApprovedMembers,
  sendInteraction,
  getUserInteractions,
  sendCommunicationRequest
} from "./services/firestoreService";
import { seedFemaleProfilesIfNeeded } from "./services/seedService";
import { HeartHandshake, Sparkles, RefreshCw, Users, ShieldAlert } from "lucide-react";

const AppContent: React.FC = () => {
  const { firebaseUser, profile, loading } = useAuth();

  // النوافذ المنبثقة
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<string>("about");

  // عضو محدد لعرض التفاصيل
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  // محادثة آمنة بعد موافقة الإدارة
  const [activeChatRequest, setActiveChatRequest] = useState<CommunicationRequest | null>(null);

  // الأعضاء والتفاعلات
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState<boolean>(true);
  const [mutualUids, setMutualUids] = useState<Set<string>>(new Set());

  // عداد الإشعارات غير المقروءة
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // الفلاتر
  const [filters, setFilters] = useState<ExploreFilters>({
    gender: "all",
    ageFrom: 18,
    ageTo: 75,
    country: "",
    city: "",
    maritalStatus: "all",
    education: "all",
    wantChildren: "all",
    smoking: "all"
  });

  // جلب الأعضاء المعتمدين
  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      // التأكد من وجود وتغذية الـ 50 بروفايل في قاعدة بيانات Firebase
      await seedFemaleProfilesIfNeeded();
      const list = await getAllApprovedMembers();
      setMembers(list);
    } catch (err) {
      console.warn("Error loading members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // جلب التفاعلات عند تسجيل الدخول
  useEffect(() => {
    if (firebaseUser) {
      getUserInteractions(firebaseUser.uid).then((res) => {
        setMutualUids(new Set(res.mutualUids));
      });
    } else {
      setMutualUids(new Set());
    }
  }, [firebaseUser]);

  // فلترة الأعضاء في الـ Grid
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // حجب الملف الشخصي الحالي من شبكة الأعضاء
      if (firebaseUser && m.uid === firebaseUser.uid) return false;
      // حجب الأعضاء المحظورين
      if (profile?.blockedUsers && profile.blockedUsers.includes(m.uid)) return false;

      // فلتر النوع
      if (filters.gender !== "all" && m.gender !== filters.gender) return false;
      // فلتر العمر
      const mAge = m.age || 25;
      if (mAge < filters.ageFrom || mAge > filters.ageTo) return false;
      // فلتر الدولة
      if (
        filters.country &&
        !m.country?.toLowerCase().includes(filters.country.toLowerCase())
      ) {
        return false;
      }
      // فلتر المدينة
      if (
        filters.city &&
        !m.city?.toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }
      // فلتر الحالة الاجتماعية
      if (
        filters.maritalStatus !== "all" &&
        m.maritalStatus !== filters.maritalStatus
      ) {
        return false;
      }
      // فلتر المؤهل
      if (filters.education !== "all" && m.education !== filters.education) {
        return false;
      }
      // فلتر الرغبة في الإنجاب
      if (
        filters.wantChildren !== "all" &&
        m.wantChildren !== filters.wantChildren
      ) {
        return false;
      }
      // فلتر التدخين
      if (filters.smoking !== "all" && m.smoking !== filters.smoking) {
        return false;
      }

      return true;
    });
  }, [members, firebaseUser, profile, filters]);

  // إرسال تفاعل (إعجاب، قلب، وردة)
  const handleSendInteraction = async (toMember: UserProfile, type: InteractionType) => {
    if (!firebaseUser || !profile) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await sendInteraction(
        firebaseUser.uid,
        profile.displayName || "عضو",
        profile.photoURL || "",
        toMember.uid,
        type
      );

      if (res.mutual) {
        setMutualUids((prev) => new Set([...prev, toMember.uid]));
        alert(`🎉 مبروك! إعجاب متبادل بينك وبين (${toMember.displayName}). يمكنكما الآن طلب بدء التواصل من زر (طلب بدء التواصل) في بطاقته.`);
      } else {
        alert(`✅ تم إرسال (${type === "like" ? "إعجاب" : type === "heart" ? "قلب" : "باقة ورد"}) إلى (${toMember.displayName}) بنجاح!`);
      }
    } catch (error) {
      alert("حدث خطأ أثناء إرسال التفاعل. يرجى المحاولة لاحقاً.");
    }
  };

  // طلب بدء التواصل (بعد الإعجاب المتبادل)
  const handleRequestCommunication = async (toMember: UserProfile) => {
    if (!firebaseUser || !profile) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await sendCommunicationRequest(
        firebaseUser.uid,
        profile.displayName || "عضو",
        profile.photoURL || "",
        toMember.uid,
        toMember.displayName || "عضو",
        toMember.photoURL || ""
      );

      alert(`✅ تم إرسال طلب بدء التواصل مع (${toMember.displayName}) إلى إدارة وصال للمراجعة والموافقة وفق ضوابط الزواج الشرعي.`);
    } catch (error) {
      alert("حدث خطأ أثناء إرسال طلب التواصل. يرجى المحاولة لاحقاً.");
    }
  };

  // فتح صفحة قانونية معينة
  const handleOpenLegal = (tab = "about") => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* شريط التنقل العلوي */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfileSetup={() => setProfileModalOpen(true)}
        onOpenAdminDashboard={() => setAdminDashboardOpen(true)}
        onOpenContactUs={() => setContactUsOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAdminChat={() => setAdminChatOpen(true)}
        onOpenLegal={handleOpenLegal}
        unreadCount={unreadCount}
      />

      {/* قسم الهيرو وشريط البحث */}
      <HeroSection
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() =>
          setFilters({
            gender: "all",
            ageFrom: 18,
            ageTo: 75,
            country: "",
            city: "",
            maritalStatus: "all",
            education: "all",
            wantChildren: "all",
            smoking: "all"
          })
        }
        totalMembersCount={members.length}
        onOpenAuth={() => setAuthModalOpen(true)}
        isLoggedIn={Boolean(firebaseUser)}
      />

      {/* شبكة الأعضاء */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-600" />
            <span>الأعضاء المتاحون للتعارف والزواج الجاد</span>
            <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
              {filteredMembers.length} عضو
            </span>
          </h2>

          <button
            onClick={fetchMembers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${membersLoading ? "animate-spin text-rose-600" : ""}`} />
            <span>تحديث القائمة</span>
          </button>
        </div>

        {membersLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-bold text-gray-600">جارٍ جلب قائمة الأعضاء من قاعدة البيانات...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 p-8 shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl mx-auto flex items-center justify-center text-rose-600">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              لا توجد نتائج تطابق خيارات التصفية الحالية
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              يمكنك تجربة توسيع نطاق العمر أو اختيار "الجميع" في الحالة الاجتماعية والمؤهل، أو النقر على زر إعادة ضبط الفلاتر.
            </p>
            <button
              onClick={() =>
                setFilters({
                  gender: "all",
                  ageFrom: 18,
                  ageTo: 75,
                  country: "",
                  city: "",
                  maritalStatus: "all",
                  education: "all",
                  wantChildren: "all",
                  smoking: "all"
                })
              }
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all"
            >
              إعادة ضبط الفلاتر وعرض الجميع
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.uid}
                member={member}
                isMutual={mutualUids.has(member.uid)}
                onSendInteraction={handleSendInteraction}
                onRequestCommunication={handleRequestCommunication}
                onOpenDetail={(m) => setSelectedMember(m)}
                currentUserId={firebaseUser?.uid}
              />
            ))}
          </div>
        )}
      </main>

      {/* التذييل */}
      <Footer
        onOpenLegal={handleOpenLegal}
        onOpenContactUs={() => setContactUsOpen(true)}
      />

      {/* 1. نافذة تسجيل الدخول / إنشاء حساب */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenLegal={handleOpenLegal}
      />

      {/* 2. نافذة إعداد الملف الشخصي وحذف الحساب */}
      <ProfileSetupModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* 3. نافذة تفاصيل العضو والإبلاغ والحظر */}
      <MemberDetailModal
        isOpen={Boolean(selectedMember)}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        isMutual={selectedMember ? mutualUids.has(selectedMember.uid) : false}
        onSendInteraction={handleSendInteraction}
        onRequestCommunication={handleRequestCommunication}
        currentUserId={firebaseUser?.uid}
      />

      {/* 4. نافذة المحادثة الآمنة */}
      <ChatModal
        isOpen={Boolean(activeChatRequest)}
        onClose={() => setActiveChatRequest(null)}
        request={activeChatRequest}
        currentUserId={firebaseUser?.uid || ""}
      />

      {/* 5. نافذة تواصل معنا (Contact Us) */}
      <ContactUsModal
        isOpen={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
      />

      {/* 6. نافذة مراسلة الإدارة */}
      <AdminChatModal
        isOpen={adminChatOpen}
        onClose={() => setAdminChatOpen(false)}
      />

      {/* 7. نافذة الإشعارات والتنبيهات */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectNotification={(notif) => {
          // إذا كان الإشعار عن موافقة تواصل يمكننا مستقبلاً فتح المحادثة
          setNotificationsOpen(false);
        }}
      />

      {/* 8. نافذة لوحة التحكم للإدارة */}
      <AdminDashboardModal
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
      />

      {/* 9. نافذة السياسات والضوابط القانونية */}
      <LegalPagesModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
        onOpenContactUs={() => {
          setLegalModalOpen(false);
          setContactUsOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
