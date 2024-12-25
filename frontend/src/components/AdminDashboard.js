import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // Flag for edit mode
    const [editProduct, setEditProduct] = useState(null); // Product being edited
    const [newProduct, setNewProduct] = useState({ name: '', price: '' }); // New product form state

    const navigate = useNavigate();

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
    
            const [productsRes, usersRes] = await Promise.all([
                fetch('http://localhost:3000/admin/products', { headers }),
                fetch('http://localhost:3000/admin/users', { headers }),
            ]);
    
            if (!productsRes.ok || !usersRes.ok) {
                throw new Error('Failed to fetch admin data');
            }
    
            setProducts(await productsRes.json());
            setUsers(await usersRes.json());
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
            navigate('/auth'); // Redirect non-admin users
        } else {
            fetchAdminData();
        }
    }, [navigate]);

    const handleDeleteProduct = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/admin/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(products.filter(product => product.id !== id));
        } catch (error) {
            console.error('Failed to delete product', error);
        }
    };

    const handleEditProduct = (product) => {
        setIsEditing(true);
        setEditProduct(product);
        setNewProduct({ name: product.name, price: product.price });
    };

    const handleSaveProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                // Update product
                await fetch(`http://localhost:3000/admin/products/${editProduct.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newProduct),
                });
                setProducts(
                    products.map(product =>
                        product.id === editProduct.id ? { ...product, ...newProduct } : product
                    )
                );
                setIsEditing(false);
                setEditProduct(null);
            } else {
                // Add new product
                const response = await fetch('http://localhost:3000/admin/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(newProduct),
                });
                const createdProduct = await response.json();
                setProducts([...products, createdProduct]);
            }
            setNewProduct({ name: '', price: '' });
        } catch (error) {
            console.error('Failed to save product', error);
        }
    };

    const handleEditUser = async (id, updates) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3000/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });
            setUsers(users.map(user => (user.id === id ? { ...user, ...updates } : user)));
        } catch (error) {
            console.error('Failed to edit user', error);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Admin Dashboard</h1>

            {/* Add/Edit Product Form */}
            <div>
                <h2>{isEditing ? 'Edit Product' : 'Add Product'}</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveProduct();
                    }}
                >
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Product Price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                    />
                    <button type="submit">{isEditing ? 'Save Changes' : 'Add Product'}</button>
                </form>
            </div>

            {/* Product List */}
            <h2>Manage Products</h2>
            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        {product.name} - ${product.price}
                        <button onClick={() => handleEditProduct(product)}>Edit</button>
                        <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {/* User List */}
            <h2>Manage Users</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.email} - {user.isAdmin ? 'Admin' : 'User'}
                        <button onClick={() => handleEditUser(user.id, { isAdmin: !user.isAdmin })}>
                            Toggle Admin
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
