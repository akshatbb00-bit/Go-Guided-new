import api from "./apiClient";

export const getAnalysis = async ({ params }) => {
  return await api.get(`/analytics/overview?${params}`);
};

export const getAllTours = async () => {
  return await api.get(`/analytics/analytic-tours`);
};
