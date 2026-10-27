import { useEffect, useState } from "react";
import { useParams } from "react-router";
import TourForm from "../../../../components/common/TourForm";
import { getTourBySlug } from "../../../../services/tourService";
import useApi from "../../../../hooks/useApi";

export default function EditTour() {
  const { slug } = useParams();
  const [tour, setTour] = useState();
  const { loading, request: fetchTour } = useApi(getTourBySlug);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchTour({ identifier: slug });
        setTour(response.data.tour);
      } catch (err) {}
    })();
  }, [slug]);

  if (loading) return <div className="p-6">Loading tour...</div>;
  if (!tour)
    return (
      <div className="p-6 text-red-500">Tour not found or failed to load.</div>
    );

  return <TourForm isEditTour={true} existingTour={tour} />;
}
