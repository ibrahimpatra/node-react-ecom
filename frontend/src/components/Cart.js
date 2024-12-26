import React, { useState, useEffect } from "react";
import axios from "axios";

const Cart = () => {
    const [cartProducts, setCartProducts] = useState([]);

    useEffect(() => {
        fetchCartProducts();
    }, []);

    const fetchCartProducts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You need to log in to view your cart.");
                return;
            }

            const res = await axios.get("http://localhost:3000/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const productIds = res.data.products;

            // Fetch product details for cart items
            const productDetails = await Promise.all(
                productIds.map((id) => axios.get(`http://localhost:3000/products/${id}`))
            );

            setCartProducts(productDetails.map((response) => response.data));
        } catch (error) {
            console.error("Error fetching cart:", error);
            alert("Failed to fetch cart. Please try again.");
        }
    };

    return (
        <div className="cart">
            <h2>Your Cart</h2>
            {cartProducts.length > 0 ? (
                <div className="cart-products">
                    {cartProducts.map((product) => (
                        <div key={product.id} className="cart-product">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Price: ${product.price}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
};

export default Cart;
