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

        // 1. إظهار الحساب والملف الشخصي فوراً (0ms delay) من الكاش أو القيم المبدئية
        const CACHE_KEY = `wisal_profile_${user.uid}`;
        let immediateProfile: UserProfile | null = null;
        try {
          const cachedStr = localStorage.getItem(CACHE_KEY);
          if (cachedStr) {
            immediateProfile = JSON.parse(cachedStr);
          }
        } catch (_) {}

        if (!immediateProfile) {
          immediateProfile = {
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
          };
        }

        setProfile(immediateProfile);
        setLoading(false);

        // 2. تحديث ومزامنة البيانات مع Firestore في الخلفية دون تعطيل الشاشة أو تأخير الدخول
        syncUserToFirestore(user)
          .then((synced) => {
            if (isMounted && synced) {
              setProfile(synced);
            }
          })
          .catch((error) => {
            console.warn("Background Firestore sync note:", error);
          });
      } else {
        setFirebaseUser(null);
        setProfile(null);
        setLoading(false);
      }
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
