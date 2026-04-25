import React from "react";
import "../styles/recentorders.css";

const RecentOrders = () => {
  return (
    <div className="recent-orders">
      <div className="section-header">
        <span className="section-icon">🎯</span>
        <h3>Recent Orders</h3>
      </div>
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h4>No orders yet</h4>
        <p>Start browsing our medical products</p>
        <button className="browse-btn">🛍️ Browse Products</button>
      </div>
    </div>
  );
};

export default RecentOrders;
