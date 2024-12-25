import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token'); // Token for authenticated requests

    // Fetch Products
    const fetchProducts = async () => {
        try {
            const response = await axios.get('/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data);
        } catch (err) {
            setError('Failed to fetch products');
        }
    };

    // Add a New Product
    const handleAddProduct = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/admin/products', newProduct, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts([...products, response.data]);
            setNewProduct({ name: '', price: '', description: '' });
            setSuccess('Product added successfully');
        } catch (err) {
            setError('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    // Edit Product
    const handleEditProduct = async (id, updatedProduct) => {
        try {
            await axios.put(`/admin/products/${id}`, updatedProduct, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(products.map(p => (p.id === id ? { ...p, ...updatedProduct } : p)));
            setSuccess('Product updated successfully');
        } catch (err) {
            setError('Failed to update product');
        }
    };

    // Delete Product
    const handleDeleteProduct = async id => {
        try {
            await axios.delete(`/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(products.filter(p => p.id !== id));
            setSuccess('Product deleted successfully');
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    // Edit User Access
    const handleEditAccess = async (userId, isAdmin) => {
        try {
            await axios.put(
                `/admin/users/${userId}`,
                { isAdmin },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers(users.map(user => (user.id === userId ? { ...user, isAdmin } : user)));
            setSuccess(`User ${userId}'s admin access updated`);
        } catch (err) {
            setError('Failed to update admin access');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchUsers();
    }, []);

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            {/* Success/Error Messages */}
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {/* Product Management */}
            <section>
                <h2>Product Management</h2>
                <ul>
                    {products.map(product => (
                        <li key={product.id}>
                            <strong>{product.name}</strong> - ${product.price} <br />
                            {product.description}
                            <button onClick={() => handleEditProduct(product.id, { ...product, name: 'Updated Name' })}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
                <div className="add-product">
                    <h3>Add Product</h3>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                    <textarea
                        placeholder="Description"
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                    <button onClick={handleAddProduct} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </section>

            {/* User Management */}
            <section>
                <h2>User Management</h2>
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            <strong>{user.email}</strong> <br />
                            Admin: {user.isAdmin ? 'Yes' : 'No'}
                            <button
                                onClick={() => handleEditAccess(user.id, !user.isAdmin)}
                                style={{ marginLeft: '10px' }}
                            >
                                {user.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default AdminDashboard;
