import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  createdAt: string;
  status?:string;
  user?: {
    name?: string;
    email?: string;
  };
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState('');
  const [view, setView] = useState<'menu' | 'orders' | 'admin'>('menu');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = `http://localhost:3333/auth/${isLogin ? 'login' : 'register'}`;

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message);

      if (isLogin) {
        setToken(data.token);
        setIsAuthenticated(true);
        setMessage('Login bem-sucedido!');
        if (data.name) setName(data.name);
        if (data.role) setRole(data.role);
      } else {
        setMessage(data.message);
        setIsLogin(true);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function fetchAdminOrders() {
  try {
    const res = await fetch('http://localhost:3333/orders/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log('Pedidos admin:', data); // Adicione este log
    if (!res.ok) throw new Error(data.error || data.message);
    setOrders(data);
    setView('admin');
  } catch (err) {
    console.error('Erro ao buscar pedidos admin:', err);
  }
}

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchProducts() {
      try {
        const res = await fetch('http://localhost:3333/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      }
    }

    fetchProducts();
  }, [isAuthenticated]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
    });
  }

  async function finalizeOrder() {
    try {
      const res = await fetch('http://localhost:3333/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message);

      alert('Pedido finalizado com sucesso!');
      setCart([]);
      fetchOrders();
      setView('orders');
    } catch (err: any) {
      alert('Erro ao finalizar pedido: ' + err.message);
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch('http://localhost:3333/orders/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      setOrders(data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`http://localhost:3333/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      // Atualize a lista correta de pedidos
      if (view === 'admin') {
        await fetchAdminOrders();
      } else {
        await fetchOrders();
      }
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  }

  function handleLogout() {
    const confirmed = window.confirm('Tem certeza que deseja sair?');
    if (!confirmed) return;

    setToken('');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setName('');
    setCart([]);
    setProducts([]);
    setMessage('');
    setOrders([]);
    setView('menu');
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-sm"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            {isLogin ? 'Login' : 'Cadastro'}
          </h2>

          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="w-full p-2 mb-4 border rounded"
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-blue-500 text-sm underline w-full text-center"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>

          {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🍽️ Cardápio</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">👤 {name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setView('menu')}
          className={`mr-2 px-4 py-2 rounded ${view === 'menu' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}
        >
          Cardápio
        </button>
        <button
          onClick={() => {
            setView('orders');
            fetchOrders();
          }}
          className={`px-4 py-2 rounded ${view === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}
        >
          Meus Pedidos
        </button>
        {role === 'admin' && (
          <button
            onClick={fetchAdminOrders}
            className={`ml-2 px-4 py-2 rounded ${view === 'admin' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border'}`}
          >
            Painel Admin
          </button>
        )}
      </div>

      {view === 'menu' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-md rounded p-4 flex flex-col justify-between"
              >
                <img
                  src={`https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="mb-2 rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description || 'Sem descrição'}</p>
                  <p className="text-blue-600 font-bold">R$ {product.price.toFixed(2)}</p>
                  <p className="text-sm italic">Categoria: {product.category}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-4 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                >
                  Adicionar ao carrinho
                </button>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="mt-8 bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">🛒 Carrinho</h2>
              <ul>
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-center mb-2">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                      >
                        -
                      </button>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-bold">
                Total: R${' '}
                {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
              <button
                onClick={finalizeOrder}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Finalizar pedido
              </button>
            </div>
          )}
        </>
      )}

      {view === 'orders' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">📦 Meus Pedidos</h2>
          {orders.length === 0 ? (
            <p>Você ainda não tem pedidos.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
              <li key={order.id} className="bg-white p-4 rounded shadow">
                <p className="font-bold mb-2">
                  Pedido em {new Date(order.createdAt).toLocaleString()}
                </p>

                {/* Mostrar status */}
                <p className="text-sm mb-2">
                  Status:{' '}
                  {role === 'admin' ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="preparando">Preparando</option>
                      <option value="entregue">Entregue</option>
                      <option value="em rota">Em rota</option>
                    </select>
                  ) : (
                    <span className="italic">{order.status || 'pendente'}</span>
                  )}
                </p>
  
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.name} x{item.quantity} — R$ {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === 'admin' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">📊 Painel Admin</h2>
          {orders.length === 0 ? (
            <p>Sem pedidos para mostrar.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="bg-white p-4 rounded shadow">
                  <p className="font-bold mb-2">
                    Pedido em {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm mb-2">
                    Cliente: {order.user?.name || 'Desconhecido'} - {order.user?.email}
                  </p>
                  <p className="text-sm mb-2">
                    Status:{' '}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="preparando">Preparando</option>
                      <option value="entregue">Entregue</option>
                      <option value="em rota">Em rota</option>
                    </select>
                  </p>
  
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm">
                        {item.name} x{item.quantity} — R$ {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
