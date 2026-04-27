import React, { useMemo, useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import SellerSidebar from "../components/SellerSidebar";
import SellerHeader from "../components/SellerHeader";
import axiosInstance from "../../utils/axiosInstance";

const SellerAnalyticsPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axiosInstance.get("/orders").then((r) => setOrders(r.data)).catch(() => {});
    axiosInstance.get("/products").then((r) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setProducts(r.data.filter((p) => p.seller?._id === user.id || p.seller?.id === user.id));
    }).catch(() => {});
  }, []);

  const stats = {
    totalRevenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0),
    totalOrders:    orders.length,
    productsListed: products.length,
    pendingOrders:  orders.filter((o) => o.status === "pending").length,
  };

  // Group orders by month
  const monthly = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = new Date(o.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      if (!map[key]) map[key] = { month: key, orders: 0, revenue: 0 };
      map[key].orders += 1;
      if (o.status !== "cancelled") map[key].revenue += o.total || 0;
    });
    return Object.values(map).reverse();
  }, [orders]);

  // Top products by order frequency
  const topProducts = useMemo(() => {
    const freq = {};
    orders.forEach((o) => o.items?.forEach((item) => {
      freq[item.name] = (freq[item.name] || 0) + item.quantity;
    }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const summaryCards = [
    { label: "Total Revenue",    value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Total Orders",     value: stats.totalOrders,    icon: ShoppingCart, bg: "bg-blue-50",   iconBg: "bg-blue-100",   iconColor: "text-blue-500" },
    { label: "Products Listed",  value: stats.productsListed, icon: Package,      bg: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-500" },
    { label: "Pending Orders",   value: stats.pendingOrders,  icon: TrendingUp,   bg: "bg-yellow-50", iconBg: "bg-yellow-100", iconColor: "text-yellow-500" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar active="analytics" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <SellerHeader />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Analytics</h1>
            <p className="text-xs text-gray-400 mt-0.5">Performance insights for your store</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {summaryCards.map((c) => (
              <div key={c.label} className={`rounded-2xl p-5 shadow-sm ${c.bg} flex items-center justify-between`}>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                  <c.icon size={20} className={c.iconColor} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Monthly breakdown */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Monthly Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Month","Orders","Revenue"].map((h) => (
                        <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-gray-300 py-10 text-sm">No data yet</td></tr>
                    ) : (
                      monthly.map((m) => (
                        <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50/60">
                          <td className="px-5 py-3 text-sm font-medium text-gray-700">{m.month}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{m.orders}</td>
                          <td className="px-5 py-3 text-sm font-bold text-gray-800">₹{m.revenue.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top products */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Top Selling Products</h2>
              </div>
              <div className="p-5 space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-center text-gray-300 py-10 text-sm">No sales data yet</p>
                ) : (
                  topProducts.map(([name, qty], i) => {
                    const maxQty = topProducts[0][1];
                    const pct = Math.round((qty / maxQty) * 100);
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="font-medium">{i + 1}. {name}</span>
                          <span>{qty} units</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Order status breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Status Breakdown</h2>
            <div className="grid grid-cols-4 gap-3">
              {["pending", "shipped", "delivered", "cancelled"].map((s) => {
                const count = orders.filter((o) => o.status === s).length;
                const cls = { pending:"bg-yellow-50 text-yellow-700", shipped:"bg-purple-50 text-purple-700", delivered:"bg-green-50 text-green-700", cancelled:"bg-red-50 text-red-700" };
                return (
                  <div key={s} className={`rounded-xl p-4 text-center ${cls[s]}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs mt-1 capitalize">{s}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;
