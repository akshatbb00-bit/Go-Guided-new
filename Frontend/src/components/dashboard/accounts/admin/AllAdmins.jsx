import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaUserShield,
  FaUserSlash,
} from "react-icons/fa";
import AdminsHeader from "../../../common/DashboardHeader";
import { BiPlusCircle } from "react-icons/bi";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import {
  deleteAdmin,
  getAllAdmins,
} from "../../../../services/manageAdminsService";
import Pagination from "../../../common/Pagination";
import useApi from "../../../../hooks/useApi";
import toast from "react-hot-toast";
import ConfirmationModal from "../../../common/ConfirmationModal";

const filterOptions = [
  {
    label: "Date Interval",
    children: [
      { label: "Start Date", value: "startDate", type: "date" },
      { label: "End Date", value: "endDate", type: "date" },
    ],
  },
];

function AllAdmins() {
  const navigate = useSafeNavigate();
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    sortOrder: "asc",
    selectedFilters: {},
  });
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const numberOfEntries = 5;
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [expandedAdmin, setExpandedAdmin] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const { loading: fetchAdminLoading, request: fetchAdminsApi } =
    useApi(getAllAdmins);
  const { loading: deleteAdminLoading, request: deleteAdminsApi } =
    useApi(deleteAdmin);

  const fetchAdmins = async () => {
    try {
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
      params.append("role", "admin");

      const response = await fetchAdminsApi({ params: params.toString() });

      setAdmins(response.data.users);
      setTotalPages(response.totalPages);
      setTotalAdmins(response.total);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, filterState]);

  // Handle "Fire Admin"
  const handleFireAdmin = async (adminId) => {
    try {
      const response = await deleteAdminsApi({ identifier: adminId });
      toast.success(response.message);
      fetchAdmins();
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  const getAdminStatus = (updatedAt) => {
    const updatedDate = new Date(updatedAt);
    const diffInDays = (new Date() - updatedDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7 ? "Active" : "Inactive";
  };

  return (
    <div className="p-6 flex flex-col gap-4 h-full overflow-y-auto scrollbar-hide">
      {/* Header Section */}
      <AdminsHeader
        title="All Admins"
        totalCount={totalAdmins}
        filterState={filterState}
        setFilterState={setFilterState}
        filterOptions={filterOptions}
      />

      {/* Add Admin CTA */}
      <div
        className="flex items-center justify-between p-4 bg-white border border-green-500 rounded-xl hover:bg-green-100 cursor-pointer transition-all"
        onClick={() => navigate("add-admin")}
      >
        <div className="flex items-center gap-2">
          <BiPlusCircle className="text-green-600 w-6 h-6" />
          <span className="text-green-700 font-semibold text-lg">
            Add New Admin
          </span>
        </div>
      </div>

      {/* Admins List */}
      {admins.length === 0 ? (
        <p className="text-green-700 text-center mt-10">No admins found.</p>
      ) : (
        admins.map((admin) => (
          <div
            key={admin._id}
            className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500 transition"
          >
            {/* Admin Name & Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-green-800 flex items-center gap-2">
                <FaUserShield className="text-green-600" />
                {admin.firstName} {admin.lastName}
              </h2>

              <button
                onClick={() =>
                  setExpandedAdmin(
                    expandedAdmin === admin._id ? null : admin._id
                  )
                }
                className="text-green-800 hover:text-green-600 transition"
              >
                {expandedAdmin === admin._id ? (
                  <FaChevronUp size={20} />
                ) : (
                  <FaChevronDown size={20} />
                )}
              </button>
            </div>

            {/* Email & Status */}
            <div className="flex flex-col md:flex-row justify-between text-green-800 mt-4 p-3 bg-green-50 border border-green-200 rounded-md shadow-sm">
              <p className="flex items-center gap-2">
                <FaEnvelope /> {admin.email}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 border rounded-md ${
                    getAdminStatus(admin.updatedAt) === "Active"
                      ? "bg-green-100 text-green-700 border-green-400"
                      : "bg-red-100 text-red-700 border-red-400"
                  }`}
                >
                  {getAdminStatus(admin.updatedAt)}
                </span>
              </p>
            </div>

            {/* Expandable Info */}
            {expandedAdmin === admin._id && (
              <div className="grid grid-cols-2 gap-4 p-4 mt-3 bg-green-50 border border-green-200 rounded-lg text-green-800 shadow-sm">
                <p>
                  <strong>Phone:</strong> {admin.phone || "Not Provided"}
                </p>
                <p>
                  <strong>Role:</strong> {admin.role}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Fire Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setSelectedAdminId(admin._id);
                  setShowConfirmModal(true);
                }}
                disabled={fetchAdminLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  fetchAdminLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                }`}
              >
                <FaUserSlash />
                {fetchAdminLoading ? "Processing..." : "Fire Admin"}
              </button>
            </div>
          </div>
        ))
      )}

      {showConfirmModal && (
        <ConfirmationModal
          text="Are you sure you want to fire this admin?"
          onConfirm={async () => {
            await handleFireAdmin(selectedAdminId);
            setShowConfirmModal(false);
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

export default AllAdmins;
