import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (!userInfo) {
    localStorage.setItem("redirectPath", window.location.pathname);
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;