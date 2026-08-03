import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  UserProfile,
  UserInteraction,
  InteractionType,
  CommunicationRequest,
  ChatMessage,
  ReportTicket,
  ContactTicket,
  ContactRequestType,
  AdminDirectMessage,
  AppNotification
} from "../types";
import { analyzeMessagePrivacy } from "../utils/securityFilter";

// ==========================================
// 1. إدارة الملف الشخصي (User Profiles)
// ==========================================
export async function getProfileByUid(uid: string): Promise<UserProfile | null> {
  const CACHE_KEY = `wisal_profile_${uid}`;
  try {
    const getDocPromise = getDoc(doc(db, "users", uid));
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
    const snap = await Promise.race([getDocPromise, timeoutPromise]);
    if (snap && snap.exists()) {
      const data = snap.data() as UserProfile;
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
      return data;
    }
    const cachedStr = localStorage.getItem(CACHE_KEY);
    if (cachedStr) {
      return JSON.parse(cachedStr) as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("خطأ في جلب الملف الشخصي:", error);
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) return JSON.parse(cachedStr) as UserProfile;
    } catch (_) {}
    return null;
  }
}

export async function updateProfileData(uid: string, data: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, "users", uid);
  // تأكد من عدم السماح بتعديل uid أو role أو accountStatus عبر واجهة المستخدم
  const safeData = { ...data };
  delete safeData.uid;
  delete safeData.role;
  delete safeData.accountStatus;

  // 1. تحديث الكاش المحلي فوراً (0ms latency) لضمان استجابة فورية دون أي تأخير
  const CACHE_KEY = `wisal_profile_${uid}`;
  try {
    const existingStr = localStorage.getItem(CACHE_KEY);
    const existingProfile = existingStr ? JSON.parse(existingStr) : {};
    const merged = { ...existingProfile, ...safeData };
    localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
  } catch (_) {}

  // 2. إرسال التحديث إلى Firestore مع حد أقصى للانتظار 800ms (حتى لا يتأخر الحفظ أبداً ويستمر في الخلفية)
  const setDocPromise = setDoc(docRef, safeData, { merge: true });
  const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 800));
  await Promise.race([setDocPromise, timeoutPromise]);
}

export async function getAllApprovedMembers(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("accountStatus", "==", "active"),
      where("profileCompleted", "==", true),
      limit(50)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((docSnap) => docSnap.data() as UserProfile);
  } catch (error) {
    console.warn("خطأ أو تأخر في جلب الأعضاء (ربما الفهرس قيد الإنشاء):", error);
    return [];
  }
}

export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
  try {
    const snaps = await getDocs(collection(db, "users"));
    return snaps.docs.map((docSnap) => docSnap.data() as UserProfile);
  } catch (error) {
    console.error("خطأ في جلب الأعضاء للإدارة:", error);
    return [];
  }
}

// ==========================================
// 2. التفاعلات (الإعجاب، القلب، الوردة، الإعجاب المتبادل)
// ==========================================
export async function sendInteraction(
  fromUid: string,
  fromName: string,
  fromPhoto: string,
  toUid: string,
  type: InteractionType
): Promise<{ mutual: boolean; id: string }> {
  // حفظ التفاعل
  const docRef = await addDoc(collection(db, "interactions"), {
    fromUid,
    toUid,
    type,
    fromName,
    fromPhoto,
    createdAt: serverTimestamp()
  });

  // فحص هل هناك إعجاب متبادل سابق من الطرف الآخر
  const mutualQuery = query(
    collection(db, "interactions"),
    where("fromUid", "==", toUid),
    where("toUid", "==", fromUid)
  );
  const mutualSnaps = await getDocs(mutualQuery);
  const isMutual = !mutualSnaps.empty;

  // إرسال إشعار للطرف الآخر
  let typeTitle = "إعجاب جديد ❤️";
  if (type === "heart") typeTitle = "قلب جديد 💖";
  if (type === "rose") typeTitle = "باقة ورد 🌹";

  await createNotification({
    userId: toUid,
    title: isMutual ? "إعجاب متبادل! ❤️❤️" : typeTitle,
    message: isMutual
      ? `لقد تم الإعجاب المتبادل بينك وبين ${fromName}. يمكنكما الآن طلب بدء التواصل.`
      : `أرسل لك/لكِ ${fromName} ${typeTitle}`,
    type: isMutual ? "mutual" : type,
    read: false
  });

  if (isMutual) {
    await createNotification({
      userId: fromUid,
      title: "إعجاب متبادل! ❤️❤️",
      message: `لقد تم الإعجاب المتبادل بينك وبين الطرف الآخر. يمكنك الآن طلب بدء التواصل.`,
      type: "mutual",
      read: false
    });
  }

  return { mutual: isMutual, id: docRef.id };
}

