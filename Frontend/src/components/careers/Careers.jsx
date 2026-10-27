import React, { useEffect, useState } from "react";
import JobCard from "./JobCard";
import DashboardHeader from "../common/DashboardHeader";
import NoResult from "../../pages/NoResult";
import { getAllJobs } from "../../services/jobService";
import useApi from "../../hooks/useApi";
import LoaderOverlay from "../common/LoaderOverlay";

function Careers() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: [],
  });

  const { loading: isJobLoading, request: getAllJobsRequest } =
    useApi(getAllJobs);

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const numberOfEntries = 10;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { searchQuery, selectedFilters, sortOrder } = filterState;
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (selectedFilters) {
          if (selectedFilters["Date Interval"]) {
            const { startDate, endDate } = selectedFilters["Date Interval"];
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
          }
        }

        if (sortOrder) {
          params.append("sort", sortOrder);
        }

        params.append("page", currentPage);
        params.append("limit", numberOfEntries);

        const response = await getAllJobsRequest(params.toString());

        const { data } = response;
        setJobs(data);
        // setTotalPages(response.totalPages);
        // setTotalJobs(response.total);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };

    fetchJobs();
  }, [currentPage, filterState]);

  if (isJobLoading) {
    return <LoaderOverlay />;
  }
  return (
    <section className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-6 flex flex-col gap-6 justify-center">
      <DashboardHeader
        title="Jobs"
        totalCount={jobs.length}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Date Interval",
            children: [
              { label: "Start Date", value: "startDate", type: "date" },
              { label: "End Date", value: "endDate", type: "date" },
            ],
          },
        ]}
      />
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 rounded-md">
          {jobs.map((job) => (
            <JobCard key={job._id} {...job} />
          ))}
        </div>
      ) : (
        <NoResult />
      )}
    </section>
  );
}

export default Careers;
