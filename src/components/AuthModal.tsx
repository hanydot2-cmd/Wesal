import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle2, ShieldCheck, Heart, LogIn, ArrowRight, Loader2 } from 'lucide-react';
import { Gender, UserProfile } from '../types';
import { store } from '../services/store';
import { ADMIN_USER } from '../services/mockData';
import { getSocialDefaultPhoto, isSocialDefaultPhoto } from '../services/socialAvatars';

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
  onOpenTerms
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode || propMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Interactive Google Sign-In Prompt State
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const [showFacebookSelector, setShowFacebookSelector] = useState(false);
  const [showTwitterSelector, setShowTwitterSelector] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customGooglePhotoUrl, setCustomGooglePhotoUrl] = useState('');
  const [customFbEmail, setCustomFbEmail] = useState('');
  const [customFbName, setCustomFbName] = useState('');
  const [customFbPhotoUrl, setCustomFbPhotoUrl] = useState('');
  const [customTwitterHandle, setCustomTwitterHandle] = useState('');
  const [customTwitterName, setCustomTwitterName] = useState('');
  const [customTwitterPhotoUrl, setCustomTwitterPhotoUrl] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Email Verification Step State for Username/Password Login & Register
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [resendNotification, setResendNotification] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'register') {
      if (!email || !password || !displayName) {
        setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة.');
        return;
      }
      if (!isAgeConfirmed) {
        setErrorMessage('يجب تأكيد أن عمرك 18 عامًا أو أكثر للتسجيل.');
        return;
      }
      if (!isTermsAccepted) {
        setErrorMessage('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية.');
        return;
      }
    } else {
      // Login mode validation
      if (!email || !password) {
        setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
        return;
      }

      // Sample catalog profiles are for browsing only; prevent logging in as them
      if (store.isSampleCatalogProfile(email)) {
        setErrorMessage('عفواً، ملفات دليل الأعضاء المتاحة مخصصة للاطلاع والتعرف فقط ولا يمكن تسجيل الدخول بها. يمكنك تسجيل الدخول بحسابك المسجل أو عبر Google.');
        return;
      }
    }

    // Trigger Email Verification Step before final login/register
    setShowEmailVerification(true);
    setOtpCode('');
    setVerificationError('');
    setResendNotification('');
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerificationError('');

    const cleanCode = otpCode.trim();
    if (!cleanCode) {
      setVerificationError('يرجى إدخال رمز التأكيد.');
      return;
    }

    if (cleanCode !== '123456' && cleanCode.length !== 6) {
      setVerificationError('رمز التأكيد غير صحيح. الرمز التجريبي المرسل إلى بريدك هو: 123456');
      return;
    }

    if (mode === 'register') {
      const newProfile = store.registerUser({
        email,
        displayName,
        gender,
        isAgeConfirmed: true,
        isTermsAccepted: true
      });

      if (onSuccess) onSuccess(newProfile, true);
    } else {
      const profiles = store.getProfiles();
      let user = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      const isNew = !user;

      if (!user) {
        user = store.registerUser({
          email,
          displayName: displayName || email.split('@')[0] || 'عضو وصال',
          gender: 'male',
          isAgeConfirmed: true,
          isTermsAccepted: true
        });
      } else {
        store.setCurrentUserId(user.id);
      }

      if (onSuccess) onSuccess(user, isNew);
    }

    setShowEmailVerification(false);
    onClose();
  };

  const handleResendCode = () => {
    setResendNotification('تم إعادة إرسال رمز التأكيد إلى بريدك الإلكتروني بنجاح (الرمز: 123456)');
    setTimeout(() => {
      setResendNotification('');
    }, 4000);
  };

  const handleSocialPhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLogin = (
    providerName: string,
    targetEmail?: string,
    targetName?: string,
    targetPhoto?: string
  ) => {
    setIsAuthenticating(true);

    setTimeout(() => {
      let emailToUse = targetEmail;
      if (!emailToUse) {
        if (providerName === 'Google-Admin') {
          emailToUse = 'hanydot2@gmail.com';
        } else {
          emailToUse = `${providerName.toLowerCase()}_user_${Date.now()}@gmail.com`;
        }
      }

      const profiles = store.getProfiles();
      let user = profiles.find((p) => p.email.toLowerCase() === emailToUse!.toLowerCase());

      const isNew = !user;

      if (!user) {
        const defaultPhoto = emailToUse === 'hanydot2@gmail.com'
          ? ADMIN_USER.photoUrl
          : providerName === 'Facebook'
            ? getSocialDefaultPhoto('Facebook')
            : providerName === 'Twitter'
              ? getSocialDefaultPhoto('Twitter')
              : getSocialDefaultPhoto('Google');

        user = store.registerUser({
          email: emailToUse,
          displayName: targetName || (emailToUse === 'hanydot2@gmail.com' ? 'إدارة منصة وصال' : `مستخدم ${providerName}`),
          photoUrl: targetPhoto || defaultPhoto,
          gender: 'male',
          isAgeConfirmed: true,
          isTermsAccepted: true
        });
      } else {
        if (targetPhoto) {
          user.photoUrl = targetPhoto;
        } else if (!user.photoUrl || isSocialDefaultPhoto(user.photoUrl)) {
          user.photoUrl = providerName === 'Facebook'
            ? getSocialDefaultPhoto('Facebook')
            : providerName === 'Twitter'
              ? getSocialDefaultPhoto('Twitter')
              : (emailToUse === 'hanydot2@gmail.com' ? ADMIN_USER.photoUrl : getSocialDefaultPhoto('Google'));
        }
        store.setCurrentUserId(user.id);
      }

      setIsAuthenticating(false);
      setShowGoogleSelector(false);
      setShowFacebookSelector(false);
      setShowTwitterSelector(false);
      if (onSuccess) onSuccess(user, isNew);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 dark:border-slate-800 relative flex flex-col max-h-[90vh] my-auto overflow-hidden">
        
        {/* Sticky Header with Close Button and Mobile Drag Handle */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-serif">
              {mode === 'register' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700"
            title="إغلاق النافذة"
          >
            <span>إغلاق</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1 touch-pan-y">
          
          {/* Mobile Visual Drag Bar Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2 sm:hidden shrink-0" />

          {showEmailVerification ? (
            <div className="space-y-5 animate-fadeIn py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800 shadow-xs">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  تأكيد بريدك الإلكتروني 📧
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  تم إرسال رمز التأكيد المكون من 6 أرقام إلى بريدك الإلكتروني:
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold dir-ltr">
                  {email}
                </div>
              </div>

              {/* Email notification simulation banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>تم إرسال كود التحقق بنجاح</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  تفقد صندوق الرسائل في بريدك الإلكتروني. الرمز التجريبي المرسل للتأكيد المباشر: <strong className="font-mono text-sm underline tracking-wider bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300">123456</strong>
                </p>
              </div>

              {resendNotification && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-xs font-bold text-emerald-700 dark:text-emerald-300 text-center animate-fadeIn">
                  {resendNotification}
                </div>
              )}

              {verificationError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
                  {verificationError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2 text-center">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    أدخل رمز التأكيد المكون من 6 أرقام:
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      className="w-48 text-center text-xl font-mono tracking-widest py-2.5 rounded-xl border-2 border-rose-400 dark:border-rose-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-black shadow-inner"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  تعبئة الرمز التجريبي (123456) ⚡
                </button>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد واستمرار الدخول</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
                >
                  إعادة إرسال الرمز 🔄
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailVerification(false)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  تعديل البريد / إلغاء
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Modal Header Title */}
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
                  {mode === 'register' ? 'مرحباً بك في وصال' : 'مرحباً بعودتك'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  منصة التعارف والزواج الجاد الأكثر أماناً وخصوصية
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  إنشاء حساب جديد
                </button>
              </div>

              {/* Social Logins */}
              <div className="space-y-2 mb-6">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>تسجيل الدخول السريع:</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Google, Facebook, Twitter</span>
                  </div>

                  {/* Standard Google Sign in */}
                  <button
                    type="button"
                    onClick={() => setShowGoogleSelector(true)}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors bg-white dark:bg-slate-800 shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>تسجيل الدخول بواسطة Google</span>
                  </button>

                  {/* Facebook & Twitter (X) Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFacebookSelector(true)}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors bg-white dark:bg-slate-800"
                    >
                      <span className="text-blue-600 font-black text-sm">f</span>
                      <span>Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTwitterSelector(true)}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors bg-white dark:bg-slate-800"
                    >
                      <span className="text-sky-500 font-black text-sm">𝕏</span>
                      <span>Twitter / X</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 absolute">
                  أو عبر البريد الإلكتروني وكلمة المرور
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الاسم الأول أو الاسم المستعار الآمن *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="مثال: عبد الله، سارة، أبو محمد"
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    {/* Account Type Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        اختيار نوع الحساب *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setGender('male')}
                          className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            gender === 'male'
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span>👨</span> رجل
                        </button>

                        <button
                          type="button"
                          onClick={() => setGender('female')}
                          className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                            gender === 'female'
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span>👩</span> سيدة
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Mandatory Checkboxes for Registration */}
                {mode === 'register' && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAgeConfirmed}
                        onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        ☑ أؤكد أن عمري 18 عامًا أو أكثر.
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        ☑ أوافق على{' '}
                        <button
                          type="button"
                          onClick={onOpenTerms}
                          className="text-rose-600 dark:text-rose-400 underline"
                        >
                          شروط الاستخدام وسياسة الخصوصية
                        </button>
                        .
                      </span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity mt-4 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{mode === 'register' ? 'إرسال رمز التفعيل للبريد والتسجيل' : 'إرسال رمز التفعيل والدخول'}</span>
                </button>
              </form>

              <p className="text-[11px] text-slate-400 text-center mt-4">
                🔒 يتم إرسال رمز تأكيد لبريدك الإلكتروني لضمان الحماية والأمان.
              </p>

              {/* Bottom Explicit Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <X className="w-4 h-4" />
                <span>إغلاق النافذة</span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* Interactive Google Account Selector Dialog Overlay */}
      {showGoogleSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 relative">
            {/* Header with Google icon */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  تسجيل الدخول بواسطة Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleSelector(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-right space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                اختر حساب Google للمتابعة إلى تطبيق وصال
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سيتم استخدام الاسم والصورة المسجلين في حساب Google الخاص بك للمتابعة.
              </p>
            </div>

            {isAuthenticating ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  جاري الاتصال وسحب الصورة الشخصية من Google...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active Detected Google Account (hanydot2@gmail.com) */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google', 'hanydot2@gmail.com', 'إدارة منصة وصال', ADMIN_USER.photoUrl)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition-all text-right group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ADMIN_USER.photoUrl}
                      alt="إدارة منصة وصال"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          إدارة منصة وصال
                        </span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md">
                          أدمن 🛡️
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                        hanydot2@gmail.com
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 rotate-180 transition-transform group-hover:-translate-x-1" />
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 absolute">
                    أو ادخل أي بريد Google / Gmail آخر
                  </span>
                </div>

                {/* Custom Gmail entry */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <img
                      src={customGooglePhotoUrl || getSocialDefaultPhoto('Google')}
                      alt="Google Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-blue-500/30 shrink-0"
                    />
                    <div className="flex-1 text-right">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">صورة حساب Google</p>
                      <label className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold inline-block mt-0.5">
                        تغيير أو رفع صورة حسابك الآن
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSocialPhotoUpload(e, setCustomGooglePhotoUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      اسم الحساب الشخصي:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: عبد العزيز الشمري"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      عنوان Gmail الخاص بك:
                    </label>
                    <input
                      type="email"
                      placeholder="username@gmail.com"
                      value={customGmail}
                      onChange={(e) => setCustomGmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!customGmail || !customGmail.includes('@')) {
                        alert('يرجى إدخال بريد Gmail صحيح');
                        return;
                      }
                      handleSocialLogin(
                        'Google',
                        customGmail,
                        customName || customGmail.split('@')[0],
                        customGooglePhotoUrl || getSocialDefaultPhoto('Google')
                      );
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                    </svg>
                    <span>المتابعة باستخدام Google</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Interactive Facebook Login Dialog Overlay */}
      {showFacebookSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-blue-200 dark:border-blue-900 p-6 space-y-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                  f
                </div>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  تسجيل الدخول بواسطة Facebook
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFacebookSelector(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-right space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ربط حساب فيسبوك بالتطبيق
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل بيانات حسابك في فيسبوك لإتمام الربط وتسجيل الدخول المباشر.
              </p>
            </div>

            {isAuthenticating ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  جاري التحقق والمزامنة مع Facebook...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-800">
                    <img
                      src={customFbPhotoUrl || getSocialDefaultPhoto('Facebook')}
                      alt="Facebook Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-blue-500/30 shrink-0"
                    />
                    <div className="flex-1 text-right">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">صورة حساب فيسبوك</p>
                      <label className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold inline-block mt-0.5">
                        تغيير أو رفع صورة حسابك الآن
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSocialPhotoUpload(e, setCustomFbPhotoUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      الاسم المعروض على فيسبوك:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: عبد العزيز العتيبي"
                      value={customFbName}
                      onChange={(e) => setCustomFbName(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      البريد الإلكتروني أو رقم الهاتف المسجل بفيسبوك:
                    </label>
                    <input
                      type="text"
                      placeholder="user@facebook.com أو 05xxxxxxxx"
                      value={customFbEmail}
                      onChange={(e) => setCustomFbEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 dir-ltr text-right"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const fbEmail = customFbEmail || `facebook_user_${Date.now()}@facebook.com`;
                    const fbName = customFbName || 'مستخدم فيسبوك';
                    handleSocialLogin(
                      'Facebook',
                      fbEmail,
                      fbName,
                      customFbPhotoUrl || getSocialDefaultPhoto('Facebook')
                    );
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <span className="font-black text-sm">f</span>
                  <span>المتابعة والمزامنة بحساب Facebook</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Twitter / X Login Dialog Overlay */}
      {showTwitterSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-300 dark:border-slate-800 p-6 space-y-5 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm flex items-center justify-center shadow-xs">
                  𝕏
                </div>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  تسجيل الدخول بواسطة Twitter / X
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTwitterSelector(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-right space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ربط حساب منصة 𝕏 (Twitter)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل اسم المستخدم المعرف الخاص بك على منصة X للمتابعة بنجاح.
              </p>
            </div>

            {isAuthenticating ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-slate-900 dark:text-white animate-spin" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  جاري التفويض والاتصال مع منصة 𝕏...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <img
                      src={customTwitterPhotoUrl || getSocialDefaultPhoto('Twitter')}
                      alt="Twitter Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-slate-400 shrink-0"
                    />
                    <div className="flex-1 text-right">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">صورة حساب 𝕏 (Twitter)</p>
                      <label className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold inline-block mt-0.5">
                        تغيير أو رفع صورة حسابك الآن
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSocialPhotoUpload(e, setCustomTwitterPhotoUrl)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      الاسم الشخصي المعروض:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: سلمان القحطاني"
                      value={customTwitterName}
                      onChange={(e) => setCustomTwitterName(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-slate-900"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      اسم المستخدم المعرف على X (@handle أو البريد):
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={customTwitterHandle}
                      onChange={(e) => setCustomTwitterHandle(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-slate-900 dir-ltr text-right"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const cleanHandle = customTwitterHandle.replace('@', '') || `x_user_${Date.now()}`;
                    const xEmail = `${cleanHandle}@x.com`;
                    const xName = customTwitterName || `@${cleanHandle}`;
                    handleSocialLogin(
                      'Twitter',
                      xEmail,
                      xName,
                      customTwitterPhotoUrl || getSocialDefaultPhoto('Twitter')
                    );
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="font-black text-sm">𝕏</span>
                  <span>المتابعة والتفويض بحساب 𝕏 (Twitter)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
