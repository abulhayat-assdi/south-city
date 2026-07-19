import bcrypt from 'bcryptjs';

// Spec §5/§13: bcrypt cost >= 12. (argon2 is the alternative; bcryptjs is pure-JS
// so it builds identically on Windows dev and the Alpine production image.)
const COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Generate a readable temporary password for admin-created accounts (spec §5). */
export function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `SC-${pick(4)}-${pick(4)}`;
}
