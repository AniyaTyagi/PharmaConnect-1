import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Clock, CheckCircle, Activity, TrendingUp } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api } from "../services/api";

const STATUS_CLS = {
  pending:   "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, cartItems: 0, pendingOrders: 0, delivered: 0, recentOrders: [] });

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {});
  }, []);

  const statCards = [
    { title: "Total Orders",   value: stats.totalOrders,   icon: Package,       bg: "bg-blue-50",    iconBg: "bg-blue-100",    iconColor: "text-blue-500" },
    { title: "Cart Items",     value: stats.cartItems,     icon: ShoppingCart,  bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: Clock,         bg: "bg-yellow-50",  iconBg: "bg-yellow-100",  iconColor: "text-yellow-500" },
    { title: "Delivered",      value: stats.delivered,     icon: CheckCircle,   bg: "bg-purple-50",  iconBg: "bg-purple-100",  iconColor: "text-purple-500" },
  ];

  const quickActions = [
    { label: "Browse Products", sub: "Discover medical supplies",        bg: "bg-blue-50",    iconBg: "bg-blue-500",    icon: Package,      path: "/products" },
    { label: "View Cart",       sub: `${stats.cartItems} items in cart`, bg: "bg-emerald-50", iconBg: "bg-emerald-500", icon: ShoppingCart, path: "/cart" },
    { label: "Track Orders",    sub: "View order status",                bg: "bg-purple-50",  iconBg: "bg-purple-500",  icon: TrendingUp,   path: "/orders" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="dashboard" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 space-y-6">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
              <p className="text-xs text-gray-400">Overview of your orders and activities</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {statCards.map((c) => (
              <div key={c.title} className={`rounded-2xl p-5 shadow-sm ${c.bg} flex flex-col gap-3`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                  <c.icon size={20} className={c.iconColor} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{c.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
                </div>
                {stats.recentOrders.length > 0 && (
                  <button onClick={() => navigate("/orders")} className="text-xs text-emerald-600 hover:underline">View all</button>
                )}
              </div>
              {stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Package size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">No orders yet</p>
                  <button onClick={() => navigate("/products")}
                    className="mt-1 text-xs font-semibold text-emerald-600 hover:underline">Browse Products</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 font-mono">#{String(o._id).slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-gray-400">{o.items.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800">₹{o.total.toLocaleString()}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[o.status] || "bg-gray-100 text-gray-500"}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                {quickActions.map(({ label, sub, icon: Icon, bg, iconBg, path }) => (
                  <button key={label} onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${bg} hover:opacity-90 transition-opacity text-left`}>
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-[11px] text-gray-400">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;
