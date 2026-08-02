import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config";
import { syncUserToFirestore, getProfileByUid, handleRedirectResult } from "../services";
import { UserProfile } from "../types";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = Boolean(
    firebaseUser &&
    (firebaseUser.email === "hanydot2@gmail.com" || profile?.role === "admin")
  );

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    try {
      const updated = await getProfileByUid(firebaseUser.uid);
      if (updated) {
        setProfile(updated);
      }
    } catch (_) {}
  };

  useEffect(() => {
    let isMounted = true;

    // فحص نتيجة العودة من Google Redirect في حالة الهواتف
    handleRedirectResult().catch((e) => console.warn("Redirect check:", e));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        setFirebaseUser(user);
        // سباق أمان لمدة ثانيتين حتى لا يتوقف التطبيق أبداً على "جاري الاتصال بنظام Firebase"
        try {
          const timeoutPromise = new Promise<UserProfile | null>((resolve) =>
            setTimeout(() => resolve(null), 2500)
          );
          const syncPromise = syncUserToFirestore(user);

          const synced = await Promise.race([syncPromise, timeoutPromise]);
          if (!isMounted) return;

          if (synced) {
            setProfile(synced);
          } else {
            // في حال تأخر الاستجابة السحابية، ننشئ ملف قراءة مؤقت ونستمر بالعمل
            setProfile({
              uid: user.uid,
              displayName: user.displayName || "عضو وصال",
              email: user.email || "",
              photoURL: user.photoURL || "",
              providerId: user.providerData[0]?.providerId || "password",
              role: user.email === "hanydot2@gmail.com" ? "admin" : "user",
              profileCompleted: false,
              accountStatus: "active",
              createdAt: new Date(),
              lastLoginAt: new Date(),
              isOnline: true
            });
            // مزامنة في الخلفية دون تعطيل واجهة المستخدم
            syncPromise.then((p) => {
              if (isMounted && p) setProfile(p);
            }).catch(() => {});
          }
        } catch (error) {
          console.error("Auth state profile sync error:", error);
          if (isMounted) {
            setProfile({
              uid: user.uid,
              displayName: user.displayName || "عضو وصال",
              email: user.email || "",
              photoURL: user.photoURL || "",
              providerId: user.providerData[0]?.providerId || "password",
              role: user.email === "hanydot2@gmail.com" ? "admin" : "user",
              profileCompleted: false,
              accountStatus: "active",
              createdAt: new Date(),
              lastLoginAt: new Date(),
              isOnline: true
            });
          }
        }
      } else {
        setFirebaseUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
