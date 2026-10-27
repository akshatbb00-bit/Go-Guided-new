export default function LoaderOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-black/45  flex items-center justify-center">
      <style>
        {`
          @keyframes dotFade {
            0%, 20% { opacity: 0; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(1); }
          }
        `}
      </style>

      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>

        <div className="text-white font-medium text-lg flex items-center leading-none">
          <span>Loading</span>
          <span className="ml-1 flex items-baseline">
            <span
              className="w-1.5 h-1.5 bg-white rounded-full mx-[2px] inline-block align-middle"
              style={{ animation: "dotFade 1.4s ease-in-out infinite" }}
            />
            <span
              className="w-1.5 h-1.5 bg-white rounded-full mx-[2px] inline-block align-middle"
              style={{
                animation: "dotFade 1.4s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            />
            <span
              className="w-1.5 h-1.5 bg-white rounded-full mx-[2px] inline-block align-middle"
              style={{
                animation: "dotFade 1.4s ease-in-out infinite",
                animationDelay: "0.4s",
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
