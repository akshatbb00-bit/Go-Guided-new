import api from "./apiClient";

export const sendChat = async ({ data }) => {
  return await api.post("/chat", data);
};
