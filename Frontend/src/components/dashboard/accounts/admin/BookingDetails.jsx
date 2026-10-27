import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getBookingById } from "../../../../services/bookingService";
import useApi from "../../../../hooks/useApi";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, request: fetchBooking } = useApi(getBookingById);
  const [booking, setBooking] = useState(null);

  const statusStyles = {
    confirmed: "bg-green-100 text-green-800 border-green-400",
    cancelled: "bg-red-100 text-red-800 border-red-400",
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchBooking({ identifier: id });
        setBooking(res?.data?.booking || {});
      } catch (err) {}
    })();
  }, []);

  if (loading)
    return <p className="text-green-700 p-4">Loading booking details...</p>;

  if (!booking) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6 h-full bg-green-50 shadow-md w-full border border-green-400 rounded-r-md overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Booking Details</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Go Back
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white border border-green-300 rounded-md shadow">
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-green-800">Booking ID:</span>{" "}
            {booking.id}
          </p>
          <p>
            <span className="font-semibold text-green-800">Tour:</span>{" "}
            {booking.tourTitle}
          </p>
          <p>
            <span className="font-semibold text-green-800">Customer:</span>{" "}
            {booking.customer}
          </p>
          <p>
            <span className="font-semibold text-green-800">Email:</span>{" "}
            {booking.email}
          </p>
          <p>
            <span className="font-semibold text-green-800">Phone:</span>{" "}
            {booking.contact}
          </p>
        </div>

        <div className="space-y-3">
          <p>
            <span className="font-semibold text-green-800">Participants:</span>{" "}
            {booking.numberOfParticipants}
          </p>
          <p>
            <span className="font-semibold text-green-800">Amount Paid:</span>{" "}
            {`${booking.amountPaid} ${booking.currency}`}
          </p>
          <p>
            <span className="font-semibold text-green-800">Payment ID:</span>{" "}
            {booking.paymentId}
          </p>
          <p>
            <span className="font-semibold text-green-800">Status:</span>{" "}
            <span
              className={`px-3 py-1 text-sm rounded-md border ${
                statusStyles[booking.status?.toLowerCase()]
              }`}
            >
              {booking.status?.[0]?.toUpperCase() +
                booking.status?.slice(1)?.toLowerCase()}
            </span>
          </p>
          <p>
            <span className="font-semibold text-green-800">Booking Date:</span>{" "}
            {formatDate(booking.createdAt)}
          </p>
        </div>
      </div>

      {/* Dates & Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white border border-green-300 rounded-md shadow">
        <p>
          <span className="font-semibold text-green-800">Start Date:</span>{" "}
          {formatDate(booking.startDate)}
        </p>
        <p>
          <span className="font-semibold text-green-800">End Date:</span>{" "}
          {formatDate(booking.endDate)}
        </p>
        <div className="md:col-span-2">
          <span className="font-semibold text-green-800">Tour Guides:</span>
          <ul className="list-disc list-inside text-green-900 ml-4 mt-1">
            {booking.guides.map((guide, index) => (
              <li key={index}>{guide}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white p-4 border border-green-300 rounded-md shadow">
        <h3 className="text-lg font-semibold text-green-800 mb-3">Members</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {booking.members.map((member, idx) => (
            <li
              key={member._id || idx}
              className="border p-3 rounded bg-green-50 space-y-1"
            >
              <p>
                <span className="font-semibold">Name:</span> {member.name}
              </p>
              <p>
                <span className="font-semibold">Age:</span> {member.age}
              </p>
              <p>
                <span className="font-semibold">Gender:</span> {member.gender}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookingDetails;
