import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldX, Clock } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { RegistrationController } from "../../controllers/RegistrationController";

const AdminVerificationsPage = () => {
  const [pending, setPending] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [doneToday, setDoneToday] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const load = async () => {
    const [pend, approved] = await Promise.all([
      RegistrationController.getAllRegistrations(),
      RegistrationController.getApprovedRegistrations(),
    ]);
    setPending(pend);
    setApprovedCount(approved.length);
  };

  useEffect(() => { load(); }, []);

  const handle = async (id, action) => {
    try {
      if (action === "active") {
        await RegistrationController.approveRegistration(id);
        setDoneToday((p) => p + 1);
      } else {
        await RegistrationController.rejectRegistration(id, "Rejected by admin");
      }
      load();
    } catch (error) {
      console.error("Error handling verification:", error);
      alert(error.response?.data?.message || "Failed to process verification");
    }
  };

  const filtered = pending.filter((u) => roleFilter === "all" || u.role === roleFilter);

  const viewDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="verifications" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Verifications</h1>
            <p className="text-xs text-gray-400 mt-0.5">Review and approve pending user accounts</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pending Approvals", value: pending.length,  bg: "bg-yellow-50", color: "text-yellow-600", icon: Clock },
              { label: "Approved Today",    value: doneToday,        bg: "bg-green-50",  color: "text-green-600",  icon: ShieldCheck },
              { label: "Total Approved",    value: approvedCount,    bg: "bg-blue-50",   color: "text-blue-600",   icon: ShieldCheck },
            ].map((c) => (
              <div key={c.label} className={`${c.bg} rounded-2xl p-5 flex items-center justify-between shadow-sm`}>
                <div>
                  <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                  <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                  <c.icon size={20} className={c.color} />
                </div>
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
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Pending Accounts</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Email", "Role", "Business", "License", "Joined", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-300 py-16 text-sm">No pending verifications</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{u.contactPerson || u.name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "manufacturer" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{u.businessName || "N/A"}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{u.licenseNumber || "N/A"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt || u.joined).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => viewDetails(u)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                          View Details
                        </button>
                        <button onClick={() => handle(u._id, "active")}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                          <ShieldCheck size={12} /> Approve
                        </button>
                        <button onClick={() => handle(u._id, "suspended")}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                          <ShieldX size={12} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Details Modal */}
        {showDetails && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetails(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Verification Details</h2>
                <button onClick={() => setShowDetails(false)} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
                  <ShieldX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs">1</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.contactPerson || selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Role</p>
                      <p className="text-sm font-medium text-gray-800 capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Joined Date</p>
                      <p className="text-sm font-medium text-gray-800">{new Date(selectedUser.createdAt || selectedUser.joined).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">2</span>
                    Business Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Business Name</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.businessName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">GST Number</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.gstNumber || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Address</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">City</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.city || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">State</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.state || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Pincode</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.pincode || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* License Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">3</span>
                    License Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">License Number</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.licenseNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Drug License</p>
                      <p className="text-sm font-medium text-gray-800">{selectedUser.drugLicense || "N/A"}</p>
                    </div>
                    {selectedUser.manufacturingLicense && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 mb-1">Manufacturing License</p>
                        <p className="text-sm font-medium text-gray-800">{selectedUser.manufacturingLicense}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button onClick={() => { handle(selectedUser._id, "active"); setShowDetails(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors">
                    <ShieldCheck size={16} /> Approve Registration
                  </button>
                  <button onClick={() => { handle(selectedUser._id, "suspended"); setShowDetails(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">
                    <ShieldX size={16} /> Reject Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationsPage;
