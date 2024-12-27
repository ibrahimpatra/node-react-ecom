import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "./ProductForm";
import "./ECommerce.css";

const ECommerce = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to control the visibility of the ProductForm

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products. Please try again later.");
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get("http://localhost:3000/brands");
      setBrands(res.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setShowForm(true); // Show the form when editing
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddProduct = () => {
    // Toggle the visibility of the ProductForm
    setShowForm(prevState => !prevState);
    setIsEditing(false); // Ensure it's not in edit mode when adding a new product
    setCurrentProduct(null); // Clear the current product
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in to proceed.");
        return;
      }

      await axios.post(
        "http://localhost:3000/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    }
  };

  return (
    <div className="ecommerce">
      {/* Add Product Button */}
      <button className="add-product-btn" onClick={handleAddProduct}>
        {showForm ? "Cancel" : "Add Product"}
      </button>

      {/* Toggle Product Form visibility */}
      {showForm && (
        <ProductForm
          brands={brands}
          categories={categories}
          fetchProducts={fetchProducts}
          fetchBrands={fetchBrands}
          fetchCategories={fetchCategories}
          isEditing={isEditing}
          currentProduct={currentProduct}
          resetEditingState={() => {
            setIsEditing(false);
            setCurrentProduct(null);
            setShowForm(false); // Hide the form after submission or cancellation
          }}
        />
      )}

      {/* Product List */}
      <div className="products">
        <h2>Products</h2>
        <div className="grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <p>Brand: {brands.find((b) => b.id === product.brandId)?.name}</p>
                <p>Category: {categories.find((c) => c.id === product.categoryId)?.name}</p>
                <button onClick={() => handleEditProduct(product)}>Edit</button>
                <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
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
