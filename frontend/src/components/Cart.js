import React, { useState, useEffect } from "react";
import axios from "axios";
import './Cart.css';
import CheckoutForm from "./CheckoutForm";

const Cart = () => {
    const [cartProducts, setCartProducts] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);


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
            calculateTotalQuantity(productDetails);
        } catch (error) {
            console.error("Error fetching cart:", error);
            alert("Failed to fetch cart. Please try again.");
        }
    };

    const calculateCartTotal = (products) => {
        const total = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
        setCartTotal(total);
    };

    const calculateTotalQuantity = (products) => {
        const totalQuantity = products.reduce((acc, product) => acc + product.quantity, 0);
        setTotalQuantity(totalQuantity);
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
            calculateTotalQuantity(updatedCart);

            await axios.put("http://localhost:3000/cart", { productId, change }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const removeProductFromCart = async (productId) => {
        try {
            const updatedCart = cartProducts.filter((product) => product.id !== productId);
            setCartProducts(updatedCart);
            calculateCartTotal(updatedCart);
            calculateTotalQuantity(updatedCart);

            await axios.delete("http://localhost:3000/cart", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                data: { productId }
            });
        } catch (error) {
            console.error("Error removing product:", error);
        }
    };

    const handleCheckout = () => {
        setShowCheckoutForm(true);
    };

    const handlePlaceOrder = async (orderDetails) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:3000/order", orderDetails, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Order placed successfully!");
            setCartProducts([]);
            setShowCheckoutForm(false);
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        }
    };


    return (
        <div className="cart">
            <h2>Your Cart</h2>
            {cartProducts.length > 0 ? (
                <>
                    <div className="cart-products">
                        {cartProducts.map((product) => (
                            <div key={product.id} className="cart-product">
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>Price: ${product.price}</p>
                                <p>Quantity: {product.quantity}</p>
                                <p className="total">Total: ${product.price * product.quantity}</p>
                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(product.id, 1)}>+</button>
                                    <button onClick={() => updateQuantity(product.id, -1)}>-</button>
                                    <button onClick={() => removeProductFromCart(product.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <p>Total Quantity: <span className="total-quantity">{totalQuantity}</span></p>
                        <p>Cart Total: ${cartTotal.toFixed(2)}</p>
                        <button onClick={handleCheckout} className="checkout-button">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            ) : (
                <p className="empty-cart">Your cart is empty.</p>
            )}

            {showCheckoutForm && (
                <CheckoutForm
                    total={cartTotal}
                    totalQuantity={totalQuantity}
                    onPlaceOrder={handlePlaceOrder}
                    onCancel={() => setShowCheckoutForm(false)}
                />
            )}
        </div>
    );
};

export default Cart;
