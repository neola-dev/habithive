import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const AuthRedirect = ({ children }) => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    setUserInfo(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  // ⛔ Wait until we know auth state
  if (userInfo === undefined) return null;

  if (userInfo === null) {
    return (
      <Navigate
        to="/"
        state={{
          redirect: location.pathname,
          inviteMessage: location.pathname.includes("battle")
            ? "⚠️ Login to join the battle"
            : "⚠️ Login to join the group",
        }}
        replace
      />
    );
  }

  return children;
};

export default AuthRedirect;