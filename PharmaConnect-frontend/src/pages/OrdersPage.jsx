import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Package, RefreshCw } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";

const STATUS_CLS = {
  pending:   "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const OrdersPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [orders,       setOrders]       = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [repeating,    setRepeating]    = useState(null);
  const prevRef = useRef([]);

  const repeatOrder = async (order) => {
    setRepeating(order._id);
    try {
      for (const item of order.items) {
        // Verify product still exists before adding
        if (!item.product) continue;
        await api.addToCart(
          { _id: item.product, name: item.name, price: item.price, category: item.category || "" },
          item.quantity
        );
      }
      await refreshCart();
      navigate("/cart");
    } catch (e) {
      alert("Failed to repeat order: " + (e.response?.data?.error || e.message));
    }
    setRepeating(null);
  };

  const loadOrders = async () => {
    const data = await api.getOrders();
    if (prevRef.current.length > 0) {
      data.forEach((order) => {
        const prev = prevRef.current.find((o) => o._id === order._id);
        if (prev && prev.status !== order.status) {
          if (Notification.permission === "granted") {
            new Notification("Order Update", {
              body: `Order #${String(order._id).slice(-8).toUpperCase()} is now ${order.status.toUpperCase()}`,
            });
          }
        }
      });
    }
    prevRef.current = data;
    setOrders(data);
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
    loadOrders();
    let delay = 5000;
    let timer;
    const schedule = () => {
      timer = setTimeout(async () => {
        try { await loadOrders(); delay = 5000; } catch { delay = Math.min(delay * 2, 60000); }
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.status.toLowerCase() === statusFilter)
    .filter((o) => searchQuery === "" || o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="orders" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Order History</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track and manage your orders</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {["all", ...STATUSES].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize tracking-wide transition-colors ${
                    statusFilter === s ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-300 bg-white placeholder:text-gray-300 w-52"
            />
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Package size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">No orders yet</p>
              <button onClick={() => navigate("/products")}
                className="mt-1 px-5 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800 font-mono">#{String(order._id).slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        {order.seller && <> · Seller: <span className="font-medium text-gray-600">{order.seller.name}</span></>}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[order.status] || "bg-gray-100 text-gray-500"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="px-5 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-50">
                          <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Product</th>
                          <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Qty</th>
                          <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 text-sm font-medium text-gray-800">{item.name}</td>
                            <td className="py-2 text-sm text-gray-500">{item.quantity}</td>
                            <td className="py-2 text-sm text-gray-700">₹{(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Order Total</p>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-bold text-gray-800">₹{order.total.toLocaleString()}</p>
                      {(order.status === "delivered" || order.status === "cancelled") && (
                        <button
                          onClick={() => repeatOrder(order)}
                          disabled={repeating === order._id}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                          <RefreshCw size={12} className={repeating === order._id ? "animate-spin" : ""} />
                          {repeating === order._id ? "Adding..." : "Repeat Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrdersPage;
