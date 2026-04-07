import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Smartphone, ArrowLeft, Shield } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const [form, setForm] = useState({ address: '', phone: '', city: '', pincode: '' });
  const [payMethod, setPayMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const { cart, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="empty-state page">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const shipping = cartTotal >= 50 ? 0 : 5.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const fullAddress = `${form.address}, ${form.city} - ${form.pincode}`;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!form.address || !form.phone || !form.city || !form.pincode) {
      toast.error('Please fill all delivery details'); return;
    }
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh.'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/orders/create', { address: fullAddress, phone: form.phone });
      const { orderId, amount, key } = res.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'SmartCart',
        description: 'Order Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/orders/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('🎉 Payment successful! Order placed.');
            await fetchCart();
            navigate('/orders');
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: { contact: form.phone },
        theme: { color: '#2563eb' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed. Try again.'); setLoading(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
        <Link to="/cart" className="btn btn-ghost btn-sm"><ArrowLeft size={15} /> Back to Cart</Link>
        <h1 className="section-title" style={{ marginBottom: 0 }}>Checkout</h1>
      </div>

      <form onSubmit={handlePayment}>
        <div className="checkout-grid">
          <div>
            {/* Delivery */}
            <div className="checkout-section">
              <div className="checkout-section-title">
                <span className="step-num">1</span>
                <MapPin size={16} /> Delivery Address
              </div>
              <div className="form-grid-2">
                <div className="form-group span-2">
                  <label className="form-label">Street Address</label>
                  <input className="form-input" placeholder="House no., Street, Area" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="City" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input className="form-input" placeholder="PIN Code" value={form.pincode}
                    onChange={e => setForm({ ...form, pincode: e.target.value })} required />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" placeholder="10-digit mobile number"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    pattern="[0-9]{10}" title="Enter 10-digit number" required />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-section">
              <div className="checkout-section-title">
                <span className="step-num">2</span>
                <CreditCard size={16} /> Payment Method
              </div>
              <div className="payment-methods">
                {[
                  { id: 'razorpay', label: 'Razorpay (Cards, UPI, Wallets)', icon: '💳' },
                  { id: 'upi', label: 'UPI / Google Pay / PhonePe', icon: '📱' },
                  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                ].map(m => (
                  <label key={m.id} className={`payment-method ${payMethod === m.id ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={m.id} checked={payMethod === m.id}
                      onChange={() => setPayMethod(m.id)} />
                    <span className="payment-method-label">{m.label}</span>
                    <span className="payment-method-icon">{m.icon}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="checkout-section">
              <div className="checkout-section-title">
                <span className="step-num">3</span> Order Review
              </div>
              <div>
                {cart.map(item => {
                  const p = item.product;
                  const imgSrc = p?.image?.startsWith('http') ? p.image : `http://localhost:8080${p?.image}`;
                  return (
                    <div key={item.id} className="order-review-item">
                      <div className="order-review-img">
                        <img src={imgSrc} alt={p?.name} />
                      </div>
                      <span className="order-review-name">{p?.name} × {item.quantity}</span>
                      <span className="order-review-price">${((p?.price ?? 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                {[['Subtotal', `$${cartTotal.toFixed(2)}`], ['Shipping', shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`], ['Tax', `$${tax.toFixed(2)}`]].map(([l, v]) => (
                  <div key={l} className="summary-line"><span>{l}</span><span>{v}</span></div>
                ))}
                <div className="summary-line total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.25rem' }} disabled={loading}>
                {loading ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
              </button>
              <div className="cart-secure" style={{ marginTop: '.75rem' }}>
                <Shield size={13} /> 100% Secure & Encrypted
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
