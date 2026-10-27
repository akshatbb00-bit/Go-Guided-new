import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { FaMagic, FaTrash, FaRoute, FaUsers, FaRupeeSign } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import {
  suggestTrip,
  quoteTrip,
  createTrip,
  getTripById,
} from "../services/tripService";
import { payForTrip } from "../integrations/tripPayment";
import TripMap from "../components/trips/TripMap";
import LoaderOverlay from "../components/common/LoaderOverlay";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const errMsg = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.message || err?.message || fallback;

// yyyy-mm-dd in the traveller's own time zone
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const input = "w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500";
const label = "block text-sm font-semibold text-green-800 mb-1";

function PriceCard({ pricing, perPerson }) {
  if (!pricing) return null;
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <h3 className="font-bold text-green-900 flex items-center gap-2 mb-2">
        <FaRupeeSign /> Price estimate
      </h3>
      <ul className="text-sm text-gray-700 space-y-1">
        {pricing.breakdown.map((b) => (
          <li key={b.label} className="flex justify-between gap-3">
            <span>{b.label}</span>
            <span className="font-medium whitespace-nowrap">{inr(b.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-green-200 mt-3 pt-3 flex justify-between items-center">
        <span className="font-semibold text-green-900">Total</span>
        <span className="text-2xl font-bold text-green-700">{inr(pricing.total)}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">About {inr(perPerson ?? pricing.perPerson)} per person</p>
    </div>
  );
}

export default function PlanTrip() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, isUserLoading } = useUser();
  const isLoggedIn = Boolean(user?._id || user?.email);

  const [step, setStep] = useState("form"); // form | plan | book
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    purpose: "",
    startDate: inDays(14),
    days: 5,
    travellers: 4,
    budgetLevel: "standard",
    preferences: "",
  });
  const [plan, setPlan] = useState(null); // { title, summary, stops[] }
  const [pricing, setPricing] = useState(null);
  const [trip, setTrip] = useState(null); // saved draft
  const [phone, setPhone] = useState("");
  const [members, setMembers] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Resume an unpaid trip from "My Trips"
  useEffect(() => {
    const id = params.get("trip");
    if (!id || !isLoggedIn) return;
    (async () => {
      try {
        setBusy(true);
        const res = await getTripById({ identifier: id });
        const t = res.data.data.trip;
        if (t.status !== "draft") return navigate("/user/trips");
        setTrip(t);
        setMembers(Array.from({ length: t.numberOfTravellers }, () => ({ name: "", age: "", gender: "male" })));
        setStep("book");
      } catch (err) {
        toast.error(errMsg(err));
      } finally {
        setBusy(false);
      }
    })();
  }, [params, isLoggedIn, navigate]);

  // Keep the price in step with the edited stops
  useEffect(() => {
    if (step !== "plan" || !plan?.stops.length) return;
    const t = setTimeout(async () => {
      try {
        const res = await quoteTrip({
          data: { days: Number(form.days), travellers: Number(form.travellers), stopsCount: plan.stops.length, budgetLevel: form.budgetLevel },
        });
        setPricing(res.data.data.pricing);
      } catch {
        /* the last price stays on screen */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [step, plan?.stops.length, form.days, form.travellers, form.budgetLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const planTrip = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      const res = await suggestTrip({
        data: { ...form, days: Number(form.days), travellers: Number(form.travellers) },
      });
      setPlan(res.data.data.plan);
      setPricing(res.data.data.pricing);
      setStep("plan");
    } catch (err) {
      toast.error(errMsg(err, "Could not plan the trip. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const stopsByDay = useMemo(() => {
    const days = {};
    (plan?.stops || []).forEach((s, i) => {
      (days[s.day] = days[s.day] || []).push({ ...s, index: i });
    });
    return days;
  }, [plan]);

  const removeStop = (index) => {
    if (plan.stops.length === 1) return toast.error("A trip needs at least one stop.");
    setPlan((p) => ({ ...p, stops: p.stops.filter((_, i) => i !== index) }));
  };
  const moveStopDay = (index, day) =>
    setPlan((p) => {
      const stops = p.stops.map((s, i) => (i === index ? { ...s, day: Number(day) } : s));
      return { ...p, stops: [...stops].sort((a, b) => a.day - b.day) };
    });

  const saveAndContinue = async () => {
    setBusy(true);
    try {
      const res = await createTrip({
        data: {
          ...form,
          days: Number(form.days),
          travellers: Number(form.travellers),
          title: plan.title,
          summary: plan.summary,
          stops: plan.stops.map((s) => ({
            day: s.day, name: s.name, place: s.place, description: s.description,
            lat: s.location.coordinates[1], lng: s.location.coordinates[0],
          })),
        },
      });
      const saved = res.data.data.trip;
      setTrip(saved);
      setMembers(Array.from({ length: saved.numberOfTravellers }, () => ({ name: "", age: "", gender: "male" })));
      setStep("book");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const setMember = (i, k, v) => setMembers((m) => m.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));

  const payNow = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await payForTrip({
        tripId: trip._id,
        phoneNumber: phone,
        members: members.map((m) => ({ ...m, age: Number(m.age) })),
      });
      toast.success("Trip booked successfully!");
      navigate("/user/trips");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  // ---------- gates ----------
  if (isUserLoading) return <LoaderOverlay />;
  if (!isLoggedIn || user?.role !== "user") {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <FaRoute className="text-5xl text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-900 mb-2">Plan your own trip</h1>
        <p className="text-gray-600 mb-6">
          {isLoggedIn
            ? "Trip planning is available for traveller (user) accounts."
            : "Please log in to plan and book a custom trip."}
        </p>
        {!isLoggedIn && (
          <Link to="/login" className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700">
            Log in
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {busy && <LoaderOverlay />}

      {/* Header */}
      <div className="mb-6 text-center bg-white rounded-xl shadow-md p-5">
        <h1 className="text-3xl md:text-4xl font-bold text-green-900">Plan a Trip</h1>
        <p className="text-gray-600 mt-1">
          Tell us where you want to go and what kind of trip it is. We plan the route, add the best places on the way, and book everything.
        </p>
        <div className="flex justify-center gap-2 mt-4 text-sm">
          {["Details", "Your plan", "Book"].map((t, i) => {
            const active = ["form", "plan", "book"].indexOf(step) >= i;
            return (
              <span key={t} className={`px-3 py-1 rounded-full ${active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                {i + 1}. {t}
              </span>
            );
          })}
        </div>
      </div>

      {/* STEP 1 */}
      {step === "form" && (
        <form onSubmit={planTrip} className="bg-white rounded-xl shadow-md p-5 md:p-8 max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Starting city</label>
            <input className={input} required minLength={2} placeholder="e.g. Indore" value={form.origin} onChange={set("origin")} />
          </div>
          <div>
            <label className={label}>Where do they want to go?</label>
            <input className={input} required minLength={2} placeholder="e.g. Bihar, Gaya, Varanasi" value={form.destination} onChange={set("destination")} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>What kind of trip is it?</label>
            <input
              className={input}
              required
              minLength={2}
              maxLength={100}
              placeholder="e.g. Temple darshan with family, trekking with friends, honeymoon"
              value={form.purpose}
              onChange={set("purpose")}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {["Pilgrimage / temple darshan", "Family holiday", "Adventure and trekking", "Heritage and culture", "Nature and wildlife", "Honeymoon"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, purpose: t }))}
                  className={`px-3 py-1 rounded-full text-sm border ${form.purpose === t ? "bg-green-600 text-white border-green-600" : "bg-white text-green-800 border-gray-300 hover:bg-green-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Start date</label>
            <input type="date" className={input} required min={inDays(1)} value={form.startDate} onChange={set("startDate")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Days</label>
              <input type="number" className={input} required min={1} max={15} value={form.days} onChange={set("days")} />
            </div>
            <div>
              <label className={label}>People</label>
              <input type="number" className={input} required min={1} max={30} value={form.travellers} onChange={set("travellers")} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={label}>Budget</label>
            <div className="grid grid-cols-3 gap-2">
              {[["economy", "Economy"], ["standard", "Standard"], ["premium", "Premium"]].map(([v, t]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setForm((f) => ({ ...f, budgetLevel: v }))}
                  className={`py-2 rounded-lg border font-medium ${form.budgetLevel === v ? "bg-green-600 text-white border-green-600" : "bg-white text-green-800 border-gray-300 hover:bg-green-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={label}>Special wishes (optional)</label>
            <textarea
              className={input}
              rows={2}
              maxLength={300}
              placeholder="e.g. include Vaishali, elders in the group so avoid long walks, or vegetarian food only"
              value={form.preferences}
              onChange={set("preferences")}
            />
          </div>
          <button type="submit" className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2">
            <FaMagic /> Plan my trip
          </button>
          <p className="md:col-span-2 text-xs text-gray-500 text-center">Planning can take up to 30 seconds. Please wait.</p>
        </form>
      )}

      {/* STEP 2 */}
      {step === "plan" && plan && (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-2xl font-bold text-green-900">{plan.title}</h2>
              <p className="text-gray-600 mt-1 text-sm">{plan.summary}</p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <FaUsers /> {form.travellers} people · {form.days} days · from {form.origin}
              </p>
            </div>

            {Object.keys(stopsByDay).map((day) => (
              <div key={day} className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-green-800 mb-2">Day {day}</h3>
                <div className="space-y-3">
                  {stopsByDay[day].map((s) => (
                    <div key={s.index} className="flex gap-3 items-start border-l-4 border-green-500 pl-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {s.index + 1}. {s.name}
                        </p>
                        {s.place && <p className="text-xs text-green-700">{s.place}</p>}
                        <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <select
                          aria-label="Change day"
                          value={s.day}
                          onChange={(e) => moveStopDay(s.index, e.target.value)}
                          className="border rounded p-1 text-sm"
                        >
                          {Array.from({ length: Number(form.days) }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeStop(s.index)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                          aria-label={`Remove ${s.name}`}
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24 self-start">
            <TripMap stops={plan.stops} />
            <PriceCard pricing={pricing} />
            <div className="flex gap-3">
              <button onClick={() => setStep("form")} className="flex-1 border border-green-600 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50">
                Change details
              </button>
              <button onClick={planTrip} className="flex-1 border border-green-600 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50">
                Plan again
              </button>
            </div>
            <button onClick={saveAndContinue} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg">
              Continue to booking
            </button>
            <p className="text-xs text-gray-500">
              Places and map points are suggested by AI and are approximate. Our team confirms the route after booking.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === "book" && trip && (
        <form onSubmit={payNow} className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-5 space-y-4">
            <h2 className="text-2xl font-bold text-green-900">Who is travelling?</h2>
            <p className="text-sm text-gray-600">
              Add the details of all {trip.numberOfTravellers} travellers. If you are booking for your family, enter their names and the phone number of someone travelling.
            </p>
            <div>
              <label className={label}>Contact phone number</label>
              <input className={input} type="tel" required minLength={8} maxLength={15} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number of a traveller" />
            </div>
            {members.map((m, i) => (
              <div key={i} className="grid grid-cols-6 gap-2">
                <input className={`${input} col-span-3`} required minLength={2} placeholder={`Traveller ${i + 1} name`} value={m.name} onChange={(e) => setMember(i, "name", e.target.value)} />
                <input className={`${input} col-span-1`} type="number" required min={0} max={120} placeholder="Age" value={m.age} onChange={(e) => setMember(i, "age", e.target.value)} />
                <select className={`${input} col-span-2`} value={m.gender} onChange={(e) => setMember(i, "gender", e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-4 self-start">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-green-900">{trip.title}</h3>
              <p className="text-sm text-gray-600">
                {trip.origin} to {trip.destination} · {trip.numberOfDays} days · {new Date(trip.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <ol className="text-sm text-gray-700 mt-2 list-decimal ml-5 space-y-0.5">
                {trip.stops.map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
              </ol>
            </div>
            <PriceCard pricing={trip.pricing} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg">
              Pay {inr(trip.pricing.total)} and book
            </button>
            <p className="text-xs text-gray-500">Payment is verified on our server before the trip is confirmed.</p>
          </div>
        </form>
      )}
    </div>
  );
}
