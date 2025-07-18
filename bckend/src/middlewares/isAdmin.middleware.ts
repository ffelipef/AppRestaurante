import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
    const userId = (req as any).userId;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }

    next();
    } catch (error) {
    return res.status(500).json({ error: 'Erro no middleware de admin', details: error });
    }
}
