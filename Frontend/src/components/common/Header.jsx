import { useEffect, useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { Link, NavLink } from "react-router";
import useSafeNavigate from "../../utils/useSafeNavigate";
import { useUser } from "../../context/UserContext";
import Avatar from "./Avatar";

function Header() {
  const safeNavigate = useSafeNavigate();
  const { user } = useUser();

  const handleProfileClick = (e) => {
    e.preventDefault();

    if (!user) return safeNavigate("/login");

    switch (user.role) {
      case "admin":
        return safeNavigate("/admin");
      case "guide":
        return safeNavigate("/guide");
      case "owner":
        return safeNavigate("/owner");
      default:
        return safeNavigate("/user");
    }
  };

  return (
    <header className="flex items-center justify-between px-32 py-4 fixed top-0 left-0 w-full h-20 bg-green-50 z-10">
      <h4 className="font-semibold text-5xl text-green-800">
        <Link to="/">
          <img className="h-12 w-40" src="/images/logo.png" alt="logo" />
        </Link>
      </h4>
      <nav className="flex items-center space-x-6">
        <ul className="flex space-x-4 text-2xl text-green-800 font-medium">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "text-green-600" : "")}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tours"
              className={({ isActive }) => (isActive ? "text-green-600" : "")}
            >
              Tours
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "text-green-600" : "")}
            >
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "text-green-600" : "")}
            >
              Contact Us
            </NavLink>
          </li>
        </ul>

        <button onClick={handleProfileClick} className="cursor-pointer">
          {user ? (
            user.profilePicUrl ? (
              <Avatar size={48} imageURL={user.profilePicUrl} />
            ) : (
              <Avatar
                size={48}
                bgColor="bg-"
                textColor="text-text-heading"
                textSize="text-xl"
                fontWeight="font-semibold"
                fullName={user.name}
              />
            )
          ) : (
            <div className="bg-primary text-nav-link rounded-full flex items-center justify-center shadow-sm shadow-nav-highlighted">
              <FaCircleUser className="text-green-200 w-12 h-12" />
            </div>
          )}
        </button>
      </nav>
    </header>
  );
}

export default Header;
