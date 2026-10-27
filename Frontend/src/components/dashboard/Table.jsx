import useSafeNavigate from "../../utils/useSafeNavigate";
import RatingStars from "../common/RatingStars";
import Pagination from "../common/Pagination";
import { useLocation } from "react-router";

function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
    case "confirmed":
    case "approved":
      return "bg-green-100 text-green-800 border border-green-400 px-2 py-1 rounded text-xs font-medium";

    case "pending":
    case "ongoing":
      return "bg-yellow-100 text-yellow-800 border border-yellow-400 px-2 py-1 rounded text-xs font-medium";

    case "failed":
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-800 border border-red-400 px-2 py-1 rounded text-xs font-medium";

    case "refunded":
    case "upcoming":
      return "bg-blue-100 text-blue-800 border border-blue-400 px-2 py-1 rounded text-xs font-medium";

    case "free":
      return "bg-gray-100 text-gray-800 border border-gray-400 px-2 py-1 rounded text-xs font-medium";

    default:
      return "bg-gray-200 text-gray-800 border border-gray-400 px-2 py-1 rounded text-xs font-medium";
  }
}

export default function Table({
  headers,
  data,
  currentPage,
  setCurrentPage,
  totalPages,
}) {
  const navigate = useSafeNavigate();

  const handleClick = (id) => {
    navigate(id);
  };
  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  return (
    <div className="w-full pb-4">
      {/* For Desktop: Scrollable Grid View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max space-y-1">
          {/* Header */}
          <div
            className="grid bg-primary-light text-text-heading font-semibold rounded-md px-3 py-1"
            style={{
              gridTemplateColumns: headers
                .map((header) => `minmax(${header.width}, 1fr)`)
                .join(" "),
            }}
          >
            {headers.map((header, index) => (
              <div key={index} className="p-2">
                {header.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-0.5">
            {data.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleClick(item._id)}
                className="grid py-1 bg-primary-light text-text-heading shadow rounded-md hover:bg-secondary-light cursor-pointer transition px-3 hover:bg-primary-dark"
                style={{
                  gridTemplateColumns: headers.map((h) => h.width).join(" "),
                }}
              >
                {headers.map((header, i) => {
                  const key = getKeyFromLabel(header.label);
                  const value = item[key];

                  return (
                    <div key={i} className="px-2 py-1.5">
                      {key === "status" ? (
                        <span
                          className={`text-sm rounded-md border px-2 py-1 ${getStatusStyle(
                            value
                          )}`}
                        >
                          {value}
                        </span>
                      ) : key === "rating" ? (
                        <RatingStars Review_Count={value} />
                      ) : (
                        <span className="block">{value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Mobile: Card View */}
      <div className="block md:hidden space-y-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(item._id)}
            className="bg-primary-light text-text-heading shadow rounded-md p-4 hover:bg-primary-dark transition cursor-pointer"
          >
            {headers.map((header, i) => {
              const key = getKeyFromLabel(header.label);
              const value = item[key];

              return (
                <div key={i} className="mb-2 flex flex-wrap items-center">
                  <p className="text-xs font-semibold text-text-subtle">
                    {header.label}:
                  </p>
                  {key === "status" ? (
                    <span
                      className={`text-sm rounded-md border px-2 py-1 inline-block mt-1 ${getStatusStyle(
                        value
                      )}`}
                    >
                      {value}
                    </span>
                  ) : key === "rating" ? (
                    <div className="">
                      <RatingStars Review_Count={value} />
                    </div>
                  ) : (
                    <p className="text-sm ">{value}</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
