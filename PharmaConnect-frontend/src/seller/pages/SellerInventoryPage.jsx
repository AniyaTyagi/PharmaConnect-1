import React, { useState, useEffect, useCallback } from "react";
import { Package, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import SellerSidebar from "../components/SellerSidebar";
import SellerHeader from "../components/SellerHeader";
import axiosInstance from "../../utils/axiosInstance";

const LOW_STOCK_KEY  = "seller_low_stock_threshold";
const ALERTS_KEY     = "seller_stock_alerts";

const getStockStatus = (stock) => {
  const n = Number(stock);
  if (n === 0) return { label: "Out of Stock",  cls: "bg-red-100 text-red-600" };
  if (n < 50)  return { label: "Low Stock",     cls: "bg-yellow-100 text-yellow-600" };
  return              { label: "In Stock",      cls: "bg-green-100 text-green-600" };
};

const getExpiryStatus = (expiry) => {
  if (!expiry) return { label: "N/A", cls: "bg-gray-100 text-gray-400" };
  const diff = (new Date(expiry) - new Date()) / 86400000;
  if (diff < 0)   return { label: "Expired",       cls: "bg-red-100 text-red-600" };
  if (diff <= 90) return { label: "Expiring Soon", cls: "bg-yellow-100 text-yellow-600" };
  return                 { label: "Valid",         cls: "bg-green-100 text-green-600" };
};

const SellerInventoryPage = () => {
  const [products,   setProducts]   = useState([]);
  const [editStock,  setEditStock]  = useState({});   // { productId: newStockValue }
  const [saving,     setSaving]     = useState(null);
  const [threshold,  setThreshold]  = useState(() => Number(localStorage.getItem(LOW_STOCK_KEY)) || 50);
  const [alerts,     setAlerts]     = useState(() => JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]"));
  const [editThresh, setEditThresh] = useState(false);
  const [threshInput,setThreshInput]= useState(threshold);

  const load = useCallback(() => {
    // Fetch from inventory endpoint instead of products
    axiosInstance.get("/inventory").then((r) => {
      const data = r.data.map(inv => ({
        _id: inv.product?._id || inv._id,
        name: inv.name || inv.product?.name,
        category: inv.product?.category,
        price: inv.product?.price,
        stock: inv.stock,
        batchNumber: inv.batchNumber,
        expiryDate: inv.product?.expiryDate,
        images: inv.product?.images
      }));
      setProducts(data);
      
      // Fetch stock alerts
      axiosInstance.get(`/inventory/alerts?threshold=${threshold}`)
        .then((res) => {
          const newAlerts = res.data.map((inv) => ({
            id:       inv._id,
            name:     inv.name || inv.product?.name,
            stock:    inv.stock,
            threshold,
            critical: Number(inv.stock) === 0,
            time:     new Date().toISOString(),
          }));
          setAlerts(newAlerts);
          localStorage.setItem(ALERTS_KEY, JSON.stringify(newAlerts));
        })
        .catch(() => {
          // Fallback: compute from local data
          const newAlerts = data
            .filter((p) => Number(p.stock) <= threshold)
            .map((p) => ({
              id: p._id, name: p.name, stock: p.stock,
              threshold, critical: Number(p.stock) === 0,
              time: new Date().toISOString(),
            }));
          setAlerts(newAlerts);
          localStorage.setItem(ALERTS_KEY, JSON.stringify(newAlerts));
        });
    }).catch(() => {});
  }, [threshold]);

  useEffect(() => { load(); }, [load]);

  const saveThreshold = () => {
    const val = Math.max(1, Number(threshInput) || 50);
    setThreshold(val);
    localStorage.setItem(LOW_STOCK_KEY, val);
    setEditThresh(false);
  };

  // Inline stock update
  const handleStockSave = async (product) => {
    const newStock = parseInt(editStock[product._id]);
    if (isNaN(newStock) || newStock < 0) return;
    setSaving(product._id);
    try {
      await axiosInstance.put(`/products/${product._id}`, { stock: newStock });
      setEditStock((p) => { const n = { ...p }; delete n[product._id]; return n; });
      load();
    } catch {
      alert("Failed to update stock.");
    }
    setSaving(null);
  };

  const lowStock    = products.filter((p) => Number(p.stock) < threshold && Number(p.stock) > 0).length;
  const outOfStock  = products.filter((p) => Number(p.stock) === 0).length;
  const expiringSoon = products.filter((p) => {
    if (!p.expiryDate) return false;
    const diff = (new Date(p.expiryDate) - new Date()) / 86400000;
    return diff >= 0 && diff <= 90;
  }).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar active="inventory" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <SellerHeader />
        <main className="flex-1 p-6 space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Inventory Management</h1>
              <p className="text-xs text-gray-400 mt-0.5">Monitor stock levels, set alerts, and update inventory</p>
            </div>
            {/* Threshold config */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Alert threshold:</span>
              {editThresh ? (
                <>
                  <input
                    type="number" min="1" value={threshInput}
                    onChange={(e) => setThreshInput(e.target.value)}
                    className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-300 text-center"
                  />
                  <button onClick={saveThreshold}
                    className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg transition-colors">
                    Save
                  </button>
                  <button onClick={() => setEditThresh(false)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-gray-800">{threshold} units</span>
                  <button onClick={() => { setThreshInput(threshold); setEditThresh(true); }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package size={20} className="text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-yellow-500">{lowStock}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-500">{expiringSoon}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-400" />
              </div>
            </div>
          </div>

          {/* ── Stock Alerts Panel ── */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-100 bg-yellow-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <h2 className="text-sm font-bold text-yellow-800">Stock Alerts</h2>
                  <span className="text-[10px] font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                    {alerts.length} product{alerts.length !== 1 ? "s" : ""} need attention
                  </span>
                </div>
                <button onClick={load} className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 flex items-center gap-1 transition-colors">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Current stock: <span className={`font-semibold ${a.critical ? "text-red-600" : "text-yellow-600"}`}>{a.stock} units</span>
                        {" · "}Threshold: {a.threshold} units
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${a.critical ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {a.critical ? "Out of Stock" : "Low Stock"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Inventory Table with inline stock update ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Inventory Overview</h2>
              <p className="text-xs text-gray-400">Click stock value to edit inline</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Product Name", "Batch", "Stock", "Stock Status", "Expiry Date", "Expiry Status", "Price"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-300 py-16 text-sm">
                        No inventory data. Add products first.
                      </td>
                    </tr>
                  ) : products.map((p) => {
                    const stock  = getStockStatus(p.stock);
                    const expiry = getExpiryStatus(p.expiryDate);
                    const isEditing = editStock[p._id] !== undefined;
                    return (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-5 py-3 text-gray-500">{p.batchNumber || "—"}</td>
                        {/* Inline stock edit */}
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number" min="0"
                                value={editStock[p._id]}
                                onChange={(e) => setEditStock((prev) => ({ ...prev, [p._id]: e.target.value }))}
                                className="w-20 text-sm border border-emerald-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-300 text-center"
                                autoFocus
                              />
                              <button
                                onClick={() => handleStockSave(p)}
                                disabled={saving === p._id}
                                className="text-[11px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-2 py-1 rounded-lg transition-colors disabled:opacity-60">
                                {saving === p._id ? "..." : "Save"}
                              </button>
                              <button
                                onClick={() => setEditStock((prev) => { const n = { ...prev }; delete n[p._id]; return n; })}
                                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditStock((prev) => ({ ...prev, [p._id]: String(p.stock) }))}
                              className="text-sm font-semibold text-gray-700 hover:text-emerald-600 underline-offset-2 hover:underline transition-colors">
                              {p.stock}
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${stock.cls}`}>{stock.label}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${expiry.cls}`}>{expiry.label}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-700 font-medium">₹{Number(p.price).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default SellerInventoryPage;
