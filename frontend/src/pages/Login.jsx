import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/teamwork.json";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [inviteMessage, setInviteMessage] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ Redirect config
  const redirect =
    searchParams.get("redirect") ||
    location.state?.redirect ||
    "/app";

  // ✅ Load initial invite/banner notifications
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "battle") {
      setInviteMessage("⚠️ Login to join the battle");
    } else if (type === "group") {
      setInviteMessage("⚠️ Login to join the invited group");
    } else if (location.state?.inviteMessage) {
      setInviteMessage(location.state.inviteMessage);
    }
  }, [searchParams, location.state]);

  // ✅ Prefill email if "Remember Me" was previously checked
  // If already logged in, redirect directly
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    const rememberFlag = localStorage.getItem("rememberMe") === "true";
    if (remembered && rememberFlag) {
      setEmail(remembered);
      setRememberMe(true);
    }

    const userInfo = localStorage.getItem("userInfo");
    if (userInfo && location.pathname === "/") {
      navigate(redirect, { replace: true });
    }
  }, [navigate, redirect, location.pathname]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ Real-time email validation
  const handleEmailChange = (val) => {
    setEmail(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(val)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  // ✅ Toggle Password visibility and preserve cursor position
  const togglePasswordVisibility = () => {
    const inputEl = document.getElementById("password");
    if (!inputEl) return;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;

    setShowPassword((prev) => !prev);

    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start, end);
    }, 0);
  };

  // ✅ Submit handler (Standard Credentials)
  const submitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (emailError) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    if (!password) {
      showToast("Password is required", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Handle Remember Me
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          token: data.token,
          id: data.id,
          name: data.name,
        })
      );

      showToast("Welcome back! Login successful.", "success");
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      const backendMessage = error.message;
      if (backendMessage === "Invalid credentials") {
        showToast("Incorrect email or password", "error");
      } else {
        showToast(backendMessage || "Login failed. Please check your credentials.", "error");
      }
    }
  };

  return (
    <div className="login-container">
      {/* Dynamic Toast Alert */}
      {toast && (
        <div className={`toast-card toast-${toast.type} show`}>
          <div className="toast-content">
            <span className="toast-icon">{toast.type === "success" ? "✓" : "⚠️"}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* LEFT — Navy Hero */}
      <div className="login-left">
        <div className="blob1"></div>
        <div className="blob2"></div>
        <div className="background-glow"></div>

        <div className="hero-content">
          <h1 className="brand-title">HabitHive</h1>
          <Lottie animationData={animationData} className="login-animation" />
          <p className="brand-tagline">Build Better Habits — Together</p>
        </div>

        {/* Feature pills */}
        <div className="auth-features">
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🔥</span>
            <span className="auth-feature-text">Track daily streaks & build momentum</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">⚔️</span>
            <span className="auth-feature-text">Battle friends and climb the leaderboard</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🏆</span>
            <span className="auth-feature-text">Earn badges and unlock achievements</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Card */}
      <div className="login-right">
        <div className="auth-card">
          {/* Brand badge */}
          <div className="auth-logo-badge">
            <span className="badge-dot"></span>
            <span className="badge-name">HabitHive</span>
          </div>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to keep your streak alive.</p>

          {inviteMessage && (
            <div className="invite-banner" role="status">{inviteMessage}</div>
          )}

          <form onSubmit={submitHandler} noValidate>
            {/* Email */}
            <div className="input-group">
              <label htmlFor="email" className="sr-only">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`auth-input ${emailError ? "input-error" : ""}`}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                disabled={isLoading}
              />
              {emailError && (
                <span id="email-error" className="error-message" role="alert">{emailError}</span>
              )}
            </div>

            {/* Password */}
            <div className="input-group password-group">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                disabled={isLoading}
              />
              <button type="button" className="password-toggle" onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me */}
            <div className="auth-utilities" style={{ justifyContent: "flex-start", marginBottom: "8px" }}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-checkmark"></span>
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-button"
              disabled={isLoading || !!emailError || !email || !password}
            >
              {isLoading ? (
                <span className="spinner-container">
                  <span className="loading-spinner"></span>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="auth-link">
            New to HabitHive?{" "}
            <span
              onClick={() => navigate("/register", { state: location.state })}
              role="link"
              tabIndex="0"
              onKeyDown={(e) => e.key === "Enter" && navigate("/register", { state: location.state })}
            >
              Create a free account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;