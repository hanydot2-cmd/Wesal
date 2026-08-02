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
 * مزامنة بيانات حساب المستخدم الحقيقي في Firestore
 */
export async function syncUserToFirestore(firebaseUser: User): Promise<UserProfile> {
  const docRef = doc(db, "users", firebaseUser.uid);
  const isAdminEmail = firebaseUser.email === "hanydot2@gmail.com";

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const existingData = snap.data() as UserProfile;
      // تحديث وقت تسجيل الدخول وحفظ البيانات الأساسية دون المساس بالـ UID أو الدور
      await setDoc(
        docRef,
        {
          email: firebaseUser.email || existingData.email,
          displayName: firebaseUser.displayName || existingData.displayName || "عضو وصال",
          photoURL: firebaseUser.photoURL || existingData.photoURL || "",
          role: isAdminEmail ? "admin" : existingData.role || "user",
          lastLoginAt: serverTimestamp(),
          isOnline: true
        },
        { merge: true }
      );
      return { ...existingData, lastLoginAt: new Date(), isOnline: true };
    } else {
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
      await setDoc(docRef, newProfile);
      return newProfile as UserProfile;
    }
  } catch (error) {
    console.warn("تنبيه: تأخر أو تعذر الاتصال بـ Firestore لحفظ الحساب (سيعمل في وضع القراءة):", error);
    // إرجاع ملف افتراضي مؤقت حتى لا يتوقف تسجيل الدخول في حال بطء الشبكة
    return {
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
  }
}

/**
 * تسجيل الدخول الحقيقي بواسطة Google
 * على أجهزة الكمبيوتر signInWithPopup، وإذا فشل بسبب حظر أو متصفح هاتف نستخدم signInWithRedirect
 */
export async function loginWithGoogle(): Promise<User | null> {
  // فحص ما إذا كنا على هاتف أو شاشة صغيرة أو متصفح مضمن
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user) {
      await syncUserToFirestore(result.user);
      return result.user;
    }
    return null;
  } catch (error: any) {
    const code = error?.code || "";
    // إذا كان البوب أب محظوراً أو أُغلق بسبب بيئة iframe، نحول فوراً إلى Redirect
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, googleProvider);
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
      await syncUserToFirestore(result.user);
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
  await syncUserToFirestore(cred.user);
  return cred.user;
}

/**
 * تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserToFirestore(cred.user);
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
      await setDoc(docRef, { isOnline: false, lastSeen: serverTimestamp() }, { merge: true });
    } catch (_) {}
  }
  await signOut(auth);
}
