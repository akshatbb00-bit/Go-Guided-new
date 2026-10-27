import api from "./apiClient";

export const suggestTrip = async ({ data }) => api.post("/trip/suggest", data);
export const quoteTrip = async ({ data }) => api.post("/trip/quote", data);
export const createTrip = async ({ data }) => api.post("/trip", data);
export const getMyTrips = async () => api.get("/trip/mine");
export const getTripById = async ({ identifier }) => api.get(`/trip/${identifier}`);
export const cancelDraftTrip = async ({ identifier }) => api.patch(`/trip/${identifier}/cancel`);
export const getAllTrips = async ({ params } = {}) => api.get("/trip/all", { params });
export const manageTrip = async ({ identifier, data }) => api.patch(`/trip/${identifier}/manage`, data);
