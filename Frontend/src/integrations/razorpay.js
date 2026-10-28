import api from "../services/apiClient";
import { openDemoCheckout } from "../components/payments/DemoCheckout";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export function initiateRazorpayPayment({ tour }) {
  return new Promise((resolve, reject) => {
    openCheckout({ tour, resolve, reject }).catch(reject);
  });
}

async function openCheckout({ tour, resolve, reject }) {
  const isScriptLoaded = await loadScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );

  if (!isScriptLoaded) {
    return reject(
      new Error("Failed to load payment gateway. Please try again.")
    );
  }

  const { data: orderResponse } = await api.post("/payment/create-order", {
    totalAmount: tour.amountPaid,
  });

  // Demo mode: simulated portal instead of the Razorpay window (the server still verifies the payment)
  if (orderResponse.data.demo) {
    const outcome = await openDemoCheckout({
      amount: orderResponse.data.amount,
      currency: orderResponse.data.currency,
      orderId: orderResponse.data.id,
      title: tour.tourTitle || "Tour booking",
    });
    if (outcome === "cancelled") return reject(new Error("Payment cancelled."));
    if (outcome !== "success") return reject(new Error("Payment failed (demo). Please try again."));
    const signed = await api.post("/payment/demo-sign", { order_id: orderResponse.data.id });
    try {
      await verifyPayment({ ...signed.data.data, tour });
      return resolve();
    } catch (err) {
      return reject(err);
    }
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    currency: orderResponse.data.currency,
    amount: `${orderResponse.data.amount}`,
    order_id: orderResponse.data.id,
    handler: async function (razorpayResponse) {
      try {
        await verifyPayment({ ...razorpayResponse, tour });
        resolve();
      } catch (err) {
        reject(err);
      }
    },
    modal: {
      ondismiss: () => reject(new Error("Payment cancelled.")),
    },
    theme: {
      color: "#10b981",
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.on("payment.failed", (err) => {
    reject(new Error(err?.error?.description || "Payment failed."));
  });
  paymentObject.open();
}

async function verifyPayment({
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  tour,
}) {
  await api.post("payment/verify-payment", {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    tour,
  });
}
