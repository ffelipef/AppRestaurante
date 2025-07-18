export type OrderStatus = 'pendente' | 'em preparo' | 'pronto' | 'entregue';

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  status: string;
  createdAt: Date;
}

export const orders: Order[] = [];
