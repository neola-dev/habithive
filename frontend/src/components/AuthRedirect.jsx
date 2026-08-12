import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const AuthRedirect = ({ children }) => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch {
        setUserInfo(null);
      }
    } else {
      setUserInfo(null);
    }
  }, []);

  // Wait until auth state is loaded
  if (userInfo === undefined) {
    return null; // or a loading spinner
  }

  // Not logged in OR invalid userInfo
  if (!userInfo || !userInfo.token) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          redirect: location.pathname,
          inviteMessage: location.pathname.includes("battle")
            ? "⚠️ Login to join the battle"
            : "⚠️ Login to join the group",
        }}
      />
    );
  }

  return children;
};

export default AuthRedirect;