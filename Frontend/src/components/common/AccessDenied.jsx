import { ShieldAlert } from "lucide-react";

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
      <div className="bg-white border border-red-200 shadow-lg rounded-2xl p-8 max-w-lg text-center space-y-4">
        <div className="flex justify-center">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to view this page. If you think this is a
          mistake, please contact your administrator or support.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;
