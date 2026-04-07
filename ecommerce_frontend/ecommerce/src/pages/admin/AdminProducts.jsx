import { useState, useEffect } from 'react';
import api, { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', price: '', description: '', category: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () =>
    api.get('/products')
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load products'));

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }
    if (isNaN(stock) || stock < 0) { toast.error('Enter a valid stock quantity'); return; }

    const payload = { ...form, price, stock };
    const data = new FormData();
    data.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (image) data.append('image', image);

    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/admin/products/${editId}`, data);
        toast.success('Product updated!');
      } else {
        await api.post('/admin/products', data);
        toast.success('Product added!');
      }
      setForm(EMPTY_FORM);
      setImage(null);
      setEditId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name ?? '',
      price: p.price ?? '',
      description: p.description ?? '',
      category: p.category ?? '',
      stock: p.stock ?? '',
    });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setImage(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Products</h2>
        <button
          onClick={() => showForm ? handleCancel() : setShowForm(true)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            placeholder="Product name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price (₹)"
            min="0"
            step="0.01"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock quantity"
            min="0"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
          />
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : (editId ? 'Update Product' : 'Add Product')}
          </button>
        </form>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <img
                    src={p.image ? `${BASE_URL}${p.image}` : 'https://placehold.co/50x50?text=?'}
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                    alt={p.name}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.category ?? '—'}</td>
                <td>₹{p.price?.toLocaleString()}</td>
                <td>{p.stock ?? '—'}</td>
                <td>
                  <button onClick={() => handleEdit(p)} className="btn-outline small">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger small">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
