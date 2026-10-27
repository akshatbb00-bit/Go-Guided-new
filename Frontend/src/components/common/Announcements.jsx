import { MdAddCircleOutline, MdCampaign } from "react-icons/md";
import { AiOutlineEye } from "react-icons/ai";
import ViewAnnouncementPost from "./ViewAnnouncementPost";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import useApi from "../../hooks/useApi";
import {
  createAnnouncement,
  getAnnouncements,
} from "../../services/announcementService";
import toast from "react-hot-toast";

function Announcement() {
  const { user } = useUser();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [visibleTo, setVisibleTo] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const { request: fetchAnnouncements } = useApi(getAnnouncements);
  const { request: postAnnouncement, loading: posting } =
    useApi(createAnnouncement);

  // Compute options based on user role
  function getAnnouncementOptions(currentRole) {
    const role = currentRole?.toLowerCase();
    const roleHierarchy = ["user", "guide", "admin", "owner"];
    const rolePluralMap = {
      user: "Users",
      guide: "Guides",
      admin: "Admins",
    };

    const currentIndex = roleHierarchy.indexOf(role);
    if (currentIndex === -1 || role === "user") return [];

    const options = roleHierarchy
      .slice(0, currentIndex)
      .map((r) => rolePluralMap[r]);

    if (role === "owner") {
      options.unshift("Everyone");
    }

    return options;
  }

  const options = getAnnouncementOptions(user.role);

  // Set default visibleTo when form is shown
  useEffect(() => {
    if (showForm && options.length > 0) {
      setVisibleTo(options[0]);
    }
  }, [showForm]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAnnouncements({});
        setAnnouncements(res?.data?.announcements || []);
      } catch (error) {}
    })();
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !message.trim() || !visibleTo) {
      alert("Title, message, and recipient are required.");
      return;
    }

    const newAnnouncement = {
      title,
      message,
      visibleTo,
      postedBy: user.name,
      date: new Date().toISOString(),
    };

    try {
      const res = await postAnnouncement({ data: newAnnouncement });
      toast.success(res?.message || "Announcement posted successfully.");

      const created = res?.data?.announcement || newAnnouncement;

      setAnnouncements([created, ...announcements]);

      // Reset form
      setShowForm(false);
      setTitle("");
      setMessage("");
      setVisibleTo(options[0] || "");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to post announcement."
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden max-w-full">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition cursor-pointer"
        >
          <MdAddCircleOutline size={20} /> New Post
        </button>
      )}

      {showForm ? (
        <div className="h-full overflow-y-auto scrollbar-none max-h-[70vh]">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MdCampaign className="text-green-500" size={24} /> Announcement
          </h2>

          <div className="h-full overflow-y-auto scrollbar-none max-h-[60vh]">
            <label className="block text-sm font-semibold text-gray-700 mt-3">
              Send To:
            </label>
            <select
              value={visibleTo}
              onChange={(e) => setVisibleTo(e.target.value)}
              className="w-full p-2 border border-green-300 rounded outline-none cursor-pointer"
            >
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded mt-3 border-green-300 outline-none cursor-pointer"
            />

            <textarea
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded mt-3 border-green-300 outline-none cursor-pointer"
              rows="4"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition cursor-pointer w-full sm:w-auto"
              >
                Discard
              </button>
              <button
                onClick={handlePost}
                disabled={posting}
                className={`px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition cursor-pointer w-full sm:w-auto ${
                  posting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {posting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mt-6 text-lg font-semibold text-green-950">
            📢 Announcements
          </h2>

          {announcements.length === 0 ? (
            <p className="text-gray-500 text-sm mt-2">No posts yet.</p>
          ) : (
            <div className="mt-2 p-2 space-y-3 max-h-48 sm:max-h-60 overflow-y-auto scrollbar-none">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="p-2 border border-green-300 rounded shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-green-950">
                      {announcement.title}
                    </h3>
                    <p className="text-xs text-green-950">
                      👁️ {announcement.visibleTo} | 📅{" "}
                      {new Date(announcement.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="text-green-700 hover:text-green-800 flex items-center gap-1 cursor-pointer"
                  >
                    <AiOutlineEye size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ViewAnnouncementPost
        isOpen={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}

export default Announcement;
