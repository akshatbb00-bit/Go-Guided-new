function Timeline({ tourSchedule }) {
  return (
    <div
      className="bg-white py-2 rounded-lg shadow-sm 
      w-full md:w-[30%] 
      flex flex-col items-center
      "
    >
      <div className="relative flex flex-col items-center w-full px-4 md:px-0">
        {/* Vertical Line */}
        <div className=" absolute left-[11%] md:left-[12%] top-11 bottom-11 w-0.5 bg-green-600/50 border-l-2 border-dotted border-green-600"></div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          {tourSchedule.map((event, index) => (
            <div
              key={index}
              className="flex items-center gap-4 relative w-full md:w-auto"
            >
              {/* Timeline Dots */}
              <div
                className={`${
                  index === 0 || index === tourSchedule.length - 1
                    ? "w-8 h-8 bg-green-600"
                    : "w-4 h-4 bg-white border-2 mx-2 border-green-600"
                } rounded-full flex-shrink-0`}
              ></div>

              {/* Content */}
              <div className="bg-white shadow-md px-4 py-1 rounded-md flex flex-col justify-center w-full md:w-64">
                <h3 className=" text-green-900 text-base md:text-lg">
                  {event.place}
                </h3>
                <p className="text-green-950 text-xs md:text-sm">
                  {event.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
