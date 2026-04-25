import React, { useState, useEffect } from "react";
import { Search, Package } from "lucide-react";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const ProductsPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sortBy,   setSortBy]   = useState("Name");
  const [adding, setAdding] = useState(null);
  const { refreshCart } = useCart();

  useEffect(() => {
    const cat = category === "All Categories" ? "" : category;
    api.getProducts({ search, category: cat }).then(setAllProducts).catch(() => {});
  }, [search, category]);

  const products = [...allProducts].sort((a, b) =>
    sortBy === "Price: Low to High" ? a.price - b.price
    : sortBy === "Price: High to Low" ? b.price - a.price
    : a.name.localeCompare(b.name)
  );

  const handleAddToCart = async (product) => {
    setAdding(product._id);
    try { await api.addToCart(product, 1); await refreshCart(); }
    catch (e) { alert(e.message); }
    setAdding(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="products" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Product Catalog</h1>
            <p className="text-xs text-gray-400 mt-0.5">Browse medicines and medical equipment</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-300 bg-white placeholder:text-gray-300"
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-600">
              <option>All Categories</option>
              <option>Equipment</option>
              <option>Medicine</option>
              <option>Supplies</option>
              <option>Consumables</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-600">
              <option>Name</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
              Showing <strong className="text-gray-600">{products.length}</strong> products
            </span>
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Package size={28} className="text-gray-300" />
              </div>
              <p className="text-sm">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].replace("/upload/", "/upload/w_400,q_auto,f_auto/")}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <Package size={40} className="text-blue-300" />
                    )}
                    <span className="absolute top-2 right-2 text-[10px] font-semibold bg-white/90 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">
                      Stock: {product.stock}
                    </span>
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{product.name}</p>
                    {product.seller && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Seller: <span className="font-medium text-gray-600">{product.seller.name || "Verified Seller"}</span>
                      </p>
                    )}

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-800">₹{Number(product.price).toLocaleString()}</span>
                      <span className="text-xs text-gray-400">per unit</span>
                    </div>

                    <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                      {product.batchNumber && <p>Batch: <span className="text-gray-600">{product.batchNumber}</span></p>}
                      {product.expiryDate  && <p>Expiry: <span className="text-gray-600">{new Date(product.expiryDate).toLocaleDateString("en-IN")}</span></p>}
                      {product.manufacturer && <p>By: <span className="text-gray-600">{product.manufacturer}</span></p>}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={adding === product._id}
                      className="mt-auto pt-3 w-full py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl transition-colors">
                      {adding === product._id ? "Adding..." : "Add to Cart"}
                    </button>
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

export default ProductsPage;
