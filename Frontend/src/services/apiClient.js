import axios from "axios";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  // baseURL: "/api/v1", // ✅ Netlify can proxy this
  withCredentials: true, // ✅ Cookie support
});

export default instance;
