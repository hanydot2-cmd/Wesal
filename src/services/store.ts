import {
  UserProfile,
  Interaction,
  InteractionType,
  MutualMatch,
  ContactRequest,
  ContactRequestStatus,
  Message,
  Conversation,
  UserReport,
  ReportReason,
  BlockedUser,
  SupportTicket,
  SupportMessage,
  Notification,
  ImageReviewStatus,
  ModerationLog,
  UserStatus
} from '../types';
import {
  ADMIN_USER,
  INITIAL_MOCK_PROFILES,
  INITIAL_INTERACTIONS,
  INITIAL_MUTUAL_MATCHES,
  INITIAL_CONTACT_REQUESTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SUPPORT_MESSAGES,
  INITIAL_NOTIFICATIONS
} from './mockData';
import { checkForbiddenContent } from '../lib/securityFilter';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'wesal_app_data_v2';

interface AppState {
  currentUserId: string | null;
  profiles: UserProfile[];
  interactions: Interaction[];
  mutualMatches: MutualMatch[];
  contactRequests: ContactRequest[];
  conversations: Conversation[];
  messages: Message[];
  reports: UserReport[];
  blockedUsers: BlockedUser[];
  supportTickets: SupportTicket[];
  supportMessages: SupportMessage[];
  notifications: Notification[];
  moderationLogs: ModerationLog[];
}

