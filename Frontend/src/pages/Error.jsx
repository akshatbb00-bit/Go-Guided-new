function Error() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
      <div className="bg-green-100 border border-green-500 rounded-lg p-6 max-w-md text-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Oops! Something went wrong.
        </h1>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export default Error;
