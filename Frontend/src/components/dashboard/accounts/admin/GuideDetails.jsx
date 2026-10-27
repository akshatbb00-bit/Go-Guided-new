import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AiOutlineClose } from "react-icons/ai";
import useApi from "../../../../hooks/useApi";
import {
  getUserById,
  sendPersonalEmail,
} from "../../../../services/userService";
import LoaderOverlay from "../../../common/LoaderOverlay";
import { toast } from "react-hot-toast";

const GuideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isMailing, setIsMailing] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [user, setUser] = useState();

  const { loading, request: fetchUserById } = useApi(getUserById);
  const { loading: sendPersonalEmailLoading, request: sendPersonalEmailAPi } =
    useApi(sendPersonalEmail);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const response = await fetchUserById({ identifier: id });
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    })();
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
    <div className="p-6 space-y-6 border border-green-400 rounded-md bg-green-50 shadow-md h-full overflow-y-auto scrollbar-none text-green-950">
      {/* Header */}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Guide Details</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 cursor-pointer py-2 bg-green-500 text-white rounded-md hover:bg-green-600 "
        >
          Go Back
        </button>
      </div>
      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-green-300 rounded-md shadow-sm">
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
          <span className="font-semibold text-green-800">Number of Tours:</span>{" "}
          {user.tours.length}
        </p>
        <p>
          <span className="font-semibold text-green-800">Last Logged in:</span>{" "}
          {new Date(user.updatedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Tour History */}
      <div className="p-4 bg-white border border-green-300 rounded-md shadow-sm">
        <h3 className="text-green-700 font-semibold mb-2">
          User's Tour History
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          {user.tours.map((tour) => (
            <li
              key={tour._id}
              className="flex justify-between items-center p-4 mb-2 bg-white shadow rounded"
            >
              <span className="font-semibold">
                Tour: <span className="text-gray-800">{tour.title}</span>
              </span>
              <span className="font-semibold">
                Start Date:
                <span className="text-gray-800">
                  {new Date(tour.startDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>
              <span className="font-semibold">
                End Date:
                <span className="text-gray-800">
                  {new Date(tour.endDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Email Trigger */}
      {!isMailing && (
        <div>
          <button
            onClick={() => setIsMailing(true)}
            className="px-4 py-2 cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Write Email
          </button>
        </div>
      )}

      {/* Email Form */}
      {isMailing && (
        <div className="relative p-4 bg-white border border-green-300 rounded-md shadow-sm space-y-4">
          <button
            onClick={() => setIsMailing(false)}
            className="absolute top-2 right-2 text-green-600 hover:text-green-800"
          >
            <AiOutlineClose size={20} />
          </button>
          <div className="space-y-2">
            <p className="text-green-700 font-semibold">Enter Your Message:</p>
            <input
              type="text"
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              placeholder="Subject"
              className="w-full p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              rows="4"
              placeholder="Enter message..."
              className="w-full p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSendMail}
              disabled={!mailSubject || !mailBody}
              className={`px-4 py-2 text-white rounded-md transition ${
                !mailSubject || !mailBody
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 cursor-pointer"
              }`}
            >
              {sendPersonalEmailLoading ? "Sending" : "  Send Email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDetails;
