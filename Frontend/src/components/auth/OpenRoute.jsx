import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// This will prevent authenticated users from accessing this route
function OpenRoute({ children }) {
  const token = useSelector((state) => state.auth.token);

  return token ? <Navigate to="/dashboard/my-profile" replace /> : children;
}

export default OpenRoute;
