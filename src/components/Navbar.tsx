import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  HeartHandshake,
  User,
  Bell,
  MessageSquare,
  ShieldAlert,
  LogOut,
  LogIn,
  Menu,
  X,
  HelpCircle
} from "lucide-react";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenProfileSetup: () => void;
  onOpenAdminDashboard: () => void;
  onOpenContactUs: () => void;
  onOpenNotifications: () => void;
  onOpenAdminChat: () => void;
  onOpenLegal: (tab?: string) => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenProfileSetup,
  onOpenAdminDashboard,
  onOpenContactUs,
  onOpenNotifications,
  onOpenAdminChat,
  onOpenLegal,
  unreadCount = 0
}) => {
  const { firebaseUser, profile, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import("../services");
      await logoutUser();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* الشعار واسم الموقع */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                وصال <span className="text-rose-600 font-extrabold text-sm sm:text-base font-normal">للتعارف والزواج الجاد</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">«خطوتك نحو شريك حياة مناسب»</p>
            </div>
          </div>

          {/* روابط التصفح للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-rose-600 hover:bg-rose-50/80 transition-all"
            >
              الرئيسية واستكشاف الأعضاء
            </button>

            <button
              onClick={() => onOpenLegal("about")}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-rose-600 hover:bg-rose-50/80 transition-all"
            >
              من نحن وضوابط الزواج
            </button>

            <button
              onClick={onOpenContactUs}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-rose-600 hover:bg-rose-50/80 transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-rose-500" />
              <span>تواصل معنا</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenAdminDashboard}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>لوحة الإدارة</span>
              </button>
            )}
          </nav>

          {/* أزرار الحساب والإشعارات للشاشات الكبيرة */}
          <div className="hidden md:flex items-center gap-3">
            {firebaseUser ? (
              <>
                {/* زر الإشعارات */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2.5 rounded-xl text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-all border border-gray-200"
                  title="الإشعارات"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* زر مراسلة الإدارة */}
                <button
                  onClick={onOpenAdminChat}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all flex items-center gap-1.5"
                  title="مراسلة الإدارة"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>مراسلة الإدارة</span>
                </button>

                {/* زر حسابي / تعديل الملف الشخصي */}
                <button
                  onClick={onOpenProfileSetup}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      profile?.displayName ? profile.displayName.charAt(0) : "ع"
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-gray-800 max-w-[100px] truncate">
                      {profile?.displayName || "حسابي"}
                    </span>
                    <span className="block text-[10px] text-gray-500">
                      {profile?.profileCompleted ? "الملف مكتمل" : "استكمال الملف ⚠️"}
                    </span>
                  </div>
                </button>

                {/* زر تسجيل الخروج */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-200"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            )}
          </div>

          {/* زر القائمة للهاتف */}
          <div className="flex md:hidden items-center gap-2">
            {firebaseUser && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-gray-700 border border-gray-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الهاتف المحمول */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-5 space-y-3 shadow-lg">
          {firebaseUser ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center font-bold text-rose-800">
                  {profile?.displayName?.charAt(0) || "ع"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{profile?.displayName}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfileSetup();
                }}
                className="px-3 py-1.5 bg-white text-rose-700 rounded-lg text-xs font-bold shadow-sm"
              >
                الملف الشخصي
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول / إنشاء حساب</span>
            </button>
          )}

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-right py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              الرئيسية واستكشاف الأعضاء
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegal("about");
              }}
              className="text-right py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              من نحن وضوابط الزواج
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContactUs();
              }}
              className="text-right py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              تواصل معنا (Contact Us)
            </button>

            {firebaseUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminChat();
                }}
                className="text-right py-2 px-3 rounded-lg text-sm font-bold text-rose-700 hover:bg-rose-50"
              >
                مراسلة الإدارة 💬
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDashboard();
                }}
                className="text-right py-2 px-3 rounded-lg text-sm font-bold text-amber-700 bg-amber-50"
              >
                لوحة الإدارة ⚠️
              </button>
            )}

            {firebaseUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-right py-2 px-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
