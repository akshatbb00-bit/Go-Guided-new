import { useNavigate, useParams } from "react-router";
import useApi from "../../../../hooks/useApi";
import {
  acceptApplication,
  getApplicationById,
  rejectApplication,
} from "../../../../services/applicationService";
import { useEffect, useState } from "react";
import LoaderOverlay from "../../../common/LoaderOverlay";
import toast from "react-hot-toast";

function JobUserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState();

  const { loading: isLoading, request: getApplication } =
    useApi(getApplicationById);
  const { loading: isAccepting, request: acceptApplicationRequest } =
    useApi(acceptApplication);
  const { loading: isRejecting, request: rejectApplicationRequest } =
    useApi(rejectApplication);

  const fetchApplication = async () => {
    try {
      const response = await getApplication({ identifier: id });
      setApplication(response?.data?.application);
    } catch (error) {}
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const handleAcceptApplication = async () => {
    try {
      const res = await acceptApplicationRequest({ identifier: id });
      toast.success(res.message);
      fetchApplication();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleRejectApplication = async () => {
    try {
      const res = await rejectApplicationRequest({ identifier: id });
      toast.success(res.message);
      fetchApplication();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  if (isLoading || !application) return <LoaderOverlay />;

  return (
    <div className="p-6 space-y-6 border border-green-400 rounded-md bg-green-50 shadow-md h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">
          Application Details
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Go Back
        </button>
      </div>

      {/* User Info Card */}
      <div className="mt-4 p-6 border border-green-300 rounded-xl bg-white shadow-lg space-y-3 text-green-900">
        <p>
          <span className="font-semibold text-green-800">Name:</span>{" "}
          {application.fullName}
        </p>
        <p>
          <span className="font-semibold text-green-800">Email:</span>{" "}
          {application.email}
        </p>
        <p>
          <span className="font-semibold text-green-800">Number:</span>{" "}
          {application.phone}
        </p>
        <p>
          <span className="font-semibold text-green-800">Job Title:</span>{" "}
          {application.jobId?.title}
        </p>
        <p>
          <span className="font-semibold text-green-800">Request Date:</span>{" "}
          {new Date(application.appliedAt).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold text-green-800">Resume:</span>{" "}
          <a
            href={application.resumeUrl}
            download
            className="text-green-600 underline hover:text-green-800"
          >
            Download
          </a>
        </p>
        <p>
          <span className="font-semibold text-green-800">Status:</span>{" "}
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1)}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleAcceptApplication}
            disabled={application.status !== "pending" || isAccepting}
            className={`px-5 py-2 text-white rounded-md transition flex items-center justify-center gap-2 ${
              application.status !== "pending" || isAccepting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAccepting ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
            ) : null}
            Approve
          </button>

          <button
            onClick={handleRejectApplication}
            disabled={application.status !== "pending" || isRejecting}
            className={`px-5 py-2 text-white rounded-md transition flex items-center justify-center gap-2 ${
              application.status !== "pending" || isRejecting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isRejecting ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
            ) : null}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobUserDetails;
