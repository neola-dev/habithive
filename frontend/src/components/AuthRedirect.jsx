import { Navigate, useLocation } from "react-router-dom";

const AuthRedirect = ({ children }) => {
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (!userInfo) {
    return (
      <Navigate
        to={`/login?redirect=${location.pathname}&type=${
          location.pathname.includes("battle") ? "battle" : "group"
        }`}
        replace
      />
    );
  }

  return children;
};

export default AuthRedirect;