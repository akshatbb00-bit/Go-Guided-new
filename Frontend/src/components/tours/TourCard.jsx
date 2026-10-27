import useSafeNavigate from "../../utils/useSafeNavigate";
import { formatDate } from "../../utils/utils";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendar, CiFlag1 } from "react-icons/ci";
import { HiArrowTrendingUp } from "react-icons/hi2";
import RatingStars from "../common/RatingStars";

function TourCard({ tour }) {
  const navigate = useSafeNavigate();

  // Split title words once
  const titleParts = tour.title.split(" ");

  return (
    <div
      className="grid grid-rows-[0.75fr_1fr] overflow-hidden shadow-sm shadow-black/15
                    h-[350px] sm:h-[400px] md:h-[450px] rounded-md
                    bg-white"
    >
      {/* Image section */}
      <div className="relative overflow-hidden rounded-t-md h-[140px] sm:h-48 md:h-56">
        <img
          className="object-cover object-center w-full h-full"
          src={tour.thumbnail}
          alt={tour.title}
        />
        {/* Background overlay shape */}
        <div className="bg-white h-20 w-[120%] absolute -bottom-10 -rotate-9 text-black text-center z-1"></div>

        {/* Title block */}
        <div className="flex flex-col items-end  absolute bottom-8 right-0 z-2">
          <p className="bg-green-600/70 shadow-sm px-2 py-1 sm:px-3 sm:py-2 text-xl sm:text-2xl text-white font-semibold">
            {titleParts[0]?.toUpperCase()} {titleParts[1]?.toUpperCase()}
          </p>
          {titleParts[2] && (
            <p className="bg-green-600/80 shadow-md px-2 py-1 sm:px-3 sm:py-2 text-xl sm:text-2xl text-white font-semibold absolute top-8 ">
              {titleParts[2].toUpperCase()}
            </p>
          )}
        </div>
      </div>

      {/* Content section */}
      <div className="bg-white rounded-b-md flex flex-col justify-between p-3 sm:p-4">
        {/* Description */}
        <p className="font-extralight text-sm sm:text-base line-clamp-3">
          {tour.description}
        </p>

        {/* Tour details grid */}
        <div className="grid grid-cols-2 gap-y-2 mt-3 text-sm sm:text-base text-gray-700">
          <div className="flex gap-x-2 items-center">
            <IoLocationOutline size={18} color="green" />
            <span>{tour.location}</span>
          </div>
          <div className="flex gap-x-2 items-center">
            <CiCalendar size={18} color="green" />
            <span>{formatDate(tour.startDate)}</span>
          </div>
          <div className="flex gap-x-2 items-center">
            <HiArrowTrendingUp size={18} color="green" />
            <span>
              {tour.difficulty.charAt(0).toUpperCase() +
                tour.difficulty.slice(1)}
            </span>
          </div>
          <div className="flex gap-x-2 items-center">
            <CiFlag1 size={18} color="green" />
            <span>{tour.tourSpots} Stops</span>
          </div>
        </div>

        {/* Rating and Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-green-600 font-semibold flex items-center gap-1 text-base sm:text-lg">
            <RatingStars Review_Count={tour.avgRating} />
            <span className="text-green-700">/5</span>
          </div>

          <button
            className="px-4 sm:px-6 py-2 bg-green-500 rounded-xl cursor-pointer hover:bg-green-600 text-white text-sm sm:text-lg transition"
            onClick={() => navigate(tour.slug)}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default TourCard;
