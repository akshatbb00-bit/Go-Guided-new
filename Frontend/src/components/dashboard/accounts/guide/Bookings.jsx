import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import BookingsHeader from "../../../common/DashboardHeader";
import BookingsTable from "../../Table";
import NoResult from "../../../../pages/NoResult";
import useApi from "../../../../hooks/useApi";
import { getBookingsByStatus } from "../../../../services/bookingService";
import LoaderOverlay from "../../../common/LoaderOverlay";

const headers = [
  { label: "S No.", width: "10%" },
  { label: "Tour Name", width: "25%" },
  { label: "Customer", width: "20%" },
  { label: "Email", width: "25%" },
  { label: "Date", width: "10%" },
  { label: "Status", width: "10%" },
];

const numberOfEntries = 9;

function Bookings() {
  const params = useParams();
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "desc",
    selectedFilters: {},
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const { loading, request: fetchBookings } = useApi(getBookingsByStatus);

  const queryParams = useMemo(() => {
    const { searchQuery, sortOrder, selectedFilters } = filterState;
    const query = {
      page: currentPage,
      limit: numberOfEntries,
      sort: sortOrder,
    };

    if (searchQuery) query.search = searchQuery;

    if (selectedFilters["Date Interval"]) {
      const { startDate, endDate } = selectedFilters["Date Interval"];
      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;
    }

    return query;
  }, [filterState, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchBookings({
          identifier: params.status,
          params: queryParams,
        });

        setBookings(res?.data?.bookings || []);
        setTotalPages(res?.data?.totalPages);
      } catch (error) {
        setBookings([]);
        setTotalPages(0);
      }
    };

    fetchData();
  }, [queryParams, params.status]);

  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  const transformedBookings = useMemo(() => {
    return bookings.map((user, idx) => {
      const row = {};
      headers.forEach((header) => {
        const key = getKeyFromLabel(header.label);
        if (key === "sno") {
          row[key] = (currentPage - 1) * numberOfEntries + idx + 1;
        } else if (key === "tourname") {
          row[key] = user.tourTitle || "-";
        } else if (key === "customer") {
          row[key] = user.customerName || "-";
        } else if (key === "email") {
          row[key] = user.customerEmail || "-";
        } else if (key === "date") {
          row[key] = user.bookingDate
            ? new Date(user.bookingDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })
            : "-"; // ✅ backend gives 'bookingDate'
        } else if (key === "status") {
          row[key] = user.status || "-";
        } else {
          row[key] = user[key] || "-";
        }
      });
      row._id = user._id;
      return row;
    });
  }, [bookings, currentPage]);

  return (
    <div className="px-4 py-4">
      <BookingsHeader
        title="Bookings"
        filterState={filterState}
        setFilterState={setFilterState}
        totalCount={transformedBookings.length}
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

      {loading ? (
        <LoaderOverlay />
      ) : transformedBookings.length > 0 ? (
        <BookingsTable
          headers={headers}
          data={transformedBookings}
          itemsPerPage={numberOfEntries}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <p className="text-center text-gray-500 text-lg py-8">
          No bookings found.
        </p>
      )}
    </div>
  );
}

export default Bookings;
