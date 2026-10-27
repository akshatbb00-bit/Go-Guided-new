import { FaRegCalendarAlt, FaRegCheckCircle } from "react-icons/fa";
import { FaRegClock, FaStar } from "react-icons/fa6";
import Announcements from "../../../common/Announcements";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import StatusToggle from "./StatusToggle";
import LoaderOverlay from "../../../common/LoaderOverlay";
import { getBookingStats } from "../../../../services/guideService";
import useApi from "../../../../hooks/useApi";
import { useEffect, useState } from "react";

function SummaryCard({ title, icon: Icon, value, onClick }) {
  return (
    <div
      className="bg-white text-green-950 p-6 border border-green-300 flex flex-col items-center justify-center shadow-sm shadow-black/40 rounded-xl space-y-3 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-center space-x-2 text-center">
        {Icon && <Icon className="text-green-700 text-2xl sm:text-xl" />}
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold text-green-800">
        {value}
      </p>
    </div>
  );
}

function Stats() {
  const navigate = useSafeNavigate();
  const [stats, setStats] = useState({
    completed: 0,
    ongoing: 0,
    upcoming: 0,
  });

  const { loading, request: fetchStats } = useApi(getBookingStats);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchStats({});
        setStats(res.data.stats);
      } catch (error) {}
    })();
  }, []);

  if (loading) return <LoaderOverlay />;

  return (
    <div className="p-4 flex flex-col space-y-4 h-full overflow-y-auto scrollbar-none">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title={"Completed"}
          icon={FaRegCheckCircle}
          value={stats.completed}
          onClick={() => navigate("bookings/completed")}
        />
        <SummaryCard
          title={"Ongoing"}
          icon={FaRegClock}
          value={stats.ongoing}
          onClick={() => navigate("bookings/ongoing")}
        />
        <SummaryCard
          title={"Upcoming"}
          icon={FaRegCalendarAlt}
          value={stats.upcoming}
          onClick={() => navigate("bookings/upcoming")}
        />
      </div>

      {/* Announcements & StatusToggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Announcements />
        <StatusToggle />
      </div>
    </div>
  );
}

export default Stats;
