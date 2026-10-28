import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";

// A simulated payment portal for project demonstrations. No money moves.
// Usage: const outcome = await openDemoCheckout({ amount, currency, orderId, title });
//        outcome is "success", "failed" or "cancelled".
let listener = null;
export const openDemoCheckout = (details) =>
  new Promise((resolve) => {
    if (!listener) return resolve("success");
    listener({ details, resolve });
  });

const inr = (paise, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format((paise || 0) / 100);

const field = "w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export function DemoCheckoutHost() {
  const [job, setJob] = useState(null); // { details, resolve }
  const [phase, setPhase] = useState("form"); // form | processing | success | failed
  const [tab, setTab] = useState("card");

  useEffect(() => {
    listener = (j) => {
      setJob(j);
      setPhase("form");
      setTab("card");
    };
    return () => {
      listener = null;
    };
  }, []);

  if (!job) return null;
  const { details, resolve } = job;

  const finish = (outcome, delay = 0) => {
    setTimeout(() => {
      setJob(null);
      resolve(outcome);
    }, delay);
  };

  const pay = (e) => {
    e.preventDefault();
    setPhase("processing");
    setTimeout(() => {
      setPhase("success");
      finish("success", 1100);
    }, 1800);
  };
  const simulateFailure = () => {
    setPhase("processing");
    setTimeout(() => {
      setPhase("failed");
      finish("failed", 1300);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Demo payment portal">
      <div className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-green-800 text-white px-5 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-lg leading-tight">Demo Payment Portal</p>
            <p className="text-xs text-green-100">Simulated test checkout</p>
          </div>
          {phase === "form" && (
            <button onClick={() => finish("cancelled")} aria-label="Close" className="text-2xl leading-none text-green-100 hover:text-white cursor-pointer">
              ×
            </button>
          )}
        </div>
        <div className="bg-amber-100 text-amber-900 text-xs font-semibold text-center py-1.5">
          DEMO MODE · No real money is charged
        </div>

        {phase === "processing" && (
          <div className="py-14 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
            <p className="font-semibold text-gray-800">Contacting bank (simulated)…</p>
            <p className="text-sm text-gray-500">Please do not close this window</p>
          </div>
        )}
        {phase === "success" && (
          <div className="py-12 text-center">
            <FaCheckCircle className="mx-auto text-green-600 text-6xl mb-3" />
            <p className="text-xl font-bold text-gray-900">Payment successful</p>
            <p className="text-sm text-gray-500 mt-1">{inr(details.amount, details.currency)} paid (demo)</p>
          </div>
        )}
        {phase === "failed" && (
          <div className="py-12 text-center">
            <FaTimesCircle className="mx-auto text-red-500 text-6xl mb-3" />
            <p className="text-xl font-bold text-gray-900">Payment failed</p>
            <p className="text-sm text-gray-500 mt-1">Simulated failure. You can try again.</p>
          </div>
        )}

        {phase === "form" && (
          <form onSubmit={pay} className="p-5 space-y-4">
            <div className="flex items-end justify-between border-b pb-3">
              <div>
                <p className="text-xs text-gray-500">Paying to</p>
                <p className="font-semibold text-gray-900">Go Guided</p>
                <p className="text-xs text-gray-500">{details.title || "Booking"}</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{inr(details.amount, details.currency)}</p>
            </div>

            <div className="flex gap-2">
              {[["card", "Card"], ["upi", "UPI"], ["bank", "Netbanking"]].map(([k, t]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border ${tab === k ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "card" && (
              <div className="space-y-3">
                <input className={field} defaultValue="4111 1111 1111 1111" aria-label="Card number" inputMode="numeric" />
                <div className="grid grid-cols-2 gap-3">
                  <input className={field} defaultValue="12/30" aria-label="Expiry" />
                  <input className={field} defaultValue="123" aria-label="CVV" type="password" />
                </div>
                <input className={field} defaultValue="Test Traveller" aria-label="Name on card" />
              </div>
            )}
            {tab === "upi" && <input className={field} defaultValue="demo@upi" aria-label="UPI id" />}
            {tab === "bank" && (
              <select className={field} defaultValue="demo" aria-label="Bank">
                <option value="demo">Demo Bank of India</option>
                <option>Test National Bank</option>
              </select>
            )}

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 cursor-pointer">
              <FaLock className="text-sm" /> Pay {inr(details.amount, details.currency)}
            </button>
            <button type="button" onClick={simulateFailure} className="w-full text-sm text-red-500 hover:underline cursor-pointer">
              Simulate a failed payment
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Order {String(details.orderId || "").slice(0, 22)} · Test card details are pre-filled
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
