import { createContext, useContext, useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { getMe } from "../services/authService";

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means nobody is logged in
  const [loading, setLoading] = useState(true);

  const setUserContext = (userData) => {
    setUser(userData);
  };

  const { request } = useApi(getMe);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await request({});
        setUserContext(response && response.user ? response.user : null);
      } catch (err) {
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.response?.status === 404
        ) {
          setUserContext(null);
        } else {
          console.error("An unexpected error occurred:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ isUserLoading: loading, user, isLoggedIn: Boolean(user), setUserContext }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = () => useContext(UserContext);
