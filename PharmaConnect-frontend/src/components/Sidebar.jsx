import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Pill, ShoppingCart, Package, FileText, Settings, Menu, X } from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/buyer-dashboard" },
  { key: "products",  label: "Products",  icon: Pill,            path: "/products" },
  { key: "cart",      label: "Cart",      icon: ShoppingCart,    path: "/cart" },
  { key: "orders",    label: "Orders",    icon: Package,         path: "/orders" },
  { key: "invoices",  label: "Invoices",  icon: FileText,        path: "/invoices" },
];

const Sidebar = ({ activeMenu }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Buyer"}');
  const initial = user?.name?.[0]?.toUpperCase() || "B";

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-200">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-44 bg-white border-r border-gray-100 flex flex-col shadow-sm z-50 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">PharmaConnect</p>
            <p className="text-[10px] text-gray-400">B2B Platform</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
            Buyer Account
          </span>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map(({ key, label, icon: Icon, path }) => (
            <button key={key} onClick={() => handleNavigation(path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeMenu === key
                  ? "bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-500"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}>
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4 space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="text-sm text-gray-700 font-medium truncate">{user?.name || "Buyer"}</span>
          </div>
          <button onClick={() => handleNavigation("/settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeMenu === "settings"
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
