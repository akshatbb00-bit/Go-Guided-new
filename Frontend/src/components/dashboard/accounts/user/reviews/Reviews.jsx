import { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaStar,
  FaRegStar,
  FaPlus,
} from "react-icons/fa";
import useSafeNavigate from "../../../../../utils/useSafeNavigate";
import ReviewsHeader from "../../../../common/DashboardHeader";
import AddEditReviewModal from "../../../../common/AddReview";
import ConfirmationModal from "../../../../../components/common/ConfirmationModal";
import NoResult from "../../../../../pages/NoResult";
import LoaderOverlay from "../../../../common/LoaderOverlay";
import {
  getUserReviews,
  deleteReview as deleteReviewById,
  submitReview,
} from "../../../../../services/reviewService";
import useApi from "../../../../../hooks/useApi";
import toast from "react-hot-toast";

function Reviews() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: [],
  });

  const navigate = useSafeNavigate();

  const [reviewedTours, setReviewedTours] = useState([]);
  const [unreviewedTours, setUnreviewedTours] = useState([]);

  const { loading, request: fetchUserReviews } = useApi(getUserReviews);
  const { loading: isDeleting, request: deleteReview } =
    useApi(deleteReviewById);
  const { loading: isSubmiting, request: addReviewToTour } =
    useApi(submitReview);
  const { loading: isEditing, request: editReviewTour } = useApi(submitReview);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUserReviews({});
        setReviewedTours(res?.data?.reviewedTours || []);
        setUnreviewedTours(res?.data?.notReviewedTours || []);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    reviewId: null,
  });
  const [editReview, setEditReview] = useState({ show: false, reviewId: null });
  const [addReview, setAddReview] = useState({ show: false, tourId: null });

  const handleEditReview = async (reviewData) => {
    try {
      const res = await addReviewToTour({
        identifier: reviewData.tourId,
        data: { rating: reviewData.rating, review: reviewData.reviewText },
      });
      await refreshReviews();
      toast.success(res?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setEditReview({ show: false, reviewId: null }); // Close modal
    }
  };

  const handleAddReview = async (reviewData) => {
    try {
      const res = await addReviewToTour({
        identifier: reviewData.tourId,
        data: { rating: reviewData.rating, review: reviewData.reviewText },
      });
      await refreshReviews();
      toast.success(res?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setAddReview({ show: false, tourId: null }); // Close modal
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      const res = await deleteReview({ identifier: id });
      await refreshReviews();
      toast.success(res?.message);
    } catch (error) {
    } finally {
      setDeleteConfirm({ show: false, reviewId: null });
    }
  };

  const refreshReviews = async () => {
    try {
      const res = await fetchUserReviews({});
      setReviewedTours(res?.data?.reviewedTours || []);
      setUnreviewedTours(res?.data?.notReviewedTours || []);
    } catch (error) {}
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, reviewId: null });
  };

  const handleOpenEditModal = (id) => {
    setEditReview({ show: true, reviewId: id });
  };

  const handleOpenAddModal = (id) => {
    setAddReview({ show: true, tourId: id });
  };

  if (loading || reviewedTours === undefined || unreviewedTours === undefined) {
    return <LoaderOverlay />;
  }

  return (
    <div className="p-4 sm:px-6 md:px-10 flex flex-col bg-green-50 h-full">
      <ReviewsHeader
        title="Reviews"
        totalCount={reviewedTours?.length + unreviewedTours?.length}
        filterState={filterState}
        setFilterState={setFilterState}
      />

      <div className="flex flex-col gap-4 overflow-y-auto h-full scrollbar-none">
        {/* Reviewed Tours Section */}
        {reviewedTours?.length > 0 && (
          <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-2">
            Reviewed Tours
          </h2>
        )}

        {reviewedTours.map((review) => (
          <div
            key={review.review._id}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-t-2 border-green-700"
          >
            <div className="flex justify-between items-center flex-wrap gap-y-2">
              <h2 className="text-lg sm:text-xl font-semibold text-green-800">
                {review.tour.title}
              </h2>
              <p className="text-gray-500 text-sm">
                {new Date(review.review.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 my-2">
              {Array.from({ length: 5 }).map((_, index) =>
                index < review.review.rating ? (
                  <FaStar key={index} className="text-yellow-400" />
                ) : (
                  <FaRegStar key={index} className="text-gray-400" />
                )
              )}
              <span className="text-gray-500 text-sm">
                {review.review.rating}/5
              </span>
            </div>

            <p className="text-green-900 p-3 rounded-md mb-4 shadow-sm text-sm sm:text-base">
              {review.review.review}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                onClick={() => handleOpenEditModal(review.tour._id)}
              >
                <FaEdit size={16} /> {isEditing ? "Editing..." : "Edit"}
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={() =>
                  setDeleteConfirm({ show: true, reviewId: review.review._id })
                }
              >
                <FaTrash size={16} /> {isDeleting ? "Deleting..." : "Delete"}
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={() => navigate(`/tours/${review.tour.slug}`)}
              >
                <FaEye size={16} /> View Tour
              </button>
            </div>
          </div>
        ))}

        {/* Unreviewed Tours Section */}
        {unreviewedTours.length > 0 && (
          <h2 className="text-xl sm:text-2xl font-bold text-green-700 mt-6 mb-2">
            Tours Awaiting Your Feedback
          </h2>
        )}

        {unreviewedTours.map((tour, i) => (
          <div
            key={tour._id + i}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-t-2 border-green-500"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-green-700">
              {tour.title}
            </h2>

            <p className="text-green-700 p-3 rounded-md mb-4 shadow-sm text-sm sm:text-base">
              You haven't reviewed this tour yet.
            </p>

            <div className="flex  gap-3 mt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                onClick={() => handleOpenAddModal(tour._id)}
              >
                <FaPlus size={16} /> {isSubmiting ? "Submiting..." : "Submit"}
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={() => navigate(`/tours/${tour.slug}`)}
              >
                <FaEye size={16} /> View Tour
              </button>
            </div>
          </div>
        ))}

        {/* No Results */}
        {reviewedTours.length <= 0 && unreviewedTours.length <= 0 && (
          <NoResult />
        )}
      </div>

      {/* Add/Edit Review Modal */}
      {editReview.show && (
        <AddEditReviewModal
          tourId={editReview.reviewId}
          initialReview={
            reviewedTours.find(
              (review) => review._id === editReview.reviewId
            ) || null
          }
          onSubmit={handleEditReview}
          setIsModalOpen={(show) =>
            setEditReview({ show, reviewId: editReview.reviewId })
          }
        />
      )}

      {addReview.show && (
        <AddEditReviewModal
          tourId={addReview.tourId}
          initialReview={null}
          onSubmit={handleAddReview}
          setIsModalOpen={(show) =>
            setAddReview({ show, tourId: addReview.tourId })
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <ConfirmationModal
          text={"Are you sure you want to delete this review?"}
          onConfirm={() => handleConfirmDelete(deleteConfirm.reviewId)}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default Reviews;
