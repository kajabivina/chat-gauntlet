import { createHmac, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "cg_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function sign(value: string): string {
  const secret = process.env.ADMIN_SECRET ?? "fallback-dev-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function generateToken(): string {
  return sign(process.env.ADMIN_PASSWORD ?? "");
}

export function verifyToken(token: string): boolean {
  const expected = generateToken();
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
