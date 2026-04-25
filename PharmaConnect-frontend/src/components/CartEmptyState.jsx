import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cartemptystate.css";

const CartEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="cart-empty-container">
      <div className="cart-empty-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Start adding medical products to your cart to get started with your order</p>
      <button className="browse-products-btn" onClick={() => navigate("/products")}>
        🛍️ Browse Products
      </button>
    </div>
  );
};

export default CartEmptyState;
