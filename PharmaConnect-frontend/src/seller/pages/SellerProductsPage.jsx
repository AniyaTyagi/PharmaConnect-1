import React, { useState, useEffect } from "react";
import { Plus, X, Package, Pencil, Trash2 } from "lucide-react";
import SellerSidebar from "../components/SellerSidebar";
import SellerHeader from "../components/SellerHeader";
import axiosInstance from "../../utils/axiosInstance";

const CATEGORIES = ["Medicine", "Equipment", "Supplies", "Consumables"];
const EMPTY = { name: "", category: "", brand: "", price: "", stock: "", batchNumber: "", expiryDate: "", description: "", manufacturer: "", imageFile: null };

const ProductModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || EMPTY);
  const isEdit = !!initial?._id;
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">{isEdit ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add a new medicine or <span className="text-blue-500">equipment</span> to your catalog</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Product Name</label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g., Paracetamol 500mg"
                className="w-full border border-blue-400 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
              <select name="category" value={form.category} onChange={handle} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Brand</label>
              <input name="brand" value={form.brand} onChange={handle} placeholder="e.g., PharmaCo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Manufacturer</label>
              <input name="manufacturer" value={form.manufacturer} onChange={handle} placeholder="e.g., Sun Pharma"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Price (₹)</label>
              <input name="price" value={form.price} onChange={handle} required type="number" min="0" step="0.01" placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Stock Quantity</label>
              <input name="stock" value={form.stock} onChange={handle} required type="number" min="0" placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Batch Number</label>
              <input name="batchNumber" value={form.batchNumber} onChange={handle} placeholder="e.g., PC2024001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Expiry Date</label>
              <input name="expiryDate" value={form.expiryDate ? new Date(form.expiryDate).toISOString().split('T')[0] : ''} onChange={handle} type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Product Image</label>
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            {form.images?.[0] && <p className="text-xs text-gray-400 mt-1">Current: {form.images[0].substring(0, 50)}...</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handle} placeholder="Product description..." rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              {isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SellerProductsPage = () => {
  const [products,      setProducts]      = useState([]);
  const [modal,         setModal]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // productId pending delete
  const [error,         setError]         = useState("");

  const load = async () => {
    const res = await axiosInstance.get("/products");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setProducts(res.data.filter((p) => p.seller?._id === user?.id));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key !== "imageFile" && key !== "_id" && key !== "images" && form[key])
        formData.append(key, form[key]);
    });
    if (form.imageFile) formData.append("images", form.imageFile);
    try {
      if (modal?._id) await axiosInstance.put(`/products/${modal._id}`, formData);
      else            await axiosInstance.post("/products", formData);
      setModal(null);
      load();
    } catch (err) {
      setError("Failed to save product: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log("Attempting to delete product:", id);
      console.log("Current user:", JSON.parse(localStorage.getItem("user") || "{}"));
      const res = await axiosInstance.delete(`/products/${id}`);
      console.log("Delete response:", res.data);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      console.error("Delete error full:", err);
      console.error("Delete error response:", err.response);
      console.error("Delete error message:", err.message);
      console.error("Delete error status:", err.response?.status);
      console.error("Delete error data:", err.response?.data);
      setError("Failed to delete: " + (err.response?.data?.error || err.response?.data?.message || err.message));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar active="products" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <SellerHeader />
        <main className="flex-1 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Product Catalog</h1>
              <p className="text-xs text-gray-400 mt-0.5">{products.length} products listed</p>
            </div>
            <button onClick={() => setModal("add")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition-colors">
              <Plus size={16} /> Add Product
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-4">✕</button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Package size={28} className="text-gray-300" />
              </div>
              <p className="text-sm">No products listed yet. Click <strong>Add Product</strong> to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <Package size={40} className="text-blue-300" />
                    </div>
                  )}
                  <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Package size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
                    <span>Brand: <strong className="text-gray-700">{p.brand || "—"}</strong></span>
                    <span>Price: <strong className="text-gray-700">₹{p.price}</strong></span>
                    <span>Stock: <strong className="text-gray-700">{p.stock}</strong></span>
                    <span>Batch: <strong className="text-gray-700">{p.batchNumber || "—"}</strong></span>
                    {p.expiryDate && <span className="col-span-2">Expiry: <strong className="text-gray-700">{new Date(p.expiryDate).toLocaleDateString()}</strong></span>}
                  </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <ProductModal
          initial={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
