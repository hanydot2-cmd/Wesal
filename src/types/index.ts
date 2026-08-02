export type Gender = 'male' | 'female';

export type EducationLevel = 'دراسات عليا' | 'جامعي' | 'فوق متوسط' | 'متوسط' | 'بدون مؤهل';

export type MaritalStatusType = 'أعزب أو عزباء' | 'مطلق أو مطلقة' | 'أرمل أو أرملة';

export type SmokingStatus = 'مدخن' | 'غير مدخن';

export type WantChildrenType = 'يريد الإنجاب' | 'لا يريد الإنجاب' | 'غير محدد';

export type PhotoApprovalStatus = 'approved' | 'pending' | 'rejected';

export type AccountStatus = 'active' | 'suspended';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  providerId: string; // 'google.com' | 'password'
  role: UserRole;
  profileCompleted: boolean;
  accountStatus: AccountStatus;
  createdAt: any;
  lastLoginAt: any;

  // الملف الشخصي
  gender?: Gender;
  firstName?: string;
  age?: number;
  birthDate?: string; // يتم التحقق من العمر دون عرضه بالكامل للعامة
  nationality?: string;
  country?: string;
  city?: string; // العامة فقط
  job?: string;
  workType?: string;
  education?: EducationLevel;
  maritalStatus?: MaritalStatusType;
  hasChildren?: 'yes' | 'no';
  childrenCount?: number;
  wantChildren?: WantChildrenType;
  smoking?: SmokingStatus;
  bio?: string;
  qualities?: string;
  interests?: string[];
  
  // صورة الملف الشخصي وموافقة الإدارة
  photoStatus?: PhotoApprovalStatus;
  photoRejectReason?: string;

  // حالة الاتصال
  isOnline?: boolean;
  lastSeen?: any;

  // مواصفات شريك الحياة المطلوب
  partnerNationality?: string;
  partnerAgeFrom?: number;
  partnerAgeTo?: number;
  partnerEducation?: EducationLevel;
  partnerMaritalStatus?: MaritalStatusType;
  partnerAcceptChildren?: 'yes' | 'no' | 'any';

  // قوائم الحظر المحلية للفلترة السريعة
  blockedUsers?: string[];
}

export type InteractionType = 'like' | 'heart' | 'rose';

export interface UserInteraction {
  id?: string;
  fromUid: string;
  toUid: string;
  type: InteractionType;
  createdAt: any;
  fromName?: string;
  fromPhoto?: string;
}

export interface CommunicationRequest {
  id?: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  toName: string;
  fromPhoto?: string;
  toPhoto?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  approvedAt?: any;
}

export interface ChatMessage {
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  read: boolean;
  violationDetected?: boolean;
  violationReason?: string;
}

export interface ReportTicket {
  id?: string;
  reporterId: string;
  reporterName?: string;
  reportedId: string;
  reportedName?: string;
  reason: string;
  details: string;
  createdAt: any;
  status: 'new' | 'reviewed' | 'resolved';
}

export type ContactRequestType =
  | 'استفسار عام'
  | 'مشكلة تقنية'
  | 'إبلاغ عن مخالفة'
  | 'طلب حذف الحساب والبيانات'
  | 'اقتراح تطوير'
  | 'استفسار'
  | 'مساعدة'
  | 'مشكلة تسجيل الدخول'
  | 'مشكلة الحساب'
  | 'مشكلة الصورة'
  | 'شكوى'
  | 'طلب حذف الحساب'
  | 'اقتراح'
  | 'خصوصية'
  | 'أخرى'
  | string;

export type ContactTicketStatus = 'جديدة' | 'قيد المراجعة' | 'تم الرد' | 'مغلقة' | string;

export interface ViolationLog {
  id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  reason: string;
  createdAt: any;
}

export interface ContactTicket {
  id?: string;
  name: string;
  email: string;
  subject: string;
  requestType: ContactRequestType;
  message: string;
  status: ContactTicketStatus;
  createdAt: any;
  replyText?: string;
  repliedAt?: any;
}

export interface AdminDirectMessage {
  id?: string;
  userId: string;
  senderRole: UserRole;
  text: string;
  createdAt: any;
  photoURL?: string;
  read?: boolean;
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'like' | 'heart' | 'rose' | 'mutual' | 'request' | 'approved' | 'rejected' | 'message' | 'admin_reply' | 'photo_approved' | 'photo_rejected' | 'account_status';
  createdAt: any;
  read: boolean;
  link?: string;
}
