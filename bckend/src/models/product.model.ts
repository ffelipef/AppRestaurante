export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export const products: Product[] = [
  {
      id: '1', name: 'Pizza Margherita', price: 35.0, category: 'Pizza',
      description: ""
  },
  {
      id: '2', name: 'Hambúrguer Artesanal', price: 28.5, category: 'Lanche',
      description: ""
  },
  {
      id: '3', name: 'Suco de Laranja', price: 8.0, category: 'Bebida',
      description: ""
  },
];
