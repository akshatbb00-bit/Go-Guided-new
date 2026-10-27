import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FeedbackHeader from "../../../common/DashboardHeader";
import { FaChevronDown, FaChevronUp, FaPen, FaTimes } from "react-icons/fa";
import NoResult from "../../../../pages/NoResult";
import useApi from "../../../../hooks/useApi";
import {
  getAllFeedbacks,
  replyFeedback,
} from "../../../../services/feedbackService";
import Pagination from "../../../common/Pagination";

function Feedbacks() {
  const { loading: fetchFeedbackLoading, request: fetchFeedbacksApi } =
    useApi(getAllFeedbacks);
  const { loading: replyFeedbackLoading, request: replyFeedbackApi } =
    useApi(replyFeedback);

  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "desc",
    selectedFilters: [],
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const numberOfEntries = 2;

  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [replyingFeedback, setReplyingFeedback] = useState(null);
  const [replyMessages, setReplyMessages] = useState({}); // Store reply text per feedback

  const fetchFeedbacks = async () => {
    try {
      const { searchQuery, selectedFilters, sortOrder } = filterState;
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);

      if (selectedFilters?.["Date Interval"]) {
        const { startDate, endDate } = selectedFilters["Date Interval"];
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
      }

      if (sortOrder) params.append("sort", sortOrder);

      params.append("page", currentPage);
      params.append("limit", numberOfEntries);

      const response = await fetchFeedbacksApi({ params: params.toString() });
      setFeedbacks(response.data.feedbacks);
      setTotalPages(response.totalPages);
      setTotalFeedbacks(response.total);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filterState, currentPage]);

  const handleReply = async (id) => {
    try {
      const message = replyMessages[id]?.trim();
      if (!message) {
        toast.error("Reply message cannot be empty!");
        return;
      }

      const response = await replyFeedbackApi({
        identifier: id,
        data: { message },
      });
      toast.success(response.message);

      // Reset state for this feedback
      setReplyMessages((prev) => ({ ...prev, [id]: "" }));
      setReplyingFeedback(null);
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="px-4 py-4 h-full overflow-y-auto scrollbar-hide text-green-950">
      <FeedbackHeader
        title="Feedbacks"
        totalCount={totalFeedbacks}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Status",
            children: [
              { label: "Pending", value: "pendingReview" },
              { label: "Resolved", value: "resolved" },
            ],
          },
          {
            label: "Date Interval",
            children: [
              { label: "Start Date", value: "startDate", type: "date" },
              { label: "End Date", value: "endDate", type: "date" },
            ],
          },
        ]}
      />

      {feedbacks.length > 0 ? (
        <>
          {feedbacks.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-white rounded-2xl mb-4 shadow-lg p-6 border-l-4 border-green-500"
            >
              {/* Header */}
              <div className="flex justify-between items-start sm:items-center">
                <h2 className="text-2xl font-semibold text-green-800 mb-2">
                  {feedback.name}
                </h2>
                <button
                  onClick={() =>
                    setExpandedFeedback(
                      expandedFeedback === feedback._id ? null : feedback._id
                    )
                  }
                  className="text-green-800 hover:text-green-600 transition"
                >
                  {expandedFeedback === feedback._id ? (
                    <FaChevronUp size={20} />
                  ) : (
                    <FaChevronDown size={20} />
                  )}
                </button>
              </div>

              {/* Subject and Status */}
              <div className="flex flex-col sm:flex-row justify-between text-green-800 bg-green-50 p-3 rounded-md mb-4 shadow-sm">
                <p className="font-medium">{feedback.subject}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-md text-sm font-medium ${
                      feedback.isResolved
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    }`}
                  >
                    {feedback.isResolved ? "Resolved" : "UnResolved"}
                  </span>
                </p>
              </div>

              {/* Expanded Message */}
              {expandedFeedback === feedback._id && (
                <div className="p-4 rounded-md bg-green-50 text-green-700 shadow-sm mb-2">
                  <p>{feedback.message}</p>
                </div>
              )}

              {/* Reply Box */}
              {replyingFeedback === feedback._id ? (
                <div className="relative mt-4 p-4 bg-white border border-green-300 rounded-md shadow space-y-4">
                  <button
                    onClick={() => setReplyingFeedback(null)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={18} className="text-green-500" />
                  </button>
                  <div className="space-y-2">
                    <p className="text-green-700 font-semibold">
                      Write your response:
                    </p>
                    <textarea
                      value={replyMessages[feedback._id] || ""}
                      onChange={(e) =>
                        setReplyMessages((prev) => ({
                          ...prev,
                          [feedback._id]: e.target.value,
                        }))
                      }
                      rows="3"
                      placeholder="Enter your reply here..."
                      className="w-full p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => handleReply(feedback._id)}
                      disabled={
                        replyFeedbackLoading ||
                        !(replyMessages[feedback._id] || "").trim()
                      }
                      className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition ${
                        replyFeedbackLoading ||
                        !(replyMessages[feedback._id] || "").trim()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {replyFeedbackLoading ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setReplyingFeedback(feedback._id)}
                    disabled={feedback.isResolved}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      feedback.isResolved
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    <FaPen size={16} />
                    Write Response
                  </button>
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </>
      ) : (
        <NoResult />
      )}
    </div>
  );
}

export default Feedbacks;
