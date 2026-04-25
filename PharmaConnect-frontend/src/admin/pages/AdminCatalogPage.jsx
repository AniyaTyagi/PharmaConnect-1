import React, { useState, useEffect } from "react";
import { Package, CheckCircle, XCircle, Trash2 } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import axiosInstance from "../../utils/axiosInstance";

const STATUS_CLS = {
  approved: "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminCatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const res = await axiosInstance.get("/products");
    setCatalog(res.data);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await axiosInstance.put(`/products/${id}`, { status });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await axiosInstance.delete(`/products/${id}`);
    load();
  };

  const filtered = filter === "all" ? catalog : catalog.filter((p) => p.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="catalog" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Product Catalog</h1>
            <p className="text-xs text-gray-400 mt-0.5">Review and manage all platform products</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Products", value: catalog.length,                                       bg: "bg-blue-50",   color: "text-blue-600" },
              { label: "Pending Review", value: catalog.filter((p) => p.status === "pending").length,  bg: "bg-yellow-50", color: "text-yellow-600" },
              { label: "Approved",       value: catalog.filter((p) => p.status === "approved").length, bg: "bg-green-50",  color: "text-green-600" },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-5 shadow-sm`}>
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {["all", "approved", "pending", "rejected"].map((s) => (
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
                  {["Product", "Category", "Manufacturer", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-300 py-16 text-sm">No products found</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-green-500" />
                        </div>
                        <span className="font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{p.category}</td>
                    <td className="px-5 py-3 text-gray-500">{p.manufacturer || "—"}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">₹{p.price}</td>
                    <td className="px-5 py-3 text-gray-500">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[p.status] || STATUS_CLS.approved}`}>{p.status || "approved"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {p.status !== "approved" && (
                          <button onClick={() => updateStatus(p._id, "approved")} title="Approve"
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><CheckCircle size={14} /></button>
                        )}
                        {p.status !== "rejected" && (
                          <button onClick={() => updateStatus(p._id, "rejected")} title="Reject"
                            className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors"><XCircle size={14} /></button>
                        )}
                        <button onClick={() => handleDelete(p._id)} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
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

export default AdminCatalogPage;
