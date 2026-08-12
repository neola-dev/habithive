import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../assets/teamwork.json";
import "../styles/Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [googleClientId, setGoogleClientId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Redirect check (for invitations/battles support)
  const redirect = location.state?.redirect || "/app";

  // Check password constraints
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const checksSatisfied = Object.values(passwordChecks).filter(Boolean).length;
  let strength = "";
  if (password.length > 0) {
    if (checksSatisfied <= 2) strength = "Weak";
    else if (checksSatisfied <= 4) strength = "Medium";
    else strength = "Strong";
  }

  // ✅ Fetch Google Client ID and initialize Sign-In SDK
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/users/config`)
      .then((res) => {
        if (res.data.googleClientId) {
          setGoogleClientId(res.data.googleClientId);
        }
      })
      .catch((err) => {
        console.error("Failed to load backend config in Register page:", err);
      });
  }, []);

  useEffect(() => {
    if (googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { 
            theme: "outline", 
            size: "large", 
            width: "310",
            text: "signup_with",
            shape: "pill"
          }
        );
      } catch (err) {
        console.error("Google accounts initialize error in Register:", err);
      }
    }
  }, [googleClientId]);

  // ✅ Google Authentication response handler
  const handleGoogleCredentialResponse = async (response) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/google-auth`,
        { credential: response.credential }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          token: data.token,
          id: data.id,
          name: data.name,
        })
      );

      showToast("Registered successfully via Google!", "success");
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 1000);

    } catch (error) {
      const msg = error.response?.data?.message || "Google signup failed. Please try again.";
      showToast(msg, "error");
      setIsLoading(false);
    }
  };

  // ✅ Trigger validation on confirmPassword as password changes
  useEffect(() => {
    if (confirmPassword) {
      if (confirmPassword !== password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  }, [password, confirmPassword]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ Name validation helper
  const handleNameChange = (val) => {
    setName(val);
    if (!val) {
      setNameError("Name is required");
    } else if (val.trim().length < 3) {
      setNameError("Name must be at least 3 characters");
    } else if (val.length > 40) {
      setNameError("Name cannot exceed 40 characters");
    } else {
      setNameError("");
    }
  };

  // ✅ Email validation helper
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

  // ✅ Confirm Password change handler
  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    if (!val) {
      setConfirmPasswordError("Please confirm your password");
    } else if (val !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // ✅ Toggle Password Visibility
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

  // ✅ Toggle Confirm Password Visibility
  const toggleConfirmPasswordVisibility = () => {
    const inputEl = document.getElementById("confirmPassword");
    if (!inputEl) return;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    
    setShowConfirmPassword((prev) => !prev);
    
    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start, end);
    }, 0);
  };

  // ✅ Email & Password Submit Registration
  const submitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Final checks
    if (!name || nameError) {
      showToast("Please enter a valid name", "error");
      return;
    }
    if (!email || emailError) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    if (checksSatisfied < 5) {
      showToast("Password must satisfy all criteria", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        { name: name.trim(), email, password }
      );

      if (!data.token) {
        showToast("Registration error: Token missing from backend!", "error");
        setIsLoading(false);
        return;
      }

      // Save user session
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          token: data.token,
          id: data.id,
          name: data.name,
        })
      );

      showToast("Account created successfully! Welcome.", "success");
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      const backendMessage = error.response?.data?.message;
      if (backendMessage === "User already exists") {
        showToast("Account already exists with this email address", "error");
      } else {
        showToast(backendMessage || "Registration failed. Please try again.", "error");
      }
    }
  };

  const isFormValid =
    name &&
    !nameError &&
    email &&
    !emailError &&
    checksSatisfied === 5 &&
    password === confirmPassword &&
    !confirmPasswordError;

  return (
    <div className="login-container">
      {/* Toast */}
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
        <div className="hero-content">
          <h1 className="brand-title">HabitHive</h1>
          <Lottie animationData={animationData} className="login-animation" />
          <p className="brand-tagline">Build Better Habits — Together</p>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🔥</span>
            <span className="auth-feature-text">Track daily streaks &amp; build momentum</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">👥</span>
            <span className="auth-feature-text">Join groups and stay accountable</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🏆</span>
            <span className="auth-feature-text">Earn badges and unlock achievements</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Register Card */}
      <div className="login-right">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Sign In
        </button>

        <div className="auth-card register-card">
          {/* Brand badge */}
          <div className="auth-logo-badge">
            <span className="badge-dot"></span>
            <span className="badge-name">HabitHive</span>
          </div>

          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Join thousands building better habits daily.</p>

          <form onSubmit={submitHandler} noValidate>
            {/* Name */}
            <div className="input-group">
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`auth-input ${nameError ? "input-error" : ""}`}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "name-error" : undefined}
                disabled={isLoading}
              />
              {nameError && (
                <span id="name-error" className="error-message" role="alert">{nameError}</span>
              )}
            </div>

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

            {/* Strength Meter */}
            {password && (
              <div className="strength-meter-container">
                <div className="strength-meter-bar">
                  <div className={`strength-fill fill-${strength.toLowerCase()}`}></div>
                </div>
                <span className={`strength-text text-${strength.toLowerCase()}`}>
                  Password strength: <strong>{strength}</strong>
                </span>
              </div>
            )}

            {/* Checklist */}
            {password && (
              <div className="checklist-container">
                <span className="checklist-title">Requirements</span>
                <ul className="checklist-list">
                  <li className={passwordChecks.length ? "satisfied" : "pending"}>
                    <span className="chk-icon">{passwordChecks.length ? "✓" : "○"}</span>
                    At least 8 characters
                  </li>
                  <li className={passwordChecks.uppercase ? "satisfied" : "pending"}>
                    <span className="chk-icon">{passwordChecks.uppercase ? "✓" : "○"}</span>
                    One uppercase letter (A–Z)
                  </li>
                  <li className={passwordChecks.lowercase ? "satisfied" : "pending"}>
                    <span className="chk-icon">{passwordChecks.lowercase ? "✓" : "○"}</span>
                    One lowercase letter (a–z)
                  </li>
                  <li className={passwordChecks.number ? "satisfied" : "pending"}>
                    <span className="chk-icon">{passwordChecks.number ? "✓" : "○"}</span>
                    One number (0–9)
                  </li>
                  <li className={passwordChecks.special ? "satisfied" : "pending"}>
                    <span className="chk-icon">{passwordChecks.special ? "✓" : "○"}</span>
                    One special character (!@#$%)
                  </li>
                </ul>
              </div>
            )}

            {/* Confirm Password */}
            <div className="input-group password-group">
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={`auth-input ${confirmPasswordError ? "input-error" : ""}`}
                aria-invalid={!!confirmPasswordError}
                aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                disabled={isLoading}
              />
              <button type="button" className="password-toggle" onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                {showConfirmPassword ? (
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
              {confirmPasswordError && (
                <span id="confirm-password-error" className="error-message" role="alert">{confirmPasswordError}</span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="auth-button" disabled={isLoading || !isFormValid}>
              {isLoading ? (
                <span className="spinner-container">
                  <span className="loading-spinner"></span>
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          {/* Google Sign-Up */}
          {googleClientId && (
            <div className="google-divider-container">
              <span className="google-divider-text">or sign up with</span>
              <div id="google-signup-btn" className="google-btn-wrapper"></div>
            </div>
          )}

          <p className="auth-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/")} role="link" tabIndex="0"
              onKeyDown={(e) => e.key === "Enter" && navigate("/")}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;