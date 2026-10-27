import api from "./apiClient";

// Submit or update a review for a tour.
export const submitReview = async ({ identifier: tourId, data }) => {
  return await api.post(`/review/${tourId}`, data);
};

// Delete a review by review ID.
export const deleteReview = async ({ identifier: reviewId }) => {
  return await api.delete(`/review/${reviewId}`);
};

// Get all reviews written by a specific user.
export const getUserReviews = async () => {
  return await api.get(`/review/user-reviews`);
};

// Fetch the 15 most recent reviews from the server.
export const getRecentReviews = async () => {
  return await api.get("/review/recent");
};

// get all reviews
export const getAllReviews = async ({ params }) => {
  return await api.get("/review/all", { params });
};

// Fetch a single review by ID
export const getReviewById = async ({ identifier: reviewId }) => {
  return await api.get(`/review/${reviewId}`);
};
