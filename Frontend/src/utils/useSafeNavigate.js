import { useLocation, useNavigate } from "react-router";

function useSafeNavigate() {
  const location = useLocation();
  const navigate = useNavigate();

  return (path, options = {}) => {
    if (location.pathname !== path) {
      navigate(path, options);
    }
  };
}

export default useSafeNavigate;
