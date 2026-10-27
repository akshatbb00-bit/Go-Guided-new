import api from "./apiClient";

// 1. Apply to a job
export const applyTojob = async ({ identifier, data }) => {
  return await api.post(`application/apply/${identifier}`, data);
};

// 2. Get all applications (with pagination, filtering, etc.)
export const getAllApplications = async ({ params }) => {
  return await api.get("/application/all", {
    params,
  });
};

// 3. Get single application by ID
export const getApplicationById = async ({ identifier }) => {
  return await api.get(`/application/${identifier}`);
};

// 4. Accept an application
export const acceptApplication = async ({ identifier }) => {
  return await api.patch(`/application/${identifier}/accept`);
};

// 5. Reject an application
export const rejectApplication = async ({ identifier }) => {
  return await api.patch(`/application/${identifier}/reject`);
};
