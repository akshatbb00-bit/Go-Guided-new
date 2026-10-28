// DEMO PAYMENT MODE: a simulated checkout for project demonstrations.
// No money moves. The server plays the part of the payment gateway: it creates a demo order,
// and (after the demo portal "pays") signs the payment, so the normal verification code runs unchanged.
//
// On by default while a Razorpay TEST key (rzp_test_...) is used. Set DEMO_PAYMENTS=false to turn it off,
// or DEMO_PAYMENTS=true to force it. It is never on with a live key unless forced.
const crypto = require("crypto");

const isDemoMode = () => {
  const flag = String(process.env.DEMO_PAYMENTS ?? "").toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return String(process.env.RAZORPAY_KEY || "").startsWith("rzp_test_");
};

const newDemoOrder = (amountInPaise, currency = "INR") => ({
  id: `order_demo_${crypto.randomBytes(8).toString("hex")}`,
  amount: amountInPaise,
  currency,
  demo: true,
});

const signDemoPayment = (orderId) => {
  const paymentId = `pay_demo_${crypto.randomBytes(8).toString("hex")}`;
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature };
};

module.exports = { isDemoMode, newDemoOrder, signDemoPayment };
