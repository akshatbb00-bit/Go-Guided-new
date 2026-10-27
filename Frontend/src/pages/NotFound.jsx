import { FiAlertTriangle } from "react-icons/fi";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-green-50 text-green-900">
      <FiAlertTriangle className="text-green-700 text-6xl mb-4" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg mt-2">The page you’re looking for doesn’t exist.</p>
      <a
        href="/"
        className="mt-6 px-6 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
      >
        Go Home
      </a>
    </div>
  );
}

export default NotFound;
