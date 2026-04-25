import React from "react";
import "../styles/statscard.css";

const StatsCard = ({ title, value, icon, bgColor }) => {
  return (
    <div className="stats-card" style={{ backgroundColor: bgColor }}>
      <div className="stats-content">
        <h4>{title}</h4>
        <h2>{value}</h2>
      </div>
      <div className="stats-icon">{icon}</div>
    </div>
  );
};

export default StatsCard;
