import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { UserProfile } from "../types";

// إنشاء مزود Google مرة واحدة فقط
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

/**
 * معالجة رسائل الخطأ العربية المطلوبة من Firebase Authentication
 */
export function getArabicAuthError(error: any): string {
  const code = error?.code || "";
  const msg = error?.message || String(error || "");

  switch (code) {
    case "auth/popup-closed-by-user":
      return "تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.";
    case "auth/popup-blocked":
      return "تم حظر نافذة تسجيل الدخول. سيتم استخدام طريقة تسجيل الدخول المناسبة أو يرجى السماح بالنوافذ المنبثقة.";
    case "auth/cancelled-popup-request":
      return "تم إلغاء طلب تسجيل الدخول السابق. يرجى المحاولة مرة أخرى.";
    case "auth/unauthorized-domain":
      return "دومين الموقع غير مضاف إلى Authorized Domains في Firebase Authentication. أضف دومين الموقع داخل إعدادات Firebase ثم أعد المحاولة.";
    case "auth/operation-not-allowed":
      return "تسجيل الدخول بواسطة Google غير مفعّل داخل Firebase Authentication.";
    case "auth/network-request-failed":
      return "تعذر الاتصال بالإنترنت. تحقق من الاتصال ثم أعد المحاولة.";
    case "auth/too-many-requests":
      return "تم تنفيذ محاولات كثيرة. يرجى الانتظار ثم إعادة المحاولة.";
    case "auth/account-exists-with-different-credential":
      return "يوجد حساب بنفس البريد الإلكتروني باستخدام طريقة تسجيل دخول مختلفة.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "تعذر التحقق من بيانات تسجيل الدخول. يرجى المحاولة مرة أخرى.";
    case "auth/internal-error":
      return "حدث خطأ داخلي أثناء تسجيل الدخول. يرجى المحاولة لاحقًا.";
    case "auth/email-already-in-use":
      return "البريد الإلكتروني مسجل بالفعل بحساب سابق.";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة جداً. يرجى استخدام 6 أحرف على الأقل.";
    default:
      if (msg.toLowerCase().includes("unauthorized domain")) {
        return "دومين الموقع غير مضاف إلى Authorized Domains في Firebase Authentication. أضف دومين الموقع داخل إعدادات Firebase ثم أعد المحاولة.";
      }
      return "حدث خطأ أثناء تسجيل الدخول: " + (error?.message || "خطأ غير معروف");
  }
}

/**
 * مزامنة بيانات حساب المستخدم الحقيقي في Firestore بشكل فوري دون تأخير (Non-Blocking Sync)
 */
