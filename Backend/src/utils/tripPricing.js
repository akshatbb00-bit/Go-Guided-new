// Price estimate for a custom trip. Always computed on the server,
// so the browser can never choose its own price.

const RATES = {
  economy: 1500, // per person per day: simple stay, local travel, meals
  standard: 2500,
  premium: 4500,
};
const GUIDE_PER_DAY = 1500; // per group per day
const STOP_FEE_PER_PERSON = 150; // entry tickets, activities, local help
const SERVICE_FEE_RATE = 0.05; // planning and support

const BUDGET_LEVELS = Object.keys(RATES);

const calculateTripPrice = ({ days, travellers, stopsCount, budgetLevel }) => {
  const rate = RATES[budgetLevel];
  if (!rate) throw new Error("Invalid budget level");

  const stay = rate * travellers * days;
  const guide = GUIDE_PER_DAY * days;
  const stops = STOP_FEE_PER_PERSON * travellers * stopsCount;
  const subtotal = stay + guide + stops;
  const service = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + service;

  return {
    currency: "INR",
    breakdown: [
      { label: `Stay, local travel and meals (${budgetLevel}, ${travellers} people x ${days} days)`, amount: stay },
      { label: `Local guide (${days} days)`, amount: guide },
      { label: `Entry tickets and local arrangements (${stopsCount} stops x ${travellers} people)`, amount: stops },
      { label: "Planning and support (5%)", amount: service },
    ],
    total,
    perPerson: Math.round(total / travellers),
  };
};

module.exports = { calculateTripPrice, BUDGET_LEVELS, RATES };
