import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function updateOrderStatusUser(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ['pendente', 'preparando', 'entregue', 'em rota'];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status},
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return res.json({ message: 'Status atualizado com sucesso', order: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status do pedido', details: error });
  }
}


export async function createOrder(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Dados inválidos para o pedido' });
  }


  const validProducts = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((item: any) => item.productId),
      },
    },
  });

  if (validProducts.length !== items.length) {
    return res.status(400).json({ error: 'Um ou mais produtos são inválidos' });
  }

  const orderItems = items.map((item: any) => ({
    productId: item.productId,
    quantity: item.quantity || 1,
  }));

  try {
    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return res.status(201).json({ message: 'Pedido criado com sucesso', order });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar pedido', details: error });
  }
}

export async function getOrderHistory(req: Request, res: Response) {
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
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

    const formatted = orders.map((order: typeof orders[number]) => ({
      id: order.id,
      createdAt: order.createdAt,
      items: order.items.map((item: typeof order.items[number]) => ({
        id: item.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar histórico de pedidos', details: error });
  }
}

export async function getAllOrders(req: Request, res: Response) {
  const role = (req as any).role;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
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
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar todos os pedidos', details: error });
  }
}
export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['pendente', 'em preparo', 'entregue', 'em rota'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: 'Status atualizado com sucesso', order: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status do pedido', details: error });
  }
}
