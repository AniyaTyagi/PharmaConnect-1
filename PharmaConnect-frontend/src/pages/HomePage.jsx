import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Package, Shield, Truck, Search, Heart } from "lucide-react";
import axios from "axios";
import "../styles/home.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/products/public`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = () => {
    navigate("/login");
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-pharma">PHARMA</span>
            <span className="logo-connect">CONNECT</span>
          </h1>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login / Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Your Trusted B2B Pharmaceutical Marketplace</h2>
          <p className="hero-subtitle">
            Connect with verified suppliers, manufacturers, and buyers in the pharmaceutical industry
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h3 className="section-title">Why Choose PharmaConnect?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h4>Verified Suppliers</h4>
            <p>All suppliers are verified and certified for quality assurance</p>
          </div>
          <div className="feature-card">
            <Package className="feature-icon" />
            <h4>Wide Product Range</h4>
            <p>Access thousands of pharmaceutical products and medical supplies</p>
          </div>
          <div className="feature-card">
            <Truck className="feature-icon" />
            <h4>Fast Delivery</h4>
            <p>Reliable logistics and timely delivery across the country</p>
          </div>
          <div className="feature-card">
            <ShoppingCart className="feature-icon" />
            <h4>Easy Ordering</h4>
            <p>Simple and secure ordering process with multiple payment options</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <h3 className="section-title">Browse Our Products</h3>
        
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">No products found</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.slice(0, 12).map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-header">
                  <span className="product-category">{product.category}</span>
                  <Heart className="wishlist-icon" onClick={handleAddToCart} />
                </div>
                <h4 className="product-name">{product.name}</h4>
                <p className="product-brand">{product.brand}</p>
                <p className="product-manufacturer">{product.manufacturer}</p>
                <div className="product-footer">
                  <span className="product-price">₹{product.price}</span>
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 PharmaConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
