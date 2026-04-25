import React, { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Users, Package, RefreshCw } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import axiosInstance from "../../utils/axiosInstance";

const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/reports");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar active="reports" />
        <div className="ml-44 flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw size={40} className="text-gray-300 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, usersByRole, transactionsByStatus, topSellers } = data;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="reports" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Reports</h1>
                <p className="text-xs text-gray-400 mt-0.5">Platform-wide analytics and insights · Auto-refreshes every 30s</p>
              </div>
              <button onClick={fetchReports} disabled={loading}
                className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Users",    value: stats.totalUsers,        icon: Users,         bg: "bg-blue-50",   ic: "bg-blue-100",   cc: "text-blue-500" },
              { label: "Total Products", value: stats.totalProducts,     icon: Package,       bg: "bg-emerald-50",  ic: "bg-emerald-100",  cc: "text-emerald-500" },
              { label: "Transactions",   value: stats.totalTransactions, icon: BarChart2,     bg: "bg-purple-50", ic: "bg-purple-100", cc: "text-purple-500" },
              { label: "Platform Revenue",value:`₹${stats.platformRevenue.toLocaleString()}`,icon: TrendingUp, bg: "bg-yellow-50", ic: "bg-yellow-100", cc: "text-yellow-500" },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-5 shadow-sm flex items-center justify-between`}>
                <div>
                  <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.ic} flex items-center justify-center`}>
                  <c.icon size={20} className={c.cc} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* User breakdown */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">User Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: "Buyers",        value: usersByRole.buyer,        max: stats.totalUsers, color: "bg-blue-500" },
                  { label: "Sellers",       value: usersByRole.seller,       max: stats.totalUsers, color: "bg-emerald-500" },
                  { label: "Manufacturers", value: usersByRole.manufacturer, max: stats.totalUsers, color: "bg-purple-500" },
                  { label: "Admins",        value: usersByRole.admin,        max: stats.totalUsers, color: "bg-red-500" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{r.label}</span>
                      <span>{r.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`${r.color} h-1.5 rounded-full`} style={{ width: r.max ? `${(r.value / r.max) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction status */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Transaction Status</h2>
              <div className="grid grid-cols-2 gap-3">
                {["delivered", "shipped", "pending", "cancelled"].map((status) => {
                  const count = transactionsByStatus[status];
                  const cls = { delivered:"bg-green-50 text-green-700", shipped:"bg-emerald-50 text-emerald-700", pending:"bg-yellow-50 text-yellow-700", cancelled:"bg-red-50 text-red-700" };
                  return (
                    <div key={status} className={`rounded-xl p-4 text-center ${cls[status]}`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs mt-1 capitalize">{status}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top sellers */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Top Sellers by Revenue</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Rank","Seller","Orders","Revenue"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSellers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-sm text-gray-400">No seller data available</td>
                  </tr>
                ) : topSellers.map((s, i) => (
                  <tr key={s.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400 font-bold">#{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.orders}</td>
                    <td className="px-5 py-3 font-bold text-gray-800">₹{s.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReportsPage;
