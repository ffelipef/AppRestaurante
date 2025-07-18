import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export async function listProducts(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produtos', details: error });
  }
}
