import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../assets/teamwork.json";
import logo from "../assets/logo.png";
import "../styles/Auth.css";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.state?.redirect || "/app";

  useEffect(() => {
    const inviteCode = localStorage.getItem("inviteCode");
    const battleCode = localStorage.getItem("battleCode");

    if (inviteCode) setInviteMessage("⚠️ Login to join the invited group");
    if (battleCode) setInviteMessage("⚠️ Login to join the battle");
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({ token: data.token, id: data.id, name: data.name })
      );

      const inviteCode = localStorage.getItem("inviteCode");
      const battleCode = localStorage.getItem("battleCode");

      if (inviteCode) {
        localStorage.removeItem("inviteCode");
        navigate(`/invite/${inviteCode}`);
      } else if (battleCode) {
        localStorage.removeItem("battleCode");
        navigate(`/battle/${battleCode}`);
      } else {
        navigate(redirect);
      }
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="login-container">
      {/* LEFT */}
      <div className="login-left">
        <h1 className="brand-title">HabitHive</h1>
        <Lottie animationData={animationData} className="login-animation" />
        <p className="brand-tagline">Build Better Habits — Together</p>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="auth-card">
          <h2 className="auth-title">Login</h2>

          {inviteMessage && (
            <div className="invite-banner">{inviteMessage}</div>
          )}

          <form onSubmit={submitHandler}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>

          <p className="auth-link">
            New user?{" "}
            <span onClick={() => navigate("/register")}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;