export async function syncUserToFirestore(firebaseUser: User): Promise<UserProfile> {
  const docRef = doc(db, "users", firebaseUser.uid);
  const isAdminEmail = firebaseUser.email === "hanydot2@gmail.com";
  const CACHE_KEY = `wisal_profile_${firebaseUser.uid}`;

  // 1. محاولة جلب الملف المخزن محلياً كنسخة احتياطية سريعة
  let cachedProfile: UserProfile | null = null;
  try {
    const cachedStr = localStorage.getItem(CACHE_KEY);
    if (cachedStr) {
      cachedProfile = JSON.parse(cachedStr);
    }
  } catch (_) {}

  // 2. سباق سريع جداً (1500 ملي ثانية) لجلب مستند Firestore دون أي تأخير لعملية الدخول
  try {
    const getDocPromise = getDoc(docRef);
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    const snap = await Promise.race([getDocPromise, timeoutPromise]);

    if (snap && snap.exists()) {
      const existingData = snap.data() as UserProfile;
      const updatedProfile: UserProfile = {
        ...existingData,
        email: firebaseUser.email || existingData.email,
        displayName: firebaseUser.displayName || existingData.displayName || "عضو وصال",
        photoURL: firebaseUser.photoURL || existingData.photoURL || "",
        role: isAdminEmail ? "admin" : existingData.role || "user",
        lastLoginAt: new Date(),
        isOnline: true
      };

      // تحديث البيانات في الخلفية دون انتظار أو تعطيل للمستخدم
      setDoc(
        docRef,
        {
          email: updatedProfile.email,
          displayName: updatedProfile.displayName,
          photoURL: updatedProfile.photoURL,
          role: updatedProfile.role,
          lastLoginAt: serverTimestamp(),
          isOnline: true
        },
        { merge: true }
      ).catch(() => {});

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProfile));
      } catch (_) {}

      return updatedProfile;
    } else if (snap && !snap.exists()) {
      // إنشاء ملف مستخدم جديد
      const newProfile: Partial<UserProfile> = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "عضو وصال",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
        providerId: firebaseUser.providerData[0]?.providerId || "password",
        role: isAdminEmail ? "admin" : "user",
        profileCompleted: false,
        accountStatus: "active",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isOnline: true
      };

      // حفظ في الخلفية فوراً دون تعطيل
      setDoc(docRef, newProfile).catch(() => {});

      const resultProfile = {
        ...newProfile,
        createdAt: new Date(),
        lastLoginAt: new Date()
      } as UserProfile;

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(resultProfile));
      } catch (_) {}

      return resultProfile;
    }
  } catch (error) {
    console.warn("تنبيه: تأخر أو تعذر الاتصال بـ Firestore لحفظ الحساب:", error);
  }

  // في حال تأخر الشبكة (> 1500ms) وكان لدينا ملف في الكاش، نرجعه فوراً
  if (cachedProfile) {
    getDoc(docRef).then((s) => {
      if (s.exists()) {
        const d = s.data() as UserProfile;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (_) {}
      }
    }).catch(() => {});
    return cachedProfile;
  }

  // إرجاع ملف افتراضي مؤقت فوراً حتى لا يتوقف أو يتأخر تسجيل الدخول أبداً
  const defaultProfile: UserProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || "عضو وصال",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    providerId: firebaseUser.providerData[0]?.providerId || "password",
    role: isAdminEmail ? "admin" : "user",
    profileCompleted: false,
    accountStatus: "active",
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isOnline: true
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(defaultProfile));
  } catch (_) {}

  return defaultProfile;
}

/**
 * تسجيل الدخول الحقيقي بواسطة Google
 * مع إجبار Google دائماً على إظهار شاشة اختيار الحساب (prompt: select_account) لتسهيل تبديل الحسابات
 */
export async function loginWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  try {
    // نحاول أولاً باستخدام Popup على جميع الأجهزة (حتى الهواتف) لضمان ظهور نافذة اختيار الحساب
    const result = await signInWithPopup(auth, provider);
    if (result && result.user) {
      // نبدأ المزامنة في الخلفية فوراً دون تأخير استجابة تسجيل الدخول
      syncUserToFirestore(result.user).catch(() => {});
      return result.user;
    }
    return null;
  } catch (error: any) {
    const code = error?.code || "";
    // إذا كان البوب أب محظوراً أو أُغلق بسبب بيئة iframe، نحول إلى Redirect
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

/**
 * فحص نتيجة العودة من Google Redirect إن وجدت
 */
export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      syncUserToFirestore(result.user).catch(() => {});
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Redirect Auth Error:", error);
    throw error;
  }
}

/**
 * تسجيل حساب جديد بالبريد الإلكتروني وكلمة المرور
 */
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await sendEmailVerification(cred.user);
  syncUserToFirestore(cred.user).catch(() => {});
  return cred.user;
}

/**
 * تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  syncUserToFirestore(cred.user).catch(() => {});
  return cred.user;
}

/**
 * إرسال رابط إعادة تعيين كلمة المرور
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * تسجيل الخروج
 */
export async function logoutUser(): Promise<void> {
  if (auth.currentUser) {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      // تنفيذ التحديث في الخلفية دون انتظار (حتى لا يتعطل أو يتأخر تسجيل الخروج أبدًا)
      setDoc(docRef, { isOnline: false, lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
    } catch (_) {}
  }
  await signOut(auth);
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (_) {}
}
