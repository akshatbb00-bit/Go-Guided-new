import { FiAlertCircle } from "react-icons/fi";

function NoResult() {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 text-gray-800">
      {/* Icon */}
      <FiAlertCircle className="text-gray-500 text-6xl mb-4" />

      {/* Title */}
      <h1 className="text-3xl font-bold">No Results Found</h1>

      {/* Message */}
      <p className="text-lg mt-2 text-center px-4">
        Sorry, we couldn’t find any matching results for your search or filter
        criteria.
      </p>

      {/* Button to Reset */}
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition"
      >
        Reset Filters
      </button>
    </div>
  );
}

export default NoResult;
