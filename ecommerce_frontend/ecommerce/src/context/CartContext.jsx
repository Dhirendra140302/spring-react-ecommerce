import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setCart([]); return; }
    setCartLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Only clear cart on auth errors; keep stale data on network errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        setCart([]);
      }
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    // Throws on error so callers can show toast
    await api.post('/cart', { productId: Number(productId), quantity });
    await fetchCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    await fetchCart();
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartTotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{ cart, cartLoading, addToCart, updateQuantity, removeItem, fetchCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
