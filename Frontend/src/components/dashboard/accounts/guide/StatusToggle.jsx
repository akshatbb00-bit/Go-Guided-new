import { useState, useEffect } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import ConfirmationModal from "../../../common/ConfirmationModal";
import { getStatus, updateStatus } from "../../../../services/guideService";
import useApi from "../../../../hooks/useApi";
import toast from "react-hot-toast";

function StatusToggle() {
  const [currentStatus, setCurrentStatus] = useState("available");
  const [nextAvailableFrom, setNextAvailableFrom] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const { request: getStatusRequest } = useApi(getStatus);
  const { request: updateStatusRequest } = useApi(updateStatus);

  // Get today’s date (ISO format for input)
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  // Load guide status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getStatusRequest({});
        setCurrentStatus(res.data?.status);
        setNextAvailableFrom(res.data.nextAvailableFrom);
      } catch (error) {}
    })();
  }, []);

  // Validate date input
  useEffect(() => {
    if (tempDate) {
      if (tempDate < today) {
        setWarningMessage("Please select a future date.");
        setSelectedDate("");
      } else {
        setWarningMessage("");
        setSelectedDate(tempDate);
      }
    }
  }, [tempDate]);

  const handleDateChange = (e) => setTempDate(e.target.value);

  const toggleStatus = () => {
    if (currentStatus === "available") setShowDatePicker(true);
    else setConfirmModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    const newStatus =
      currentStatus === "available" ? "unavailable" : "available";

    try {
      const payload =
        newStatus === "unavailable"
          ? { status: "unavailable", nextAvailableFrom: selectedDate }
          : { status: "available" };

      const res = await updateStatusRequest({ data: payload });

      setCurrentStatus(newStatus);
      setNextAvailableFrom(res.data.nextAvailableFrom);
      toast.success(res.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      resetFields();
      setConfirmModalOpen(false);
    }
  };

  const resetFields = () => {
    setShowDatePicker(false);
    setTempDate("");
    setSelectedDate("");
    setWarningMessage("");
  };

  const closeModals = () => {
    resetFields();
    setConfirmModalOpen(false);
  };

  return (
    <div className="w-full p-6 bg-white shadow-sm rounded-lg text-center">
      <h2 className="text-xl font-bold text-green-950">
        Status:{" "}
        <span
          className={
            currentStatus === "available" ? "text-green-800" : "text-red-600"
          }
        >
          {currentStatus === "available" ? "Available" : "Unavailable"}
        </span>
      </h2>

      {currentStatus === "unavailable" && nextAvailableFrom && (
        <p className="text-sm text-gray-700 mt-1">
          📅 <span className="font-medium">Available from:</span>{" "}
          <span className="font-semibold">
            {new Date(nextAvailableFrom).toLocaleDateString("en-GB")}
          </span>
        </p>
      )}

      {!showDatePicker && (
        <div className="my-4">
          <button
            onClick={toggleStatus}
            className={`w-32 py-2 text-white font-semibold rounded-lg transition ${
              currentStatus === "available"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Change
          </button>
        </div>
      )}

      {showDatePicker && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select date you’ll be available from:
          </label>
          <input
            type="date"
            value={tempDate}
            min={today}
            onChange={handleDateChange}
            className="border p-2 rounded w-full border-green-300 outline-none"
          />

          {warningMessage && (
            <div className="flex items-center bg-red-100 text-red-700 px-3 py-2 rounded mt-2">
              <FaExclamationCircle className="w-5 h-5 mr-2" />
              <p className="text-sm font-semibold">{warningMessage}</p>
            </div>
          )}

          {selectedDate && !warningMessage && (
            <>
              <p className="text-sm text-gray-600 mt-2">
                📅{" "}
                <span className="font-medium">You’ll be available from:</span>{" "}
                <span className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString("en-GB")}
                </span>
              </p>
              <button
                onClick={() => setConfirmModalOpen(true)}
                className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
              >
                Confirm Unavailable
              </button>
            </>
          )}
        </div>
      )}

      {confirmModalOpen && (
        <ConfirmationModal
          text={
            currentStatus === "available"
              ? "Are you sure you want to mark yourself as Unavailable?"
              : "Are you sure you want to mark yourself as Available?"
          }
          onCancel={closeModals}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
}

export default StatusToggle;
