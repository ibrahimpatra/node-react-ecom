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
                res.data.products.map(async ({ id, quantity }) => {
                    const response = await axios.get(`http://localhost:3000/products/${id}`);
                    const price = Number(response.data.price) || 0; // Fallback to 0 if price is invalid
                    return {
                        ...response.data,
                        quantity,
                        price,
                        totalPrice: price * quantity, // Calculate total price
                    };
                })
            );

            setCartProducts(productDetails);
            calculateCartSummary(productDetails);
        } catch (error) {
            console.error("Error fetching cart:", error);
            alert("Failed to fetch cart. Please try again.");
        }
    };

    const calculateCartSummary = (products) => {
        const total = products.reduce((acc, product) => acc + (product.totalPrice || 0), 0);
        const totalQty = products.reduce((acc, product) => acc + product.quantity, 0);

        setCartTotal(total.toFixed(2)); // Ensure total is a string with 2 decimal places
        setTotalQuantity(totalQty);
    };

    const updateQuantity = async (productId, change) => {
        try {
            setCartProducts((prev) =>
                prev.map((product) =>
                    product.id === productId ? { ...product, isUpdating: true } : product
                )
            );

            const res = await axios.put(
                "http://localhost:3000/cart",
                { productId, change },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const updatedProducts = await Promise.all(
                res.data.products.map(async ({ id, quantity }) => {
                    const response = await axios.get(`http://localhost:3000/products/${id}`);
                    const price = Number(response.data.price) || 0; // Ensure valid price
                    return {
                        ...response.data,
                        quantity,
                        price,
                        totalPrice: price * quantity,
                    };
                })
            );

            setCartProducts(updatedProducts);
            calculateCartSummary(updatedProducts);
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert("Failed to update quantity. Please try again.");
        } finally {
            setCartProducts((prev) =>
                prev.map((product) =>
                    product.id === productId ? { ...product, isUpdating: false } : product
                )
            );
        }
    };

    const removeProductFromCart = async (productId) => {
        try {
            const updatedCart = cartProducts.filter((product) => product.id !== productId);
            setCartProducts(updatedCart);
            calculateCartSummary(updatedCart);

            await axios.delete("http://localhost:3000/cart", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                data: { productId },
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
    
            const orderData = {
                ...orderDetails,
                products: cartProducts.map(({ id, quantity, totalPrice }) => ({
                    id,
                    quantity,
                    totalPrice,
                })),
                totalPrice: parseFloat(cartTotal),
                totalQuantity,
            };
    
            await axios.post("http://localhost:3000/order", orderData, {
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
                                <p>Price: ${product.price.toFixed(2)}</p>
                                <p>Quantity: {product.quantity}</p>
                                <p className="total">Total: ${(product.totalPrice || 0).toFixed(2)}</p>
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
                        <p>Cart Total: ${cartTotal}</p>
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
                total={parseFloat(cartTotal)} // Pass the numeric value
                    totalQuantity={totalQuantity}
                    onPlaceOrder={handlePlaceOrder}
                    onCancel={() => setShowCheckoutForm(false)}
                />
            )}
        </div>
    );
};

export default Cart;
