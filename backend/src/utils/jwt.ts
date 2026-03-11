import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export interface TokenPayload {
  userId: string;
  username: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: 7200 };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: 604800 };
  return jwt.sign(payload, JWT_REFRESH_SECRET as jwt.Secret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET as jwt.Secret) as TokenPayload;
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
