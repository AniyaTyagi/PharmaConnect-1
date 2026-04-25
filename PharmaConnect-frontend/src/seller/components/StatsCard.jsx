import React from "react";

const StatsCard = ({ title, value, icon: Icon, bg, iconBg, iconColor, change, changeType }) => (
  <div className={`rounded-2xl p-5 shadow-sm ${bg} flex flex-col gap-3`}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <span className={`text-xs font-semibold flex items-center gap-0.5 ${changeType === "up" ? "text-emerald-600" : "text-red-500"}`}>
        {changeType === "up" ? "↗" : "↘"} {change}
      </span>
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatsCard;
