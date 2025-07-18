import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getAllOrders(_req: Request, res: Response) {
    try {
    const orders = await prisma.order.findMany({
        include: {
        user: {
            select: {
            id: true,
            name: true,
            email: true,
            },
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

    const formatted = orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        user: order.user,
        status: order.status,
        items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        })),
    }));

    return res.json(formatted);
    } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar pedidos', details: error });
    }
}

export async function updateOrderStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pendente', 'em preparo', 'entregue', 'cancelado'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
    }

    try {
        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

    return res.json({ message: 'Status atualizado com sucesso', order: updated });
    } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status', details: error });
    }
}

export async function deleteOrder(req: Request, res: Response) {
    const { id } = req.params;

    try {
    await prisma.order.delete({
        where: { id },
    });

    return res.json({ message: 'Pedido removido com sucesso' });
    } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover pedido', details: error });
    }
}
