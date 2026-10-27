import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { FaTrash } from "react-icons/fa";
import StarRatings from "react-star-ratings";
import ConfirmationModal from "../../../common/ConfirmationModal";
import {
  getReviewById,
  deleteReview,
} from "../../../../services/reviewService";
import useApi from "../../../../hooks/useApi";

// Local date formatting utility
const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", options);
};

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false });

  const { loading, request: fetchReview } = useApi(getReviewById);
  const { loading: isDeleting, request: deleteReviewById } =
    useApi(deleteReview);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchReview({ identifier: id });
        setReview(res?.data?.review);
      } catch (error) {}
    })();
  }, []);

  const handleDelete = () => {
    setDeleteConfirm({ show: true });
  };

  const confirmDelete = async () => {
    try {
      const res = await deleteReviewById({ identifier: review.id });
      setDeleteConfirm({ show: false });
      navigate(-1);
    } catch (error) {}
  };

  const cancelDelete = () => setDeleteConfirm({ show: false });

  if (!review) return <p className="p-4 text-green-800">Loading...</p>;

  return (
    <div className="p-6 space-y-6 bg-green-50 border border-green-400 rounded shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-800">Review Details</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go Back
        </button>
      </div>

      {/* Review Details */}
      <div className="space-y-4 bg-white p-4 border border-green-300 rounded shadow">
        <p>
          <span className="font-semibold text-green-800">Reviewer:</span>{" "}
          {review.reviewerName}
        </p>
        <p>
          <span className="font-semibold text-green-800">Email:</span>{" "}
          {review.email}
        </p>
        <p>
          <span className="font-semibold text-green-800">Tour:</span>{" "}
          {review.tourName}
        </p>
        <p>
          <span className="font-semibold text-green-800">Date:</span>{" "}
          {formatDate(review.date)}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-800">Rating:</span>
          <StarRatings
            rating={review.rating}
            starRatedColor="#FFD700"
            numberOfStars={5}
            starDimension="18px"
            starSpacing="2px"
          />
        </div>
        <div>
          <h3 className="text-green-700 font-semibold mb-1">Review Message</h3>
          <p className="text-green-800">{review.message}</p>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        <FaTrash size={16} /> Delete Review
      </button>

      {/* Confirmation Modal */}
      {deleteConfirm.show && (
        <ConfirmationModal
          text={"Are you sure you want to delete this review?"}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default ReviewDetails;
