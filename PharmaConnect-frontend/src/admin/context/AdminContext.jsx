import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminContext = createContext(null);

const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } };
const save = (key, v) => localStorage.setItem(key, JSON.stringify(v));

const INIT_USERS = [];
const INIT_CATALOG = [];
const INIT_TRANSACTIONS = [];

export const AdminProvider = ({ children }) => {
  const [users,        setUsers]        = useState(() => load("admin_users",        INIT_USERS));
  const [catalog,      setCatalog]      = useState(() => load("admin_catalog",      INIT_CATALOG));
  const [transactions, setTransactions] = useState(() => load("admin_transactions", INIT_TRANSACTIONS));
  const [notifications,setNotifications]= useState(() => load("admin_notifications", []));

  useEffect(() => save("admin_users",         users),         [users]);
  useEffect(() => save("admin_catalog",       catalog),       [catalog]);
  useEffect(() => save("admin_transactions",  transactions),  [transactions]);
  useEffect(() => save("admin_notifications", notifications), [notifications]);

  const pushNotif = useCallback((title, message, type = "info") => {
    setNotifications((prev) => [{ id: Date.now(), title, message, type, read: false, time: new Date().toISOString() }, ...prev]);
  }, []);

  // Users
  const updateUserStatus = useCallback((id, status) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
    const u = users.find((x) => x.id === id);
    if (u) pushNotif("User Status Updated", `${u.name} marked as ${status}.`, "user");
  }, [users, pushNotif]);

  const deleteUser = useCallback((id) => {
    const u = users.find((x) => x.id === id);
    setUsers((prev) => prev.filter((x) => x.id !== id));
    if (u) pushNotif("User Removed", `${u.name} has been removed from the platform.`, "user");
  }, [users, pushNotif]);

  // Catalog
  const updateProductStatus = useCallback((id, status) => {
    setCatalog((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    const p = catalog.find((x) => x.id === id);
    if (p) pushNotif("Product " + (status === "approved" ? "Approved" : "Rejected"), `"${p.name}" has been ${status}.`, "product");
  }, [catalog, pushNotif]);

  const deleteProduct = useCallback((id) => {
    const p = catalog.find((x) => x.id === id);
    setCatalog((prev) => prev.filter((x) => x.id !== id));
    if (p) pushNotif("Product Removed", `"${p.name}" removed from catalog.`, "product");
  }, [catalog, pushNotif]);

  // Notifications
  const markAllRead      = useCallback(() => setNotifications((p) => p.map((n) => ({ ...n, read: true }))), []);
  const markRead         = useCallback((id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n)), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  const stats = {
    totalUsers:       users.length,
    totalProducts:    catalog.length,
    totalTransactions:transactions.length,
    platformRevenue:  transactions.filter((t) => t.status !== "cancelled").reduce((s, t) => s + t.amount, 0),
    pendingUsers:     users.filter((u) => u.status === "pending").length,
    pendingProducts:  catalog.filter((p) => p.status === "pending").length,
    unread:           notifications.filter((n) => !n.read).length,
  };

  return (
    <AdminContext.Provider value={{
      users, catalog, transactions, notifications, stats,
      updateUserStatus, deleteUser,
      updateProductStatus, deleteProduct,
      markAllRead, markRead, clearNotifications, pushNotif,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
