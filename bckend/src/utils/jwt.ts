import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET não definida nas variáveis de ambiente');
}

export function generateToken(payload: object) {
  return jwt.sign(payload, secret as string, { expiresIn: '10h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret as string);
}
