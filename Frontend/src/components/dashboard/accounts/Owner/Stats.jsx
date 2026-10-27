import { FaRegCheckCircle } from "react-icons/fa";
import {
  FaArrowRight,
  FaIndianRupeeSign,
  FaRegClock,
  FaStar,
} from "react-icons/fa6";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import Announcements from "../../../common/Announcements";
import BookingChart from "../admin/BookingChart";
import LoaderOverlay from "../../../common/LoaderOverlay";
import { formatNumberIndian } from "../../../../utils/numberFormatter";
import { useEffect, useState } from "react";
import {
  getStatCardCounts,
  getStats,
} from "../../../../services/dashboardServices";
import useApi from "../../../../hooks/useApi";

function SummaryCard({ title, icon: Icon, value }) {
  return (
    <div className="bg-white text-green-950 p-6 border border-green-300 flex flex-col items-center shadow-sm shadow-black/50 rounded-lg space-y-2">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="text-green-700 text-xl sm:text-2xl" />}
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
      </div>
      <p className="text-4xl sm:text-5xl font-extrabold">{value}</p>
    </div>
  );
}

function StatCard({ title, value = 0, route }) {
  const safeNavigate = useSafeNavigate();

  return (
    <div className="text-green-900 bg-white p-6 rounded-xl shadow-lg flex justify-between items-center border border-green-300">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {title != "Analytics" && (
          <p className="text-2xl font-semibold">{formatNumberIndian(value)}</p>
        )}
      </div>
      {route && (
        <button
          onClick={() => safeNavigate(route)}
          className="bg-green-200 cursor-pointer text-green-900 p-2 rounded-full shadow-md hover:bg-green-300 transition-all duration-200"
        >
          <FaArrowRight size={20} />
        </button>
      )}
    </div>
  );
}

function Stats() {
  const [stats, setStats] = useState(null);
  const [statCardCounts, setStatCardCounts] = useState({});

  const { loading: loadingStats, request: fetchStats } = useApi(getStats);
  const { loading: loadingCards, request: fetchStatCardCounts } =
    useApi(getStatCardCounts);

  useEffect(() => {
    (async () => {
      try {
        const res1 = await fetchStats({});
        const res2 = await fetchStatCardCounts({});

        setStats(res1?.data || {});
        setStatCardCounts(res2?.data?.statsCount || {});
      } catch (error) {}
    })();
  }, []);

  if (loadingStats || loadingCards || !stats) return <LoaderOverlay />;

  const {
    totalConfirmedBookingAmount = 0,
    toursByStatus = { completed: 0, ongoing: 0, upcoming: 0 },
    averageRating = 0,
    bookingsPerMonth = [],
  } = stats;

  const {
    bookings = 0,
    tours = 0,
    reviews = 0,
    users = 0,
    feedbacks = 0,
    guides = 0,
    jobs = 0,
    admins = 0,
  } = statCardCounts;

  return (
    <div className="p-4 flex flex-col space-y-4 h-full overflow-y-scroll scrollbar-none">
      {/* Revenue and Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="Revenue"
          icon={FaIndianRupeeSign}
          value={totalConfirmedBookingAmount}
        />
        <SummaryCard
          title="Completed"
          icon={FaRegCheckCircle}
          value={toursByStatus.completed}
        />
        <SummaryCard
          title="Ongoing"
          icon={FaRegClock}
          value={toursByStatus.ongoing}
        />
        <SummaryCard
          title="Rating"
          icon={FaStar}
          value={
            Number.isInteger(averageRating)
              ? averageRating
              : averageRating.toFixed(1)
          }
        />
      </div>

      {/* Charts and Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BookingChart bookingsPerMonth={bookingsPerMonth} />
        <Announcements />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Bookings" value={bookings} route="bookings" />
        <StatCard title="Tours" value={tours} route="tours" />
        <StatCard title="Reviews" value={reviews} route="reviews" />
        <StatCard title="Users" value={users} route="users" />
        <StatCard title="Feedbacks" value={feedbacks} route="feedbacks" />
        <StatCard title="Guides" value={guides} route="guides" />
        <StatCard title="Jobs" value={jobs} route="jobs" />
        <StatCard title="Admins" value={admins} route="manage-admins" />
        <StatCard title={"Analytics"} route={"analytics"} />
      </div>
    </div>
  );
}

export default Stats;
