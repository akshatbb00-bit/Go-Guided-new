import { useState } from "react";
import { useLocation } from "react-router";
import { IoIosSettings } from "react-icons/io";
import { MdOutlineLogout, MdOutlineSpaceDashboard } from "react-icons/md";
import { Menu } from "lucide-react";
import NavItem from "../NavItem";

const guideNavLinks = [
  {
    to: ".",
    label: "Dashboard",
    icon: <MdOutlineSpaceDashboard className="text-green-200" />,
  },
  {
    to: "settings",
    label: "Settings",
    icon: <IoIosSettings className="text-green-200" />,
  },
  {
    to: "logout",
    label: "Logout",
    icon: <MdOutlineLogout className="text-green-200" />,
  },
];

function GuideLinks() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div>
      {/* Mobile / Tablet Navbar with Burger Button */}
      <div className="lg:hidden flex gap-5 bg-green-50 items-center px-8 py-2 w-full">
        <button onClick={() => setOpen(!open)} className="text-green-950">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-green-950">
          {guideNavLinks.find((n) => location.pathname.includes(n.to))?.label ||
            "Dashboard"}
        </h1>
      </div>

      {/* Mobile / Tablet Drawer */}
      {open && (
        <div className="lg:hidden bg-green-700 shadow-md px-4 py-2 space-y-1 z-50 absolute w-fit left-4">
          {guideNavLinks.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              isActive={location.pathname.includes(item.to)}
              onClick={() => setOpen(false)} // close drawer on click
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
          {guideNavLinks.map((item) => (
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

export default GuideLinks;
