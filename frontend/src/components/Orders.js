import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Orders.css'; // Importing the CSS file

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

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card" key={order.id}>
              <h3 className="order-title">Order #{order.id}</h3>
              <div className="order-details">
                <p className="order-total">Total: <span className="order-price">${order.totalPrice}</span></p>
                <p className="order-quantity">Quantity: {order.totalQuantity}</p>
                <p className="order-date">Placed on: {order.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default Orders;
