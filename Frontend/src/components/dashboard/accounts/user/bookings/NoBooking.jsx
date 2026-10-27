import { NavLink } from "react-router";
import { FaSearch } from "react-icons/fa";

function NoBooking() {
  return (
    <div className="h-full flex flex-col items-center justify-center py-16 animate-fadeIn space-y-3 bg-green-50 rounded-md">
      <p className="text-gray-500 text-xl font-semibold">
        You have not booked any tours yet.
      </p>
      <p className="text-gray-400 text-sm text-center max-w-md">
        Discover amazing travel experiences and book your next adventure today!
      </p>
      <NavLink to="/tours">
        <button className="mt-6 flex items-center gap-2 px-6 py-2 text-white bg-green-600 hover:bg-green-700 cursor-pointer rounded-md shadow-md transition transform hover:scale-105">
          <FaSearch /> Explore Tours
        </button>
      </NavLink>
    </div>
  );
}

export default NoBooking;
