import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ showError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const authenticate = () => {
        const url = `http://localhost:3000/${isRegister ? 'register' : 'login'}`;
        axios
            .post(url, { email, password })
            .then((res) => {
                if (!isRegister) {
                    localStorage.setItem('token', res.data.token);
                    window.location.reload();
                } else {
                    showError('Registration successful. Please login.');
                    setIsRegister(false);
                }
            })
            .catch((err) => {
                const message = err.response?.data?.message || 'An error occurred';
                showError(message);
            });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isRegister ? 'Register' : 'Login'}</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                />
                <button onClick={authenticate} className="auth-button">
                    {isRegister ? 'Register' : 'Login'}
                </button>
                <p
                    onClick={() => setIsRegister(!isRegister)}
                    className="toggle-auth"
                >
                    {isRegister
                        ? 'Already have an account? Login here.'
                        : 'Don’t have an account? Register here.'}
                </p>
            </div>
        </div>
    );
};

export default Login;
