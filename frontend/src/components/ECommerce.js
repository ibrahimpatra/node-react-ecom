import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductPage from './ProductPage';
import './ECommerce.css';

const ECommerce = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        '../images/i1.jpg', // Replace with actual paths or URLs
        '../images/i2.jpg',
        '../images/i3.jpg',
        '../images/i4.jpg'
    ];

    useEffect(() => {
        // Fetch products from the server (currently using placeholders)
        axios.get('http://localhost:3000/products').then(res => setProducts(res.data));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000); // Change slides every 3 seconds
        return () => clearInterval(interval);
    }, [slides.length]);

    const getSlideClass = (index) => {
        if (index === currentSlide) return 'active';
        if (index === (currentSlide - 1 + slides.length) % slides.length) return 'prev';
        if (index === (currentSlide + 1) % slides.length) return 'next';
        return '';
    };

    if (selectedProduct) {
        return <ProductPage product={selectedProduct} />;
    }

    return (
        <div className="ecommerce">
            {/* Slideshow */}
            <div className="slideshow">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`slide ${getSlideClass(index)}`}
                        style={{ backgroundImage: `url(${slide})` }}
                    ></div>
                ))}
            </div>

            {/* Products Grid */}
            <div className="products">
                <h2>Products</h2>
                <div className="grid">
                    {products.length > 0 ? (
                        products.map(product => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="product-image"></div>
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>Price: ${product.price}</p>
                            </div>
                        ))
                    ) : (
                        // Placeholder grids
                        Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="product-card placeholder">
                                <div className="product-image"></div>
                                <h3>Product Name</h3>
                                <p>Description</p>
                                <p>Price: $0.00</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ECommerce;
