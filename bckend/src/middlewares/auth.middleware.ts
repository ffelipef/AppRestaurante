import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

dotenv.config(); // Carrega variáveis do .env

const secret = process.env.JWT_SECRET as string;

if (!secret) {
  throw new Error('JWT_SECRET não definida nas variáveis de ambiente');
}

interface JwtPayload {
  id: string;
  role: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret) as unknown as JwtPayload;
    (req as any).userId = decoded.id;
    (req as any).role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
