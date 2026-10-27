import { useEffect, useState } from "react";
import UsersHeader from "../../../common/DashboardHeader";
import UsersTable from "../../../dashboard/Table";
import NoResult from "../../../../pages/NoResult";
import LoaderOverlay from "../../../common/LoaderOverlay";
import { getAllAdmins } from "../../../../services/manageAdminsService";
import useApi from "../../../../hooks/useApi";

const headers = [
  { label: "S No.", width: "10%" },
  { label: "Name", width: "20%" },
  { label: "Email", width: "25%" },
  { label: "Phone", width: "25%" },
  { label: "Last Visit", width: "20%" },
];

const usersData = Array.from({ length: 50 }, (_, i) => ({
  _id: (i + 1).toString(),
  firstName: ["John", "Jane", "Sam", "Lucy"][i % 4],
  lastName: ["Doe", "Smith", "Wilson", "Heart"][i % 4],
  email: [
    "john@example.com",
    "jane@example.com",
    "sam@example.com",
    "lucy@example.com",
  ][i % 4],
  number: ["1234567890", "9876543210", "4561237890", "7894561230"][i % 4],
  lastVisit: `2024-03-${(i % 30) + 1}`.padStart(10, "0"),
}));

function UsersList() {
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: [],
  });

  const [users, setUsers] = useState(usersData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(usersData.length);
  const [loading, setLoading] = useState(false);
  const numberOfEntries = 10;

  const { loading: fetchUserLoading, request: fetchUserApi } =
    useApi(getAllAdmins);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { searchQuery, selectedFilters, sortOrder } = filterState;
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);

      if (selectedFilters?.["Date Interval"]) {
        const { startDate, endDate } = selectedFilters["Date Interval"];
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
      }

      if (sortOrder) params.append("sort", sortOrder);

      params.append("page", currentPage);
      params.append("limit", numberOfEntries);
      params.append("role", "user");

      const response = await fetchUserApi({ params: params.toString() });

      setUsers(response.data.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterState]);

  const getKeyFromLabel = (label) =>
    label.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");

  const transformedUsers = users.map((user, idx) => {
    const row = {};
    headers.forEach((header) => {
      const key = getKeyFromLabel(header.label);
      if (key === "sno") {
        row[key] = (currentPage - 1) * numberOfEntries + idx + 1;
      } else if (key === "name") {
        const capitalize = (str) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        row[key] = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
      } else if (key === "lastvisit") {
        row[key] = new Date(user.updatedAt).toLocaleDateString();
      } else {
        row[key] = user[key] || "-";
      }
    });

    row._id = user._id;
    return row;
  });

  if (loading) return <LoaderOverlay />;

  return (
    <div className="p-4">
      <UsersHeader
        title="Users"
        totalCount={totalUsers}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={[
          {
            label: "Status",
            children: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ],
          },
        ]}
      />
      {transformedUsers.length > 0 ? (
        <UsersTable
          headers={headers}
          data={transformedUsers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      ) : (
        <NoResult />
      )}
    </div>
  );
}

export default UsersList;
