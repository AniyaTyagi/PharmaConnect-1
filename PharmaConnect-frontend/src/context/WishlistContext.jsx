import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = () => {
    setWishlistCount(api.getWishlist().length);
  };

  useEffect(() => {
    if (localStorage.getItem("token")) refreshWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
