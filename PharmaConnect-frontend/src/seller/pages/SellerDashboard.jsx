import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingCart, Package, Clock, Activity, TrendingUp } from "lucide-react";
import SellerSidebar from "../components/SellerSidebar";
import SellerHeader from "../components/SellerHeader";
import StatsCard from "../components/StatsCard";
import axiosInstance from "../../utils/axiosInstance";

const STATUS_CLS = {
  pending:   "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axiosInstance.get("/api/orders").then((r) => setOrders(r.data)).catch(() => {});
    axiosInstance.get("/products").then((r) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setProducts(r.data.filter((p) => p.seller?._id === user.id));
    }).catch(() => {});
  }, []);

  const recentOrders = orders.slice(0, 5);
  const stats = {
    totalRevenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0),
    totalOrders:    orders.length,
    productsListed: products.length,
    pendingOrders:  orders.filter((o) => o.status === "pending").length,
  };

  const statCards = [
    { title: "Total Revenue",   value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { title: "Total Orders",    value: stats.totalOrders,    icon: ShoppingCart, bg: "bg-blue-50",   iconBg: "bg-blue-100",   iconColor: "text-blue-500" },
    { title: "Products Listed", value: stats.productsListed, icon: Package,      bg: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-500" },
    { title: "Pending Orders",  value: stats.pendingOrders,  icon: Clock,        bg: "bg-yellow-50", iconBg: "bg-yellow-100", iconColor: "text-yellow-500" },
  ];

  const quickActions = [
    { key: "products", label: "Manage Products", sub: `${stats.productsListed} products listed`, icon: Package,     bg: "bg-emerald-50", iconBg: "bg-emerald-500", path: "/seller/products" },
    { key: "orders",   label: "Process Orders",  sub: `${stats.pendingOrders} pending orders`,  icon: ShoppingCart, bg: "bg-blue-50",    iconBg: "bg-blue-500",    path: "/seller/orders" },
    { key: "analytics",label: "View Analytics",  sub: "Performance insights",                   icon: TrendingUp,   bg: "bg-purple-50",  iconBg: "bg-purple-500",  path: "/seller/analytics" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar active="dashboard" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <SellerHeader />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Seller Dashboard</h1>
              <p className="text-xs text-gray-400">Overview of your sales and inventory</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {statCards.map((s) => <StatsCard key={s.title} {...s} />)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
                </div>
                {orders.length > 0 && (
                  <button onClick={() => navigate("/seller/orders")} className="text-xs text-emerald-600 hover:underline">View all</button>
                )}
              </div>
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <ShoppingCart size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                      <div>
                        <p className="text-xs font-semibold text-gray-700">#{String(o._id).slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-gray-400">{o.buyer?.name || "Buyer"} · {o.items?.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800">₹{o.total?.toLocaleString()}</p>
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
                {quickActions.map(({ key, label, sub, icon: Icon, bg, iconBg, path }) => (
                  <button key={key} onClick={() => navigate(path)}
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

export default SellerDashboard;
