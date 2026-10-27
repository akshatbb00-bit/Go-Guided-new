import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AiOutlineClose } from "react-icons/ai";
import useApi from "../../../../hooks/useApi";
import {
  getUserById,
  sendPersonalEmail,
} from "../../../../services/userService";
import LoaderOverlay from "../../../common/LoaderOverlay";
import { toast } from "react-hot-toast";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMailing, setIsMailing] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const { loading, request: fetchUserById } = useApi(getUserById);
  const { loading: sendPersonalEmailLoading, request: sendPersonalEmailAPi } =
    useApi(sendPersonalEmail);
  const [user, setUser] = useState();

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const response = await fetchUserById({ identifier: id }); // API cal
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleSendMail = async () => {
    try {
      const fullName = `${user.firstName?.trim()} ${user.lastName?.trim()}`;
      const response = await sendPersonalEmailAPi({
        data: {
          name: fullName,
          email: user.email,
          subject: mailSubject,
          message: mailBody,
        },
      });

      toast.success(response.message);

      setIsMailing(false);
      setMailSubject("");
      setMailBody("");
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
      console.error(err);
    }
  };

  if (loading || !user) {
    return <LoaderOverlay />;
  }

  return (
    <div className="p-6 space-y-6 border border-green-400 rounded-md bg-green-50 shadow-md h-full overflow-y-auto scrollbar-hide text-green-950">
      {/* Header */}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">User Details</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 "
        >
          Go Back
        </button>
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-green-300 rounded-md shadow">
        <p>
          <span className="font-semibold text-green-800">Name:</span>{" "}
          {user.firstName} {user.lastName}
        </p>

        <p>
          <span className="font-semibold text-green-800">Email:</span>{" "}
          {user.email}
        </p>
        <p>
          <span className="font-semibold text-green-800">Phone:</span>{" "}
          {user.phone}
        </p>
        <p>
          <span className="font-semibold text-green-800">
            Number of Bookings:
          </span>{" "}
          {user.bookings.length}
        </p>
        <p>
          <span className="font-semibold text-green-800">Last Logged In:</span>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Tour History */}
      <div className="p-4 bg-white border border-green-300 rounded-md shadow">
        <h3 className="text-green-700 font-semibold mb-2">
          User's Bookings History
        </h3>
        <ul className="list-disc pl-6 space-y-1 text-green-900 h-[30vh] overflow-y-scroll scrollbar-hide">
          {user.bookings.map((booking) => (
            <li
              key={booking._id} // ← unique key per item
              className="flex justify-between items-center p-4 mb-2 bg-white shadow rounded "
            >
              <span className="font-semibold">
                Tour: <span className="text-gray-800">{booking.tourTitle}</span>
              </span>
              <span>
                Participants:{" "}
                <span className="text-gray-800">
                  {booking.numberOfParticipants}
                </span>
              </span>
              <span
                className={
                  booking.status === "cancelled"
                    ? "px-2 py-1 text-red-700 bg-red-100 rounded"
                    : "px-2 py-1 text-green-700 bg-green-100 rounded"
                }
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Write Email Button */}
      {!isMailing && (
        <div className="flex justify-start">
          <button
            onClick={() => setIsMailing(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
          >
            Write Email
          </button>
        </div>
      )}

      {/* Mail Form */}
      {isMailing && (
        <div className="relative p-4 bg-white border border-green-300 rounded-md shadow space-y-4">
          <button
            onClick={() => setIsMailing(false)}
            className="absolute top-2 right-2 text-green-600 hover:text-green-800"
          >
            <AiOutlineClose size={20} />
          </button>
          <p className="text-green-700 font-semibold">Enter Your Message:</p>
          <input
            type="text"
            value={mailSubject}
            onChange={(e) => setMailSubject(e.target.value)}
            placeholder="Subject"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <textarea
            value={mailBody}
            onChange={(e) => setMailBody(e.target.value)}
            rows="4"
            placeholder="Enter message..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleSendMail}
            disabled={!mailSubject || !mailBody}
            className={`px-4 py-2 text-white rounded-md transition-all duration-150 ${
              !mailSubject || !mailBody
                ? "cursor-not-allowed bg-gray-500"
                : "bg-green-500 hover:bg-green-600 cursor-pointer"
            }`}
          >
            {sendPersonalEmailLoading ? "Sending" : "  Send Email"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
