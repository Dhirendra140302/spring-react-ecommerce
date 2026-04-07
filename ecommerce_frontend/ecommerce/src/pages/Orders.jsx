import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  PENDING:    { label: 'Pending',    cls: 'badge-warning' },
  PAID:       { label: 'Paid',       cls: 'badge-success' },
  PROCESSING: { label: 'Processing', cls: 'badge-primary' },
  SHIPPED:    { label: 'Shipped',    cls: 'badge-primary' },
  DELIVERED:  { label: 'Delivered',  cls: 'badge-success' },
  CANCELLED:  { label: 'Cancelled',  cls: 'badge-danger' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading orders...</span></div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state page">
        <Package size={64} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
        <h2>No orders yet</h2>
        <p>Your order history will appear here</p>
        <Link to="/" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title">My Orders</h1>
      <div className="orders-list">
        {orders.map(order => {
          const s = STATUS_MAP[order.status] || { label: order.status, cls: 'badge-muted' };
          return (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-card-id">Order #{order.id}</div>
                  {order.createdAt && (
                    <div className="order-card-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <span className={`badge ${s.cls}`}>{s.label}</span>
              </div>
              <div className="order-card-body">
                <div className="order-items-list">
                  {order.items?.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span>{item.product?.name ?? 'Product'}</span>
                      <span>× {item.quantity}</span>
                      <span>${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-card-footer">
                  <div className="order-address">
                    <MapPin size={13} /> {order.address}
                  </div>
                  <div>
                    <div className="order-total-label">Order Total</div>
                    <div className="order-total-value">${(order.totalAmount ?? 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
