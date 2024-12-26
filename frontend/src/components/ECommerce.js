import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ECommerce.css';

const ECommerce = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', price: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:3000/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to fetch products. Please try again later.');
        }
    };
    

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async () => {
        if (!form.name || !form.description || !form.price) {
            alert('Please fill out all fields.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You need to log in to add products.');
                return;
            }
    
            const product = {
                name: form.name,
                description: form.description,
                price: form.price,
            };
    
            const response = await axios.post(
                'http://localhost:3000/products',
                product,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            setProducts((prevProducts) => [...prevProducts, response.data]);
            setForm({ name: '', description: '', price: '' });
        } catch (error) {
            console.error('Error adding product:', error);
            alert(error.response?.data?.message || 'Failed to add product. Please try again.');
        }
    };    
    
    const handleEditProduct = (product) => {
        setIsEditing(true);
        setCurrentProductId(product.id);
        setForm({ name: product.name, description: product.description, price: product.price });
    };

    const handleUpdateProduct = async () => {
        if (!form.name || !form.description || !form.price) {
            alert('Please fill out all fields.');
            return;
        }
        try {
            await axios.put(`http://localhost:3000/products/${currentProductId}`, form);
            setIsEditing(false);
            setForm({ name: '', description: '', price: '' });
            setCurrentProductId(null);
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className="ecommerce">
            {/* Form for adding/editing products */}
            <div className="product-form">
                <h2>{isEditing ? 'Edit Product' : 'Add Product'}</h2>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Product Name"
                />
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Description"
                />
                <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="Price"
                />
                <button onClick={isEditing ? handleUpdateProduct : handleAddProduct}>
                    {isEditing ? 'Update Product' : 'Add Product'}
                </button>
            </div>

            {/* Products Grid */}
            <div className="products">
                <h2>Products</h2>
                <div className="grid">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="product-card">
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>Price: ${product.price}</p>
                                <button onClick={() => handleEditProduct(product)}>Edit</button>
                                <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                            </div>
                        ))
                    ) : (
                        <p>No products available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ECommerce;
