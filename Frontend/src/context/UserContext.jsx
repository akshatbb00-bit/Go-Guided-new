import { createContext, useContext, useState, useEffect } from "react";
import useApi from "../hooks/useApi";
import { getMe } from "../services/authService";

// Create the context
const UserContext = createContext();

// Default user object
const defaultUser = {
  role: "user",
  name: "Aman",
  permissions: [],
};

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(); // default user with role
  const [loading, setLoading] = useState(true);

  const setUserContext = (userData) => {
    setUser(userData);
  };

  const { request } = useApi(getMe);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await request({});
        if (response && response.user) {
          setUserContext(response.user);
        } else {
          setUserContext(defaultUser);
        }
      } catch (err) {
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.response?.status === 404
        ) {
          setUserContext(defaultUser);
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
      value={{ isUserLoading: loading, user, setUserContext }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the user context
export const useUser = () => useContext(UserContext);
