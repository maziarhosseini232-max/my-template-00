import bcrypt from 'bcryptjs';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const LATIN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toLatinDigits(input: string): string {
  if (!input) return '';
  let result = String(input);
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), LATIN_DIGITS[i]);
    result = result.replace(new RegExp(ARABIC_DIGITS[i], 'g'), LATIN_DIGITS[i]);
  }
  return result;
}

export function hashPassword(password: string): string {
  const normalized = toLatinDigits(password);
  return bcrypt.hashSync(normalized, 10);
}

export function comparePassword(plain: string, hashed: string): boolean {
  if (!plain || !hashed) return false;
  // 1. Direct comparison
  if (bcrypt.compareSync(plain, hashed)) return true;
  // 2. Normalized latin digits comparison (for Persian/Arabic keyboard entry)
  const latin = toLatinDigits(plain);
  if (latin !== plain && bcrypt.compareSync(latin, hashed)) return true;
  return false;
}

