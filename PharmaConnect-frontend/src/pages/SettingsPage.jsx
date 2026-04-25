import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, LogOut, Bell, Lock, ShieldAlert, User, Eye, EyeOff } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import axiosInstance from "../utils/axiosInstance";

const Field = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
  <div>
    <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
    <input name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300" />
  </div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
        <Icon size={15} className="text-emerald-600" />
      </div>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, sub, checked, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm text-gray-700 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
    <button onClick={onChange} type="button"
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Buyer","email":"buyer@test.com"}');

  const [profile,    setProfile]    = useState({ name: user.name, email: user.email, phone: "", company: "" });
  const [passwords,  setPasswords]  = useState({ current: "", newPass: "", confirm: "" });
  const [notifPrefs, setNotifPrefs] = useState({ orderUpdates: true, invoices: true, shipment: true, promotions: false });
  const [showPw,     setShowPw]     = useState(false);
  const [saved,      setSaved]      = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const flash = (s) => { setSaved(s); setTimeout(() => setSaved(null), 2500); };

  const saveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ ...user, name: profile.name, email: profile.email }));
    flash("profile");
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return alert("Passwords do not match");
    if (passwords.newPass.length < 6) return alert("Password must be at least 6 characters");
    if (!passwords.current) return alert("Please enter your current password");
    try {
      await axiosInstance.patch("/api/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      flash("password");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="settings" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 max-w-2xl space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Settings</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage your account preferences</p>
          </div>

          {/* Profile */}
          <SectionCard icon={User} title="Profile Information">
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {profile.name?.[0]?.toUpperCase() || "B"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{profile.name || "Buyer"}</p>
                  <p className="text-xs text-gray-400">{profile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name"    name="name"    value={profile.name}    onChange={(e) => setProfile({ ...profile, name: e.target.value })}    placeholder="Your name" />
                <Field label="Email"        name="email"   value={profile.email}   onChange={(e) => setProfile({ ...profile, email: e.target.value })}   type="email" placeholder="you@example.com" />
                <Field label="Phone"        name="phone"   value={profile.phone}   onChange={(e) => setProfile({ ...profile, phone: e.target.value })}   placeholder="+91 XXXXX XXXXX" />
                <Field label="Company Name" name="company" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} placeholder="Your company" />
              </div>
              <div className="flex items-center justify-between pt-1">
                {saved === "profile" ? <p className="text-xs text-emerald-600 font-medium">✓ Profile saved successfully</p> : <span />}
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Notifications */}
          <SectionCard icon={Bell} title="Notification Preferences">
            <div className="space-y-3">
              <Toggle label="Order Updates"    sub="Get notified when your order status changes"    checked={notifPrefs.orderUpdates} onChange={() => setNotifPrefs((p) => ({ ...p, orderUpdates: !p.orderUpdates }))} />
              <Toggle label="Invoice Alerts"   sub="Receive alerts when new invoices are generated" checked={notifPrefs.invoices}     onChange={() => setNotifPrefs((p) => ({ ...p, invoices: !p.invoices }))} />
              <Toggle label="Shipment Tracking" sub="Track your shipments in real-time"             checked={notifPrefs.shipment}     onChange={() => setNotifPrefs((p) => ({ ...p, shipment: !p.shipment }))} />
              <Toggle label="Promotions"        sub="Receive promotional offers and discounts"      checked={notifPrefs.promotions}   onChange={() => setNotifPrefs((p) => ({ ...p, promotions: !p.promotions }))} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {saved === "notif" ? <p className="text-xs text-emerald-600 font-medium">✓ Preferences saved</p> : <span />}
              <button type="button" onClick={() => flash("notif")}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                <Save size={14} /> Save Preferences
              </button>
            </div>
          </SectionCard>

          {/* Password */}
          <SectionCard icon={Lock} title="Change Password">
            <form onSubmit={savePassword} className="space-y-4">
              <div className="relative">
                <label className="text-xs font-medium text-gray-600 block mb-1">Current Password</label>
                <input value={passwords.current} type={showPw ? "text" : "password"}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300 pr-10" />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">New Password</label>
                  <input value={passwords.newPass} type={showPw ? "text" : "password"}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Confirm Password</label>
                  <input value={passwords.confirm} type={showPw ? "text" : "password"}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-gray-300" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                {saved === "password" ? <p className="text-xs text-emerald-600 font-medium">✓ Password updated successfully</p> : <span />}
                <button type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <Lock size={14} /> Update Password
                </button>
              </div>
            </form>
          </SectionCard>

          {/* Account */}
          <SectionCard icon={ShieldAlert} title="Account">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Log Out</p>
                  <p className="text-xs text-gray-400">Sign out of your buyer account</p>
                </div>
                {!logoutConfirm ? (
                  <button onClick={() => setLogoutConfirm(true)} type="button"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                    <LogOut size={14} /> Log Out
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">Are you sure?</p>
                    <button onClick={logout} type="button"
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                      Yes, Logout
                    </button>
                    <button onClick={() => setLogoutConfirm(false)} type="button"
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-red-700">Delete Account</p>
                  <p className="text-xs text-red-400">Permanently remove your account and data</p>
                </div>
                <button type="button" onClick={() => alert("Please contact support to delete your account.")}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </SectionCard>

        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
