import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { getMyTrips, cancelDraftTrip } from "../../../../../services/tripService";
import LoaderOverlay from "../../../../common/LoaderOverlay";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const date = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const badge = {
  draft: "bg-yellow-100 text-yellow-800",
  booked: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-200 text-gray-600",
};

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getMyTrips();
      setTrips(res.data.data.trips);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load your trips.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await cancelDraftTrip({ identifier: id });
      toast.success("Trip removed");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove the trip.");
    }
  };

  if (loading) return <LoaderOverlay />;

  return (
    <div className="p-4 w-full h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-2xl font-bold text-green-950">My Trips</h2>
        <Link to="/plan-trip" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Plan a new trip
        </Link>
      </div>

      {trips.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-gray-600">
          You have not planned a trip yet.{" "}
          <Link to="/plan-trip" className="text-green-700 font-semibold underline">Plan your first trip</Link>.
        </div>
      )}

      <div className="space-y-4">
        {trips.map((t) => (
          <div key={t._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg text-green-900">{t.title}</h3>
                <p className="text-sm text-gray-600">
                  {t.origin} to {t.destination} · {date(t.startDate)} · {t.numberOfDays} days · {t.numberOfTravellers} people
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${badge[t.status]}`}>
                {t.status === "draft" ? "Not paid yet" : t.status}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Route:</strong> {t.stops.map((s) => s.name).join(" → ")}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <span className="text-xl font-bold text-green-700">{inr(t.pricing?.total)}</span>
              {t.status === "draft" && (
                <div className="flex gap-2">
                  <Link to={`/plan-trip?trip=${t._id}`} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                    Continue booking
                  </Link>
                  <button onClick={() => remove(t._id)} className="border border-red-400 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 text-sm">
                    Remove
                  </button>
                </div>
              )}
              {t.status === "booked" && <span className="text-sm text-gray-500">Our team will contact you on {t.phoneNumber}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
