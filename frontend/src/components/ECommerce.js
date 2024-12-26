import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ECommerce.css";

const ECommerce = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    brandId: "",
    categoryId: "",
  });
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBrand = async () => {
    if (!newBrand.trim()) {
      alert("Please enter a brand name.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/brands", { name: newBrand });
      setBrands((prev) => [...prev, res.data]);
      setNewBrand("");
    } catch (error) {
      console.error("Error adding brand:", error);
      alert("Failed to add brand. Please try again.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/categories", { name: newCategory });
      setCategories((prev) => [...prev, res.data]);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleAddOrUpdateProduct = async () => {
    if (!form.name || !form.description || !form.price || !form.brandId || !form.categoryId) {
      alert("Please fill out all fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to log in to proceed.");
      return;
    }

    try {
      const productData = {
        name: form.name,
        description: form.description,
        price: form.price,
        brandId: form.brandId,
        categoryId: form.categoryId,
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:3000/products/${currentProductId}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const response = await axios.post(
          "http://localhost:3000/products",
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProducts((prevProducts) => [...prevProducts, response.data]);
      }

      resetForm();
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      brandId: product.brandId,
      categoryId: product.categoryId,
    });
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  

  const resetForm = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setForm({ name: "", description: "", price: "", brandId: "", categoryId: "" });
  };

  return (
    <div className="ecommerce">
      <div className="product-form">
        <h2>{isEditing ? "Edit Product" : "Add Product"}</h2>
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
        <select name="brandId" value={form.brandId} onChange={handleFormChange}>
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          placeholder="Add New Brand"
        />
        <button onClick={handleAddBrand}>Add Brand</button>
        <select name="categoryId" value={form.categoryId} onChange={handleFormChange}>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add New Category"
        />
        <button onClick={handleAddCategory}>Add Category</button>
        <button onClick={handleAddOrUpdateProduct}>
          {isEditing ? "Update Product" : "Add Product"}
        </button>
        {isEditing && <button onClick={resetForm}>Cancel</button>}
      </div>

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
