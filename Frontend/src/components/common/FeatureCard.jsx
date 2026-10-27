function FeatureCard({ icon, title, description }) {
  return (
    <div
      className="
      w-full
      max-w-xs  /* max width ~320px */
      sm:min-w-[310px]  /* minimum width on small screens and up */
      h-[240px]      /* auto height to adjust content */
      p-6 
      border border-green-300 
      rounded-2xl 
      bg-white 
      shadow-md shadow-black/50 
      transition-transform duration-200 ease-in-out 
      hover:scale-105 
      overflow-hidden 
      relative 
      flex flex-col gap-2 items-center
    "
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-green-800 text-center">
        {title}
      </h3>
      <p className="text-sm text-green-700 overflow-hidden max-h-24 pr-2 text-center">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
