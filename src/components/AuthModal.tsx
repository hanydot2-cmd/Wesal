import React, { useState } from "react";
import { X, LogIn, Mail, Lock, CheckSquare, AlertCircle, RefreshCw } from "lucide-react";
import { loginWithGoogle, registerWithEmail, loginWithEmail, resetPassword, getArabicAuthError } from "../services/authService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: (tab: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenLegal }) => {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleGoogleLogin = async () => {
    resetForm();
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      // إذا تم تسجيل الدخول بنجاح عبر Popup (user موجود)، نغلق النافذة
      // إذا تم التحويل لـ Redirect، الصفحة ستحمل مجدداً
      if (user) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(getArabicAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    if (mode === "reset") {
      if (!email) {
        setErrorMsg("يرجى إدخال البريد الإلكتروني لإعادة تعيين كلمة المرور.");
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccessMsg("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.");
      } catch (err: any) {
        setErrorMsg(getArabicAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "register") {
      if (!agreeTerms) {
        setErrorMsg("يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("كلمتا المرور غير متطابقتين.");
        return;
      }
      setLoading(true);
      try {
        await registerWithEmail(email, password);
        setSuccessMsg("تم إنشاء الحساب بنجاح! تم إرسال رسالة تحقق إلى بريدك الإلكتروني.");
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMsg(getArabicAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // login
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onClose();
    } catch (err: any) {
      setErrorMsg(getArabicAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
        {/* الهيدر */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-6 pb-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black">
            {mode === "login"
              ? "تسجيل الدخول في وصال"
              : mode === "register"
              ? "إنشاء حساب جديد"
              : "إعادة تعيين كلمة المرور"}
          </h2>
          <p className="text-xs text-rose-100 mt-1">«خطوتك نحو شريك حياة مناسب» – تعارف جاد بهدف الزواج</p>
        </div>

        {/* جسم النافذة */}
        <div className="p-6 -mt-4 bg-white rounded-t-3xl relative z-10 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-semibold">
              <span>✅ {successMsg}</span>
            </div>
          )}

          {/* زر تسجيل الدخول بواسطة Google */}
          {mode !== "reset" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all flex items-center justify-center gap-3 text-sm font-bold text-gray-800 shadow-sm disabled:opacity-50"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>{loading ? "جارٍ فتح تسجيل الدخول بواسطة Google..." : "المتابعة باستخدام Google"}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <span className="w-full border-t border-gray-200"></span>
                <span className="bg-white px-3 text-xs text-gray-400 font-semibold absolute">أو باستخدام البريد</span>
              </div>
            </div>
          )}

          {/* نموذج البريد وكلمة المرور */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                />
              </div>
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  />
                </div>
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 pr-10 pl-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  />
                </div>
              </div>
            )}

            {mode === "register" && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 rounded text-rose-600 focus:ring-rose-500 border-gray-300"
                />
                <label htmlFor="agreeTerms" className="text-xs text-gray-600 leading-relaxed">
                  أقر بأنني أستخدم منصة وصال بغرض <strong className="text-rose-700">الزواج الشرعي الجاد فقط</strong>، وأوافق على{" "}
                  <button
                    type="button"
                    onClick={() => onOpenLegal("terms")}
                    className="text-rose-600 underline font-bold"
                  >
                    شروط الاستخدام
                  </button>{" "}
                  و{" "}
                  <button
                    type="button"
                    onClick={() => onOpenLegal("privacy")}
                    className="text-rose-600 underline font-bold"
                  >
                    سياسة الخصوصية
                  </button>
                  .
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>
                {mode === "login"
                  ? "تسجيل الدخول"
                  : mode === "register"
                  ? "إنشاء حساب جديد"
                  : "إرسال رابط إعادة التعيين"}
              </span>
            </button>
          </form>

          {/* روابط التبديل بين الأوضاع */}
          <div className="pt-2 text-center space-y-2 border-t border-gray-100">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    resetForm();
                  }}
                  className="block w-full text-xs text-rose-600 hover:underline font-bold"
                >
                  نسيت كلمة المرور؟
                </button>
                <p className="text-xs text-gray-500">
                  ليس لديك حساب بعد؟{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      resetForm();
                    }}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    إنشاء حساب جديد الآن
                  </button>
                </p>
              </>
            )}

            {mode === "register" && (
              <p className="text-xs text-gray-500">
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    resetForm();
                  }}
                  className="text-rose-600 font-bold hover:underline"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                ← العودة إلى تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
