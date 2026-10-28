import axios from "axios";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  // baseURL: "/api/v1", // ✅ Netlify can proxy this
  withCredentials: true, // ✅ Cookie support
});

// Cookies are the normal way to stay logged in. Some browsers block cookies that are set by another
// website (our frontend and backend are on different addresses), so the token is also kept here and
// sent as "Authorization: Bearer <token>".
const TOKEN_KEY = "gg_token";

instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* storage not available */
  }
  return config;
});

instance.interceptors.response.use(
  (res) => {
    try {
      const url = res.config?.url || "";
      if (url.endsWith("/auth/login") && res.data?.token) localStorage.setItem(TOKEN_KEY, res.data.token);
      if (url.endsWith("/auth/logout")) localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage not available */
    }
    return res;
  },
  (err) => {
    try {
      const url = err.config?.url || "";
      const status = err.response?.status;
      if (url.endsWith("/auth/me") && (status === 401 || status === 404)) localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage not available */
    }
    return Promise.reject(err);
  }
);

export default instance;