class Store {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    // Periodically simulate online/offline heartbeat updates
    setInterval(() => {
      this.updateOnlineHeartbeats();
    }, 30000);
  }

  private loadState(): AppState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const existingIds = new Set((parsed.profiles || []).map((p: UserProfile) => p.id));
        let mergedProfiles = [
          ...(parsed.profiles || []),
          ...INITIAL_MOCK_PROFILES.filter(p => !existingIds.has(p.id))
        ];

        // Ensure ADMIN_USER has its distinct official photoUrl and email
        mergedProfiles = mergedProfiles.map(p => {
          if (p.id === 'admin_1' || p.email.toLowerCase() === 'hanydot2@gmail.com') {
            return {
              ...p,
              email: 'hanydot2@gmail.com',
              role: 'admin',
              photoUrl: ADMIN_USER.photoUrl,
              displayName: ADMIN_USER.displayName,
              photoReviewStatus: 'approved'
            };
          }
          return p;
        });

        return {
          currentUserId: parsed.currentUserId ?? 'user_male_1',
          profiles: mergedProfiles.length > 0 ? mergedProfiles : INITIAL_MOCK_PROFILES,
          interactions: parsed.interactions || INITIAL_INTERACTIONS,
          mutualMatches: parsed.mutualMatches || INITIAL_MUTUAL_MATCHES,
          contactRequests: parsed.contactRequests || INITIAL_CONTACT_REQUESTS,
          conversations: parsed.conversations || [],
          messages: parsed.messages || [],
          reports: parsed.reports || [],
          blockedUsers: parsed.blockedUsers || [],
          supportTickets: parsed.supportTickets || INITIAL_SUPPORT_TICKETS,
          supportMessages: parsed.supportMessages || INITIAL_SUPPORT_MESSAGES,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          moderationLogs: parsed.moderationLogs || []
        };
      }
    } catch (e) {
      console.warn('Failed to parse state from localStorage, initializing fresh:', e);
    }

    return {
      currentUserId: 'user_male_1', // Default logged-in male user for demo
      profiles: INITIAL_MOCK_PROFILES,
      interactions: INITIAL_INTERACTIONS,
      mutualMatches: INITIAL_MUTUAL_MATCHES,
      contactRequests: INITIAL_CONTACT_REQUESTS,
      conversations: [],
      messages: [],
      reports: [],
      blockedUsers: [],
      supportTickets: INITIAL_SUPPORT_TICKETS,
      supportMessages: INITIAL_SUPPORT_MESSAGES,
      notifications: INITIAL_NOTIFICATIONS,
      moderationLogs: []
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Session & Current User Methods ---
  public getCurrentUser(): UserProfile | null {
    if (!this.state.currentUserId) return null;
    return this.state.profiles.find((p) => p.id === this.state.currentUserId) || null;
  }

  public setCurrentUserId(userId: string | null) {
    this.state.currentUserId = userId;
    if (userId) {
      this.updateProfile(userId, { isOnline: true, lastActive: new Date().toISOString() });
    }
    this.saveState();
  }

  public registerUser(profile: Partial<UserProfile>): UserProfile {
    const userEmail = (profile.email || '').trim().toLowerCase();
    const isAdmin = userEmail === 'hanydot2@gmail.com' || userEmail === 'admin@wesal.app';

    const newId = isAdmin ? 'admin_1' : 'user_' + Date.now();
    const newProfile: UserProfile = {
      id: newId,
      email: profile.email || `${newId}@wesal.app`,
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      isProfileComplete: Boolean(profile.displayName && profile.age && profile.nationality),
      isAgeConfirmed: true,
      isTermsAccepted: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
      gender: profile.gender || 'male',
      displayName: isAdmin ? 'إدارة منصة وصال (أحمد العتيبي)' : (profile.displayName || 'عضو جديد'),
      age: profile.age || 35,
      birthDate: profile.birthDate || '1991-01-01',
      nationality: profile.nationality || 'سعودي',
      country: profile.country || 'المملكة العربية السعودية',
      city: profile.city || 'الرياض',
      occupation: isAdmin ? 'مدير منصة وصال' : (profile.occupation || 'غير محدد'),
      jobNature: profile.jobNature || '',
      education: profile.education || 'جامعي',
      maritalStatus: profile.maritalStatus || (profile.gender === 'female' ? 'عزباء' : 'أعزب'),
      hasChildren: profile.hasChildren || false,
      childrenCount: profile.childrenCount || 0,
      desiresChildren: profile.desiresChildren || 'نعم',
      smoking: profile.smoking || (profile.gender === 'female' ? 'غير مدخنة' : 'غير مدخن'),
      photoUrl: isAdmin ? ADMIN_USER.photoUrl : (profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'),
      photoReviewStatus: isAdmin ? 'approved' : 'pending', // Requires admin approval for standard users!
      bio: profile.bio || '',
      personalTraits: profile.personalTraits || '',
      hobbies: profile.hobbies || '',
      partnerBio: profile.partnerBio || '',
      partnerSpecs: profile.partnerSpecs || '',
      partnerNationality: profile.partnerNationality || 'الكل',
      partnerMinAge: profile.partnerMinAge || 18,
      partnerMaxAge: profile.partnerMaxAge || 50,
      partnerEducation: profile.partnerEducation || 'جامعي',
      partnerMaritalStatus: profile.partnerMaritalStatus || 'الكل',
      partnerAcceptsChildren: profile.partnerAcceptsChildren || 'نعم',
      partnerPreferencesNotes: profile.partnerPreferencesNotes || '',
      violationCount: 0
    };

    // Replace or add profile
    const existingIdx = this.state.profiles.findIndex(p => p.id === newId || p.email.toLowerCase() === userEmail);
    if (existingIdx !== -1) {
      this.state.profiles[existingIdx] = { ...this.state.profiles[existingIdx], ...newProfile };
    } else {
      this.state.profiles.push(newProfile);
    }
    this.state.currentUserId = newId;

    // Send admin notification
    this.addNotification({
      userId: 'admin_1',
      title: 'تسجيل عضو جديد 👤',
      message: `انضم عضو جديد: ${newProfile.displayName} (${newProfile.gender === 'male' ? 'رجل' : 'سيدة'}). الصورة قيد المراجعة.`,
      type: 'system',
      isRead: false
    });

    this.saveState();
    return newProfile;
  }

  public updateProfile(userId: string, updates: Partial<UserProfile>) {
    const idx = this.state.profiles.findIndex((p) => p.id === userId);
    if (idx !== -1) {
      // If photo changed, set to pending review
      if (updates.photoUrl && updates.photoUrl !== this.state.profiles[idx].photoUrl) {
        updates.photoReviewStatus = 'pending';
        updates.photoRejectionReason = undefined;
      }
      this.state.profiles[idx] = {
        ...this.state.profiles[idx],
        ...updates
      };
      this.saveState();
    }
  }

  public getProfiles(): UserProfile[] {
    return this.state.profiles;
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.state.profiles.find((p) => p.id === id);
  }

  private updateOnlineHeartbeats() {
    const now = new Date().toISOString();
    if (this.state.currentUserId) {
      const idx = this.state.profiles.findIndex((p) => p.id === this.state.currentUserId);
      if (idx !== -1) {
        this.state.profiles[idx].isOnline = true;
        this.state.profiles[idx].lastActive = now;
      }
    }
  }

  // --- Interactions (Likes, Hearts, Flowers) ---
  public sendInteraction(receiverId: string, type: InteractionType) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    if (currentUser.id === receiverId) return;

    // Check if already interacted
    const existing = this.state.interactions.find(
      (i) => i.senderId === currentUser.id && i.receiverId === receiverId
    );

    if (existing) {
      existing.type = type;
      existing.createdAt = new Date().toISOString();
    } else {
      const newInter: Interaction = {
        id: 'int_' + Date.now(),
        senderId: currentUser.id,
        receiverId,
        type,
        createdAt: new Date().toISOString()
      };
      this.state.interactions.push(newInter);
    }

    const typeLabel = type === 'like' ? 'إعجاباً ❤️' : type === 'flower' ? 'باقة ورد 🌹' : 'قلباً 💖';
    this.addNotification({
      userId: receiverId,
      title: `تفاعل جديد ${type === 'like' ? '❤️' : type === 'flower' ? '🌹' : '💖'}`,
      message: `أرسل لك العضو "${currentUser.displayName}" ${typeLabel}.`,
      type: 'like',
      isRead: false
    });

    // Check for Mutual Match
    const reverseInter = this.state.interactions.find(
      (i) => i.senderId === receiverId && i.receiverId === currentUser.id
    );

    if (reverseInter) {
      this.handleMutualMatch(currentUser.id, receiverId);
    } else if (receiverId !== 'admin_1') {
      // Simulate live reciprocal interest from default profiles
      setTimeout(() => {
        const autoReverseInter: Interaction = {
          id: 'int_' + Date.now(),
          senderId: receiverId,
          receiverId: currentUser.id,
          type: type === 'like' ? 'like' : type === 'flower' ? 'flower' : 'heart',
          createdAt: new Date().toISOString()
        };
        this.state.interactions.push(autoReverseInter);
        this.handleMutualMatch(currentUser.id, receiverId);
        this.saveState();
      }, 800);
    }

    this.saveState();
  }

  private handleMutualMatch(user1Id: string, user2Id: string) {
    const existingMatch = this.state.mutualMatches.find(
      (m) => (m.user1Id === user1Id && m.user2Id === user2Id) || (m.user1Id === user2Id && m.user2Id === user1Id)
    );

    if (!existingMatch) {
      const newMatch: MutualMatch = {
        id: 'match_' + Date.now(),
        user1Id,
        user2Id,
        matchedAt: new Date().toISOString(),
        status: 'active'
      };
      this.state.mutualMatches.push(newMatch);

      const p1 = this.getProfileById(user1Id);
      const p2 = this.getProfileById(user2Id);

      // Notify both users
      if (p1 && p2) {
        this.addNotification({
          userId: user1Id,
          title: 'تم الإعجاب المتبادل! 🎉',
          message: `يوجد اهتمام متبادل بينك وبين "${p2.displayName}". يمكنك الآن إرسال طلب بدء التواصل إلى الإدارة.`,
          type: 'match',
          isRead: false
        });

        this.addNotification({
          userId: user2Id,
          title: 'تم الإعجاب المتبادل! 🎉',
          message: `يوجد اهتمام متبادل بينك وبين "${p1.displayName}". يمكنك الآن إرسال طلب بدء التواصل إلى الإدارة.`,
          type: 'match',
          isRead: false
        });

        // Trigger celebratory confetti if current user involved
        if (this.state.currentUserId === user1Id || this.state.currentUserId === user2Id) {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // fallback ignore
          }
        }
      }
    }
  }

  public isMutualMatch(user1Id: string, user2Id: string): boolean {
    return this.state.mutualMatches.some(
      (m) =>
        m.status === 'active' &&
        ((m.user1Id === user1Id && m.user2Id === user2Id) || (m.user1Id === user2Id && m.user2Id === user1Id))
    );
  }

  public getInteractions(): Interaction[] {
    return this.state.interactions;
  }

  public getMutualMatches(): MutualMatch[] {
    return this.state.mutualMatches;
  }

  // --- Communication Requests (طلب بدء التواصل) ---
  public sendContactRequest(receiverId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const existing = this.state.contactRequests.find(
      (r) =>
        (r.senderId === currentUser.id && r.receiverId === receiverId) ||
        (r.senderId === receiverId && r.receiverId === currentUser.id)
    );

    if (existing) {
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.createdAt = new Date().toISOString();
      }
    } else {
      const newReq: ContactRequest = {
        id: 'req_' + Date.now(),
        senderId: currentUser.id,
        receiverId,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      this.state.contactRequests.push(newReq);
    }

    // Notify Admin
    this.addNotification({
      userId: 'admin_1',
      title: 'طلب بدء تواصل جديد 💬',
      message: `قدم العضو "${currentUser.displayName}" طلب بدء تواصل. يرجى المراجعة والموافقة.`,
      type: 'contact_request',
      isRead: false
    });

    // Auto-approve contact requests for default mock profiles after 1 sec for seamless interaction
    if (receiverId.startsWith('user_') || receiverId.startsWith('demo_')) {
      setTimeout(() => {
        const req = this.getContactRequestBetween(currentUser.id, receiverId);
        if (req && req.status === 'pending') {
          this.adminReviewContactRequest(req.id, 'approved', 'موافقة فورية متوافقة مع معايير التواصل');
        }
      }, 1000);
    }

    this.saveState();
  }

  public getContactRequests(): ContactRequest[] {
    return this.state.contactRequests;
  }

  public getContactRequestBetween(user1Id: string, user2Id: string): ContactRequest | undefined {
    return this.state.contactRequests.find(
      (r) => (r.senderId === user1Id && r.receiverId === user2Id) || (r.senderId === user2Id && r.receiverId === user1Id)
    );
  }

  public adminReviewContactRequest(requestId: string, status: ContactRequestStatus, adminNote?: string) {
    const req = this.state.contactRequests.find((r) => r.id === requestId);
    if (!req) return;

    req.status = status;
    req.adminNote = adminNote;
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = this.state.currentUserId || 'admin';

    const p1 = this.getProfileById(req.senderId);
    const p2 = this.getProfileById(req.receiverId);

    if (status === 'approved') {
      // Create conversation
      this.getOrCreateConversation(req.senderId, req.receiverId);

      if (p1 && p2) {
        this.addNotification({
          userId: req.senderId,
          title: 'تمت موافقة الإدارة على التواصل! ✅',
          message: `وافقت إدارة وصال على طلب التواصل مع "${p2.displayName}". تم فتح المحادثة الآمنة بينكما الآن.`,
          type: 'contact_request',
          isRead: false
        });

        this.addNotification({
          userId: req.receiverId,
          title: 'تمت موافقة الإدارة على التواصل! ✅',
          message: `وافقت إدارة وصال على التواصل بينك وبين "${p1.displayName}". تم فتح المحادثة الآمنة بينكما الآن.`,
          type: 'contact_request',
          isRead: false
        });
      }
    } else if (status === 'rejected') {
      this.addNotification({
        userId: req.senderId,
        title: 'تحديث بشأن طلب التواصل ℹ️',
        message: 'تعذر قبول طلب التواصل من قبل الإدارة لعدم استيفاء الشروط المتبادلة.',
        type: 'contact_request',
        isRead: false
      });
    }

    this.saveState();
  }

  // --- Secure Messaging Engine ---
  public getOrCreateConversation(user1Id: string, user2Id: string): Conversation {
    let conv = this.state.conversations.find(
      (c) =>
        (c.participants[0] === user1Id && c.participants[1] === user2Id) ||
        (c.participants[0] === user2Id && c.participants[1] === user1Id)
    );

    if (!conv) {
      conv = {
        id: 'conv_' + Date.now(),
        participants: [user1Id, user2Id],
        createdAt: new Date().toISOString()
      };
      this.state.conversations.push(conv);
      this.saveState();
    }
    return conv;
  }

  public getConversationsForUser(userId: string): Conversation[] {
    return this.state.conversations.filter((c) => c.participants.includes(userId));
  }

  public getMessagesForConversation(convId: string): Message[] {
    return this.state.messages.filter((m) => m.conversationId === convId);
  }

  public sendMessage(conversationId: string, receiverId: string, text: string): { success: boolean; errorReason?: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, errorReason: 'لم يتم تسجيل الدخول' };

    // Check if account is suspended
    if (currentUser.status === 'suspended' || currentUser.status === 'banned') {
      return { success: false, errorReason: 'حسابك موقوف مؤقتاً بسبب مخالفة شروط الاستخدام.' };
    }

    // Check if blocked
    if (this.isUserBlocked(receiverId, currentUser.id)) {
      return { success: false, errorReason: 'لا يمكن إرسال الرسالة نظراً لحظر التواصل.' };
    }

    // Check Anti-Contact Sharing Filter
    const securityCheck = checkForbiddenContent(text);
    if (securityCheck.isForbidden) {
      // Log violation attempt
      currentUser.violationCount = (currentUser.violationCount || 0) + 1;
      this.state.moderationLogs.push({
        id: 'mod_' + Date.now(),
        userId: currentUser.id,
        action: 'contact_info_attempt',
        details: `محاولة إرسال بيانات اتصالات ممنوعة (${securityCheck.detectedPattern}): "${text.slice(0, 50)}..."`,
        timestamp: new Date().toISOString()
      });

      // Escalation check
      if (currentUser.violationCount >= 3) {
        currentUser.status = 'suspended';
        this.addNotification({
          userId: currentUser.id,
          title: 'تم إيقاف الحساب مؤقتاً ⚠️',
          message: 'تم إيقاف قدرتك على المراسلة بسبب تكرار محاولة مشاركة أرقام الهواتف أو الروابط الممنوعة.',
          type: 'system',
          isRead: false
        });
      }

      this.saveState();
      return {
        success: false,
        errorReason: securityCheck.reason || 'تعذر إرسال الرسالة لأنها تحتوي على بيانات اتصال أو معلومات شخصية غير مسموح بمشاركتها.'
      };
    }

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: currentUser.id,
      receiverId,
      text,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    this.state.messages.push(newMsg);

    // Update conversation last message
    const conv = this.state.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageTime = newMsg.createdAt;
    }

    // Notify receiver
    this.addNotification({
      userId: receiverId,
      title: `رسالة جديدة من ${currentUser.displayName} 💬`,
      message: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
      type: 'chat',
      isRead: false
    });

    // Auto-reply for default mock profiles after 1.5 seconds
    const receiverProfile = this.getProfileById(receiverId);
    if (receiverProfile && (receiverId.startsWith('user_') || receiverId.startsWith('demo_'))) {
      setTimeout(() => {
        const femaleReplies = [
          `أهلاً وسهلاً بك يا ${currentUser.displayName}، سعدت بقراءة رسالتك ومواصفاتك الطيبة عبر المنصة.`,
          `مرحباً بك! يسعدني أن نتواصل بجدية بما يرضي الله سبحانه وتعالى.`,
          `شكراً على رسالتك اللطيفة، أتمنى لنا وللجميع التوفيق والبركة في البحث عن شريك الحياة.`,
          `أهلاً بك، قرأت ملفك ويشرفني التعرف عليك أكثر من خلال منصة وصال.`
        ];
        const maleReplies = [
          `أهلاً وسهلاً بكِ، سعدت بتواصلكِ الكريم عبر المنصة الموقرة.`,
          `مرحباً بكِ، يشرفني الحديث معكِ وتكملة التعارف الجاد في وصال.`,
          `شكراً لكِ على هذه المبادرة الطيبة، أتمنى لكِ التوفيق دائماً.`,
          `أهلاً بكِ، يسعدني التعرف عليكِ والحديث بما يرضي الله.`
        ];
        const pool = receiverProfile.gender === 'female' ? femaleReplies : maleReplies;
        const replyText = pool[Math.floor(Math.random() * pool.length)];

        const autoMsg: Message = {
          id: 'msg_' + Date.now(),
          conversationId,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: replyText,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        this.state.messages.push(autoMsg);

        const targetConv = this.state.conversations.find((c) => c.id === conversationId);
        if (targetConv) {
          targetConv.lastMessage = replyText;
          targetConv.lastMessageTime = autoMsg.createdAt;
        }

        this.addNotification({
          userId: currentUser.id,
          title: `رسالة جديدة من ${receiverProfile.displayName} 💬`,
          message: replyText,
          type: 'chat',
          isRead: false
        });

        this.saveState();
      }, 1500);
    }

    this.saveState();
    return { success: true };
  }

  // --- Blocking & Reporting ---
  public blockUser(blockedUserId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    if (!this.state.blockedUsers.some((b) => b.blockerId === currentUser.id && b.blockedUserId === blockedUserId)) {
      this.state.blockedUsers.push({
        id: 'block_' + Date.now(),
        blockerId: currentUser.id,
        blockedUserId,
        createdAt: new Date().toISOString()
      });
      this.saveState();
    }
  }

  public unblockUser(blockedUserId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    this.state.blockedUsers = this.state.blockedUsers.filter(
      (b) => !(b.blockerId === currentUser.id && b.blockedUserId === blockedUserId)
    );
    this.saveState();
  }

  public isUserBlocked(blockerId: string, targetUserId: string): boolean {
    return this.state.blockedUsers.some(
      (b) => b.blockerId === blockerId && b.blockedUserId === targetUserId
    );
  }

  public reportUser(reportedUserId: string, reason: ReportReason, details: string, messageId?: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const report: UserReport = {
      id: 'rep_' + Date.now(),
      reporterId: currentUser.id,
      reportedUserId,
      reason,
      details,
      messageId,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    this.state.reports.push(report);

    // Notify Admin
    this.addNotification({
      userId: 'admin_1',
      title: 'بلاغ جديد ⚠️',
      message: `تم تقديم بلاغ ضد العضو "${this.getProfileById(reportedUserId)?.displayName}" بسبب (${reason}).`,
      type: 'system',
      isRead: false
    });

    this.saveState();
  }

  public getReports(): UserReport[] {
    return this.state.reports;
  }

  // --- Admin Moderation Operations ---
  public reviewPhoto(userId: string, approved: boolean, reason?: string) {
    const profile = this.getProfileById(userId);
    if (!profile) return;

    if (approved) {
      profile.photoReviewStatus = 'approved';
      profile.photoRejectionReason = undefined;

      this.addNotification({
        userId,
        title: 'تم اعتماد صورتك الشخصية! 📸',
        message: 'وافقت الإدارة على صورتك الشخصية وأصبحت تظهر الآن للأعضاء.',
        type: 'photo_review',
        isRead: false
      });
    } else {
      profile.photoReviewStatus = 'rejected';
      profile.photoRejectionReason = reason || 'الصورة غير واضحة أو مخالفة للضوابط الشرعية والشخصية.';

      this.addNotification({
        userId,
        title: 'تم رفض الصورة الشخصية ⚠️',
        message: `نحيطك علماً برفض الصورة الشخصية بسبب: ${profile.photoRejectionReason}. يرجى رفع صورة شخصية مناسبة.`,
        type: 'photo_review',
        isRead: false
      });
    }

    this.saveState();
  }

  public updateUserStatus(userId: string, status: UserStatus) {
    const profile = this.getProfileById(userId);
    if (!profile) return;

    profile.status = status;

    this.addNotification({
      userId,
      title: 'تحديث حالة الحساب ℹ️',
      message: `تم تغيير حالة حسابك إلى (${status === 'active' ? 'نشط' : status === 'suspended' ? 'موقوف' : 'محظور'}).`,
      type: 'system',
      isRead: false
    });

    this.saveState();
  }

  // --- Contact Us & Admin Support Tickets ---
  public createSupportTicket(data: Partial<SupportTicket>): SupportTicket {
    const currentUser = this.getCurrentUser();
    const newTicket: SupportTicket = {
      id: 'ticket_' + Date.now(),
      userId: currentUser?.id,
      name: data.name || currentUser?.displayName || 'زائر',
      email: data.email || currentUser?.email || 'visitor@wesal.app',
      subject: data.subject || 'استفسار عام',
      type: data.type || 'استفسار عام',
      message: data.message || '',
      createdAt: new Date().toISOString(),
      status: 'new',
      isUrgent: data.type === 'شكوى أو بلاغ' || data.type === 'طلب حذف الحساب'
    };

    this.state.supportTickets.push(newTicket);

    // Initial message
    this.state.supportMessages.push({
      id: 'smsg_' + Date.now(),
      ticketId: newTicket.id,
      senderId: currentUser?.id || 'visitor',
      senderName: newTicket.name,
      isAdmin: false,
      text: newTicket.message,
      createdAt: newTicket.createdAt
    });

    // Notify Admin
    this.addNotification({
      userId: 'admin_1',
      title: 'رسالة دعم فني جديدة 📩',
      message: `رسالة جديدة من ${newTicket.name} موضوع: (${newTicket.subject})`,
      type: 'admin_reply',
      isRead: false
    });

    this.saveState();
    return newTicket;
  }

  public sendSupportMessage(ticketId: string, text: string, isAdmin: boolean = false, attachmentUrl?: string) {
    const currentUser = this.getCurrentUser();
    const ticket = this.state.supportTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const newMsg: SupportMessage = {
      id: 'smsg_' + Date.now(),
      ticketId,
      senderId: isAdmin ? 'admin_1' : currentUser?.id || 'user',
      senderName: isAdmin ? 'إدارة منصة وصال' : currentUser?.displayName || ticket.name,
      isAdmin,
      text,
      attachmentUrl,
      createdAt: new Date().toISOString()
    };

    this.state.supportMessages.push(newMsg);

    if (isAdmin) {
      ticket.status = 'replied';
      if (ticket.userId) {
        this.addNotification({
          userId: ticket.userId,
          title: '🔔 لديك رد جديد من إدارة وصال',
          message: `ردت الإدارة على تذكرتك: "${text.slice(0, 50)}..."`,
          type: 'admin_reply',
          isRead: false
        });
      }
    } else {
      ticket.status = 'in_review';
    }

    this.saveState();
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status']) {
    const ticket = this.state.supportTickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      this.saveState();
    }
  }

  public getSupportTickets(): SupportTicket[] {
    return this.state.supportTickets;
  }

  public getSupportMessagesForTicket(ticketId: string): SupportMessage[] {
    return this.state.supportMessages.filter((m) => m.ticketId === ticketId);
  }

  // --- Notifications ---
  public getNotificationsForUser(userId: string): Notification[] {
    return this.state.notifications.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public markNotificationAsRead(notifId: string) {
    const notif = this.state.notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      this.saveState();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.state.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.saveState();
  }

  public addNotification(notif: Omit<Notification, 'id' | 'createdAt'>) {
    this.state.notifications.push({
      ...notif,
      id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    });
    this.saveState();
  }

  // --- Moderation Logs ---
  public getModerationLogs(): ModerationLog[] {
    return this.state.moderationLogs;
  }

  public logout() {
    if (this.state.currentUserId) {
      this.updateProfile(this.state.currentUserId, { isOnline: false });
    }
    this.setCurrentUserId(null);
  }

  public getUserConversations(userId: string): Conversation[] {
    return this.state.conversations.filter(
      (c) => c.participants && c.participants.includes(userId)
    );
  }

  // --- Admin Statistics ---
  public getAdminStats() {
    const totalMembers = this.state.profiles.length;
    const menCount = this.state.profiles.filter((p) => p.gender === 'male').length;
    const womenCount = this.state.profiles.filter((p) => p.gender === 'female').length;
    const onlineCount = this.state.profiles.filter((p) => p.isOnline).length;
    const pendingPhotos = this.state.profiles.filter((p) => p.photoReviewStatus === 'pending').length;
    const likesCount = this.state.interactions.filter((i) => i.type === 'like').length;
    const heartsCount = this.state.interactions.filter((i) => i.type === 'heart').length;
    const flowersCount = this.state.interactions.filter((i) => i.type === 'flower').length;
    const mutualMatchesCount = this.state.mutualMatches.filter((m) => m.status === 'active').length;
    const contactRequestsCount = this.state.contactRequests.length;
    const activeChatsCount = this.state.conversations.length;
    const suspendedAccounts = this.state.profiles.filter((p) => p.status === 'suspended' || p.status === 'banned').length;
    const reportsCount = this.state.reports.length;
    const supportTicketsCount = this.state.supportTickets.length;

    return {
      totalMembers,
      menCount,
      womenCount,
      onlineCount,
      pendingPhotos,
      likesCount,
      heartsCount,
      flowersCount,
      mutualMatchesCount,
      contactRequestsCount,
      activeChatsCount,
      suspendedAccounts,
      reportsCount,
      supportTicketsCount
    };
  }
}

export const store = new Store();
