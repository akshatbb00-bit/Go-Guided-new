import api from "./apiClient";

export const getAllBookings = async ({ params }) => {
  return await api.get("/booking/all", { params });
};

export const getUserBookings = async ({ params }) => {
  return await api.get("/booking/users", { params });
};

export const cancelBookingById = async ({ identifier: bookingId }) => {
  return await api.patch(`/booking/cancel/${bookingId}`);
};

export const getBookingsByStatus = async ({ identifier: status, params }) => {
  return await api.get(`/booking/status/${status}`, { params });
};

export const getBookingById = async ({ identifier: bookingId }) => {
  return await api.get(`/booking/detail/${bookingId}`);
};

export const getTourBookings = async ({ identifier: tourSlug, params }) => {
  return await api.get(`/booking/tour/${tourSlug}`, { params });
};
