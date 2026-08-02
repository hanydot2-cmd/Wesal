/**
 * نظام فلترة وحماية الخصوصية ومنع تبادل أرقام الهواتف وأرقام الواتساب والبريد الإلكتروني والروابط والعناوين
 */

// تحويل الأرقام العربية المشرقية والفارسية إلى أرقام لاتينية للفحص الدقيق
export function normalizeDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
}

// تحويل الأرقام المكتوبة بالحروف العربية إلى أرقام لفحص محاولات التحايل
const arabicNumberWords: { [key: string]: string } = {
  'صفر': '0',
  'واحد': '1', 'واحده': '1', 'أحد': '1',
  'اتنين': '2', 'اثنين': '2', 'إثنين': '2', 'ثنتين': '2',
  'تلاته': '3', 'ثلاثة': '3', 'ثلاث': '3', 'تلات': '3',
  'اربعة': '4', 'أربعة': '4', 'اربع': '4', 'أربع': '4',
  'خمسة': '5', 'خمسه': '5', 'خمس': '5',
  'ستة': '6', 'سته': '6', 'ست': '6',
  'سبعة': '7', 'سبعه': '7', 'سبع': '7',
  'ثمانية': '8', 'تمانية': '8', 'ثمانيه': '8', 'تمان': '8',
  'تسعة': '9', 'تسعه': '9', 'تسع': '9',
  'عشرة': '10', 'عشره': '10',
  'زيرو': '0', 'وان': '1', 'تو': '2', 'ثري': '3', 'فور': '4', 'فايف': '5', 'سكس': '6', 'سفن': '7', 'ايه': '8', 'ايت': '8', 'ناين': '9'
};

export function replaceWordNumbers(text: string): string {
  let processed = text;
  Object.keys(arabicNumberWords).forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    processed = processed.replace(regex, arabicNumberWords[word]);
  });
  return processed;
}

export interface SecurityCheckResult {
  blocked: boolean;
  reason?: string;
  matchedPattern?: string;
}

export function analyzeMessagePrivacy(rawText: string): SecurityCheckResult {
  if (!rawText || !rawText.trim()) {
    return { blocked: false };
  }

  const normalized = normalizeDigits(rawText);
  const withWordsConverted = replaceWordNumbers(normalized);

  // 1. فحص البريد الإلكتروني (بما في ذلك التحايل بمسافات أو كلمات دوت وأت)
  const emailPattern = /[a-zA-Z0-9._%+-]+(?:\s*[@|@|ات|at]\s*|\s*\[@\]\s*)[a-zA-Z0-9.-]+(?:\s*[.|dot|دوت]\s*|\s*\[\.\]\s*)[a-zA-Z]{2,}/i;
  const simpleEmailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  if (simpleEmailPattern.test(normalized) || emailPattern.test(normalized)) {
    return {
      blocked: true,
      reason: 'يُمنع مشاركة البريد الإلكتروني داخل الرسائل لحماية خصوصيتك.',
      matchedPattern: 'Email Detected'
    };
  }

  // 2. فحص روابط المواقع ومواقع التواصل الاجتماعي (واتساب، فيسبوك، انستجرام، سناب، تليجرام، تيك توك، تويتر)
  const socialKeywords = [
    'whatsapp', 'واتساب', 'واتس', 'وتس', 'wa.me',
    'facebook', 'فيسبوك', 'فيس', 'fb.com',
    'instagram', 'انستجرام', 'انستا', 'انستغرام',
    'snapchat', 'سناب', 'سنابتشات',
    'telegram', 'تليجرام', 'تلغرام', 'تليغرام', 't.me',
    'tiktok', 'تيكتوك', 'تيك توك',
    'twitter', 'تويتر', 'x.com',
    'http://', 'https://', 'www.', '.com', '.net', '.org'
  ];

  for (const keyword of socialKeywords) {
    if (normalized.toLowerCase().includes(keyword.toLowerCase())) {
      return {
        blocked: true,
        reason: 'يُمنع إرسال الروابط أو الإشارة لتطبيقات التواصل الاجتماعي (واتساب، انستا، فيسبوك، سناب، تليجرام...)',
        matchedPattern: `Social/Link Keyword (${keyword})`
      };
    }
  }

  // 3. فحص أرقام الهاتف (تسلسل 7 أرقام أو أكثر حتى لو بينها مسافات أو رموز أو شرطات أو حروف)
  // إزالة المسافات والرموز من النص المحول لمعرفة عدد الأرقام المتصلة
  const digitsOnly = withWordsConverted.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 8) {
    return {
      blocked: true,
      reason: 'يُمنع مشاركة أرقام الهواتف أو أرقام التواصل بأي صيغة (أرقام متصلة أو متقطعة أو بالحروف).',
      matchedPattern: 'Phone Number Sequence Detected'
    };
  }

  // فحص نمط أرقام متقطعة (مثلاً: 0 1 0 1 2 3 ...)
  const spacedNumberPattern = /(?:\d[\s\-_.,/\\|*#@~]?){8,}/;
  if (spacedNumberPattern.test(normalized)) {
    return {
      blocked: true,
      reason: 'تم اكتشاف محاولة كتابة أرقام اتصال متقطعة. يرجى الالتزام بقواعد التواصل الآمن في وصال.',
      matchedPattern: 'Spaced Number Pattern'
    };
  }

  // 4. فحص العناوين التفصيلية أو الحساسة
  const addressKeywords = [
    'شارع رقم', 'عمارة رقم', 'شقة رقم', 'الدور ال', 'منزل رقم', 'ميدان ال', 'بجوار مسجد', 'بجوار كنيسة', 'بجوار محطة', 'رقم الهوية', 'الرقم القومي', 'بطاقة رقم', 'سجل مدني'
  ];
  for (const kw of addressKeywords) {
    if (normalized.includes(kw)) {
      return {
        blocked: true,
        reason: 'يُمنع مشاركة العناوين التفصيلية للمنزل أو العمل أو بيانات الهوية لحمايتك.',
        matchedPattern: `Address/ID keyword (${kw})`
      };
    }
  }

  return { blocked: false };
}
