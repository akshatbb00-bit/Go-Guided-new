import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllTrips, manageTrip } from "../../../../services/tripService";
import LoaderOverlay from "../../../common/LoaderOverlay";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const date = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const badge = {
  draft: "bg-yellow-100 text-yellow-800",
  booked: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-200 text-gray-600",
};

// Admin and owner: custom trips planned by travellers
export default function CustomTrips() {
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState("booked");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const load = async (s = status) => {
    setLoading(true);
    try {
      const res = await getAllTrips({ params: s ? { status: s } : {} });
      setTrips(res.data.data.trips);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load trips.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(status);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (id, data) => {
    try {
      await manageTrip({ identifier: id, data });
      toast.success("Trip updated");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update the trip.");
    }
  };

  return (
    <div className="p-4 w-full h-full overflow-y-auto scrollbar-hide">
      {loading && <LoaderOverlay />}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-2xl font-bold text-green-950">Custom Trips</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg p-2">
          <option value="booked">Booked (to arrange)</option>
          <option value="completed">Completed</option>
          <option value="draft">Not paid yet</option>
          <option value="cancelled">Cancelled</option>
          <option value="">All</option>
        </select>
      </div>

      {!loading && trips.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-600">No trips here.</div>}

      <div className="space-y-3">
        {trips.map((t) => (
          <div key={t._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="font-bold text-green-900">{t.title}</h3>
                <p className="text-sm text-gray-600">
                  {t.user?.firstName} {t.user?.lastName} · {t.phoneNumber || t.user?.phone} · {t.user?.email}
                </p>
                <p className="text-sm text-gray-600">
                  {t.origin} to {t.destination} · {date(t.startDate)} · {t.numberOfDays} days · {t.numberOfTravellers} people · {t.budgetLevel}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${badge[t.status]}`}>{t.status}</span>
                <p className="text-lg font-bold text-green-700 mt-1">{inr(t.pricing?.total)}</p>
              </div>
            </div>

            <button onClick={() => setOpen(open === t._id ? null : t._id)} className="text-green-700 text-sm underline mt-2">
              {open === t._id ? "Hide itinerary" : "Show itinerary and travellers"}
            </button>

            {open === t._id && (
              <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-1">Itinerary</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    {t.stops.map((s, i) => (
                      <li key={i}>
                        <strong>Day {s.day}:</strong> {s.name} {s.place && <span className="text-gray-500">({s.place})</span>}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="font-semibold mb-1">Travellers</p>
                  <ul className="space-y-0.5">
                    {t.members?.map((m, i) => (
                      <li key={i}>{m.name}, {m.age}, {m.gender}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {t.status === "booked" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => update(t._id, { status: "completed" })} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                  Mark completed
                </button>
                <button onClick={() => update(t._id, { status: "cancelled" })} className="border border-red-400 text-red-500 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
