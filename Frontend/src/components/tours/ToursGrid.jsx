import TourCard from "./TourCard";

function ToursGrid({ tours }) {
  return (
    <div className="space-y-10 p-6">
      {tours.map((categoryData, index) => (
        <section key={index}>
          <h2 className="text-2xl font-semibold mb-4">
            {categoryData.category === "general"
              ? "General Tours"
              : categoryData.category === "mostVisited"
              ? "Most Visited"
              : "Most Liked"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryData.tours.map((tour, ind) => (
              <TourCard key={ind} tour={tour} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ToursGrid;
