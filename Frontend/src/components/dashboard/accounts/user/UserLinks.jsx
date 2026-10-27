import { IoIosSettings } from "react-icons/io";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { IoBagHandleOutline } from "react-icons/io5";
import { FaRegStar } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import { Menu } from "lucide-react";
import { MdOutlineLogout } from "react-icons/md";
import NavItem from "../NavItem";
import { useState } from "react";
import { useLocation } from "react-router";

const navLinks = [
  {
    to: ".",
    label: "Settings",
    icon: <IoIosSettings className="text-green-200" />,
  },
  {
    to: "announcements",
    label: "Announcements",
    icon: <HiOutlineSpeakerphone className="text-green-200" />,
  },
  {
    to: "bookings",
    label: "My Bookings",
    icon: <IoBagHandleOutline className="text-green-200" />,
  },
  {
    to: "reviews",
    label: "My Reviews",
    icon: <FaRegStar className="text-green-200" />,
  },
  {
    to: "logout",
    label: "Logout",
    icon: <MdOutlineLogout className="text-green-200" />,
  },
];

function UserLinks() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div>
      {/* Mobile / Tablet Navbar with Burger Button */}
      <div className="lg:hidden flex gap-5 bg-green-50 items-center px-8 py-2 w-full ">
        <button onClick={() => setOpen(!open)} className="text-green-950">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold  text-green-950">
          {navLinks.find((n) => location.pathname.includes(n.to))?.label ||
            "Settings"}
        </h1>
      </div>

      {/* Mobile / Tablet Drawer */}
      {open && (
        <div className="lg:hidden bg-green-700 shadow-md px-4 py-2 space-y-1 z-50 absolute w-fit left-4">
          {navLinks.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              isActive={location.pathname.includes(item.to)}
              onClick={() => setOpen(false)} // close drawer on any item click
            >
              {item.icon}
              <span>{item.label}</span>
            </NavItem>
          ))}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full overflow-x-auto lg:overflow-x-visible scrollbar-none">
        <div className="flex lg:flex-col min-w-max md:min-w-0 px-2 md:px-0">
          {navLinks.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              isActive={location.pathname.includes(item.to)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavItem>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserLinks;
