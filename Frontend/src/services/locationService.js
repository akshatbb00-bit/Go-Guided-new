import api from "./apiClient";

export const fetchLocationName = async ({ params }) => {
  return await api.get("/geocode/reverse-geocode", {
    params,
  });
};
