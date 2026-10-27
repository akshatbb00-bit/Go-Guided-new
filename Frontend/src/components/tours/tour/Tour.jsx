import { useState } from "react";
import { FaStar, FaRegStar, FaArrowLeft } from "react-icons/fa";
import { BsSunFill } from "react-icons/bs";
import { TiGroup } from "react-icons/ti";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { CiCalendar } from "react-icons/ci";
import { IoLanguage } from "react-icons/io5";

import CallToAction from "./CallToAction";
import IncludedAndGuided from "./IncludedAndGuides";
import Timeline from "./Timeline";
import Photos from "./Photos";
import TourMap from "./TourMap";
import Reviews from "../../common/Reviews";
import useSafeNavigate from "../../../utils/useSafeNavigate";
import ShareModal from "../../common/ShareModal";
import { getTourBySlug, likeTour } from "../../../services/tourService";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import { useParams } from "react-router";
import LoaderOverlay from "../../common/LoaderOverlay";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function Tour() {
  const { user } = useUser();
  const safeNavigate = useSafeNavigate();

  const [tour, setTour] = useState([]);
  const [liked, setLiked] = useState(false);
  const [share, setShare] = useState(false);
  const shareUrl = window.location.origin + location.pathname;
  const { slug } = useParams();

  const { loading: isLoading, request: fetchTour } = useApi(getTourBySlug);
  const { request: sendLike, loading: likeLoading } = useApi(likeTour);

  const getTour = async () => {
    try {
      const res = await fetchTour({ identifier: slug });
      setTour(res?.data?.tour);

      // Check if current user has liked the tour
      setLiked(
        res?.data?.tour.likes.some((id) => id.toString() === user.id.toString())
      );
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getTour();
  }, [slug, user.id]);

  const handleLike = async () => {
    const action = liked ? "unlike" : "like";
    await sendLike({ identifier: tour._id, data: { action } });
    getTour();
  };

  if (isLoading || tour?.length === 0) return <LoaderOverlay />;

  return (
    <div className="px-4 md:px-20 lg:px-32 py-6 flex flex-col gap-6">
      {/* Heading */}
      <div className="shadow-md bg-white rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        {/* Left Side: Title, Rating, Location */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6 w-full ">
          {/* Title */}
          <div className="flex gap-4 items-center ">
            <button
              className="bg-green-600 text-white p-2.5 sm:p-3 rounded-full uppercase font-semibold tracking-wide hover:bg-green-700 transition cursor-pointer flex items-center justify-center"
              onClick={() => safeNavigate(-1)}
              aria-label="Back"
            >
              <FaArrowLeft size={18} />
            </button>
            <h3 className="font-bold text-xl sm:text-3xl text-green-900 truncate max-w-xs sm:max-w-none">
              {tour.title}
            </h3>
          </div>
          <div className="flex justify-between w-full ">
            <div className="flex gap-4 items-center ">
              {/* Rating */}
              {tour.totalReviews > 0 ? (
                <div className="flex items-center gap-1 text-green-950 text-lg sm:text-xl font-semibold whitespace-nowrap">
                  <span>
                    {tour.avgRating === 5
                      ? "5"
                      : tour.avgRating.toFixed(1).replace(/\.0$/, "")}
                  </span>
                  <FaStar className="text-yellow-400 text-base sm:text-lg" />
                  <span className="text-sm sm:text-base font-medium text-gray-600">
                    ({tour.totalReviews}{" "}
                    {tour.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500 italic">
                  No ratings yet
                </span>
              )}

              {/* Location */}
              <span className="text-sm sm:text-lg text-green-950 truncate max-w-xs">
                {tour.location}
              </span>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={handleLike}
              >
                {liked ? (
                  <FaHeart className="text-red-600 text-xl sm:text-2xl" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-xl sm:text-2xl" />
                )}
              </div>
              <button
                className="bg-green-700 text-white px-3 py-1 rounded-lg uppercase font-semibold tracking-wide hover:bg-green-800 transition cursor-pointer text-sm sm:text-base"
                onClick={() => setShare(!share)}
              >
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Buttons */}
      </div>

      {/* Photos */}
      <Photos images={tour.images} />

      {/* Overview */}
      <div className="flex flex-col md:flex-row rounded-lg gap-8">
        {/* Left Side - Quick Facts */}
        <div className="flex flex-col gap-5 w-full md:w-1/3 bg-white p-4 sm:p-5 rounded-lg shadow-sm">
          <h3 className="text-xl md:text-2xl font-bold text-green-900">
            Quick Facts
          </h3>

          {/* Each fact */}
          <div className="flex items-center gap-2 sm:gap-3 text-green-950 flex-wrap">
            <BsSunFill size={20} className="text-green-500" />
            <span className="font-medium text-sm sm:text-lg whitespace-nowrap">
              Duration:
            </span>
            <span className="text-sm sm:text-lg font-light">
              {tour.duration} {tour.duration === 1 ? "day" : "days"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-green-950 flex-wrap">
            <TiGroup size={20} className="text-green-500" />
            <span className="font-medium text-sm sm:text-lg whitespace-nowrap">
              Participants:
            </span>
            <span className="text-sm sm:text-lg font-light">
              {tour.participants}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-green-950 flex-wrap">
            <HiArrowTrendingUp size={20} className="text-green-500" />
            <span className="font-medium text-sm sm:text-lg whitespace-nowrap">
              Difficulty:
            </span>
            <span className="text-sm sm:text-lg font-light">
              {tour.difficulty.charAt(0).toUpperCase() +
                tour.difficulty.slice(1).toLowerCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-green-950 flex-wrap">
            <FaRegStar size={20} className="text-green-500" />
            <span className="font-medium text-sm sm:text-lg whitespace-nowrap">
              Rating:
            </span>
            <span className="text-sm sm:text-lg font-light">
              {tour.rating && tour.rating > 0
                ? `${tour.rating}/5`
                : "Not rated"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-green-950 flex-wrap">
            <IoLanguage size={20} className="text-green-500" />
            <span className="font-medium text-sm sm:text-lg whitespace-nowrap">
              Languages:
            </span>
            <span className="text-sm sm:text-lg font-light">
              {tour.languages.join(", ")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-green-950 flex-wrap">
            <CiCalendar size={20} className="text-green-500" />
            <span className="font-medium text-sm sm:text-lg whitespace-nowrap">
              Date:
            </span>
            <span className="text-sm sm:text-lg font-light">
              {formatDate(tour.startDate)}
            </span>
          </div>
        </div>

        {/* Right Side - Tour Overview */}
        <div className="w-full md:w-2/3 bg-white p-4 sm:p-5 rounded-lg shadow-sm">
          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-bold text-green-900">
              About This Tour
            </h3>
            <p className="text-green-950 leading-relaxed max-h-28 overflow-y-auto scrollbar-none text-sm sm:text-base">
              {tour.overview}
            </p>
          </div>

          <div className="mt-4 pb-1">
            <h4 className="text-lg md:text-xl font-semibold text-green-900">
              Tour Highlights
            </h4>
            <ul className="list-disc list-inside text-green-950 mt-2 space-y-1 md:space-y-2 max-h-36 overflow-y-auto scrollbar-none text-sm sm:text-base">
              {tour.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="flex flex-col justify-between gap-5 rounded-lg p-4 sm:p-5 bg-white shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold text-green-900">
          Itinerary
        </h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full justify-between rounded-lg">
          <Timeline tourSchedule={tour.tourSpots} />
          <TourMap spots={tour.tourSpots} />
        </div>
      </div>

      {/* Buy and Included Things */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 md:gap-10 bg-white p-4 sm:p-6 rounded-xl shadow-lg h-full">
        <IncludedAndGuided included={tour.included} guides={tour.guides} />
        <CallToAction
          images={tour.images}
          duration={tour.duration}
          startDate={tour.startDate}
          availableSlots={tour.availableSlots}
        />
      </div>

      {/* Reviews */}
      <div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row shadow-sm rounded-sm items-start sm:items-center justify-between p-2 gap-2 sm:gap-0">
            <h2 className="text-xl md:text-2xl font-bold text-green-900">
              Reviews
            </h2>
          </div>

          <Reviews reviews={tour.reviews} />
        </div>

        {share && (
          <ShareModal
            isOpen={share}
            setIsModalOpen={setShare}
            shareUrl={shareUrl}
          />
        )}
      </div>
    </div>
  );
}

export default Tour;
