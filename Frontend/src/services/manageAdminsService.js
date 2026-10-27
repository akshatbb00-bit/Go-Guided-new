import api from "./apiClient";

export const getAllAdmins = async ({ params }) => {
  return await api.get(`user/users?${params}`);
};

export const addAdmin = async ({ data }) => {
  return await api.post("admin/create-admin", data);
};
export const deleteAdmin = async ({ identifier }) => {
  return await api.delete(`admin/delete-admin/${identifier}`);
};
