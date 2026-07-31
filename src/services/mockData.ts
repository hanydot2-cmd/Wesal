import { UserProfile, Interaction, ContactRequest, Message, Conversation, SupportTicket, SupportMessage, UserReport, Notification } from '../types';

export const ADMIN_USER: UserProfile = {
  id: 'admin_1',
  email: 'hanydot2@gmail.com',
  role: 'admin',
  status: 'active',
  isProfileComplete: true,
  isAgeConfirmed: true,
  isTermsAccepted: true,
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: new Date().toISOString(),
  isOnline: true,
  gender: 'male',
  displayName: 'إدارة منصة وصال',
  age: 35,
  birthDate: '1991-05-15',
  nationality: 'سعودي',
  country: 'المملكة العربية السعودية',
  city: 'الرياض',
  occupation: 'مدير منصة وصال',
  jobNature: 'إدارة عامة',
  education: 'دراسات عليا',
  maritalStatus: 'أعزب',
  hasChildren: false,
  desiresChildren: 'نعم',
  smoking: 'غير مدخن',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  photoReviewStatus: 'approved',
  bio: 'الحساب الرسمي لمدير منصة وصال للتعارف والزواج الجاد.',
  personalTraits: 'التزام، أمانة، وحرص على تقديم الخدمة بخصوصية وأمان.',
  hobbies: 'المطالعة، خدمة المجتمع',
  partnerBio: '',
  partnerSpecs: '',
  partnerNationality: 'أي جنسية',
  partnerMinAge: 20,
  partnerMaxAge: 50,
  partnerEducation: 'جامعي',
  partnerMaritalStatus: 'أي حالة',
  partnerAcceptsChildren: 'نعم',
  partnerPreferencesNotes: '',
  violationCount: 0
};

export const INITIAL_MOCK_PROFILES: UserProfile[] = [
  ADMIN_USER
];

export const INITIAL_INTERACTIONS: Interaction[] = [];

export const INITIAL_MUTUAL_MATCHES = [];

export const INITIAL_CONTACT_REQUESTS: ContactRequest[] = [];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket_1',
    userId: 'user_female_1',
    name: 'فاطمة الزهراء',
    email: 'fatima@wesal.app',
    subject: 'استفسار عن طريقة مراجعة طلب التواصل',
    type: 'استفسار عام',
    message: 'السلام عليكم ورحمة الله، أود الاستفسار كم يستغرق وقت مراجعة طلب التواصل من قبل إدارة منصة وصال؟ وشكراً لجهودكم المباركة.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'in_review',
    isUrgent: false
  },
  {
    id: 'ticket_2',
    name: 'عبدالله السالم',
    email: 'abdullah@example.com',
    subject: 'طلب التثبت من شروط التسجيل',
    type: 'استفسار عن الخصوصية',
    message: 'مرحباً إدارة وصال، هل يظهر اسم العائلة الخاص بي للأعضاء؟ وأرجو توضيح معايير الأمان المتبعة.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'replied',
    isUrgent: false
  }
];

export const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: 'smsg_1',
    ticketId: 'ticket_1',
    senderId: 'user_female_1',
    senderName: 'فاطمة الزهراء',
    isAdmin: false,
    text: 'السلام عليكم ورحمة الله، أود الاستفسار كم يستغرق وقت مراجعة طلب التواصل من قبل إدارة منصة وصال؟ وشكراً لجهودكم المباركة.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'smsg_2',
    ticketId: 'ticket_1',
    senderId: 'admin_1',
    senderName: 'إدارة منصة وصال',
    isAdmin: true,
    text: 'وعليكم السلام ورحمة الله وبركاته أختنا الكريمة فاطمة. يتم مراجعة طلبات التواصل خلال مدة أقصاها 24 ساعة لضمان أمان الطرفين والتأكد من مطابقة شروط وصال.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'smsg_3',
    ticketId: 'ticket_2',
    senderId: 'admin_1',
    senderName: 'إدارة منصة وصال',
    isAdmin: true,
    text: 'أهلاً بك أخي الكريم. لا يظهر اسم العائلة ولا أي بيانات شخصية أو بريد إلكتروني نهائياً للعامة أو للأعضاء. يظهر فقط الاسم الأول أو المستعار والعمر والجنسية فقط.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [];
