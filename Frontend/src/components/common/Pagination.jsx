function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-center space-x-4 p-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md text-sm sm:text-base font-medium transition ${
          currentPage === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
        }`}
      >
        Prev
      </button>

      <span className="text-gray-700 text-sm sm:text-base mt-2 sm:mt-0">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md text-sm sm:text-base font-medium transition ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
