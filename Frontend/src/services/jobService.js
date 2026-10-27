import api from "./apiClient";

export const createJob = async ({ data }) => {
  return await api.post("/job/post-job", data);
};

export const getAllJobs = async () => {
  return await api.get("/job/get-jobs");
};

export const deleteJob = async ({ identifier }) => {
  return await api.delete(`/job/delete-job/${identifier}`);
};
