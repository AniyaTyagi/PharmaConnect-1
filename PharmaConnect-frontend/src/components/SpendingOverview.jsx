import React from "react";
import "../styles/spendingoverview.css";

const MONTHLY_BUDGET = 50000;

const SpendingOverview = ({ orders = [] }) => {
  const total = orders.reduce((sum, o) => sum + o.total, 0);
  const pct = Math.min(Math.round((total / MONTHLY_BUDGET) * 100), 100);

  return (
    <div className="spending-overview">
      <div className="spending-header">
        <span className="spending-icon">📈</span>
        <h3>Spending Overview</h3>
      </div>
      <div className="spending-content">
        <h2>₹{total.toLocaleString()} <span>total spent</span></h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
        <p>{pct}% of monthly budget utilized</p>
      </div>
    </div>
  );
};

export default SpendingOverview;
