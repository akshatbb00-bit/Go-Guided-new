import { useEffect, useState } from "react";
import ToursHeader from "../components/common/DashboardHeader";
import ToursGrid from "../components/tours/ToursGrid";
import NoResult from "./NoResult";
import LoaderOverlay from "../components/common/LoaderOverlay";
import { getAllToursAsCards } from "../services/tourService";
import useApi from "../hooks/useApi";

const filterOptions = [
  {
    label: "Tour Status",
    children: [
      { label: "Upcoming", value: "upcoming" },
      { label: "Ongoing", value: "ongoing" },
      { label: "Completed", value: "completed" },
    ],
  },
  {
    label: "Difficulty Level",
    children: [
      { label: "Easy", value: "easy" },
      { label: "Medium", value: "medium" },
      { label: "Hard", value: "hard" },
    ],
  },
  {
    label: "Date Interval",
    children: [
      { label: "Start Date", value: "startDate", type: "date" },
      { label: "End Date", value: "endDate", type: "date" },
    ],
  },
];

function Tours() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: [],
  });

  const [tours, setTours] = useState([]);
  const [totalTours, setTotalTours] = useState();

  const { loading: isLoading, request: fetchTours } =
    useApi(getAllToursAsCards);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams();
        const { searchQuery, selectedFilters, sortOrder } = filterState;

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (sortOrder) {
          params.append("sortOrder", sortOrder);
        }

        // ⬇ Handle status
        const statusFilter = selectedFilters["Tour Status"];
        if (statusFilter?.length > 0) {
          params.append("status", statusFilter.toLowerCase()); // assuming one value selected
        }

        // ⬇ Handle difficulty
        const difficultyFilter = selectedFilters["Difficulty Level"];
        if (difficultyFilter?.length > 0) {
          params.append("difficulty", difficultyFilter.toLowerCase());
        }

        // ⬇ Handle date range
        const dateFilters = selectedFilters["Date Interval"];
        if (dateFilters) {
          const { startDate, endDate } = dateFilters;
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);
        }

        const response = await fetchTours({ params });
        setTours(response?.data?.tour || []);
        setTotalTours(response?.data?.totalTours);
      } catch (error) {}
    })();
  }, [filterState]);

  if (isLoading) return <LoaderOverlay />;

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col justify-center p-3 shadow-sm bg-white rounded-lg">
        <ToursHeader
          title="Tours"
          totalCount={totalTours}
          filterState={filterState}
          setFilterState={setFilterState}
          filterOptions={filterOptions}
        />
        {tours.length > 0 ? <ToursGrid tours={tours} /> : <NoResult />}
      </div>
    </div>
  );
}

export default Tours;
