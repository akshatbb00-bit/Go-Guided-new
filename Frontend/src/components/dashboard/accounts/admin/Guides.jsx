import useApi from "../../../../hooks/useApi";
import NoResult from "../../../../pages/NoResult";
import { getAllAdmins } from "../../../../services/manageAdminsService";
import UsersHeader from "../../../common/DashboardHeader";
import GuidesTable from "../../../dashboard/Table";
import { useEffect, useState } from "react";
import LoaderOverlay from "../../../common/LoaderOverlay";
const headers = [
  { label: "S No.", width: "10%" },
  { label: "Name", width: "20%" },
  { label: "Email", width: "25%" },
  { label: "Phone", width: "15%" },
  { label: "Role", width: "15%" },
  { label: "Status", width: "15%" },
];

function Guides() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: [],
  });

  const [guides, setGuides] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuides, setTotalGuides] = useState(0);
  const numberOfEntries = 10;

  const { loading: fetchGuideLoading, request: fetchGuideApi } =
    useApi(getAllAdmins);

  const fetchGuidess = async () => {
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
      params.append("role", "guide");

      const response = await fetchGuideApi({ params: params.toString() });

      setGuides(response.data.users);
      setTotalPages(response.totalPages);
      setTotalGuides(response.total);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  useEffect(() => {
    fetchGuidess();
  }, [currentPage, filterState]);

  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  const transformedGuides = guides.map((guide, idx) => {
    const row = {};
    headers.forEach((header, i) => {
      const key = getKeyFromLabel(header.label);

      if (key === "sno") {
        row[key] = (currentPage - 1) * numberOfEntries + idx + 1;
      } else if (key == "name") {
        const capitalize = (str) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        row[key] = `${capitalize(guide.firstName)} ${capitalize(
          guide.lastName
        )}`;
      } else if (key === "status") {
        row[key] = guide.availabilityStatus;
      } else {
        row[key] = guide[key] || "-";
      }
    });

    row._id = guide._id;
    return row;
  });

  if (fetchGuideLoading) return <LoaderOverlay />;
  return (
    <div className="p-4">
      <UsersHeader
        title="Guides"
        totalCount={totalGuides}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Activity",
            children: [
              { label: "Below 3 Tours", value: "below_3" },
              { label: "Below 5 Tours", value: "below_5" },
              { label: "Below 10 Tours", value: "below_10" },
              { label: "Above 10 Tours", value: "above_10" },
              { label: "No Tours Conducted", value: "no_tours" },
            ],
          },
          {
            label: "Status",
            children: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
              { label: "Free", value: "free" },
              { label: "Assigned", value: "assigned" },
            ],
          },
        ]}
      />
      {transformedGuides.length > 0 ? (
        <GuidesTable
          headers={headers}
          data={transformedGuides}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      ) : (
        <NoResult />
      )}
    </div>
  );
}

export default Guides;
