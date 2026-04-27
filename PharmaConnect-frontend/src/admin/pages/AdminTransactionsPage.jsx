import React, { useState, useEffect } from "react";
import { ArrowLeftRight, Eye } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import axiosInstance from "../../utils/axiosInstance";

const STATUS_CLS = {
  delivered: "bg-green-100 text-green-700",
  shipped:   "bg-emerald-100 text-emerald-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const res = await axiosInstance.get("/orders");
    setTransactions(res.data);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await axiosInstance.patch(`/orders/${id}/status`, { status });
    load();
  };

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.status === filter);
  const totalRevenue = transactions.filter((t) => t.status !== "cancelled").reduce((s, t) => s + t.total, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="transactions" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Transactions</h1>
            <p className="text-xs text-gray-400 mt-0.5">Monitor all platform transactions</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total",     value: transactions.length,                                         bg: "bg-blue-50",   color: "text-blue-600" },
              { label: "Delivered", value: transactions.filter((t) => t.status === "delivered").length,  bg: "bg-green-50",  color: "text-green-600" },
              { label: "Pending",   value: transactions.filter((t) => t.status === "pending").length,    bg: "bg-yellow-50", color: "text-yellow-600" },
              { label: "Revenue",   value: `₹${totalRevenue.toLocaleString()}`,                         bg: "bg-emerald-50", color: "text-emerald-600" },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-4 shadow-sm`}>
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {["all", "delivered", "shipped", "pending", "cancelled"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${filter === s ? "bg-emerald-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Order ID", "Buyer", "Items", "Amount", "Date", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-300 py-16 text-sm">No transactions found</td></tr>
                ) : filtered.map((t) => (
                  <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-700">{t._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-gray-700">{t.buyer?.name || "—"}</td>
                    <td className="px-5 py-3 text-gray-500">{t.items?.length} item(s)</td>
                    <td className="px-5 py-3 font-bold text-gray-800">₹{t.total?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(t)} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Order #{selected._id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Buyer",  selected.buyer?.name || "—"],
                ["Email",  selected.buyer?.email || "—"],
                ["Amount", `₹${selected.total?.toLocaleString()}`],
                ["Date",   new Date(selected.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <select value={selected.status} onChange={(e) => { updateStatus(selected._id, e.target.value); setSelected({ ...selected, status: e.target.value }); }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1">
                  {["pending", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Items</p>
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setSelected(null)}
              className="mt-5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
