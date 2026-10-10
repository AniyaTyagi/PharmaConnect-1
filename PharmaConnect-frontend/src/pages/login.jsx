import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveUser } from "../utils/auth";
import RegistrationForm from "../views/RegistrationForm";
import "../styles/login.css";

const DEMO_ACCOUNTS = [
  { label: "Buyer Account",  email: "buyer@test.com",  password: "password123", role: "buyer",  badge: "Buyer"  },
  { label: "Seller Account", email: "seller@test.com", password: "password123", role: "seller", badge: "Seller" },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(null);

  const routeByRole = (role) => {
    if (role === "seller" || role === "manufacturer") return "/seller/dashboard";
    if (role === "admin")  return "/admin/dashboard";
    return "/buyer-dashboard";
  };

  // Redirect if already logged in
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) navigate(routeByRole(user.role), { replace: true });
    } catch {}
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api.login(email, password);
      saveUser(data.user);
      navigate(routeByRole(data.user.role));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDemoLogin = async (demo) => {
    setLoadingDemo(demo.role);
    try {
      const data = await api.login(demo.email, demo.password);
      saveUser(data.user);
      navigate(routeByRole(data.user.role));
    } catch (err) {
      alert(err.response?.data?.message || "Demo login failed. Please try again.");
    } finally {
      setLoadingDemo(null);
    }
  };


  return (
    <div className="login-container">
      
      {/* LEFT SIDE */}
      <div className="left-section">
        <div className="brand">
          <div className="brand-text">
            <h1>PharmaConnect</h1>
            <p>Healthcare Supply Chain Platform</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-content">
            <h3>Comprehensive Catalog</h3>
            <p>Access thousands of verified medicines and medical equipment from trusted suppliers</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-content">
            <h3>Secure Transactions</h3>
            <p>Enterprise-grade security with complete compliance and audit trails</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-content">
            <h3>Healthcare First</h3>
            <p>Built specifically for healthcare professionals and medical institutions</p>
          </div>
        </div>
      </div>


      {/* RIGHT SIDE */}
      <div className="right-section">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          <div className="login-body">
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button type="submit">Sign In</button>
            </form>

            <p className="signup-text">
              Don't have an account? <span onClick={() => setShowRegistration(true)} style={{cursor: 'pointer', color: '#10b981', fontWeight: 700}}>Sign up now</span>
            </p>

            {/* Demo Accounts */}
            <div className="demo-accounts">
              <h4>Quick Demo Access</h4>
              {DEMO_ACCOUNTS.map((demo) => (
                <div
                  key={demo.role}
                  className={`demo-card ${demo.role}`}
                  onClick={() => handleDemoLogin(demo)}
                >
                  <div className="demo-info">
                    <h5>{demo.label}</h5>
                    <p>{demo.email}</p>
                  </div>
                  <span className="demo-badge">
                    {loadingDemo === demo.role ? "Loading…" : `Try ${demo.badge}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RegistrationForm open={showRegistration} onClose={() => setShowRegistration(false)} />
    </div>
    
  );
};

export default Login;