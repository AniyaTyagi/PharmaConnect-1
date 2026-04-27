import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Package, ArrowLeftRight, DollarSign, Activity, TrendingUp, ShoppingCart } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import axiosInstance from "../../utils/axiosInstance";

const STATUS_CLS = {
  delivered: "bg-green-100 text-green-700",
  shipped:   "bg-purple-100 text-purple-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/admin/users"),
      axiosInstance.get("/products"),
      axiosInstance.get("/orders"),
    ]).then(([usersRes, productsRes, ordersRes]) => {
      const orders = ordersRes.data;
      setStats({
        totalUsers:    usersRes.data.count,
        totalProducts: productsRes.data.length,
        totalOrders:   orders.length,
        revenue:       orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
      });
      setRecentOrders(orders.slice(0, 4));
    }).catch(() => {});
  }, []);

  const statCards = [
    { title: "Total Users",        value: stats.totalUsers,                    icon: Users,        bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { title: "Total Products",     value: stats.totalProducts,                 icon: Package,      bg: "bg-blue-50",    iconBg: "bg-blue-100",    iconColor: "text-blue-500" },
    { title: "Total Orders",       value: stats.totalOrders,                   icon: ShoppingCart, bg: "bg-purple-50",  iconBg: "bg-purple-100",  iconColor: "text-purple-500" },
    { title: "Platform Revenue",   value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign,   bg: "bg-yellow-50",  iconBg: "bg-yellow-100",  iconColor: "text-yellow-500" },
  ];

  const quickActions = [
    { label: "Manage Users",       sub: "Approve and verify accounts",  icon: Users,         bg: "bg-emerald-50", iconBg: "bg-emerald-500", path: "/admin/users" },
    { label: "Review Catalog",     sub: "Monitor product compliance",   icon: Package,       bg: "bg-blue-50",    iconBg: "bg-blue-500",    path: "/admin/catalog" },
    { label: "Transaction Monitor",sub: "Track all platform activity",  icon: ArrowLeftRight,bg: "bg-purple-50",  iconBg: "bg-purple-500",  path: "/admin/transactions" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="dashboard" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 space-y-6">

          {/* Page title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Platform overview and system metrics</p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((c) => (
              <div key={c.title} className={`rounded-2xl p-5 shadow-sm ${c.bg} flex flex-col gap-3`}>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                    <c.icon size={20} className={c.iconColor} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{c.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions + Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
                </div>
                <button onClick={() => navigate("/admin/transactions")} className="text-xs text-emerald-600 hover:underline">View all</button>
              </div>
              <div className="space-y-2">
                {recentOrders.map((t) => (
                  <div key={t._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart size={14} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">#{String(t._id).slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-gray-400">{t.buyer?.name || "Buyer"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800">₹{t.total?.toLocaleString()}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
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

          {/* Platform Health Overview */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4 flex items-center gap-2">
              <Activity size={16} className="text-white" />
              <h2 className="text-sm font-bold text-white">Platform Health Overview</h2>
            </div>
            <div className="bg-white px-6 py-5 grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">System Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-sm font-semibold text-gray-800">All Systems Operational</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-800">342</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Uptime</p>
                <p className="text-2xl font-bold text-gray-800">99.9%</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
