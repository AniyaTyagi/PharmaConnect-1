import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Package } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const [moving, setMoving] = useState(null);

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (!result.success) {
      alert(result.error);
    }
  };

  const moveToCart = async (product) => {
    setMoving(product._id);
    try {
      await api.addToCart(product, 1);
      await refreshCart();
      await removeFromWishlist(product._id);
    } catch (e) {
      alert(e.message);
    }
    setMoving(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeMenu="wishlist" />
        <div className="ml-44 flex-1 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p className="text-gray-400">Loading wishlist...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="wishlist" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Wishlist</h1>
            <p className="text-xs text-gray-400 mt-0.5">{wishlist.length} saved product{wishlist.length !== 1 ? "s" : ""}</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Heart size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">Your wishlist is empty</p>
              <p className="text-xs text-gray-300">Save products you want to buy later</p>
              <button onClick={() => navigate("/products")}
                className="mt-1 px-5 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {wishlist.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
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
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    {/* Remove from wishlist */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors group">
                      <Heart size={14} className="text-red-400 fill-red-400 group-hover:text-red-600 group-hover:fill-red-600" />
                    </button>
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
                      {product.stock !== undefined && (
                        <p>Stock: <span className={product.stock > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                          {product.stock > 0 ? product.stock : "Out of stock"}
                        </span></p>
                      )}
                      {product.expiryDate && <p>Expiry: <span className="text-gray-600">{new Date(product.expiryDate).toLocaleDateString("en-IN")}</span></p>}
                    </div>

                    <div className="mt-auto pt-3 flex gap-2">
                      <button
                        onClick={() => moveToCart(product)}
                        disabled={moving === product._id || product.stock === 0}
                        className="flex-1 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors">
                        {moving === product._id ? "Moving..." : "Move to Cart"}
                      </button>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="px-3 py-2 text-sm font-semibold text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-xl transition-colors">
                        Remove
                      </button>
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

export default WishlistPage;
