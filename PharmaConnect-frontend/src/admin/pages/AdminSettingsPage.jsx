import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, LogOut, ShieldAlert, Bell, Eye, EyeOff, Lock } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const Field = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
  <div>
    <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
    <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300" />
  </div>
);

const Toggle = ({ label, sub, checked, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm text-gray-700 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
    <button onClick={onChange} type="button"
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-emerald-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "Admin User", email: "admin@test.com", phone: "" });
  const [notifs, setNotifs]   = useState({ newUsers: true, newProducts: true, transactions: true, reports: false });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showPw, setShowPw]   = useState(false);
  const [saved, setSaved]     = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const flash = (k) => { setSaved(k); setTimeout(() => setSaved(null), 2500); };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="settings" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 max-w-2xl space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Settings</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage admin profile and platform preferences</p>
          </div>

          {/* Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><ShieldAlert size={15} className="text-emerald-600" /></div>
              <h2 className="text-sm font-bold text-gray-800">Admin Profile</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">A</div>
              <div><p className="text-sm font-semibold text-gray-800">{profile.name}</p><p className="text-xs text-gray-400">{profile.email}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" name="name"  value={profile.name}  onChange={(e) => setProfile({ ...profile, name: e.target.value })}  placeholder="Admin name" />
              <Field label="Email"     name="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" placeholder="admin@example.com" />
              <Field label="Phone"     name="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="flex items-center justify-between pt-1">
              {saved === "profile" ? <p className="text-xs text-emerald-600 font-medium">✓ Profile saved</p> : <span />}
              <button onClick={() => flash("profile")}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Save size={14} /> Save Profile
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><Bell size={15} className="text-emerald-600" /></div>
              <h2 className="text-sm font-bold text-gray-800">Notification Preferences</h2>
            </div>
            <Toggle label="New User Registrations" sub="Alert when new users sign up"          checked={notifs.newUsers}     onChange={() => setNotifs((p) => ({ ...p, newUsers: !p.newUsers }))} />
            <Toggle label="New Product Submissions" sub="Alert when sellers add products"       checked={notifs.newProducts}  onChange={() => setNotifs((p) => ({ ...p, newProducts: !p.newProducts }))} />
            <Toggle label="Transaction Alerts"      sub="Notify on every platform transaction" checked={notifs.transactions} onChange={() => setNotifs((p) => ({ ...p, transactions: !p.transactions }))} />
            <Toggle label="Weekly Reports"          sub="Receive weekly platform summary"      checked={notifs.reports}      onChange={() => setNotifs((p) => ({ ...p, reports: !p.reports }))} />
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {saved === "notif" ? <p className="text-xs text-emerald-600 font-medium">✓ Preferences saved</p> : <span />}
              <button onClick={() => flash("notif")}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Save size={14} /> Save Preferences
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"><Lock size={15} className="text-emerald-600" /></div>
              <h2 className="text-sm font-bold text-gray-800">Change Password</h2>
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-gray-600 block mb-1">Current Password</label>
              <input value={passwords.current} type={showPw ? "text" : "password"} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300 pr-10" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">New Password</label>
                <input value={passwords.newPass} type={showPw ? "text" : "password"} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Confirm Password</label>
                <input value={passwords.confirm} type={showPw ? "text" : "password"} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              {saved === "password" ? <p className="text-xs text-emerald-600 font-medium">✓ Password updated</p> : <span />}
              <button onClick={() => { if (passwords.newPass !== passwords.confirm) { alert("Passwords don't match"); return; } flash("password"); setPasswords({ current: "", newPass: "", confirm: "" }); }}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Lock size={14} /> Update Password
              </button>
            </div>
          </div>

          {/* Account / Logout */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><LogOut size={15} className="text-red-500" /></div>
              <h2 className="text-sm font-bold text-gray-800">Account</h2>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800">Log Out</p>
                <p className="text-xs text-gray-400">Sign out of the admin panel</p>
              </div>
              {!logoutConfirm ? (
                <button onClick={() => setLogoutConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                  <LogOut size={14} /> Log Out
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Are you sure?</p>
                  <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Yes, Logout</button>
                  <button onClick={() => setLogoutConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
