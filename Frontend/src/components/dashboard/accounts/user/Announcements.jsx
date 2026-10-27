import { useState, useEffect } from "react";
import { FaInfoCircle, FaBullhorn, FaEye } from "react-icons/fa";
import ViewAnnouncementPost from "../../../common/ViewAnnouncementPost";
import { getAnnouncements } from "../../../../services/announcementService";
import useApi from "../../../../hooks/useApi";
import { useUser } from "../../../../context/UserContext"; // ✅ <-- add this

export default function Announcements() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const { user } = useUser(); // ✅ get user role
  const userRole = user?.role?.toLowerCase();

  const { request: fetchAnnouncements, loading } = useApi(getAnnouncements);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAnnouncements({});
        setAnnouncements(res?.data?.announcements || []);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    })();
  }, []);

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6">
      <div className="min-h-[80vh] sm:min-h-screen shadow-md bg-white p-4 sm:p-6 rounded-lg">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-green-700 flex items-center">
          <FaBullhorn className="mr-2" /> Announcements
        </h1>

        {loading && (
          <p className="text-gray-500 text-sm">Loading announcements...</p>
        )}
        {!loading && announcements.length === 0 && (
          <p className="text-gray-500 text-sm">No announcements found.</p>
        )}

        {/* Announcements List */}
        <div className="space-y-4 h-full max-h-[70vh] overflow-y-auto scrollbar-none">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="p-4 border border-green-400 rounded-lg shadow-md bg-white"
            >
              <div className="flex justify-between items-center flex-wrap gap-y-2">
                <h2 className="text-base sm:text-lg font-semibold text-green-800 flex items-center">
                  <FaInfoCircle className="mr-2" /> {announcement.title}
                </h2>
                <span className="text-sm text-green-600">
                  {new Date(announcement.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <p className="text-green-700 mt-1 text-sm sm:text-base">
                {announcement.message}
              </p>

              <div className="flex justify-between items-center mt-2 text-sm text-green-600 flex-wrap gap-y-2">
                {/* ✅ Conditionally show postedBy */}
                {userRole !== "user" && (
                  <span className="font-bold">{announcement.postedBy}</span>
                )}
                <button
                  className="text-green-700 hover:text-green-900 flex items-center gap-1"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <FaEye /> View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal View */}
        <ViewAnnouncementPost
          isOpen={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          announcement={selectedAnnouncement}
        />
      </div>
    </div>
  );
}
