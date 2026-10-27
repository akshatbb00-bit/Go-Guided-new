import { useEffect, useState } from "react";
import { FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import BookingsHeader from "../../../../common/DashboardHeader";
import ConfirmationModal from "../../../../common/ConfirmationModal";
import NoResult from "../../../../../pages/NoResult";
import NoBooking from "./NoBooking";
import {
  cancelBookingById,
  getUserBookings,
} from "../../../../../services/bookingService";
import useApi from "../../../../../hooks/useApi";
import LoaderOverlay from "../../../../common/LoaderOverlay";
import toast from "react-hot-toast";
import Pagination from "../../../../common/Pagination";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

export default function Bookings() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "desc",
    selectedFilters: [],
  });

  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [expandedBooking, setExpandedBooking] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    bookingId: null,
  });

  const { loading, request: fetchBookings } = useApi(getUserBookings);
  const { request: cancelBooking } = useApi(cancelBookingById);

  useEffect(() => {
    (async () => {
      try {
        const status = filterState.selectedFilters["Booking Status"];
        const dateInterval = filterState.selectedFilters["Date Interval"] || {};

        const query = {
          page: currentPage,
          limit: 2,
          search: filterState.searchQuery,
          sortOrder: filterState.sortOrder || "desc",
          status:
            status === "cancelled" || status === "confirmed"
              ? status
              : undefined,
          startDate: dateInterval.startDate,
          endDate: dateInterval.endDate,
        };

        const res = await fetchBookings({ params: query });
        setBookings(res?.data?.bookings || []);
        setTotalPages(res?.data?.totalPages || 1);
        setTotalCount(res?.data?.total);
      } catch (error) {}
    })();
  }, [filterState, currentPage]);

  const toggleAccordion = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const handleCancel = (id) => {
    setDeleteConfirm({ show: true, bookingId: id });
  };

  const confirmCancel = async () => {
    const { bookingId } = deleteConfirm;
    setDeleteConfirm({ show: false, bookingId: null });

    try {
      const res = await cancelBooking({ identifier: bookingId });
      toast.success(res?.message);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, bookingId: null });
  };

  if (!bookings.length) {
    return <NoBooking />;
  }
  if (loading) return <LoaderOverlay />;

  return (
    <>
      <div className="p-4 sm:px-6 md:px-10 pb-8 grid grid-cols-1 gap-4 bg-green-50 overflow-y-auto h-full scrollbar-none">
        <BookingsHeader
          title="Your Bookings"
          totalCount={totalCount}
          filterState={filterState}
          setFilterState={setFilterState}
          filterOptions={[
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
          ]}
        />

        {bookings.length > 0 ? (
          <>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-t-2 border-green-500"
              >
                {/* Booking Header */}
                <div className="flex justify-between items-center flex-wrap gap-y-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-green-800">
                    {booking?.tour?.title}
                  </h2>
                  <button
                    onClick={() => toggleAccordion(booking.id)}
                    className="text-green-800 hover:text-green-600 transition cursor-pointer"
                  >
                    {expandedBooking === booking.id ? (
                      <FaChevronUp size={20} />
                    ) : (
                      <FaChevronDown size={20} />
                    )}
                  </button>
                </div>

                {/* Booking Status */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 bg-gray-100 p-3 rounded-md mb-4 shadow-sm text-sm sm:text-base">
                  {/* Booking Status */}
                  <p className="text-green-800">
                    <strong>Booking Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        booking.status === "cancelled"
                          ? "text-red-500"
                          : booking.status === "pending"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </p>

                  {/* Trip Status */}
                  <p className="text-green-800">
                    <strong>Tour Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        booking.tripStatus === "completed"
                          ? "text-gray-600"
                          : booking.tripStatus === "ongoing"
                            ? "text-blue-600"
                            : "text-green-600"
                      }`}
                    >
                      {booking.tripStatus.charAt(0).toUpperCase() +
                        booking.tripStatus.slice(1)}
                    </span>
                  </p>
                </div>

                {/* Accordion Expanded Details */}
                {expandedBooking === booking.id && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md shadow-sm text-sm sm:text-base">
                      <p className="text-green-800 font-medium">
                        Booked On:{" "}
                        <span className="font-normal text-green-700">
                          {formatDate(booking?.createdAt)}
                        </span>
                      </p>
                      <p className="text-green-800 font-medium">
                        Tour Guides:{" "}
                        <span className="font-normal text-green-700">
                          {booking?.tour?.guides?.length
                            ? booking.tour.guides.join(", ")
                            : "Not assigned"}
                        </span>
                      </p>
                      <p className="text-green-800 font-medium">
                        Start Date:{" "}
                        <span className="font-normal text-green-700">
                          {formatDate(booking?.tour?.startDate)}
                        </span>
                      </p>
                      <p className="text-green-800 font-medium">
                        End Date:{" "}
                        <span className="font-normal text-green-700">
                          {formatDate(booking?.tour?.endDate)}
                        </span>
                      </p>
                    </div>

                    {/* Tour Members */}
                    <div className="sm:col-span-2">
                      <p className="text-green-800 font-medium mb-2">
                        Tour Members:
                      </p>

                      {booking?.tour?.members?.length ? (
                        <div className="space-y-2">
                          {booking.tour.members.map((member, index) => (
                            <div
                              key={member._id || index}
                              className="bg-gray-100 rounded-lg p-3 border flex gap-3"
                            >
                              <p className="text-green-700">
                                <strong>Name:</strong> {member.name || "N/A"}
                              </p>

                              <p className="text-green-700">
                                <strong>Email:</strong> {member.email || "N/A"}
                              </p>

                              <p className="text-green-700">
                                <strong>Phone:</strong>{" "}
                                {member.phoneNumber || "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-700">No members found</span>
                      )}
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full items-center">
                  {booking.tripStatus === "upcoming" &&
                    booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <FaTrash size={16} /> Cancel Booking
                      </button>
                    )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <NoResult />
        )}

        {/* Cancel Confirmation Modal */}
        {deleteConfirm.show && (
          <ConfirmationModal
            text={"Are you sure you want to cancel this booking?"}
            onConfirm={confirmCancel}
            onCancel={cancelDelete}
          />
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
