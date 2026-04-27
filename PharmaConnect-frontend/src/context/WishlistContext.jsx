import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("user")) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, []);

  const addToWishlist = async (productId) => {
    try {
      const updated = await api.addToWishlist(productId);
      setWishlist(updated);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const updated = await api.removeFromWishlist(productId);
      setWishlist(updated);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const clearWishlist = async () => {
    try {
      await api.clearWishlist();
      setWishlist([]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  const refreshWishlist = () => {
    loadWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        refreshWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
