import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = () => {
    api.getCart().then((data) => setCartCount(data.count || 0)).catch(() => setCartCount(0));
  };

  useEffect(() => {
    if (localStorage.getItem("token")) refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
