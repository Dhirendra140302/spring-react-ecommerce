import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand"><ShoppingBag size={20} /> SmartCart</div>
          <p className="footer-desc">Your one-stop destination for quality products at unbeatable prices. Shop smart, live better.</p>
        </div>
        <div>
          <div className="footer-col-title">Shop</div>
          <div className="footer-links">
            <Link to="/">All Products</Link>
            <Link to="/?cat=electronics">Electronics</Link>
            <Link to="/?cat=jewelery">Jewellery</Link>
            <Link to="/?cat=men's clothing">Men's Fashion</Link>
            <Link to="/?cat=women's clothing">Women's Fashion</Link>
          </div>
        </div>
        <div>
          <div className="footer-col-title">Account</div>
          <div className="footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </div>
        </div>
        <div>
          <div className="footer-col-title">Support</div>
          <div className="footer-links">
            <a href="#">Help Center</a>
            <a href="#">Track Order</a>
            <a href="#">Returns</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {new Date().getFullYear()} SmartCart. All rights reserved.</span>
          <div className="footer-payments">
            <span style={{ fontSize: '.78rem', marginRight: '.3rem' }}>We accept:</span>
            {['Visa', 'Mastercard', 'UPI', 'Razorpay'].map(p => (
              <span key={p} className="payment-chip">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
