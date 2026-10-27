import api from "./apiClient";

export const updateName = async ({ data }) => {
  return await api.patch("account/update-name", data);
};

export const updateProfilePic = async ({ data }) => {
  return await api.patch("account/update-profile-pic", data);
};
