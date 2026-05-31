// Login.jsx — Premium login page
import { useState } from "react";

export default function Login({ onLogin }) {
  const [role,     setRole]     = useState("buyer");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const DEMO = {
    buyer:  { email:"buyer@test.com",  password:"buyer123"  },
    seller: { email:"seller@test.com", password:"seller123" },
    owner:  { email:"owner@test.com",  password:"owner123"  },
  };

  const roleConfig = {
    buyer:  { icon:"🛒", label:"Buyer",  color:"#f6a623", gradient:"linear-gradient(135deg, #f6a623 0%, #f97316 100%)" },
    seller: { icon:"🏪", label:"Seller", color:"#3b82f6", gradient:"linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
    owner:  { icon:"👑", label:"Owner",  color:"#7c3aed", gradient:"linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" },
  };

  async function handleLogin(emailOverride, passwordOverride) {
    setError(""); setLoading(true);
    const loginEmail    = emailOverride    || email;
    const loginPassword = passwordOverride || password;
    try {
      const res  = await fetch("/api/auth/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || "Wrong email or password.");
      }
    } catch(e) {
      setError("Cannot reach server. Is backend running?");
    }
    setLoading(false);
  }

  function fillDemo() {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
  }

  return (
    <div style={s.page}>
      {/* Animated background */}
      <div style={s.bgGradient}/>
      <div style={s.blob1}/>
      <div style={s.blob2}/>
      <div style={s.blob3}/>
      
      {/* Main card */}
      <div style={s.card} className="fade-in login-card">
        {/* Logo section */}
        <div style={s.logoSection} className="login-logo-section">
          <div style={s.logoCircle} className="login-logo-circle">
            <span style={s.logoIcon}>⚡</span>
          </div>
          <h1 style={s.logoText} className="login-logo-text">
            Smarter<span style={{...s.logoAccent, background: roleConfig[role].gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>Blinkit</span>
          </h1>
          <p style={s.tagline} className="login-tagline">India's Most Intelligent Grocery Platform</p>
        </div>

        {/* Role selector */}
        <div style={s.roleSection} className="login-role-section">
          <p style={s.roleLabel} className="login-role-label">Select Your Role</p>
          <div style={s.tabs} className="login-tabs">
            {Object.entries(roleConfig).map(([r, cfg]) => (
              <button key={r}
                style={{
                  ...s.tab,
                  ...(role===r ? {
                    background: cfg.gradient,
                    color: "#fff",
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 24px ${cfg.color}44`
                  } : {})
                }}
                onClick={()=>{setRole(r);setEmail(DEMO[r].email);setPassword(DEMO[r].password);setError("");}}>
                <span style={s.tabIcon}>{cfg.icon}</span>
                <span style={s.tabLabel}>{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form section */}
        <div style={s.formSection}>
          <div style={s.formGroup}>
            <label style={s.label}>
              <span style={s.labelIcon}>📧</span>
              Email Address
            </label>
            <input 
              style={{...s.input, borderColor: role ? roleConfig[role].color + "33" : "#e5e7eb"}} 
              type="email" 
              placeholder="Enter your email"
              value={email} 
              onChange={e=>setEmail(e.target.value)}
            />
          </div>
          
          <div style={s.formGroup}>
            <label style={s.label}>
              <span style={s.labelIcon}>🔒</span>
              Password
            </label>
            <div style={s.passwordWrapper}>
              <input 
                style={{...s.input, paddingRight: 48, borderColor: role ? roleConfig[role].color + "33" : "#e5e7eb"}} 
                type={showPass?"text":"password"}
                placeholder="Enter your password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              />
              <button style={s.eye} onClick={()=>setShowPass(!showPass)}>
                {showPass ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={s.err} className="slide-in">
              <span style={s.errIcon}>⚠️</span>
              {error}
            </div>
          )}

          <button
            style={{...s.loginBtn, background: roleConfig[role].gradient}}
            onClick={() => handleLogin()} 
            disabled={loading}>
            {loading ? (
              <><span style={s.btnSpinner}/> Logging in...</>
            ) : (
              <>Login as {roleConfig[role].label} <span style={s.btnArrow}>→</span></>
            )}
          </button>

          {/* Demo credentials */}
          <div style={s.demoBox} className="login-demo-box" onClick={fillDemo}>
            <div style={s.demoHeader}>
              <span style={s.demoIcon}>🧪</span>
              <span style={s.demoTitle}>Demo Credentials</span>
            </div>
            <div style={s.demoContent}>
              <span style={s.demoText}>{DEMO[role].email}</span>
              <span style={s.demoDivider}>•</span>
              <span style={s.demoText}>{DEMO[role].password}</span>
            </div>
            <p style={s.demoHint}>Click to auto-fill</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px"
  },
  bgGradient: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 20% 50%, rgba(246, 166, 35, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 50%)",
    pointerEvents: "none"
  },
  blob1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(246, 166, 35, 0.2) 0%, transparent 70%)",
    top: "-150px",
    right: "-150px",
    pointerEvents: "none",
    animation: "pulse 8s ease-in-out infinite"
  },
  blob2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
    bottom: "-100px",
    left: "-100px",
    pointerEvents: "none",
    animation: "pulse 10s ease-in-out infinite"
  },
  blob3: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    animation: "pulse 12s ease-in-out infinite"
  },
  card: {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: "48px 40px",
    width: "100%",
    maxWidth: 480,
    position: "relative",
    zIndex: 1,
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
  },
  logoSection: {
    textAlign: "center",
    marginBottom: 40
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f6a623 0%, #f97316 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 8px 32px rgba(246, 166, 35, 0.4)",
    animation: "glow 3s ease-in-out infinite"
  },
  logoIcon: {
    fontSize: 40,
    filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))"
  },
  logoText: {
    fontSize: 32,
    fontWeight: 900,
    color: "#1a1a1a",
    letterSpacing: -1,
    marginBottom: 8
  },
  logoAccent: {
    marginLeft: 4
  },
  tagline: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500,
    margin: 0
  },
  roleSection: {
    marginBottom: 32
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    padding: 0
  },
  tab: {
    padding: "16px 12px",
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
  },
  tabIcon: {
    fontSize: 28,
    lineHeight: 1
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: 600
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: 0
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#334155",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 600
  },
  labelIcon: {
    fontSize: 16
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    background: "#fff",
    color: "#1a1a1a",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s",
    fontWeight: 500
  },
  passwordWrapper: {
    position: "relative"
  },
  eye: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 20,
    padding: 8,
    color: "#64748b",
    transition: "color 0.2s"
  },
  err: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    border: "2px solid #fca5a5",
    color: "#dc2626",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600
  },
  errIcon: {
    fontSize: 18
  },
  loginBtn: {
    width: "100%",
    padding: "16px 24px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s"
  },
  btnSpinner: {
    width: 16,
    height: 16,
    border: "2px solid #fff",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
    display: "inline-block"
  },
  btnArrow: {
    fontSize: 18,
    fontWeight: 900
  },
  demoBox: {
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    border: "2px dashed #cbd5e1",
    borderRadius: 12,
    padding: "16px 20px",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  demoHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  demoIcon: {
    fontSize: 18
  },
  demoTitle: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  demoContent: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },
  demoText: {
    color: "#f6a623",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
    fontWeight: 600
  },
  demoDivider: {
    color: "#cbd5e1",
    fontSize: 12
  },
  demoHint: {
    color: "#94a3b8",
    fontSize: 12,
    margin: 0,
    fontStyle: "italic"
  }
};
