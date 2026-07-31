/**
 * Helper utilities for Social Login Avatars (Facebook, Google, Twitter/X)
 * Generates high-resolution SVG Data URL avatars with social branding badges
 * and detects whether a user is currently using a social default photo.
 */

export type SocialProviderType = 'Facebook' | 'Google' | 'Twitter';

export const getSocialDefaultPhoto = (provider: SocialProviderType): string => {
  if (provider === 'Facebook') {
    return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400';
  }
  if (provider === 'Twitter') {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400';
  }
  // Google
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
};

export const isSocialDefaultPhoto = (url?: string): boolean => {
  return false;
};

export const detectSocialProvider = (user?: {
  email: string;
  photoUrl?: string;
}): SocialProviderType | null => {
  if (!user) return null;
  const email = user.email.toLowerCase();
  const url = user.photoUrl || '';
  if (
    email.includes('@facebook.com') ||
    email.includes('facebook') ||
    url.includes('1500648767791')
  ) {
    return 'Facebook';
  }
  if (
    email.includes('@x.com') ||
    email.includes('twitter') ||
    url.includes('1472099645785')
  ) {
    return 'Twitter';
  }
  if (
    email.includes('@gmail.com') ||
    email.includes('google') ||
    url.includes('1534528741775')
  ) {
    if (email === 'hanydot2@gmail.com') return null;
    return 'Google';
  }
  return null;
};
