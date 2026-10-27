import api from "./apiClient";

export const getUserById = async ({ identifier }) => {
  return await api.get(`user/${identifier}`);
};
export const sendPersonalEmail = async ({ data }) => {
  return await api.post("user/send-custom-email", data);
};
