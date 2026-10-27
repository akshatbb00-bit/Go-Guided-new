import api from "./apiClient";

export const getStats = async () => {
  return await api.get("/dashboard/stats");
};

export const getStatCardCounts = async () => {
  return await api.get("/dashboard/stat-cards");
};

export const fetchAchievements = async () => {
  return await api.get("/dashboard/achievements");
};
