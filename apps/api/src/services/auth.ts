import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? "era-cloud-dev-secret-change-in-production";
const JWT_EXPIRY = "24h";
const API_KEY_PREFIX = "era_";

export interface AuthPayload {
  tenantId: string;
  userId: string;
  role: string;
}

export function createToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function generateApiKey(): { key: string; prefix: string } {
  const id = nanoid(32);
  const key = `${API_KEY_PREFIX}${id}`;
  return {
    key,
    prefix: `${API_KEY_PREFIX}${id.slice(0, 8)}...${id.slice(-4)}`
  };
}

export function hashApiKey(key: string): string {
  return `ak_${createHash("sha256").update(key).digest("hex")}`;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");

  if (!salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
