export type Gender = 'male' | 'female';

export type MaritalStatusMale = 'أعزب' | 'مطلق' | 'أرمل';
export type MaritalStatusFemale = 'عزباء' | 'مطلقة' | 'أرملة';
export type MaritalStatus = MaritalStatusMale | MaritalStatusFemale;

export type EducationLevel = 'دراسات عليا' | 'جامعي' | 'فوق متوسط' | 'متوسط' | 'بدون مؤهل';
export type SmokingStatus = 'مدخن' | 'غير مدخن' | 'أقلعت عن التدخين' | 'مدخنة' | 'غير مدخنة';
export type DesiresChildren = 'نعم' | 'لا' | 'غير محدد';
export type AcceptsChildren = 'نعم' | 'لا' | 'حسب الحالة';

export type UserRole = 'user' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';
export type ImageReviewStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string; // user id
  email: string;
  role: UserRole;
  status: UserStatus;
  isProfileComplete: boolean;
  isAgeConfirmed: boolean;
  isTermsAccepted: boolean;
  createdAt: string;
  lastActive: string;
  isOnline: boolean;

  // Account Type
  gender: Gender;

  // Personal Info
  displayName: string; // First name or safe pseudonym
  age: number;
  birthDate?: string;
  nationality: string;
  country: string;
  city: string; // General region/city
  occupation: string;
  jobNature?: string;
  education: EducationLevel;
  maritalStatus: MaritalStatus;
  hasChildren: boolean;
  childrenCount?: number;
  desiresChildren: DesiresChildren;
  smoking: SmokingStatus;
  
  // Photos
  photoUrl: string; // Main profile photo
  additionalPhotos?: string[];
  photoReviewStatus: ImageReviewStatus;
  photoRejectionReason?: string;

  // Bio & Traits
  bio: string;
  personalTraits: string;
  hobbies: string;

  // Partner Preferences (الشريك المطلوب)
  partnerBio?: string;
  partnerSpecs?: string;
  partnerNationality?: string;
  partnerMinAge: number;
  partnerMaxAge: number;
  partnerEducation?: EducationLevel | 'الكل';
  partnerMaritalStatus?: string;
  partnerAcceptsChildren: AcceptsChildren;
  partnerPreferencesNotes?: string;

  // Moderation counters
  violationCount: number;
  restrictionExpiry?: string;
}

export type InteractionType = 'like' | 'heart' | 'flower';

export interface Interaction {
  id: string;
  senderId: string;
  receiverId: string;
  type: InteractionType;
  createdAt: string;
}

export interface MutualMatch {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: string;
  status: 'active' | 'unmatched';
}

export type ContactRequestStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface ContactRequest {
  id: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  status: ContactRequestStatus;
  adminNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  flagged?: boolean;
  flaggedReason?: string;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
  isBlocked?: boolean;
  blockedBy?: string;
  isTerminated?: boolean;
}

export type ReportReason =
  | 'إساءة أو ألفاظ غير مناسبة'
  | 'طلب بيانات شخصية'
  | 'محاولة مشاركة رقم هاتف'
  | 'حساب مزيف'
  | 'صورة غير مناسبة'
  | 'مضايقة'
  | 'احتيال'
  | 'سبب آخر';

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details: string;
  messageId?: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'action_taken' | 'dismissed';
  adminActionNote?: string;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export type TicketType =
  | 'استفسار عام'
  | 'طلب مساعدة'
  | 'مشكلة في تسجيل الدخول'
  | 'مشكلة في الحساب'
  | 'مشكلة في الصورة الشخصية'
  | 'شكوى أو بلاغ'
  | 'طلب حذف الحساب'
  | 'اقتراح أو ملاحظة'
  | 'استفسار عن الخصوصية'
  | 'طلب التواصل مع الإدارة'
  | 'أخرى';

export type TicketStatus = 'new' | 'in_review' | 'replied' | 'closed';

export interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  type: TicketType;
  message: string;
  createdAt: string;
  status: TicketStatus;
  isUrgent?: boolean;
  adminNotes?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string; // 'user' or 'admin' or user ID
  senderName: string;
  isAdmin: boolean;
  text: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'like' | 'match' | 'contact_request' | 'chat' | 'photo_review' | 'admin_reply' | 'system';
  isRead: boolean;
  createdAt: string;
  linkAction?: string;
}

export interface ModerationLog {
  id: string;
  userId: string;
  action: 'contact_info_attempt' | 'photo_rejected' | 'account_suspended' | 'warning_issued';
  details: string;
  timestamp: string;
}
