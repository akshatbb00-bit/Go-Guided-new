import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaTrash, FaPen } from "react-icons/fa";
import LoaderOverlay from "../../../common/LoaderOverlay";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import useApi from "../../../../hooks/useApi";
import { getAllJobs, deleteJob } from "../../../../services/jobService";
import toast from "react-hot-toast";

const AdminJobManager = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useSafeNavigate();

  const { loading: jobsLoading, request: getJobs } = useApi(getAllJobs);
  const { request: deleteJobById } = useApi(deleteJob);

  useEffect(function () {
    (async () => {
      try {
        const response = await getJobs({});
        setJobs(response?.data);
      } catch (err) {}
    })();
  }, []);

  const handleDelete = async (jobId) => {
    try {
      const response = await deleteJobById({ identifier: jobId });
      setJobs((jobs) => jobs.filter((job) => job._id !== response?.jobId));
      toast.success(response.message);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  if (jobsLoading) return <LoaderOverlay />;

  return (
    <div className="max-w-4xl mx-auto p-4 h-full overflow-y-auto scrollbar-hide">
      {/* Header */}

      <div className="flex justify-between items-center py-2">
        <h2 className="text-2xl font-bold text-green-800">Manage Jobs</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
        >
          Go Back
        </button>
      </div>

      {/* Job Listings */}
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white rounded-2xl mb-6 shadow-lg p-6 border-t-4 border-green-500"
          >
            {/* Job Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-green-800">
                {job.title}{" "}
                <span className="text-base">
                  (#{String(job._id).toUpperCase()})
                </span>
              </h2>
            </div>
            {/* Description */}
            <p className="text-green-800 mb-4">{job.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-green-700 mt-2">
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <p>
                <strong>Posts:</strong> {job.numberOfPosts}
              </p>
              <p>
                <strong>Salary:</strong> ₹{job.salary.min} - ₹{job.salary.max}
              </p>
              <p>
                <strong>Last Date:</strong>{" "}
                {new Date(job.lastDateToApply).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => navigate("edit-job")}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition cursor-pointer"
              >
                <FaPen size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(job._id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer"
              >
                <FaTrash size={16} /> Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center mt-10">No jobs available.</p>
      )}
    </div>
  );
};

export default AdminJobManager;
