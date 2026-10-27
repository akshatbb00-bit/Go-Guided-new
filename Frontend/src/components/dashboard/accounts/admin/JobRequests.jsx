import NoResult from "../../../../pages/NoResult";
import JobsHeader from "../../../common/DashboardHeader";
import JobTable from "../../Table";
import { useEffect, useState } from "react";
import { getAllApplications } from "../../../../services/applicationService";
import useApi from "../../../../hooks/useApi";
import LoaderOverlay from "../../../common/LoaderOverlay";
import Pagination from "../../../common/Pagination";

const headers = [
  { label: "S No.", width: "10%" },
  { label: "Name", width: "25%" },
  { label: "Email", width: "25%" },
  { label: "Applied On", width: "20%" },
  { label: "Status", width: "20%" },
];

function JobRequests() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "desc",
    selectedFilters: [],
  });

  const [jobRequests, setJobRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  let numberOfEntriesPerPage = 9;

  const { loading, request: getApplications } = useApi(getAllApplications);

  useEffect(() => {
    (async () => {
      try {
        const response = await getApplications({
          params: {
            page: currentPage,
            limit: numberOfEntriesPerPage,
            sort: filterState.sortOrder,
          },
        });
        setJobRequests(response?.data?.applications || []);
        setTotalPages(response?.data?.totalPages || 1);
        setTotalResults(response?.data?.totalResults);
      } catch (err) {}
    })();
  }, [filterState.sortOrder]);

  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  const transformedJobRequests = jobRequests.map((request, idx) => {
    const row = {};
    headers.forEach((header, i) => {
      const key = getKeyFromLabel(header.label);

      if (key === "sno") {
        row[key] = (currentPage - 1) * numberOfEntriesPerPage + idx + 1;
      } else if (key === "name") {
        row[key] = request.fullName || "Unnamed";
      } else if (key === "appliedon") {
        row[key] = new Date(request.appliedAt).toLocaleDateString();
      } else {
        row[key] = request[key] || "-";
      }
    });

    row._id = request._id;
    return row;
  });

  if (loading) return <LoaderOverlay />;

  return (
    <div className="p-4 flex flex-col bg-gray-100 min-h-screen">
      {/* Job Requests Header */}
      <JobsHeader
        title="Job Requests"
        totalCount={totalResults}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Experience Level",
            children: [
              { label: "Fresher", value: "fresher" },
              { label: "Above 1 Year", value: "1" },
              { label: "Above 2 Years", value: "2" },
              { label: "Above 3 Years", value: "3" },
              { label: "Above 5 Years", value: "5" },
            ],
          },
          {
            label: "Status",
            children: [
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
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
      {transformedJobRequests.length > 0 ? (
        <>
          <JobTable
            headers={headers}
            data={transformedJobRequests}
            itemsPerPage={9}
            navToBy={"id"}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <NoResult />
      )}
    </div>
  );
}

export default JobRequests;
