import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  ShieldCheck,
  Heart,
  LogIn,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import { syncUserToFirestore, getArabicAuthErrorMessage } from '../services/firebaseAuthHelper';
import { store } from '../services/store';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen?: boolean;
  mode?: 'login' | 'register';
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: (user: UserProfile, isNewRegistration: boolean) => void;
  onOpenTerms?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  mode: propMode,
  initialMode,
  onSuccess,
  onOpenTerms,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode || propMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = (profileId: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    store.setCurrentUserId(profileId);
    const userProfile = store.getCurrentUser();
    if (userProfile && onSuccess) {
      onSuccess(userProfile, false);
    } else {
      onClose();
    }
  };

  const handleSocialLogin = async (providerType: 'Google' | 'Facebook' | 'Twitter') => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsAuthenticating(true);

    let provider;
    if (providerType === 'Google') {
      provider = new GoogleAuthProvider();
    } else if (providerType === 'Facebook') {
      provider = new FacebookAuthProvider();
    } else {
      provider = new TwitterAuthProvider();
    }

    try {
      const result = await signInWithPopup(auth, provider);

      if (!auth.currentUser || !auth.currentUser.uid) {
        throw new Error('لم يتم استلام بيانات مستخدم Firebase حقيقي.');
      }

      await syncUserToFirestore(auth.currentUser, providerType);
      store.setCurrentUserId(auth.currentUser.uid);

      const currentUserProfile = store.getCurrentUser();
      if (currentUserProfile && onSuccess) {
        onSuccess(currentUserProfile, false);
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error(`Firebase Auth Error (${providerType}):`, err);
      setErrorMessage(getArabicAuthErrorMessage(err, providerType));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register') {
      if (!email || !password || !confirmPassword || !displayName) {
        setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('كلمتا المرور غير متطابقتين.');
        return;
      }
      if (!isTermsAccepted) {
        setErrorMessage('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية.');
        return;
      }

      setIsAuthenticating(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        if (!auth.currentUser || !auth.currentUser.uid) {
          throw new Error('فشل التحقق من مستخدم Firebase.');
        }

        // Set initial profile name on auth user and firestore
        await syncUserToFirestore(auth.currentUser, 'password');

        try {
          await sendEmailVerification(auth.currentUser);
        } catch (verErr) {
          console.warn('Could not send verification email:', verErr);
        }

        setSuccessMessage('تم إنشاء الحساب بنجاح. تم إرسال رسالة تحقق إلى بريدك الإلكتروني.');
      } catch (err: any) {
        console.error('Firebase Register Error:', err);
        setErrorMessage(getArabicAuthErrorMessage(err, 'password'));
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      // Login mode
      if (!email || !password) {
        setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
        return;
      }

      setIsAuthenticating(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        if (!auth.currentUser || !auth.currentUser.uid) {
          throw new Error('فشل الحصول على جلسة مستخدم Firebase.');
        }

        await syncUserToFirestore(auth.currentUser, 'password');
        store.setCurrentUserId(auth.currentUser.uid);

        const currentUserProfile = store.getCurrentUser();
        if (currentUserProfile && onSuccess) {
          onSuccess(currentUserProfile, false);
        } else {
          onClose();
        }
      } catch (err: any) {
        console.error('Firebase Login Error:', err);
        setErrorMessage(getArabicAuthErrorMessage(err, 'password'));
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('يرجى إدخال بريدك الإلكتروني أولاً لإرسال رابط إعادة تعيين كلمة المرور.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setIsAuthenticating(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
    } catch (err: any) {
      setErrorMessage(getArabicAuthErrorMessage(err, 'password'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-serif font-black text-lg">
              و
            </div>
            <div>
              <h3 className="text-lg font-black font-serif">
                {mode === 'login' ? 'تسجيل الدخول إلى وصال' : 'إنشاء حساب جديد'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {mode === 'login'
                  ? 'مرحباً بك مجدداً في منصة التعارف الشرعي والزواج الجاد'
                  : 'انضم إلى مجتمع وصال للتعارف والزواج الإسلامي الجاد'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {(errorMessage.includes('Authorized Domains') || errorMessage.includes('نطاق')) && (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 truncate max-w-[200px]" dir="ltr">
                    {window.location.hostname}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.hostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'تم النسخ!' : 'نسخ النطاق'}</span>
                  </button>
                </div>
              )}
              {(errorMessage.includes('iframe') || errorMessage.includes('تبويب') || errorMessage.includes('حظر') || errorMessage.includes('نافذة') || errorMessage.includes('INTERNAL') || errorMessage.includes('Pending') || errorMessage.includes('Popup') || errorMessage.includes('Google')) && (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>🚀 فتح التطبيق في تبويب جديد (New Tab) لتسجيل الدخول بـ Google</span>
                  </button>
                  <span className="text-[11px] text-rose-600 dark:text-rose-300">
                    💡 أو يمكنك استخدام أزرار <b>«⚡ دخول فوري للتجربة»</b> بالأسفل للدخول مباشرة.
                  </span>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                موافق، إغلاق النافذة
              </button>
            </div>
          )}

          {!successMessage && (
            <>
              {/* Demo / Instant Login Section */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>⚡ دخول فوري للتجربة (بدون إعدادات Firebase):</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('user_female_1')}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-[11px] font-bold text-right flex items-center justify-between transition-all shadow-sm"
                  >
                    <span>👩 فاطمة (عضوة)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">دخول</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('user_male_1')}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-[11px] font-bold text-right flex items-center justify-between transition-all shadow-sm"
                  >
                    <span>👨 عبدالله (عضو)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">دخول</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin_1')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>👑 الدخول السريع بصلاحيات الإدارة (Admin)</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 absolute">
                  أو باستخدام حسابات التواصل (Firebase Auth)
                </span>
              </div>

              {/* Social Login Buttons (Real Firebase Auth) */}
              <div className="space-y-2.5">
                {window !== window.parent && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                    💡 <b>تنبيه هام حول نافذة المعاينة:</b> متصفحات الويب تحظر النوافذ المنبثقة لـ Google Auth داخل إطار المعاينة (iframe). لتسجيل الدخول بحساب Google دون مشاكل، اضغط على <b>"🚀 فتح التطبيق في تبويب جديد"</b> أدناه، أو استخدم <b>دخول فوري للتجربة</b> بالأعلى.
                    <button
                      type="button"
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="mt-2 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>🚀 فتح التطبيق في تبويب جديد (New Tab)</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5 shrink-0"
                  />
                  <span>المتابعة باستخدام حساب Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm"
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-white text-[#1877F2] font-black rounded-full text-sm shrink-0">
                    f
                  </span>
                  <span>المتابعة باستخدام حساب Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Twitter')}
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-sm"
                >
                  <span className="text-base font-black shrink-0">𝕏</span>
                  <span>المتابعة باستخدام حساب X (Twitter)</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 absolute">
                  أو باستخدام البريد الإلكتروني
                </span>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      الاسم المعروض *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="اكتب اسمك أو اسماً مستعاراً لائقاً"
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-rose-500/30 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-rose-500/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      كلمة المرور *
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-rose-500/30 outline-none"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-rose-500/30 outline-none"
                      />
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none pt-1">
                    <input
                      type="checkbox"
                      checked={isTermsAccepted}
                      onChange={(e) => setIsTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>
                      أوافق على{' '}
                      <button
                        type="button"
                        onClick={onOpenTerms}
                        className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                      >
                        شروط الاستخدام وسياسة الخصوصية
                      </button>{' '}
                      وأقر بأنني جاد في طلب الزواج الشرعي.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الاتصال بنظام Firebase...</span>
                    </>
                  ) : mode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول الآن</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>إنشاء الحساب الآن</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'ليس لديك حساب في وصال؟' : 'لديك حساب بالفعل؟'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                {mode === 'login' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
