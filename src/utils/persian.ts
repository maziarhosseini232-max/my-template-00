/**
 * Persian localization and formatting utilities
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const LATIN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts English/Latin numbers to Persian digits
 */
export function toPersianDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = typeof input === 'number' ? input.toString() : String(input);
  return str.replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w]);
}

/**
 * Converts Persian digits to Latin numbers
 */
export function toLatinDigits(input: string): string {
  if (!input) return '';
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), LATIN_DIGITS[i]);
  }
  return result;
}

/**
 * Formats a number with Persian comma separators (٬)
 */
export function formatPersianNumber(num: number | string): string {
  if (num === undefined || num === null) return '۰';
  const numVal = typeof num === 'string' ? parseFloat(toLatinDigits(num)) : num;
  if (isNaN(numVal)) return toPersianDigits(num);

  const parts = numVal.toString().split('.');
  const intPartWithCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  
  if (parts.length > 1) {
    return toPersianDigits(intPartWithCommas) + '٫' + toPersianDigits(parts[1]);
  }
  return toPersianDigits(intPartWithCommas);
}

/**
 * Formats a price in Tomans (تومان) with Persian digits
 * If price is 0, returns "رایگان"
 */
export function formatPriceToman(amount: number): string {
  if (amount === 0) {
    return 'رایگان';
  }
  return `${formatPersianNumber(amount)} تومان`;
}

export const formatTomanPrice = formatPriceToman;

/**
 * Formats rating with Persian decimal (٫) e.g. ۴٫۸
 */
export function formatRatingFa(rating: number): string {
  if (!rating) return '۵٫۰';
  const fixed = rating.toFixed(1);
  return toPersianDigits(fixed.replace('.', '٫'));
}

/**
 * Formats duration in hours & minutes in Persian
 */
export function formatDurationFa(hours: number, minutes?: number): string {
  const hFa = toPersianDigits(hours);
  if (minutes && minutes > 0) {
    const mFa = toPersianDigits(minutes);
    return `${hFa} ساعت و ${mFa} دقیقه`;
  }
  return `${hFa} ساعت`;
}

/**
 * Formats student count e.g. ۱۲٬۴۵۰ دانشجو
 */
export function formatStudentsFa(count: number): string {
  return `${formatPersianNumber(count)} دانشجو`;
}

/**
 * Formats lessons count e.g. ۲۴ جلسه
 */
export function formatLessonsFa(count: number): string {
  return `${formatPersianNumber(count)} جلسه`;
}

/**
 * Formats relative date or Shamsi representation in Persian
 */
export function formatDateFa(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr === 'Just now' || dateStr === 'همین الان') return 'همین الان';
  if (dateStr.includes('hour') || dateStr.includes('ساعت')) return '۲ ساعت پیش';
  if (dateStr.includes('day') || dateStr.includes('روز')) return 'دیروز';

  // If already contains Persian characters
  if (/[\u0600-\u06FF]/.test(dateStr)) {
    return dateStr;
  }

  // Simple conversion fallback for demo dates
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return toPersianDigits(dateStr);
  }

  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return formatter.format(date);
  } catch {
    return toPersianDigits(dateStr);
  }
}
