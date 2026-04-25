import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const SellerContext = createContext(null);

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const SellerProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => load("seller_settings", {
    name: "", email: "", phone: "", company: "", address: "", gstin: "",
    notifications: { newOrders: true, lowStock: true, expiry: true },
  }));
  const [notifications, setNotifications] = useState(() => load("seller_notifications", []));

  // Seed settings from JWT user on first load — always prefer JWT as source of truth
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) {
      setSettings((p) => ({
        ...p,
        name:  p.name  || user.name,
        email: p.email || user.email || "",
      }));
    }
  }, []);

  useEffect(() => save("seller_settings",      settings),      [settings]);
  useEffect(() => save("seller_notifications", notifications), [notifications]);

  const updateSettings = useCallback((data) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  // Notifications — called externally to push alerts (e.g. new order, low stock)
  const pushNotification = useCallback((type, title, message) => {
    setNotifications((prev) => [{
      id: Date.now(), type, read: false, title, message,
      time: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const markAllRead      = useCallback(() => setNotifications((p) => p.map((n) => ({ ...n, read: true }))), []);
  const markRead         = useCallback((id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n)), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  const stats = {
    unreadNotifications: notifications.filter((n) => !n.read).length,
  };

  return (
    <SellerContext.Provider value={{
      settings, notifications, stats,
      updateSettings, pushNotification,
      markAllRead, markRead, clearNotifications,
    }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => useContext(SellerContext);
