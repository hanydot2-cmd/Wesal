import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function syncUserToFirestore(user: User, providerIdName: string = 'password'): Promise<void> {
  if (!user || !user.uid) return;

  const docRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(docRef);
    const isAdmin = user.email === 'hanydot2@gmail.com';

    if (snap.exists()) {
      // Update lastLoginAt without modifying uid, role, or accountStatus
      const existingData = snap.data();
      await setDoc(
        docRef,
        {
          lastLoginAt: serverTimestamp(),
          displayName: user.displayName || existingData.displayName || 'عضو جديد',
          photoURL: user.photoURL || existingData.photoURL || '',
          email: user.email || existingData.email || '',
        },
        { merge: true }
      );
    } else {
      // Create new user document in Firestore users/{uid}
      await setDoc(
        docRef,
        {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'عضو جديد',
          email: user.email || '',
          photoURL: user.photoURL || '',
          providerId: providerIdName,
          role: isAdmin ? 'admin' : 'user',
          profileCompleted: false,
          accountStatus: 'active',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    const code = error?.code || '';
    const msg = String(error?.message || error || '');
    if (code === 'unavailable' || code === 'permission-denied' || msg.includes('offline') || msg.includes('Could not reach')) {
      console.info('العمل في وضع الاتصال المحلي/غير المتصل - تم تسجيل دخول المستخدم بنجاح بدون مزامنة Firestore السحابية');
      return;
    }
    console.error('Error syncing user to Firestore wesal-app-dbfcc:', error);
  }
}

export function getArabicAuthErrorMessage(error: any, provider?: string): string {
  const code = error?.code || '';
  const msg = error?.message || String(error || '');

  if (code === 'auth/operation-not-allowed' || msg.toLowerCase().includes('not enabled')) {
    const provName = provider || 'Google';
    return `تنبيه: تسجيل الدخول بواسطة (${provName}) غير مفعّل في لوحة تحكم Firebase Console. لتفعيله: اذهب إلى Authentication > Sign-in method > اختر ${provName} وفعّل الخيار (Enable) واختَر البريد الإلكتروني للدعم (Support email).`;
  }

  if (
    code === 'auth/popup-blocked' ||
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/operation-not-supported-in-this-environment' ||
    code === 'auth/internal-error' ||
    msg.includes('INTERNAL ASSERTION FAILED') ||
    msg.includes('Pending promise was never set') ||
    msg.toLowerCase().includes('popup')
  ) {
    return 'تنبيه: لا يمكن لنوافذ تسجيل الدخول (مثل Google Popup) العمل داخل نافذة المعاينة المضمنة (iframe) في AI Studio بسبب قيود المتصفحات الأمنية على النوافذ المنبثقة وملفات تعريف الارتباط. لحل ذلك: اضغط على زر «🚀 فتح التطبيق في تبويب جديد (New Tab)» بالأسفل، أو استخدم أزرار «⚡ دخول فوري للتجربة» للدخول مباشرة.';
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح';
    case 'auth/user-not-found':
      return 'المستخدم غير موجود في النظام';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة';
    case 'auth/invalid-credential':
      return 'بيانات الاعتماد غير صحيحة أو تم تغييرها';
    case 'auth/email-already-in-use':
      return 'البريد الإلكتروني مسجل بالفعل بحساب آخر';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً';
    case 'auth/too-many-requests':
      return 'تم حظر المحاولات مؤقتاً بسبب كثرة الطلبات';
    case 'auth/network-request-failed':
      return 'فشل الاتصال بالشبكة، يرجى التحقق من الإنترنت';
    case 'auth/account-exists-with-different-credential':
      return 'يوجد حساب مسجل بنفس البريد الإلكتروني باستخدام طريقة دخول أخرى';
    case 'auth/unauthorized-domain':
      return 'تنبيه: نطاق الموقع الحالي غير مضاف في قائمة النطاقات المسموحة (Authorized Domains) في Firebase. يرجى إضافته من لوحة تحكم Firebase > Authentication > Settings > Authorized domains، أو استخدام البريد الإلكتروني وكلمة المرور.';
    default:
      return 'حدث خطأ أثناء تسجيل الدخول: ' + (error?.message || 'خطأ غير معروف');
  }
}
