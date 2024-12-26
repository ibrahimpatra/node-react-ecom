import React, { useState, useEffect } from "react";
import axios from "axios";
import './Cart.css';

const Cart = () => {
    const [cartProducts, setCartProducts] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);

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

            const productDetails = await Promise.all(
                res.data.products.map(({ id, quantity }) =>
                    axios.get(`http://localhost:3000/products/${id}`).then(response => ({
                        ...response.data,
                        quantity,
                    }))
                )
            );

            setCartProducts(productDetails);
            calculateCartTotal(productDetails);
        } catch (error) {
            console.error("Error fetching cart:", error);
            alert("Failed to fetch cart. Please try again.");
        }
    };

    const calculateCartTotal = (products) => {
        const total = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
        setCartTotal(total);
    };

    const updateQuantity = async (productId, change) => {
        try {
            const updatedCart = cartProducts.map((product) =>
                product.id === productId
                    ? { ...product, quantity: Math.max(product.quantity + change, 1) }
                    : product
            );
            setCartProducts(updatedCart);
            calculateCartTotal(updatedCart);

            await axios.put("http://localhost:3000/cart", { productId, change }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
        } catch (error) {
            console.error("Error updating quantity:", error);
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
                            <p>Quantity: {product.quantity}</p>
                            <p>Total: ${product.price * product.quantity}</p>
                            <button onClick={() => updateQuantity(product.id, 1)}>+</button>
                            <button onClick={() => updateQuantity(product.id, -1)}>-</button>
                        </div>
                    ))}
                    <h3>Cart Total: ${cartTotal}</h3>
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
};

export default Cart;