export async function getUserInteractions(uid: string): Promise<{
  likedByMe: UserInteraction[];
  likedMe: UserInteraction[];
  mutualUids: string[];
}> {
  try {
    const q1 = query(collection(db, "interactions"), where("fromUid", "==", uid));
    const snaps1 = await getDocs(q1);
    const likedByMe = snaps1.docs.map((d) => ({ id: d.id, ...d.data() }) as UserInteraction);

    const q2 = query(collection(db, "interactions"), where("toUid", "==", uid));
    const snaps2 = await getDocs(q2);
    const likedMe = snaps2.docs.map((d) => ({ id: d.id, ...d.data() }) as UserInteraction);

    const myToUids = new Set(likedByMe.map((x) => x.toUid));
    const mutualUids = likedMe.map((x) => x.fromUid).filter((id) => myToUids.has(id));

    return { likedByMe, likedMe, mutualUids };
  } catch (error) {
    console.warn("خطأ في جلب التفاعلات:", error);
    return { likedByMe: [], likedMe: [], mutualUids: [] };
  }
}

// ==========================================
// 3. طلبات بدء التواصل (Communication Requests)
// ==========================================
export async function sendCommunicationRequest(
  fromUid: string,
  fromName: string,
  fromPhoto: string,
  toUid: string,
  toName: string,
  toPhoto: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "communication_requests"), {
    fromUid,
    toUid,
    fromName,
    toName,
    fromPhoto: fromPhoto || "",
    toPhoto: toPhoto || "",
    status: "pending",
    createdAt: serverTimestamp()
  });

  // إشعار للإدارة بمراجعة الطلب
  await createNotification({
    userId: "admin",
    title: "طلب تواصل جديد للمراجعة",
    message: `طلب بدء تواصل جديد بين ${fromName} و ${toName}`,
    type: "request",
    read: false
  });

  // إشعار للطرفين
  await createNotification({
    userId: fromUid,
    title: "تم إرسال طلب التواصل",
    message: `تم إرسال طلب التواصل مع ${toName} إلى إدارة وصال للمراجعة والموافقة.`,
    type: "request",
    read: false
  });

  return docRef.id;
}

export async function getCommunicationRequestsForAdmin(): Promise<CommunicationRequest[]> {
  try {
    const q = query(collection(db, "communication_requests"), orderBy("createdAt", "desc"));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunicationRequest);
  } catch (error) {
    console.warn("خطأ في جلب طلبات التواصل للإدارة:", error);
    return [];
  }
}

export async function approveCommunicationRequest(reqId: string, req: CommunicationRequest): Promise<void> {
  await updateDoc(doc(db, "communication_requests", reqId), {
    status: "approved",
    approvedAt: serverTimestamp()
  });

  await createNotification({
    userId: req.fromUid,
    title: "موافقة الإدارة على التواصل 🎉",
    message: `وافت الإدارة على طلب بدء التواصل مع ${req.toName}. يمكنكما الآن المراسلة الآمنة.`,
    type: "approved",
    read: false
  });

  await createNotification({
    userId: req.toUid,
    title: "موافقة الإدارة على التواصل 🎉",
    message: `وافت الإدارة على طلب بدء التواصل مع ${req.fromName}. يمكنكما الآن المراسلة الآمنة.`,
    type: "approved",
    read: false
  });
}

export async function rejectCommunicationRequest(reqId: string, req: CommunicationRequest): Promise<void> {
  await updateDoc(doc(db, "communication_requests", reqId), {
    status: "rejected"
  });

  await createNotification({
    userId: req.fromUid,
    title: "اعتذار من الإدارة",
    message: `نعتذر، لم تتم الموافقة على طلب التواصل مع ${req.toName} وفق ضوابط المنصة.`,
    type: "rejected",
    read: false
  });
}

