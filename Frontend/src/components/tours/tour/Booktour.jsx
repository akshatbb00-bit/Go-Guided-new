import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  FaPlus,
  FaRegCalendarTimes,
  FaTrash,
  FaUserTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { initiateRazorpayPayment } from "../../../integrations/razorpay";
import { getTourBySlug } from "../../../services/tourService";
import useApi from "../../../hooks/useApi";
import { useUser } from "../../../context/UserContext";
import LoaderOverlay from "../../common/LoaderOverlay";

const BookTourForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { user } = useUser();
  const isUser = user?.role === "user";

  const [tour, setTour] = useState({});
  const [members, setMembers] = useState([]);
  const [bookingClosed, setBookingClosed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { loading, request: fetchTour } = useApi(getTourBySlug);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTour({ identifier: slug });
        const tourData = res?.data?.tour;
        setTour(tourData);

        // Check if booking is closed
        const today = new Date();
        const startDate = new Date(tourData.startDate);
        if (startDate <= today) setBookingClosed(true);
      } catch (error) {
        toast.error("Failed to fetch tour details.");
      }
    })();
  }, []);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length >= tour.availableSlots) {
      toast.error("No more slots available.");
      return;
    }

    const last = members[members.length - 1];
    const incomplete = last && (!last.name.trim() || !last.age || !last.gender);

    if (incomplete) {
      toast.error("Please complete the last member before adding another.");
      return;
    }

    setMembers([...members, { name: "", age: "", gender: "" }]);
  };

  const removeMember = (index) => {
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const totalCost = members.length * (tour.pricePerPerson || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUser) {
      toast.error("Please log in with a user account to book this tour.");
      return;
    }

    if (members.length === 0) {
      toast.error("Please add at least one member.");
      return;
    }

    try {
      await initiateRazorpayPayment({
        tour: {
          _id: tour._id,
          tourTitle: tour.title,
          pricePerPerson: tour.pricePerPerson,
          numberOfParticipants: members.length,
          amountPaid: totalCost,
          members,
          phoneNumber,
          currency: "INR",
        },
      });

      toast.success("Booking confirmed successfully!");
      navigate("/user/bookings");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong during booking."
      );
    }
  };

  // 🛑 Block non-users
  if (!isUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FaUserTimes className="text-6xl text-yellow-500 mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-yellow-600 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 text-lg">
          You are not allowed to book this tour.
          <br />
          Please login with a <strong>user</strong> account to proceed.
        </p>
      </div>
    );
  }

  if (loading) return <LoaderOverlay />;

  if (bookingClosed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FaRegCalendarTimes className="text-6xl text-red-500 mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-red-600 mb-2">Booking Closed</h2>
        <p className="text-gray-600 text-lg">
          This tour has already started. New bookings are no longer accepted.
        </p>
      </div>
    );
  }

  if (tour.availableSlots === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FaUserTimes className="text-6xl text-red-500 mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-red-600 mb-2">Booking Full</h2>
        <p className="text-gray-600 text-lg">
          Sorry, there are no slots left for this tour.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl min-h-[70vh] mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-1">
            Add Members
          </h2>
          <span className="inline-block bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium shadow-sm">
            {typeof tour.availableSlots === "number"
              ? `${tour.availableSlots} slots left`
              : "Loading slots..."}
          </span>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-green-700 font-semibold">Price per Person:</p>
          <p className="text-xl font-bold text-green-600">
            {typeof tour.pricePerPerson === "number"
              ? new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: tour.currency || "INR",
                  maximumFractionDigits: 0,
                }).format(tour.pricePerPerson)
              : "Loading..."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-green-700 font-semibold mb-2">
            Contact Phone Number
          </label>

          <input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="p-2 border rounded-md focus:ring-green-500 focus:border-green-500 w-full"
            required
          />
        </div>
        {/* Member Fields */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-green-600">
              Member Details
            </h3>
            <button
              type="button"
              onClick={addMember}
              disabled={members.length >= tour.availableSlots}
              className={`text-green-600 flex items-center gap-1 hover:underline cursor-pointer ${
                members.length >= tour.availableSlots
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FaPlus /> Add Member
            </button>
          </div>

          {members.map((member, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 items-end"
            >
              <input
                type="text"
                placeholder="Name"
                value={member.name}
                onChange={(e) =>
                  handleMemberChange(index, "name", e.target.value)
                }
                className="p-2 border rounded-md focus:ring-green-500 focus:border-green-500 w-full"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={member.age}
                onChange={(e) =>
                  handleMemberChange(index, "age", e.target.value)
                }
                className="p-2 border rounded-md focus:ring-green-500 focus:border-green-500 w-full"
                required
              />
              <div className="flex items-center gap-2 w-full">
                <select
                  value={member.gender}
                  onChange={(e) =>
                    handleMemberChange(index, "gender", e.target.value)
                  }
                  className="p-2 border rounded-md focus:ring-green-500 focus:border-green-500 w-full"
                  required
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-red-500 hover:text-red-700 cursor-pointer p-2"
                  aria-label="Remove member"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Cost */}
        <div className="text-right">
          <p className="text-lg font-semibold">
            Total:{" "}
            <span className="text-green-700">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: tour.currency || "INR",
                maximumFractionDigits: 0,
              }).format(totalCost || 0)}
            </span>
          </p>
        </div>

        <button
          type="submit"
          disabled={totalCost === 0}
          className="p-4 w-full text-lg uppercase text-white bg-green-600 rounded-md cursor-pointer
          hover:bg-green-700 hover:shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Pay & Book Tour
        </button>
      </form>
    </div>
  );
};

export default BookTourForm;
