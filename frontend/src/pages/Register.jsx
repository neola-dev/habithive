import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/teamwork.json";
import "../styles/Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        { name, email, password }
      );
      console.log("API URL:", import.meta.env.VITE_API_URL);
      // ✅ DEBUG (VERY IMPORTANT)
      console.log("Register API response:", data);

      // ❗ Ensure token exists
      if (!data.token) {
        alert("Token missing from backend!");
        return;
      }

      // ✅ Save user
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          token: data.token,
          id: data.id,
          name: data.name,
        })
      );

      console.log("Saved in localStorage:", localStorage.getItem("userInfo"));

      // ✅ Navigate to app
      navigate("/app", { replace: true });

    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1 className="brand-title">HabitHive</h1>
        <Lottie animationData={animationData} className="login-animation" />
        <p className="brand-tagline">Build Better Habits — Together</p>
      </div>

      <div className="login-right">
        <div className="auth-card">
          <h2 className="auth-title">Register</h2>

          <form onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
            />

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
              Register
            </button>
          </form>

          <p className="auth-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;