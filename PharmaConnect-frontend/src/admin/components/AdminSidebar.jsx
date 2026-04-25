import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, Users, BookOpen, ArrowLeftRight, BarChart2, Settings, FileCheck } from "lucide-react";

const navItems = [
  { key: "dashboard",     label: "Dashboard",     icon: LayoutDashboard,  path: "/admin/dashboard" },
  { key: "verifications", label: "Verifications", icon: ShieldCheck,      path: "/admin/verifications" },
  { key: "users",         label: "Users",         icon: Users,            path: "/admin/users" },
  { key: "catalog",       label: "Catalog",       icon: BookOpen,         path: "/admin/catalog" },
  { key: "transactions",  label: "Transactions",  icon: ArrowLeftRight,   path: "/admin/transactions" },
  { key: "reports",       label: "Reports",       icon: BarChart2,        path: "/admin/reports" },
];

const AdminSidebar = ({ active = "dashboard" }) => {
  const navigate = useNavigate();

  return (
    <aside className="fixed top-0 left-0 h-screen w-44 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 leading-tight">PharmaConnect</p>
          <p className="text-[10px] text-gray-400">B2B Platform</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pb-3">
        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
          Admin Account
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ key, label, icon: Icon, path }) => (
          <button key={key} onClick={() => navigate(path)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === key
                ? "bg-emerald-50 text-emerald-700 font-semibold border-l-4 border-emerald-500"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}>
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 space-y-0.5">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="text-sm text-gray-700 font-medium">Admin User</span>
        </div>
        <button onClick={() => navigate("/admin/settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            active === "settings"
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}>
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
