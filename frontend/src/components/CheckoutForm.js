import React, { useState } from "react";
import './CheckoutForm.css';

const CheckoutForm = ({ total, totalQuantity, onPlaceOrder, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        paymentMethod: "COD",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onPlaceOrder({ ...formData });
    };

    return (
        <div className="checkout-form">
            <h2>Checkout</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Phone:
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Address:
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Payment Method:
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                    >
                        <option value="COD">Cash on Delivery</option>
                    </select>
                </label>

                <div className="order-summary">
                    <p>Total Quantity: {totalQuantity}</p>
                    <p>Cart Total: ${total.toFixed(2)}</p>
                </div>

                <button type="submit">Place Order</button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;
