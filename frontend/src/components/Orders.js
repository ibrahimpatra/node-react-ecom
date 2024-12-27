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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Firestore stores timestamp as seconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length > 0 ? (
        orders.map(order => (
          <div key={order.id}>
            <h3>Order #{order.id}</h3>
            <p>Total: ${order.totalPrice}</p>
            <p>Quantity: {order.totalQuantity}</p>
            <p>Placed on: {order.createdAt}</p>
          </div>
        ))
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default Orders;
