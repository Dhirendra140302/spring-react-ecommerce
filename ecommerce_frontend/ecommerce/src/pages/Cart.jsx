import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, cartLoading, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQty = async (itemId, qty) => {
    try {
      await updateQuantity(itemId, qty);
      // qty <= 0 removes the item (handled by backend + fetchCart)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="empty-state page">
        <ShoppingBag size={64} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
        <h2>Please login to view your cart</h2>
        <p>Sign in to access your saved items</p>
        <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="loading-wrap" style={{ minHeight: '40vh' }}>
        <div className="spinner" /><span>Loading cart...</span>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-state page">
        <ShoppingBag size={64} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet</p>
        <Link to="/" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    );
  }

  const shipping = cartTotal >= 50 ? 0 : 5.99;
  const tax = +(cartTotal * 0.08).toFixed(2);
  const total = +(cartTotal + shipping + tax).toFixed(2);

  return (
    <div className="cart-page">
      <h1 className="section-title">
        Shopping Cart{' '}
        <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 400 }}>
          ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="cart-grid">
        {/* Items list */}
        <div className="cart-items-list">
          {cart.map(item => {
            const p = item.product;
            // FakeStore images are full URLs; backend-uploaded images are relative
            const imgSrc = p?.image?.startsWith('http')
              ? p.image
              : `http://localhost:8080${p?.image}`;

            return (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-img">
                  <img src={imgSrc} alt={p?.name ?? 'Product'} />
                </div>

                <div className="cart-item-body">
                  <div className="cart-item-cat">{p?.category}</div>
                  <Link to={`/product/${p?.id}`} className="cart-item-name">{p?.name}</Link>
                  <div className="cart-item-price">${p?.price?.toFixed(2)} each</div>
                </div>

                <div className="cart-item-controls">
                  <div className="qty-ctrl">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <span className="cart-item-total">
                    ${((p?.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="btn-icon"
                    onClick={() => handleRemove(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="cart-summary-card">
          <div className="cart-summary-title">Order Summary</div>

          <div className="coupon-row">
            <input placeholder="Coupon code" />
            <button className="btn btn-outline btn-sm">Apply</button>
          </div>

          <div className="summary-line">
            <span>Subtotal ({cartCount} items)</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'free' : ''}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          {shipping > 0 && (
            <div style={{ fontSize: '.78rem', color: 'var(--primary)', marginBottom: '.5rem' }}>
              Add ${(50 - cartTotal).toFixed(2)} more for free shipping
            </div>
          )}

          <div className="summary-line">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-line total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>

          <Link
            to="/"
            className="btn btn-ghost btn-full"
            style={{ marginTop: '.5rem', justifyContent: 'center' }}
          >
            Continue Shopping
          </Link>

          <div className="cart-secure">
            <Shield size={13} /> Secure checkout — SSL encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
