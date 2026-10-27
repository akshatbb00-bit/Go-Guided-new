import api from "../services/apiClient";

function loadScript(src) {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Pays for a saved trip. The amount comes from the server, not from the browser.
export async function payForTrip({ tripId, phoneNumber, members }) {
  const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  if (!loaded) throw new Error("Failed to load payment gateway. Please try again.");

  const { data } = await api.post(`/trip/${tripId}/create-order`, { phoneNumber, members });
  const order = data.data;

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      currency: order.currency,
      amount: `${order.amount}`,
      order_id: order.id,
      handler: async (response) => {
        try {
          const res = await api.post(`/trip/${tripId}/verify-payment`, response);
          resolve(res.data);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
      theme: { color: "#10b981" },
    });
    razorpay.on("payment.failed", (err) =>
      reject(new Error(err?.error?.description || "Payment failed."))
    );
    razorpay.open();
  });
}
