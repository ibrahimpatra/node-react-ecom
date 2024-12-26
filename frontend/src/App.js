import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login'; // Import the Login component
import Navbar from './components/Navbar'; // Import the Navbar component
import TaskManager from './components/TaskManager'; // Import the TaskManager component
import ECommerce from './components/ECommerce'; // Import the ECommerce component
import Cart from './components/Cart';

const App = () => {
    const [errorMessage, setErrorMessage] = useState(''); // State to manage error messages
    const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(''), 5000); // Hide error after 5 seconds
    };

    return (
        <Router>
            <div className="App">
                {isAuthenticated && <Navbar />} {/* Show Navbar only when logged in */}
                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )} {/* Display error messages */}
                <Routes>
                    <Route
                        path="/auth"
                        element={!isAuthenticated ? <Login showError={showError} /> : <Navigate to="/tasks" />}
                    />
                    <Route
                        path="/tasks"
                        element={isAuthenticated ? <TaskManager /> : <Navigate to="/auth" />}
                    />
                    <Route
                        path="/ecommerce"
                        element={isAuthenticated ? <ECommerce /> : <Navigate to="/auth" />}
                    />
                    <Route
                        path="/cart"
                        element={isAuthenticated ? <Cart /> : <Navigate to="/auth" />}
                    />
                    <Route
                        path="*"
                        element={<Navigate to={isAuthenticated ? "/tasks" : "/auth"} />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
