import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);

app.use('/orders', orderRoutes);

app.use('/auth', authRoutes);  

console.log('Chave JWT carregada:', process.env.JWT_SECRET);
app.get('/', (_req, res) => res.send('a API do Restaurante está funcionando!'));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
