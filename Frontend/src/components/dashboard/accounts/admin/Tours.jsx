import { useEffect, useState } from "react";
import DashboardHeader from "../../../common/DashboardHeader";
import ToursList from "./ToursList";
import { getAllTours } from "../../../../services/tourService";
import useApi from "../../../../hooks/useApi";
import LoaderOverlay from "../../../common/LoaderOverlay";
import Pagination from "../../../common/Pagination";

function Tours() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "desc",
    selectedFilters: [],
  });

  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const numberOfEntries = 2;

  const { loading: isLoading, request: fetchAllTours } = useApi(getAllTours);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = filterState.selectedFilters["Tour Status"];
        const dateInterval = filterState.selectedFilters["Date Interval"] || {};

        const query = {
          page: currentPage,
          limit: numberOfEntries,
          search: filterState.searchQuery,
          sortOrder: filterState.sortOrder,
          status,
          startDate: dateInterval.startDate,
          endDate: dateInterval.endDate,
        };

        const res = await fetchAllTours({
          params: query,
        });
        setTours(res?.data?.tours || []);
        setTotalPages(res?.data?.totalPages || 1);
        setTotalTours(res?.data?.total || 0);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [filterState, currentPage]);

  if (isLoading || !tours) return <LoaderOverlay />;

  return (
    <div className="p-4 ">
      <DashboardHeader
        title="Tours"
        totalCount={totalTours}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Tour Status",
            children: [
              { label: "Upcoming", value: "upcoming" },
              { label: "Ongoing", value: "ongoing" },
              { label: "Completed", value: "completed" },
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
      {tours.length > 0 ? (
        <>
          <ToursList tours={tours} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-8">
          No tours found.
        </p>
      )}
    </div>
  );
}

export default Tours;
