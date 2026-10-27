import api from "./apiClient";

export const updateStatus = async ({ data }) => {
  return await api.patch("guide/status", data);
};

export const getStatus = async () => {
  return await api.get("guide/status");
};

export const getAvailableGuides = async ({ params }) => {
  return await api.get("/guide/available", {
    params,
  });
};

export const getBookingStats = async () => {
  return await api.get("/guide/booking-stats");
};
