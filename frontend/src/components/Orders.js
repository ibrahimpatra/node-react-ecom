import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3000/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { // Customize this format as needed
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div>
            <h2>Your Orders</h2>
            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order.id}>
                        <h3>Order #{order.id}</h3>
                        <p>Total: ${order.totalPrice.toFixed(2)}</p>
                        <p>Quantity: {order.totalQuantity}</p>
                        <p>Placed on: {formatDate(order.createdAt)}</p>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default Orders;
