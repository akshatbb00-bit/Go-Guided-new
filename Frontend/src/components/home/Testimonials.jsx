import Reviews from "../common/Reviews";
import { getRecentReviews } from "../../services/reviewService";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import { useState } from "react";

function Testimonials() {
  const { request: fetchRecentReviews } = useApi(getRecentReviews);
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchRecentReviews({});
        setReviews(res?.data?.reviews);
      } catch (error) {}
    })();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-32 py-10 space-y-6">
      <h3 className="text-center text-2xl sm:text-3xl font-bold text-green-800">
        What our clients say
      </h3>
      <Reviews reviews={reviews} />
    </div>
  );
}

export default Testimonials;
