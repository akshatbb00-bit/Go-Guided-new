import useSafeNavigate from "../../utils/useSafeNavigate";

function Hero({ backgroundImage = "/images/hero.webp" }) {
  const navigate = useSafeNavigate();

  return (
    <section
      className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center w-full sm:w-4/5 md:w-3/5 lg:w-2/5 text-center space-y-4 md:space-y-6 lg:space-y-8 text-gray-100">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fadeIn text-white leading-tight">
            Discover Unforgettable Tours with Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-tight animate-fadeIn delay-200 text-gray-200 px-2 sm:px-0">
            Explore top-rated tours, curated for every kind of traveler. Find
            your next destination and make lasting memories.
          </p>
          <button
            onClick={() => navigate("/tours")}
            aria-label="Explore Tours"
            className="px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-green-700 hover:bg-green-600 text-white text-base sm:text-lg md:text-xl font-semibold rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 animate-fadeIn delay-400 cursor-pointer"
          >
            Explore Tours
          </button>
          <button
            onClick={() => navigate("/plan-trip")}
            aria-label="Plan your own trip"
            className="px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-white/90 hover:bg-white text-green-800 text-base sm:text-lg md:text-xl font-semibold rounded-xl shadow-lg transition duration-300 cursor-pointer"
          >
            Plan your own trip
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
