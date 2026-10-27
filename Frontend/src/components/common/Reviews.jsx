import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import Avatar from "./Avatar";

function Reviews({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="w-full py-6 rounded-xl overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-0">
      <div className="flex gap-4 items-stretch">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] lg:min-w-[310px] h-auto p-4 sm:p-5 lg:p-6 border border-green-500 rounded-2xl bg-white shadow-md shadow-black/50 transition-transform duration-200 ease-in-out hover:scale-105 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 mb-1">
              {review?.profilePicUrl ? (
                <Avatar size={48} imageURL={review.profilePicUrl} />
              ) : (
                <Avatar
                  size={48}
                  bgColor={"bg-green-500"}
                  textColor={"text-white"}
                  textSize={"text-2xl"}
                  fontWeight={"font-semibold"}
                  fullName={review.reviewerName}
                />
              )}
              <h3 className="text-base sm:text-lg font-semibold text-green-800">
                {review.reviewerName}
              </h3>
            </div>
            <div className="text-sm text-green-700 italic relative pl-5 before:content-['“'] before:text-2xl before:text-green-600 before:absolute before:left-0 overflow-y-auto max-h-20 pr-2 whitespace-normal scrollbar-none">
              {review.review}
            </div>
            <p className="text-sm text-green-600 font-semibold flex items-center gap-1 mt-auto">
              {Array.from({ length: 5 }, (_, i) =>
                i < Math.floor(review.rating) ? (
                  <FaStar key={i} className="text-yellow-500" />
                ) : i < review.rating ? (
                  <FaStarHalfAlt key={i} className="text-yellow-500" />
                ) : (
                  <FaRegStar key={i} className="text-yellow-500" />
                )
              )}{" "}
              ({review.rating}/5)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;
