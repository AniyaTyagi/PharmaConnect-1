import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart, Package, FileText, CheckCheck, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const INIT_NOTIFS = [
  { id: 1, type: "order",   title: "Order Confirmed",    message: "Your order has been placed successfully.", time: new Date(Date.now() - 120000).toISOString(),   read: false },
  { id: 2, type: "order",   title: "Shipment Update",    message: "Your order is out for delivery.",           time: new Date(Date.now() - 3600000).toISOString(),  read: false },
  { id: 3, type: "invoice", title: "Invoice Generated",  message: "Invoice #1 is ready to download.",          time: new Date(Date.now() - 10800000).toISOString(), read: true },
];

const TYPE_META = {
  order:   { icon: Package,   bg: "bg-blue-100",    color: "text-blue-500" },
  invoice: { icon: FileText,  bg: "bg-emerald-100", color: "text-emerald-500" },
};

const timeAgo = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60)    return `${d}s ago`;
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const Topbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Buyer"}');
  const initial = user?.name?.[0]?.toUpperCase() || "B";

  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(INIT_NOTIFS);

  const notifRef   = useRef();
  const profileRef = useRef();

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const clearAll    = () => setNotifications([]);

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 relative z-20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-800">Welcome back, {user.name}!</span>
        <span className="text-[11px] bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">✓ Verified</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Cart */}
        <button onClick={() => navigate("/cart")} className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <ShoppingCart size={18} className="text-gray-500" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold px-0.5">
              {cartCount}
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
            className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={18} className="text-gray-500" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold px-0.5">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                  {unread > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">{unread} new</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {notifications.length > 0 && (<>
                    <button onClick={markAllRead} title="Mark all read" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-emerald-500 transition-colors"><CheckCheck size={14} /></button>
                    <button onClick={clearAll}    title="Clear all"     className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </>)}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
                    <Bell size={28} /><p className="text-xs">No notifications yet</p>
                  </div>
                ) : notifications.map((n) => {
                  const meta = TYPE_META[n.type] || TYPE_META.order;
                  const Icon = meta.icon;
                  return (
                    <button key={n.id}
                      onClick={() => setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${!n.read ? "bg-emerald-50/40" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg}`}>
                        <Icon size={14} className={meta.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${!n.read ? "text-gray-800" : "text-gray-600"}`}>{n.title}</p>
                          {!n.read && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.time)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
            className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold hover:bg-emerald-600 transition-colors">
            {initial}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{initial}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button onClick={() => { setShowProfile(false); navigate("/settings"); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Settings</button>
                <button onClick={() => { setShowProfile(false); navigate("/orders"); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">My Orders</button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Log Out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
