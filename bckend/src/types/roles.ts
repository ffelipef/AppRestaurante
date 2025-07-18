export type OrderWithItemsAndProduct = {
  id: string;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }[];
};
