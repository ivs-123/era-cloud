import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

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
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const chr = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `ak_${Math.abs(hash).toString(36)}`;
}
