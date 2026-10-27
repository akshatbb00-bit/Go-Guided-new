import { useEffect, useState } from "react";
import useSafeNavigate from "../../../utils/useSafeNavigate";
import { useUser } from "../../../context/UserContext";

function CallToAction({ images, duration, startDate, availableSlots }) {
  const navigate = useSafeNavigate();
  const { user } = useUser();

  const [isBookingClosed, setIsBookingClosed] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const isUser = user?.role === "user";
  const isDisabled = isBookingClosed || isFull || !isUser;

  useEffect(() => {
    if (startDate) {
      const today = new Date();
      const tourStart = new Date(startDate);
      setIsBookingClosed(tourStart < today);
    }

    if (typeof availableSlots === "number") {
      setIsFull(availableSlots <= 0);
    }
  }, [startDate, availableSlots]);

  const getButtonLabel = () => {
    if (!isUser) return "Login as User to Book";
    if (isBookingClosed) return "Booking Closed";
    if (isFull) return "No Slots Available";
    return "Book Tour Now!";
  };

  return (
    <div className="flex flex-col justify-between w-full md:w-[60%] p-6 md:p-8 rounded-lg shadow-sm h-full min-h-[400px]">
      {/* Top Images */}
      <div className="flex justify-center -space-x-12 mb-6">
        {images.slice(0, 3).map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt="Adventure"
            className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
        ))}
      </div>

      {/* Middle Text */}
      <div className="text-center mb-6 px-2">
        <h2 className="text-green-700 font-bold text-xl md:text-2xl leading-snug mb-2">
          What Are You Waiting For?
        </h2>
        <p className="text-gray-700 text-xs md:text-sm">
          {duration} {duration === 1 ? "day" : "days"}. 1 adventure. Infinite
          memories. Make it yours today!
        </p>
      </div>

      {/* Bottom Button */}
      <div className="flex justify-center px-2">
        <button
          disabled={isDisabled}
          onClick={() => navigate("book-tour")}
          className={`bg-green-600 text-white text-sm font-semibold py-3 px-6 md:px-8 rounded-full shadow-md transition-all duration-300
            ${
              isDisabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-700 cursor-pointer"
            }`}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}

export default CallToAction;
