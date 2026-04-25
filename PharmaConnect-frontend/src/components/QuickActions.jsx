import React from "react";
import "../styles/quickactions.css";

const QuickActions = () => {
  return (
    <div className="quick-actions">
      <div className="section-header">
        <span className="section-icon">⚡</span>
        <h3>Quick Actions</h3>
      </div>
      <div className="action-card blue">
        <div className="action-icon">🛍️</div>
        <div className="action-content">
          <h4>Browse Products</h4>
          <p>Discover medical supplies</p>
        </div>
      </div>
      <div className="action-card green">
        <div className="action-icon">🛒</div>
        <div className="action-content">
          <h4>View Cart</h4>
          <p>0 items in cart</p>
        </div>
      </div>
      <div className="action-card purple">
        <div className="action-icon">📍</div>
        <div className="action-content">
          <h4>Track Orders</h4>
          <p>View order status</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
