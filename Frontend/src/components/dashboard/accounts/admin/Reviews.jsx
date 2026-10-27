import ReviewsHeader from "../../../common/DashboardHeader";
import ReviewsTable from "../../../dashboard/Table";
import { useEffect, useState } from "react";
import { getAllReviews } from "../../../../services/reviewService";
import useApi from "../../../../hooks/useApi";

const headers = [
  { label: "S No.", width: "10%" },
  { label: "Name", width: "25%" },
  { label: "Email", width: "25%" },
  { label: "Date ", width: "20%" },
  { label: "Rating", width: "20%" },
];

function Reviews() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: [],
  });

  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const numberOfEntries = 4;

  const { request: fetchReviews } = useApi(getAllReviews);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rating = filterState.selectedFilters["Rating"];
        const dateInterval = filterState.selectedFilters["Date Interval"] || {};

        const query = {
          page: currentPage,
          limit: numberOfEntries,
          search: filterState.searchQuery,
          sortOrder: filterState.sortOrder,
          rating,
          startDate: dateInterval.startDate,
          endDate: dateInterval.endDate,
        };

        const res = await fetchReviews({ params: query });

        setReviews(res?.data?.reviews || []);
        setTotalPages(res?.data?.totalPages || 1);
        setTotalCount(res?.data?.totalReviews || 0);
      } catch (error) {
        // handle if needed
      }
    };

    fetchData();
  }, [filterState, currentPage]);

  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  const transformedReviews = reviews.map((review, idx) => {
    const row = {};
    headers.forEach((header) => {
      const key = getKeyFromLabel(header.label);
      if (key === "sno") {
        row[key] = (currentPage - 1) * numberOfEntries + idx + 1;
      } else if (key === "date") {
        row[key] = new Date(review.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
      } else if (key === "name") {
        row[key] = review.reviewerName || "-";
      } else if (key === "email") {
        row[key] = review.reviewerEmail || "-";
      } else if (key === "rating") {
        row[key] = review.rating;
      } else {
        row[key] = review[key] || "-";
      }
    });
    row._id = review._id;
    return row;
  });

  return (
    <div>
      <ReviewsHeader
        title="Reviews"
        totalCount={totalCount}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Rating",
            children: [
              { label: "1 & above", value: "gte_1" },
              { label: "2 & above", value: "gte_2" },
              { label: "3 & above", value: "gte_3" },
              { label: "4 & above", value: "gte_4" },
              { label: "5 only", value: "eq_5" },
            ],
          },
          {
            label: "Date Interval",
            children: [
              { label: "Start Date", value: "startDate", type: "date" },
              { label: "End Date", value: "endDate", type: "date" },
            ],
          },
        ]}
      />

      {transformedReviews.length > 0 ? (
        <ReviewsTable
          headers={headers}
          data={transformedReviews}
          itemsPerPage={numberOfEntries}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <div className="text-center text-sm text-gray-500 py-8">
          No reviews found matching the criteria.
        </div>
      )}
    </div>
  );
}

export default Reviews;
