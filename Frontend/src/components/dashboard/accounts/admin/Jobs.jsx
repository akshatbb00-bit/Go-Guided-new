import { BiPlusCircle, BiListCheck } from "react-icons/bi";
import useSafeNavigate from "../../../../utils/useSafeNavigate";

function Jobs() {
  const navigate = useSafeNavigate();

  return (
    <div className="p-4 flex flex-col gap-6  min-h-screen bg-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Job Management</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
        >
          Go Back
        </button>
      </div>
      {/* Create Job Button */}
      <div
        className="flex items-center justify-between p-4 bg-white border border-green-500 rounded-xl -my-2 cursor-pointer hover:bg-green-100 transition-all"
        onClick={() => navigate("create-job")}
      >
        <div className="flex items-center gap-2">
          <BiPlusCircle className="text-green-600 w-6 h-6" />
          <span className="text-green-700 font-semibold text-lg">
            Create a Job
          </span>
        </div>
      </div>
      {/* See Applications Button */}

      <div
        className="flex items-center justify-between p-4 bg-white border border-green-500 rounded-xl -my-2 cursor-pointer hover:bg-green-100 transition-all"
        onClick={() => navigate("requests")}
      >
        <div className="flex items-center gap-2">
          <BiListCheck className="text-green-600 w-6 h-6" />{" "}
          <span className="text-green-700 font-semibold text-lg">
            See Applications
          </span>
        </div>
      </div>
      <div
        className="flex items-center justify-between p-4 bg-white border border-green-500 rounded-xl -my-2 cursor-pointer hover:bg-green-100 transition-all"
        onClick={() => navigate("manage-jobs")}
      >
        <div className="flex items-center gap-2">
          <BiListCheck className="text-green-600 w-6 h-6" />{" "}
          <span className="text-green-700 font-semibold text-lg">
            Manage Jobs
          </span>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
