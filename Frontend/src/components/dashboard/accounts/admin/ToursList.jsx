import { useState } from "react";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import {
  FaEdit,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { BiPlusCircle } from "react-icons/bi";

const getStatus = (startDate, endDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today < start) return "Upcoming";
  if (today >= start && today <= end) return "Ongoing";
  return "Completed";
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const isPastEndDate = (endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to start of today
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0); // normalize too
  return today > end;
};

export default function ToursList({ tours }) {
  const [expandedTour, setExpandedTour] = useState(null);
  const navigate = useSafeNavigate();

  const toggleAccordion = (id) => {
    setExpandedTour(expandedTour === id ? null : id);
  };

  return (
    <div className="p-4 pb-20 grid grid-cols-1 gap-6 bg-green-50 overflow-y-auto h-full scrollbar-none">
      {/* Add New Tour Button */}
      <div
        className="flex items-center justify-between p-4 bg-white border border-green-500 rounded-xl -my-2 cursor-pointer hover:bg-green-100 transition-all h-16"
        onClick={() => navigate("add")}
      >
        <div className="flex items-center gap-2">
          <BiPlusCircle className="text-green-600 w-6 h-6" />
          <span className="text-green-700 font-semibold text-lg">
            Add New Tour
          </span>
        </div>
      </div>

      {/* Tour List */}
      {tours.map((tour) => (
        <div
          key={tour._id}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-4 border-t-2 border-green-500"
        >
          {/* Tour Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-2xl font-semibold text-green-800">
              {tour.title}
            </h2>
            <button
              onClick={() => toggleAccordion(tour._id)}
              className="text-green-800 hover:text-green-600 transition self-end sm:self-auto"
            >
              {expandedTour === tour._id ? (
                <FaChevronUp size={20} />
              ) : (
                <FaChevronDown size={20} />
              )}
            </button>
          </div>

          {/* Tour Description and Status */}
          <div className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center bg-gray-100 p-2 rounded-md my-3 shadow-sm">
            <p className="text-green-800">{tour.description}</p>
            <p className="text-green-800">
              <strong>Status:</strong> {getStatus(tour.startDate, tour.endDate)}
            </p>
          </div>

          {/* Expanded Tour Details */}
          {expandedTour === tour._id && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 sm:p-4 rounded-md shadow-sm">
              <p className="text-green-800 font-medium">
                Location:{" "}
                <span className="font-normal text-green-700">
                  {tour.location}
                </span>
              </p>
              <p className="text-green-800 font-medium">
                Duration:{" "}
                <span className="font-normal text-green-700">
                  {tour.duration} {tour.duration === 1 ? "day" : "days"}
                </span>
              </p>
              <p className="text-green-800 font-medium">
                Difficulty:{" "}
                <span className="font-normal text-green-700">
                  {tour.difficulty.charAt(0).toUpperCase() +
                    tour.difficulty.slice(1).toLowerCase()}
                </span>
              </p>
              <p className="text-green-800 font-medium">
                Group Size:{" "}
                <span className="font-normal text-green-700">
                  {tour.participants === 1 ? "1" : `1 to ${tour.participants}`}
                </span>
              </p>
              <p className="text-green-800 font-bold">
                Price:{" "}
                <span className="font-normal text-green-700">
                  ₹{tour.pricePerPerson.toLocaleString("en-IN")} per person
                </span>
              </p>
              <p className="text-green-800 font-bold">
                Start Date:{" "}
                <span className="font-normal text-green-700">
                  {formatDate(tour.startDate)}
                </span>
              </p>
              <p className="text-green-800 font-bold">
                End Date:{" "}
                <span className="font-normal text-green-700">
                  {formatDate(tour.endDate)}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
            <button
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto 
                ${
                  isPastEndDate(tour.endDate)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
              onClick={() => {
                if (!isPastEndDate(tour.endDate)) {
                  navigate(`edit/${tour.slug}`);
                }
              }}
              disabled={isPastEndDate(tour.endDate)}
            >
              <FaEdit size={16} /> Edit
            </button>

            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
              onClick={() => navigate(`bookings/${tour.slug}`)}
            >
              <FaClipboardList size={16} /> View Bookings
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
