import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { Gender, UserProfile } from '../types';
import { store } from '../services/store';

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

      // Create new user profile in store
      const newProfile = store.registerUser({
        email,
        displayName,
        gender,
        isAgeConfirmed: true,
        isTermsAccepted: true
      });

      if (onSuccess) onSuccess(newProfile, true);
      onClose();
    } else {
      // Login mode
      if (!email || !password) {
        setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
        return;
      }

      // Find existing user or create demo session
      const profiles = store.getProfiles();
      let user = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Quick demo login auto-creates if unknown email
        user = store.registerUser({
          email,
          displayName: email.split('@')[0] || 'عضو وصال',
          gender: 'male',
          isAgeConfirmed: true,
          isTermsAccepted: true
        });
      } else {
        store.setCurrentUserId(user.id);
      }

      if (onSuccess) onSuccess(user, false);
      onClose();
    }
  };

  const handleSocialLogin = (providerName: string, customEmail?: string) => {
    let emailToUse = customEmail;
    if (!emailToUse) {
      if (providerName === 'Google-Admin') {
        emailToUse = 'hanydot2@gmail.com';
      } else {
        emailToUse = `${providerName.toLowerCase()}_user_${Date.now()}@gmail.com`;
      }
    }

    const profiles = store.getProfiles();
    let user = profiles.find((p) => p.email.toLowerCase() === emailToUse!.toLowerCase());

    if (!user) {
      user = store.registerUser({
        email: emailToUse,
        displayName: emailToUse === 'hanydot2@gmail.com' ? 'إدارة منصة وصال (أحمد العتيبي)' : `مستخدم ${providerName}`,
        gender: 'male',
        isAgeConfirmed: true,
        isTermsAccepted: true
      });
      if (onSuccess) onSuccess(user, true);
    } else {
      store.setCurrentUserId(user.id);
      if (onSuccess) onSuccess(user, false);
    }
    onClose();
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
              <span>تسجيل الدخول الاجتماعي المباشر:</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Google, Facebook, Twitter</span>
            </div>

            {/* Google Admin Direct Option */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google-Admin')}
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>دخول الإدارة (hanydot2@gmail.com)</span>
              </div>
              <span className="text-[10px] bg-amber-200 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-black">
                حساب الأدمن 🛡️
              </span>
            </button>

            {/* Standard Google Sign in */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors bg-white dark:bg-slate-800"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>متابعة باستخدام Google / Gmail</span>
            </button>

            {/* Facebook & Twitter (X) Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors bg-white dark:bg-slate-800"
              >
                <span className="text-blue-600 font-black text-sm">f</span>
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Twitter')}
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
            أو عبر البريد الإلكتروني
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
                    placeholder="مثال: أحمد، سارة، أبو محمد"
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dir-ltr text-right"
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
                className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity mt-4"
          >
            {mode === 'register' ? 'إنشاء حساب واستكمال البيانات' : 'دخول'}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          🔒 بياناتك مشفرة ولا تظهر للعامة مطلقاً.
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

        </div>
      </div>
    </div>
  );
};
