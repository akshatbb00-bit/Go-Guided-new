import api from "./apiClient";

// Get all announcements
export const getAnnouncements = async () => {
  return await api.get("/announcement");
};

export const createAnnouncement = ({ data }) =>
  api.post("/announcement/post", data);
