import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserRoleType } from '../db/schema.js';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: UserRoleType[];
  name: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
