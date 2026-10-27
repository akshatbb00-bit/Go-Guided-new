import { useEffect, useState } from "react";
import BookingsHeader from "../../../common/DashboardHeader";
import BookingsTable from "../../../dashboard/Table";
import NoResult from "../../../../pages/NoResult";
import { getAllBookings } from "../../../../services/bookingService";
import useApi from "../../../../hooks/useApi";

const headers = [
  { label: "S No.", width: "10%" },
  { label: "Tour", width: "20%" },
  { label: "Customer", width: "20%" },
  { label: "Email", width: "25%" },
  { label: "Date", width: "15%" },
  { label: "Status", width: "10%" },
];

const filterOptions = [
  {
    label: "Booking Status",
    children: [
      { label: "Cancelled", value: "cancelled" },
      { label: "Confirmed", value: "confirmed" },
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

function Bookings() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: {},
  });

  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const numberOfEntries = 5;

  const { loading, request: fetchAllBookings } = useApi(getAllBookings);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = filterState.selectedFilters["Booking Status"];
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

        const res = await fetchAllBookings({ params: query });
        setBookings(res?.data?.bookings || []);
        setTotalPages(res?.data?.totalPages || 1);
        setTotalCount(res?.data?.total || 0);
      } catch (error) {}
    };

    fetchData();
  }, [filterState, currentPage]);

  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  const transformedBookings = bookings.map((booking, idx) => {
    const row = {};
    headers.forEach((header) => {
      const key = getKeyFromLabel(header.label);
      if (key === "sno") {
        row[key] = (currentPage - 1) * numberOfEntries + idx + 1;
      } else if (key === "date") {
        row[key] = new Date(booking.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
      } else if (key === "tour") {
        row[key] = booking.tourTitle || "-";
      } else if (key === "customer") {
        row[key] = booking.customerName || "-";
      } else if (key === "email") {
        row[key] = booking.customerEmail || "-";
      } else if (key === "status") {
        row[key] =
          booking.status.charAt(0).toUpperCase() +
            booking.status.slice(1).toLowerCase() || "-";
      } else {
        row[key] = booking[key] || "-";
      }
    });
    row._id = booking._id;
    return row;
  });

  return (
    <div className="px-4 py-4">
      <BookingsHeader
        title="Bookings"
        totalCount={totalCount}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={filterOptions}
      />

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : transformedBookings.length > 0 ? (
        <BookingsTable
          headers={headers}
          data={transformedBookings}
          itemsPerPage={numberOfEntries}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <NoResult />
      )}
    </div>
  );
}

export default Bookings;
