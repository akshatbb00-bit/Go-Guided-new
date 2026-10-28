import { MdOutlineTour, MdOutlineSupportAgent, MdOutlineLocalOffer } from "react-icons/md";

const services = [
  {
    icon: <MdOutlineTour size={26} />,
    title: "Guided Tours & Local Experience",
    text: "Discover hidden gems with our expert local guides who bring history, culture, and adventure to life.",
  },
  {
    icon: <MdOutlineSupportAgent size={26} />,
    title: "24/7 Customer Support",
    text: "Our AI assistant answers your questions about tours, prices and bookings on every page, at any time of the day.",
  },
  {
    icon: <MdOutlineLocalOffer size={26} />,
    title: "Best Price Guarantee",
    text: "We offer competitive pricing with no hidden fees, ensuring you get the best value for your travel experiences.",
  },
];

function Services() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-32 flex flex-col items-center gap-10">
      <h3 className="text-center text-2xl sm:text-3xl font-bold text-green-800">
        Our Services
      </h3>

      <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 w-full">
        {/* Image: same height as the card on large screens */}
        <div className="shadow-lg shadow-black/30 overflow-hidden rounded-lg w-full lg:w-2/5 h-64 sm:h-80 lg:h-auto lg:min-h-[22rem]">
          <img
            src="https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Our Services"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Services: all aligned the same way */}
        <div className="flex flex-col justify-center bg-white gap-8 shadow-lg shadow-black/30 p-6 sm:p-8 lg:p-10 rounded-lg w-full lg:w-3/5">
          {services.map((service) => (
            <div key={service.title} className="flex items-start gap-4 text-left">
              <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                {service.icon}
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-green-800 text-lg font-semibold">
                  {service.title}
                </h2>
                <p className="text-sm sm:text-base text-green-700">
                  {service.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;
