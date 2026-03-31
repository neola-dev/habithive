import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "../assets/teamwork.json";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect =
  searchParams.get("redirect") ||
  location.state?.redirect ||
  "/app";

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
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        { email, password }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          token: data.token,
          id: data.id,
          name: data.name,
        })
      );
      const destination = location.state?.redirect || "/app";
    
      navigate(destination, { replace: true });
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
        <p className="brand-tagline">
          Build Better Habits — Together
        </p>
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
            <span onClick={() => navigate("/register", { state: location.state })}>
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;