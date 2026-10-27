import { useState, useEffect } from "react";
import useApi from "../../hooks/useApi";
import { fetchAchievements } from "../../services/dashboardServices";
import LoaderOverlay from "../common/LoaderOverlay";

function Achievements() {
  const { loading, request: loadAchievements } = useApi(fetchAchievements);
  const [achievementData, setAchievementData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await loadAchievements({});
        if (response?.data) {
          const {
            destinationsCovered,
            customerSatisfaction,
            repeatTravelers,
            averageRating,
            profitsDonated,
            tripsPlanned,
          } = response.data;

          setAchievementData([
            {
              value: `${destinationsCovered}+`,
              description: "Destinations Covered",
            },
            {
              value: `${customerSatisfaction}%`,
              description: "Customer Satisfaction",
            },
            {
              value: `${repeatTravelers}%`,
              description: "Repeat Travelers",
            },
            {
              value: `${averageRating}/5`,
              description: "Average Rating",
            },
            {
              value: `${profitsDonated}%`,
              description: "Profits Donated",
            },
            {
              value: `${tripsPlanned}+`,
              description: "Trips Planned",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load achievements", error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoaderOverlay />;
  }

  return (
    <div className="px-6 md:px-32 py-6 flex flex-col gap-6 items-center">
      <h3 className="text-3xl font-bold text-green-900 text-center">
        Our Achievements
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-7xl">
        {achievementData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 p-5 border border-green-700 rounded-2xl bg-white shadow-md shadow-black/50 transition-transform duration-200 ease-in-out hover:scale-105"
          >
            <span className="text-4xl font-extrabold text-green-900">
              {item.value}
            </span>
            <p className="text-green-900 font-medium text-center">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
