import React, { useState, useEffect } from "react";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import axiosInstance from "../../utils/axiosInstance";

const ROLE_CLS = {
  buyer:        "bg-blue-100 text-blue-700",
  seller:       "bg-emerald-100 text-emerald-700",
  manufacturer: "bg-emerald-100 text-emerald-700",
  admin:        "bg-gray-100 text-gray-700",
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    const res = await axiosInstance.get("/admin/users");
    setUsers(res.data.users);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await axiosInstance.delete(`/admin/users/${id}`);
    load();
  };

  const filtered = users
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) => roleFilter === "all" || u.role === roleFilter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="users" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Users</h1>
            <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users on the platform</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Users",   value: users.length,                                          bg: "bg-blue-50",   color: "text-blue-600" },
              { label: "Buyers",        value: users.filter((u) => u.role === "buyer").length,         bg: "bg-green-50",  color: "text-green-600" },
              { label: "Manufacturers", value: users.filter((u) => u.role === "manufacturer").length,  bg: "bg-emerald-50", color: "text-emerald-600" },
              { label: "Admins",        value: users.filter((u) => u.role === "admin").length,         bg: "bg-gray-50",   color: "text-gray-600" },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-4 shadow-sm`}>
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Role filters */}
          <div className="flex gap-2 flex-wrap">
            {["all", "buyer", "seller", "manufacturer", "admin"].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${
                  roleFilter === r ? "bg-emerald-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}>
                {r}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-300 py-16 text-sm">No users found</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_CLS[u.role] || "bg-gray-100 text-gray-700"}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(u._id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersPage;
