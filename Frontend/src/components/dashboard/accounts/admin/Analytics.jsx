import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import useApi from "../../../../hooks/useApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAllTours,
  getAnalysis,
} from "../../../../services/analyticsService";

function Analytics() {
  const [filterState, setFilterState] = useState({
    selectedFilters: {
      tourType: "all",
      tourId: "",
      startDate: "",
      endDate: "",
    },
  });

  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const { loading: analyticsLoading, request: fetchAnalyticsApi } =
    useApi(getAnalysis);
  const { loading: toursLoading, request: fetchToursApi } = useApi(getAllTours);

  const COLORS = ["#22c55e", "#ef4444", "#eab308"];

  // Fetch all tours
  const fetchTours = async () => {
    try {
      const response = await fetchToursApi({});
      setTours(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      toast.error("Failed to load tours list");
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const { tourType, tourId, startDate, endDate } =
        filterState.selectedFilters;

      const params = new URLSearchParams();
      if (tourType === "single" && tourId) params.append("tourId", tourId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetchAnalyticsApi({ params: params.toString() });
      setAnalytics(response);
    } catch (error) {
      toast.error("Failed to fetch analytics");
      console.error(error);
    }
  };

  // Load tours on mount
  useEffect(() => {
    fetchTours();
  }, []);

  // Auto-fetch analytics when filters change (only when valid)
  useEffect(() => {
    const { tourType, tourId } = filterState.selectedFilters;
    if (tourType === "single" && !tourId) return; // wait until tour selected
    fetchAnalytics();
  }, [filterState]);

  const reviewData = analytics?.reviewAnalysis;
  const searchData = analytics?.searchAnalysis;

  // Create sentiment data for pie chart
  const sentimentDistribution = reviewData
    ? [
        { name: "Positive", value: reviewData.positives?.length || 0 },
        { name: "Negative", value: reviewData.negatives?.length || 0 },
      ]
    : [];

  return (
    <div className="py-4 px-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center p-2 bg-white  rounded-lg shadow-md ">
        <h2 className="text-2xl font-bold  text-green-800">Analysis</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-500 cursor-pointer text-white rounded-md hover:bg-green-600"
        >
          Go Back
        </button>
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 flex p-4 items-center gap-2">
        <FaChartLine className="text-blue-600" /> Review Analytics
      </h1>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-10 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1 font-medium">Tour Type</label>
          <select
            value={filterState.selectedFilters.tourType}
            onChange={(e) =>
              setFilterState((prev) => ({
                ...prev,
                selectedFilters: {
                  ...prev.selectedFilters,
                  tourType: e.target.value,
                  tourId: "",
                },
              }))
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Tours</option>
            <option value="single">Single Tour</option>
          </select>
        </div>

        {filterState.selectedFilters.tourType === "single" && (
          <div className="flex flex-col">
            <label className="text-gray-600 mb-1 font-medium">
              Select Tour
            </label>
            <select
              value={filterState.selectedFilters.tourId}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  selectedFilters: {
                    ...prev.selectedFilters,
                    tourId: e.target.value,
                  },
                }))
              }
              className="border rounded-lg px-3 py-2 min-w-[200px]"
            >
              <option value="">-- Select Tour --</option>
              {tours.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-gray-600 mb-1 font-medium">Start Date</label>
          <input
            type="date"
            value={filterState.selectedFilters.startDate}
            onChange={(e) =>
              setFilterState((prev) => ({
                ...prev,
                selectedFilters: {
                  ...prev.selectedFilters,
                  startDate: e.target.value,
                },
              }))
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-600 mb-1 font-medium">End Date</label>
          <input
            type="date"
            value={filterState.selectedFilters.endDate}
            onChange={(e) =>
              setFilterState((prev) => ({
                ...prev,
                selectedFilters: {
                  ...prev.selectedFilters,
                  endDate: e.target.value,
                },
              }))
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Analytics Display */}
      {analyticsLoading ? (
        <div className="text-center text-gray-500 text-lg">Loading...</div>
      ) : !analytics ? (
        <div className="text-center text-gray-500 text-lg">
          No analytics data found.
        </div>
      ) : (
        <>
          {/* Review Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Sentiment Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Sentiment Overview
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                  >
                    {sentimentDistribution.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Positives */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Top Positives
              </h2>
              <ul className="space-y-2 text-green-600 font-medium">
                {reviewData?.positives?.slice(0, 6).map((p, i) => (
                  <li key={i}>✅ {p}</li>
                ))}
              </ul>
            </div>

            {/* Top Negatives */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Top Negatives
              </h2>
              <ul className="space-y-2 text-red-600 font-medium">
                {reviewData?.negatives?.slice(0, 6).map((n, i) => (
                  <li key={i}>⚠️ {n}</li>
                ))}
              </ul>
            </div>

            {/* Summary (full width on a new row) */}
            <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {reviewData?.summary ||
                  "No summary available for this selection."}
              </p>
            </div>
          </div>

          {/* Search Analysis */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Search Insights
            </h2>
            <p className="text-gray-700 mb-4">
              {searchData?.insight_summary || "No search insights available."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Informative Searches
                </h3>
                <ul className="list-disc ml-5 text-gray-700">
                  {searchData?.informative_searches?.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Non-informative Searches
                </h3>
                <ul className="list-disc ml-5 text-gray-700">
                  {searchData?.non_informative_searches?.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
