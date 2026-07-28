/**
 * Smart Anti-Contact Sharing & Security Filter for Wesal
 * Prevents sharing phone numbers, WhatsApp, emails, social links, and detailed addresses.
 */

export interface FilterResult {
  isForbidden: boolean;
  reason?: string;
  detectedPattern?: string;
}

// Convert Eastern Arabic numerals (٠-٩) to English numerals (0-9)
export function normalizeArabicDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return result;
}

// Map Arabic spelled out single digit numbers
const arabicWordNumbersMap: Record<string, string> = {
  'صفر': '0',
  'زيرو': '0',
  'واحد': '1',
  'واحدة': '1',
  'اثنان': '2',
  'اثنين': '2',
  'تنين': '2',
  'ثلاثة': '3',
  'ثلاثه': '3',
  'تلاتة': '3',
  'تلاته': '3',
  'أربعة': '4',
  'اربعة': '4',
  'اربع': '4',
  'أربع': '4',
  'خمسة': '5',
  'خمسه': '5',
  'خمس': '5',
  'ستة': '6',
  'سته': '6',
  'ست': '6',
  'سبعة': '7',
  'سبعه': '7',
  'سبع': '7',
  'ثمانية': '8',
  'ثمانيه': '8',
  'تمانية': '8',
  'تمانيه': '8',
  'ثمان': '8',
  'تسعة': '9',
  'تسعه': '9',
  'تسع': '9',
};

export function checkForbiddenContent(text: string): FilterResult {
  if (!text || text.trim().length === 0) {
    return { isForbidden: false };
  }

  const rawLower = text.toLowerCase();
  const normalizedDigits = normalizeArabicDigits(rawLower);

  // 1. Check for Emails
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  if (emailRegex.test(normalizedDigits) || normalizedDigits.includes('@') || normalizedDigits.includes('جيميل') || normalizedDigits.includes('ياهو')) {
    return {
      isForbidden: true,
      reason: 'يمنع إرسال البريد الإلكتروني.',
      detectedPattern: 'email',
    };
  }

  // 2. Check for Social Links and URLs
  const urlRegex = /(https?:\/\/|www\.|wa\.me|t\.me|fb\.me|instagram\.com|facebook\.com|twitter\.com|tiktok\.com|snapchat\.com|linkedin\.com)/gi;
  if (urlRegex.test(normalizedDigits)) {
    return {
      isForbidden: true,
      reason: 'يمنع مشاركة الروابط الخارجية أو روابط التواصل الاجتماعي.',
      detectedPattern: 'url',
    };
  }

  // 3. Social Media App mentions with user handles or numbers
  const socialKeywords = [
    'واتس', 'واتساب', 'whatsapp', 'انستا', 'انستجرام', 'instagram', 'تلجرام',
    'تيليجرام', 'telegram', 'سناب', 'snapchat', 'فيسبوك', 'facebook', 'تيك توك',
    'tiktok', 'تويتر', 'twitter', 'إيميل', 'ايميل', 'فايبر', 'viber', 'لاين', 'line'
  ];

  for (const kw of socialKeywords) {
    if (normalizedDigits.includes(kw)) {
      // Check if it's accompanied by contact requests like handle or number
      if (/(@|[0-9]{3,}|رقم|حساب|اكونت|سيرش|ضيفني|خاص|تواصل)/i.test(normalizedDigits)) {
        return {
          isForbidden: true,
          reason: `يمنع مشاركة وسيلة التواصل خارج الموقع (${kw}).`,
          detectedPattern: 'social_handle',
        };
      }
    }
  }

  // 4. Phone Number Pattern Scanner (detects sequence of 7 or more digits even separated by spaces, dots, dashes, slashes, or zero-width spaces)
  const cleanedDigitsOnly = normalizedDigits.replace(/[^0-9]/g, '');
  if (cleanedDigitsOnly.length >= 7) {
    // Check if it matches common phone country codes or phone formats (+966, +20, 05, 01, 00)
    const digitsInOriginal = normalizedDigits.match(/(?:\+?\d[\d\s.\-/#]{6,}\d)/g);
    if (digitsInOriginal || cleanedDigitsOnly.length >= 8) {
      return {
        isForbidden: true,
        reason: 'يمنع إرسال أرقام الهواتف أو الجوال بجميع أنواعها.',
        detectedPattern: 'phone_digits',
      };
    }
  }

  // 5. Spelled out Arabic numbers trick check
  // Replace spelled out numbers with actual digits
  let textWithConvertedWords = normalizedDigits;
  for (const [word, digit] of Object.entries(arabicWordNumbersMap)) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    textWithConvertedWords = textWithConvertedWords.replace(reg, digit);
  }
  const cleanedConvertedDigits = textWithConvertedWords.replace(/[^0-9]/g, '');
  if (cleanedConvertedDigits.length >= 7) {
    return {
      isForbidden: true,
      reason: 'يمنع التحايل بكتابة رقم الهاتف بالأحرف أو الكلمات.',
      detectedPattern: 'phone_words',
    };
  }

  // 6. Explicit calls to phone/address
  const explicitTriggers = [
    'رقمي هو', 'رقم الجوال', 'رقم الهاتف', 'كلمني على', 'رقم الواتس', 'هذا رقمي',
    'عنواني بالتفصيل', 'الشارع رقم', 'شقة رقم', 'عمارتنا', 'تلفوني'
  ];
  for (const trigger of explicitTriggers) {
    if (normalizedDigits.includes(trigger)) {
      return {
        isForbidden: true,
        reason: 'يمنع إرسال بيانات الاتصال أو العناوين التفصيلية.',
        detectedPattern: 'explicit_trigger',
      };
    }
  }

  return { isForbidden: false };
}
