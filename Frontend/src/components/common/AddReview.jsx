import { useState } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

function AddReview({ tourId, initialReview = null, onSubmit, setIsModalOpen }) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(initialReview?.reviewText || "");
  const [hasReviewed, setHasReviewed] = useState(!!initialReview);

  const handleSubmit = () => {
    if (!reviewText.trim()) {
      alert("Please enter a review.");
      return;
    }
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    const newReview = { rating, reviewText, tourId };
    onSubmit(newReview);

    setHasReviewed(true); // Mark as reviewed
  };
  const handleMouseMove = (star, event) => {
    const { left, width } = event.target.getBoundingClientRect();
    const x = event.clientX - left;
    const isHalf = x < width / 2;
    setHoverRating(isHalf ? star - 0.5 : star);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white  rounded-lg shadow-lg w-200 relative">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-2 right-2 text-green-600 hover:text-green-900 cursor-pointer"
        >
          <IoClose size={30} />
        </button>
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  rounded-lg shadow-lg w-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-green-600 hover:text-green-900 cursor-pointer"
            >
              <IoClose size={30} />
            </button>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-green-950">
                {hasReviewed ? "Edit Your Review" : "Add a Review"}
              </h2>
              <div className="flex flex-col gap-4">
                {/* Rating Selection */}
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isHalfStar =
                      rating === star - 0.5 || hoverRating === star - 0.5;
                    return (
                      <div
                        key={star}
                        className="cursor-pointer relative"
                        onMouseMove={(e) => handleMouseMove(star, e)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(hoverRating || star)}
                        style={{
                          width: "30px",
                          height: "30px",
                          position: "relative",
                        }}
                      >
                        {/* Full Star (Gray Background) */}
                        <FaStar
                          size={30}
                          className="absolute top-0 left-0 text-gray-300"
                          style={{ zIndex: 1 }}
                        />
                        {/* Half or Full Star (Yellow Foreground) */}
                        {isHalfStar ? (
                          <FaStarHalfAlt
                            size={30}
                            className="absolute top-0 left-0 text-yellow-500"
                            style={{ zIndex: 2 }}
                          />
                        ) : rating >= star || hoverRating >= star ? (
                          <FaStar
                            size={30}
                            className="absolute top-0 left-0 text-yellow-500"
                            style={{ zIndex: 2 }}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {/* Review Input */}
                <textarea
                  className="w-full p-2 text-green-950 border border-green-700 outline-none rounded-lg "
                  rows="4"
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                {/* Submit Button */}
                <button
                  className="flex self-end cursor-pointer w-34 items-center justify-center  mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  onClick={handleSubmit}
                >
                  {hasReviewed ? "Edit Review" : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddReview;
