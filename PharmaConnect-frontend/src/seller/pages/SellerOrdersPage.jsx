import React, { useState, useEffect } from "react";
import SellerSidebar from "../components/SellerSidebar";
import SellerHeader from "../components/SellerHeader";
import axiosInstance from "../../utils/axiosInstance";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];

const STATUS_CLS = {
  pending:   "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const res = await axiosInstance.get("/api/orders");
    setOrders(res.data);
  };

  useEffect(() => { load(); }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      console.log("Updating order:", id, "to status:", status);
      const res = await axiosInstance.patch(`/api/orders/${id}/status`, { status });
      console.log("Update response:", res.data);
      load();
    } catch (err) {
      console.error("Update error:", err.response || err);
      alert("Failed to update order: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar active="orders" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <SellerHeader />
        <main className="flex-1 p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Order Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">{orders.length} total orders</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize tracking-wide transition-colors ${
                  filter === s ? "bg-emerald-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}>
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Order ID", "Buyer", "Items", "Total", "Date", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <p className="text-sm font-medium text-gray-400">No orders found</p>
                      <p className="text-xs text-gray-300 mt-1">Orders will appear here once buyers place them</p>
                    </td>
                  </tr>
                ) : filtered.map((o) => (
                  <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-700">#{String(o._id).slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-800">{o.buyer?.name || "—"}</p>
                      <p className="text-[11px] text-gray-400">{o.buyer?.email || ""}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{o.items?.length}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-800">₹{o.total?.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[o.status] || "bg-gray-100 text-gray-500"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <select value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-600 font-medium">
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setSelected(o)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800 tracking-tight">Order Details</h2>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">#{String(selected._id).slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Buyer</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.buyer?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{selected.buyer?.email || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date & Status</p>
                  <p className="text-sm font-semibold text-gray-800">{new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-2">Product</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-2">Qty</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-2">Price</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items?.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2.5 text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="py-2.5 text-sm text-gray-500">{item.quantity}</td>
                      <td className="py-2.5 text-sm text-gray-500">₹{item.price?.toLocaleString()}</td>
                      <td className="py-2.5 text-sm font-semibold text-gray-700">₹{(item.price * item.quantity)?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Order Total</p>
                  <p className="text-lg font-bold text-gray-800">₹{selected.total?.toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
