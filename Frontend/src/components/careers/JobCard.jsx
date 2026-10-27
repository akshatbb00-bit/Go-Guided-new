import { MdLocationOn } from "react-icons/md";
import useSafeNavigate from "../../utils/useSafeNavigate";

export default function JobCard({
  _id: jobId,
  title,
  location,
  salary,
  createdAt,
  lastDateToApply,
  numberOfPosts,
}) {
  const navigate = useSafeNavigate();
  const jobSlug = title
    .toLowerCase()
    .trim()
    .replace(/[\/\\]/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  function getDaysAgo(createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return " today";
    if (diffDays === 1) return " yesterday";
    return `${diffDays} days ago`;
  }

  return (
    <div className="p-4">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-lg transition duration-200 max-w-sm w-full mx-auto">
        <div className="p-5">
          {/* Title */}
          <div className="flex flex-col mb-2">
            <h2 className="text-xl font-semibold text-green-950">{title}</h2>
            <span className="text-xs text-gray-500">
              #{jobId.toUpperCase()}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-green-700 mb-4">
            <MdLocationOn className="mr-1" />
            <span>{location}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
              Salary: ₹{salary?.min} - ₹{salary?.max}
            </span>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
              Last Date:{new Date(lastDateToApply).toLocaleDateString()}
            </span>
          </div>

          {/* Info and Button */}
          <div className="flex items-center justify-between mt-4 mb-4 px-2  ">
            <div className="flex w-full justify-between">
              <p className="text-sm text-gray-500">
                Posted: {getDaysAgo(createdAt)}
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {numberOfPosts} {numberOfPosts === 1 ? "Opening" : "Openings"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/careers/${jobSlug}/${jobId}`)}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
