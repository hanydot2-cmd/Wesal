import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { store } from './services/store';

// Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { SafetySection } from './components/SafetySection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ProfileForm } from './components/ProfileForm';
import { MemberSearch } from './components/MemberSearch';
import { MemberCard } from './components/MemberCard';
import { MemberDetailModal } from './components/MemberDetailModal';
import { ChatModal } from './components/ChatModal';
import { ContactUsPage } from './components/ContactUsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminMessagingModal } from './components/AdminMessagingModal';
import { TermsModal } from './components/TermsModal';

import { Sparkles, Heart, Lock, MessagesSquare, ShieldCheck, ArrowLeft } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(store.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'profile' | 'chats' | 'contact'>('home');

  // Modals state
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login'
  });
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAdminChatTicketId, setShowAdminChatTicketId] = useState<string | null>(null);
  const [showAdminChatModal, setShowAdminChatModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
    return unsub;
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModal({ open: true, mode });
  };

  const handleLogout = () => {
    store.logout();
    setActiveTab('home');
  };

  // Get active user conversations for the "chats" tab
  const conversations = currentUser ? store.getUserConversations(currentUser.id) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between selection:bg-rose-500 selection:text-white" dir="rtl">
      
      {/* Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => setShowAdminDashboard(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-16">
            <Hero
              onOpenAuth={handleOpenAuth}
              setActiveTab={setActiveTab}
            />

            {/* Featured Members Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    اعضاء جدد يبحثون عن الزواج الشرعي
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-serif mt-1">
                    أحدث الأعضاء المتواجدين على وصال
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 border border-rose-200/80 dark:border-rose-800 flex items-center gap-2 self-start sm:self-auto"
                >
                  <span>عرض جميع الأعضاء</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {store.getProfiles().slice(0, 4).map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    currentUser={currentUser}
                    onSelectMember={setSelectedMember}
                    onOpenAuth={handleOpenAuth}
                  />
                ))}
              </div>
            </section>

            <HowItWorks />
            <SafetySection />
          </div>
        )}

        {/* TAB 2: BROWSE & SEARCH */}
        {activeTab === 'browse' && (
          <MemberSearch
            currentUser={currentUser}
            onSelectMember={setSelectedMember}
            onOpenAuth={handleOpenAuth}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {/* TAB 3: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="py-8 px-4 sm:px-6">
            {currentUser ? (
              <ProfileForm
                currentUser={currentUser}
                onSaved={() => {
                  // Alert or toast
                }}
              />
            ) : (
              <div className="max-w-md mx-auto my-12 text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-xl space-y-4">
                <Lock className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-xl font-bold font-serif">الوصول إلى الملف الشخصي</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  يرجى تسجيل الدخول أو إنشاء حساب جديد لتعديل ملفك الشخصي ومواصفات الشريك المطلوبة.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
                  >
                    إنشاء حساب
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRIVATE CHATS */}
        {activeTab === 'chats' && (
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
            {!currentUser ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
                <Lock className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-bold">المحادثات الخاصة</h3>
                <p className="text-xs text-slate-500">سجل الدخول لاستعراض ومتابعة محادثاتك المفتوحة.</p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  تسجيل الدخول
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="w-6 h-6 text-rose-500" />
                    <h2 className="text-xl font-black font-serif">المحادثات الخاصة المعتمدة</h2>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-600 rounded-full">
                    {conversations.length} محادثة
                  </span>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Heart className="w-10 h-10 mx-auto text-rose-300" />
                    <p className="text-xs font-semibold">لا توجد محادثات مفتوحة حالياً.</p>
                    <p className="text-[11px] text-slate-500">
                      تفتح المحادثات بعد حدوث إعجاب متبادل وموافقة إدارة المنصة على طلب التواصل.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conv) => {
                      const partnerId = conv.participants[0] === currentUser.id ? conv.participants[1] : conv.participants[0];
                      const partner = store.getProfileById(partnerId);
                      if (!partner) return null;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => setActiveChatPartnerId(partnerId)}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={partner.photoUrl}
                              alt={partner.displayName}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-500/20"
                            />
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{partner.displayName}</span>
                                <span className="text-xs text-rose-600 font-normal">
                                  ({partner.age} سنة - {partner.city})
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {conv.lastMessage || 'محادثة آمنة بدأت حديثاً...'}
                              </p>
                            </div>
                          </div>

                          <button className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs">
                            فتح المحادثة 💬
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CONTACT US & SUPPORT */}
        {activeTab === 'contact' && (
          <ContactUsPage
            currentUser={currentUser}
            onOpenAdminChat={(ticketId) => {
              setShowAdminChatTicketId(ticketId);
              setShowAdminChatModal(true);
            }}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenTerms={() => setShowTermsModal(true)}
      />

      {/* MODALS */}

      {/* Auth Modal */}
      {authModal.open && (
        <AuthModal
          isOpen={true}
          mode={authModal.mode}
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onOpenTerms={() => setShowTermsModal(true)}
          onSuccess={() => {
            setAuthModal({ open: false, mode: 'login' });
            setActiveTab('profile');
          }}
        />
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          currentUser={currentUser}
          onClose={() => setSelectedMember(null)}
          onGoHome={() => {
            setSelectedMember(null);
            setActiveTab('home');
          }}
          onOpenChat={(pId) => setActiveChatPartnerId(pId)}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Direct Private Chat Modal */}
      {activeChatPartnerId && currentUser && (
        <ChatModal
          partnerId={activeChatPartnerId}
          currentUser={currentUser}
          onClose={() => setActiveChatPartnerId(null)}
        />
      )}

      {/* Admin Dashboard */}
      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* Admin Private Messaging Modal */}
      {showAdminChatModal && currentUser && (
        <AdminMessagingModal
          currentUser={currentUser}
          ticketId={showAdminChatTicketId || undefined}
          onClose={() => {
            setShowAdminChatModal(false);
            setShowAdminChatTicketId(null);
          }}
        />
      )}

      {/* Terms & Privacy Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

    </div>
  );
}

export default App;
