import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/" state={{ redirect: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;