import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import prisma from '../lib/prisma';

export async function register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' });
    
    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({  
        data: {
            name,
            email,
            password: hashed,
            role: 'customer',
        }
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso' });
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = generateToken({ id: user.id, role: user.role });
    return res.json({ token, name: user.name, role: user.role });
}

export async function getAllOrders(req: Request, res: Response) {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const formatted = orders.map(order => ({
            id: order.id,
            createdAt: order.createdAt,
            user: order.user,
            items: order.items.map(item => ({
                id: item.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
            })),
        }));

        return res.json(formatted);
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao buscar todos os pedidos',
            details: error,
        });
    }
}

