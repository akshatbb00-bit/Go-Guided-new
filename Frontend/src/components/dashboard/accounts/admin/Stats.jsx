import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import Announcements from "../../../common/Announcements";
import LoaderOverlay from "../../../common/LoaderOverlay";
import { formatNumberIndian } from "../../../../utils/numberFormatter";
import { getStatCardCounts } from "../../../../services/dashboardServices";
import useApi from "../../../../hooks/useApi";

function StatCard({ title, value, route }) {
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
  const { request: fetchStatCardCounts } = useApi(getStatCardCounts);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchStatCardCounts({});
        setCounts(res?.data?.statsCount || {});
      } catch (error) {}
    })();
  }, []);

  if (!counts) return <LoaderOverlay />;

  return (
    <div className="p-4 flex flex-col space-y-4 h-full overflow-y-scroll scrollbar-none">
      {/* Announcements */}
      <div className="grid grid-cols-1 gap-4">
        <Announcements />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title={"Bookings"}
          value={counts.bookings || 0}
          route={"bookings"}
        />
        <StatCard title={"Tours"} value={counts.tours || 0} route={"tours"} />
        <StatCard
          title={"Reviews"}
          value={counts.reviews || 0}
          route={"reviews"}
        />
        <StatCard title={"Users"} value={counts.users || 0} route={"users"} />
        <StatCard
          title={"Feedbacks"}
          value={counts.feedbacks || 0}
          route={"feedbacks"}
        />
        <StatCard
          title={"Guides"}
          value={counts.guides || 0}
          route={"guides"}
        />
        <StatCard title={"Jobs"} value={counts.jobs || 0} route={"jobs"} />
        <StatCard title={"Analytics"} route={"analytics"} />
      </div>
    </div>
  );
}

export default Stats;
