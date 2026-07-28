import React, { useState, useEffect } from 'react';
import {
  Heart,
  User,
  LogOut,
  Bell,
  ShieldCheck,
  Search,
  MessageCircle,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  UserCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';
import { store } from '../services/store';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdmin: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenAdmin,
  isDarkMode = false,
  setIsDarkMode
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoAccountSwitcher, setShowDemoAccountSwitcher] = useState(false);

  useEffect(() => {
    const update = () => {
      if (currentUser) {
        const notifs = store.getNotificationsForUser(currentUser.id);
        setUnreadCount(notifs.filter((n) => !n.isRead).length);
      } else {
        setUnreadCount(0);
      }
    };

    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, [currentUser]);

  const handleSwitchAccount = (userId: string) => {
    store.setCurrentUserId(userId);
    setShowDemoAccountSwitcher(false);
    setShowUserMenu(false);
  };

  const allProfiles = store.getProfiles();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-rose-100 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white stroke-none animate-pulse" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-serif">
                  وصال
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-medium border border-rose-200 dark:border-rose-800">
                  للزواج الجاد
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                منصة التعارف والزواج الشرعي
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'browse'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Search className="w-4 h-4" />
              تصفح الأعضاء
            </button>
            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'how-it-works'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              طريقة العمل
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'safety'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              الأمان والخصوصية
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'contact'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              تواصل معنا
            </button>
          </nav>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Account Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowDemoAccountSwitcher(!showDemoAccountSwitcher)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                title="تبديل الحساب التجريبي بسرعة"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تبديل حساب التجربة</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoAccountSwitcher && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1 border-b border-slate-100 dark:border-slate-700">
                    اختر حساب للتجربة السرعة:
                  </p>
                  <div className="mt-1 space-y-1 max-h-60 overflow-y-auto">
                    {allProfiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchAccount(p.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right text-xs transition-colors ${
                          currentUser?.id === p.id
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <img
                          src={p.photoUrl}
                          alt={p.displayName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 truncate">
                          <div className="font-semibold">{p.displayName}</div>
                          <div className="text-[10px] text-slate-400">
                            {p.role === 'admin' ? '🛡️ مدير' : p.gender === 'male' ? '👨 رجل' : '👩 سيدة'} ({p.country})
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="تغيير المظهر"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {currentUser ? (
              <>
                {/* Notification Bell */}
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="relative p-2.5 rounded-2xl text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Menu Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700 transition-colors"
                  >
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.displayName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-500/20"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[90px] truncate hidden sm:inline">
                      {currentUser.displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {currentUser.displayName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {currentUser.gender === 'male' ? 'حساب رجل' : 'حساب سيدة'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700 text-right"
                      >
                        <User className="w-4 h-4 text-rose-500" />
                        الملف الشخصي والمواصفات
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin-messages');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 text-right"
                      >
                        <MessageCircle className="w-4 h-4 text-indigo-500" />
                        مراسلة الإدارة الخاصة
                      </button>

                      <button
                        onClick={() => {
                          onOpenAuth('login');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
                      >
                        <LogIn className="w-4 h-4 text-rose-500" />
                        تسجيل الدخول / حساب آخر
                      </button>

                      <button
                        onClick={() => {
                          onOpenAuth('register');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-right"
                      >
                        <UserPlus className="w-4 h-4 text-pink-500" />
                        إنشاء حساب جديد
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onOpenAdmin();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-right my-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          لوحة التحكم الإدارية
                        </button>
                      )}

                      <button
                        onClick={() => {
                          store.setCurrentUserId(null);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
