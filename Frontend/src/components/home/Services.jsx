function Services() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-32 flex flex-col items-center gap-10">
      <h3 className="text-center text-2xl sm:text-3xl font-bold text-green-800">
        Our Services
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-20 w-full">
        {/* Image */}
        <div className="shadow-lg shadow-black/30 overflow-hidden rounded-lg w-full max-w-sm">
          <img
            src="https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Our Services"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Service Content */}
        <div className="flex flex-col bg-white gap-8 shadow-lg shadow-black/30 p-6 sm:p-8 lg:p-12 rounded-lg w-full">
          {/* Service 1 */}
          <div className="flex flex-col gap-2 text-left">
            <h2 className="text-green-800 text-lg font-semibold">
              Guided Tours & Local Experience
            </h2>
            <p className="text-sm text-green-700">
              Discover hidden gems with our expert local guides who bring
              history, culture, and adventure to life.
            </p>
          </div>

          {/* Service 2 */}
          <div className="flex flex-col gap-2 text-left lg:text-right">
            <h2 className="text-green-800 text-lg font-semibold">
              24/7 Customer Support
            </h2>
            <p className="text-sm text-green-700">
              System provides AI chatbots and live chat to assist customers
              anytime, ensuring quick and efficient support.
            </p>
          </div>

          {/* Service 3 */}
          <div className="flex flex-col gap-2 text-left">
            <h2 className="text-green-800 text-lg font-semibold">
              Best Price Guarantee
            </h2>
            <p className="text-sm text-green-700">
              We offer competitive pricing with no hidden fees, ensuring you get
              the best value for your travel experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
