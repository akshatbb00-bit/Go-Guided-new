const heroData = {
  title: "About Us",
  backgroundImage: "/images/about_us.webp",
};

function Hero() {
  return (
    <section
      className="relative w-full h-[70vh] bg-cover bg-center flex items-center justify-center px-4 sm:px-8"
      style={{ backgroundImage: `url(${heroData.backgroundImage})` }}
    >
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wide text-center max-w-4xl">
          {heroData.title}
        </h1>
      </div>
    </section>
  );
}

export default Hero;
