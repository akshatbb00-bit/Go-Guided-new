import { useState } from "react";
import { Link, useLocation } from "react-router";
import { RiRobot2Line } from "react-icons/ri";
import { FaTimes } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import Chatbot from "./Chatbot";

// Floating chat launcher shown on every page (bottom-right).
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const { pathname } = useLocation();

  const isLoggedIn = Boolean(user?._id || user?.email);

  // Not useful on the auth screens
  if (["/login", "/signup"].includes(pathname)) return null;

  return (
    <div className="fixed right-4 bottom-20 lg:bottom-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[70vh] max-h-[560px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
          {isLoggedIn ? (
            <Chatbot onClose={() => setOpen(false)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
              <RiRobot2Line className="text-5xl text-green-700" />
              <p className="text-gray-700">
                Log in to chat with our travel assistant.
              </p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className="w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition flex items-center justify-center text-2xl cursor-pointer"
      >
        {open ? <FaTimes /> : <RiRobot2Line />}
      </button>
    </div>
  );
}

export default ChatWidget;
