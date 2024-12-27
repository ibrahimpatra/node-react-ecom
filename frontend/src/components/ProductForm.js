import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductForm = ({
  brands,
  categories,
  fetchProducts,
  fetchBrands,
  fetchCategories,
  isEditing,
  currentProduct,
  resetEditingState,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    brandId: "",
    categoryId: "",
  });
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (isEditing && currentProduct) {
      setForm(currentProduct);
    } else {
      resetForm();
    }
  }, [isEditing, currentProduct]);

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
      fetchBrands();
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
      fetchCategories();
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
        await axios.put(`http://localhost:3000/products/${currentProduct.id}`, productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post("http://localhost:3000/products", productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      resetForm();
      fetchProducts();
      resetEditingState();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", brandId: "", categoryId: "" });
  };

  return (
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
      {isEditing && <button onClick={resetEditingState}>Cancel</button>}
    </div>
  );
};

export default ProductForm;
