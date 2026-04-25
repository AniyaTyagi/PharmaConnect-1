import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

const roleHome = (role) => {
  if (role === "seller" || role === "manufacturer") return "/seller/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/buyer-dashboard";
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const role = getUserRole();
  if (allowedRoles && !allowedRoles.includes(role))
    return <Navigate to={roleHome(role)} replace />;

  return children;
};

export default ProtectedRoute;