// ==========================================
// 4. المراسلة الآمنة وحماية الخصوصية
// ==========================================
export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  rawText: string
): Promise<{ success: boolean; error?: string }> {
  // فحص النص أمنياً لمنع تسريب الأرقام والعناوين والروابط
  const check = analyzeMessagePrivacy(rawText);
  if (check.blocked) {
    // تسجيل محاولة المخالفة في لوحة الإدارة
    await addDoc(collection(db, "violations"), {
      senderId,
      receiverId,
      text: rawText,
      reason: check.reason || "محاولة إرسال بيانات اتصال",
      createdAt: serverTimestamp()
    });

    return { success: false, error: check.reason };
  }

  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    receiverId,
    text: rawText,
    createdAt: serverTimestamp(),
    read: false
  });

  await createNotification({
    userId: receiverId,
    title: "رسالة جديدة 💬",
    message: "لديك رسالة جديدة في محادثتك الآمنة.",
    type: "message",
    read: false
  });

  return { success: true };
}

export function subscribeToMessages(conversationId: string, callback: (msgs: ChatMessage[]) => void) {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snaps) => {
    const messages = snaps.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage);
    callback(messages);
  });
}

// ==========================================
// 5. الإبلاغ والحظر (Report & Block)
// ==========================================
export async function sendReportTicket(report: Omit<ReportTicket, "id" | "createdAt" | "status">): Promise<void> {
  await addDoc(collection(db, "reports"), {
    ...report,
    createdAt: serverTimestamp(),
    status: "new"
  });
}

export async function blockMember(reporterId: string, blockedId: string): Promise<void> {
  const userRef = doc(db, "users", reporterId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const current = snap.data().blockedUsers || [];
    if (!current.includes(blockedId)) {
      await updateDoc(userRef, {
        blockedUsers: [...current, blockedId]
      });
    }
  }
}

// ==========================================
// 6. تواصل معنا (Contact Us)
// ==========================================
export async function sendContactTicket(
  name: string,
  email: string,
  subject: string,
  requestType: ContactRequestType,
  message: string
): Promise<void> {
  await addDoc(collection(db, "contact_tickets"), {
    name,
    email,
    subject,
    requestType,
    message,
    status: "جديدة",
    createdAt: serverTimestamp()
  });
}

export async function getAllContactTicketsForAdmin(): Promise<ContactTicket[]> {
  try {
    const snaps = await getDocs(collection(db, "contact_tickets"));
    return snaps.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactTicket);
  } catch (error) {
    console.error("خطأ في جلب تذاكر الدعم:", error);
    return [];
  }
}

export async function replyToContactTicket(ticketId: string, replyText: string): Promise<void> {
  await updateDoc(doc(db, "contact_tickets", ticketId), {
    status: "تم الرد",
    replyText,
    repliedAt: serverTimestamp()
  });
}

// ==========================================
// 7. مراسلة الإدارة (Admin Messaging)
// ==========================================
export async function sendAdminDirectMessage(
  userId: string,
  senderRole: "user" | "admin",
  text: string,
  photoURL?: string
): Promise<void> {
  await addDoc(collection(db, "admin_messages"), {
    userId,
    senderRole,
    text,
    createdAt: serverTimestamp(),
    photoURL: photoURL || "",
    read: false
  });
}

export function subscribeToAdminMessages(userId: string, callback: (msgs: AdminDirectMessage[]) => void) {
  const q = query(
    collection(db, "admin_messages"),
    where("userId", "==", userId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snaps) => {
    const msgs = snaps.docs.map((d) => ({ id: d.id, ...d.data() }) as AdminDirectMessage);
    callback(msgs);
  });
}

// ==========================================
// 8. الإشعارات (Notifications)
// ==========================================
export async function createNotification(notif: Omit<AppNotification, "id" | "createdAt">): Promise<void> {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notif,
      createdAt: serverTimestamp()
    });
  } catch (_) {}
}

export function subscribeToUserNotifications(userId: string, callback: (notifs: AppNotification[]) => void) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "in", [userId, "all"]),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  return onSnapshot(
    q,
    (snaps) => {
      const items = snaps.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification);
      callback(items);
    },
    (err) => {
      console.warn("تنبيه الإشعارات:", err);
      callback([]);
    }
  );
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", id), { read: true });
  } catch (_) {}
}
