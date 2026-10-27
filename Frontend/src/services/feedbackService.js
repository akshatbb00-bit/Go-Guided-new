import api from "./apiClient";

export const getAllFeedbacks = async ({ params }) => {
  return await api.get(`/feedback/get-all-feedbacks?${params}`);
};
export const submitFeedback = async ({ data }) => {
  return await api.post("/feedback/create", data);
};
export const replyFeedback = async ({ identifier, data }) => {
  return await api.patch(`/feedback/resolve/${identifier}`, data);
};
