import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { useState } from "react";

function Tickets() {
  const [tickets, setTickets] = useState({
    Adult: { label: "Adult (18+ years)", count: 0, price: 100 },
    Youth: { label: "Youth (13-17 years)", count: 0, price: 100 },
    Child: { label: "Children (0-12 years)", count: 0, price: 100 },
  });

  // Function to update ticket count
  const updateCount = (type, increment) => {
    setTickets((prevTickets) => ({
      ...prevTickets,
      [type]: {
        ...prevTickets[type],
        count: Math.max(0, prevTickets[type].count + increment), // Prevent negative values
      },
    }));
  };

  // Calculate total price
  const totalPrice = Object.values(tickets).reduce(
    (total, ticket) => total + ticket.count * ticket.price,
    0
  );

  return (
    <div className="flex flex-col w-full md:w-[30%] px-4 md:px-6 py-3 space-y-3 border border-green-100 shadow-sm rounded-lg">
      <div className="flex justify-between">
        <h3 className="font-semibold text-xl text-green-900">Tickets</h3>
        <span className="font-semibold text-green-950">
          Available:<span className="font-bold text-green-800"> 69</span>
        </span>
      </div>

      {/* Ticket Selection */}
      {Object.entries(tickets).map(([key, ticket]) => (
        <div
          key={key}
          className="flex justify-between items-center py-1 text-green-950"
        >
          <div className="flex gap-2 items-center">
            <span className="font-semibold">{ticket.label}</span>
            <span className="font-semibold">&#8377; {ticket.price}</span>
          </div>
          <div className="flex gap-2 items-center">
            <CiCircleMinus
              color="green"
              size={24}
              className="cursor-pointer"
              onClick={() => updateCount(key, -1)}
            />
            <span className="text-xl">{ticket.count}</span>
            <CiCirclePlus
              color="green"
              size={24}
              className="cursor-pointer"
              onClick={() => updateCount(key, 1)}
            />
          </div>
        </div>
      ))}

      {/* Total Price and Book Now Button */}
      <div className="flex flex-col items-center mt-auto">
        <div className="flex justify-between items-center py-2 w-full">
          <span className="font-semibold text-2xl text-green-700">Total:</span>
          <span className="font-semibold text-2xl text-green-900">
            &#8377; {totalPrice}
          </span>
        </div>

        <button
          className={`w-full py-3 rounded-lg text-white ${
            totalPrice > 0
              ? "bg-green-700 hover:bg-green-800 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={totalPrice === 0}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default Tickets;
