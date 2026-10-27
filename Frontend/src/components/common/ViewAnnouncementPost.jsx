import { FaTimes } from "react-icons/fa";
import { useUser } from "../../context/UserContext"; // ✅ import context

function ViewAnnouncementPost({ isOpen, onClose, announcement }) {
  const { user } = useUser(); // ✅ get user
  const role = user?.role?.toLowerCase();

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full sm:max-w-lg md:max-w-xl relative overflow-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-red-600 hover:text-red-900 cursor-pointer text-xl sm:text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-2 break-words">
          {announcement.title}
        </h2>

        <p className="text-green-700 break-words">{announcement.message}</p>

        {/* ✅ Conditionally show "Posted by" */}
        {role !== "user" && (
          <div className="mt-4 text-sm text-gray-600 break-words">
            Posted by:{" "}
            <span className="font-bold">{announcement.postedBy}</span>
          </div>
        )}

        <div className="mt-1 text-sm text-gray-500 break-words">
          Date:{" "}
          {new Date(announcement.date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      </div>
    </div>
  );
}

export default ViewAnnouncementPost;
