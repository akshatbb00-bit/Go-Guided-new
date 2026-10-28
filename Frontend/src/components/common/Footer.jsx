import { Link, NavLink } from "react-router-dom";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { FaXTwitter, FaLocationDot } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { MdCall } from "react-icons/md";

function Footer() {
  return (
    <footer className="bg-green-50 text-green-950 px-4 sm:px-6 lg:px-32 py-10 flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row gap-10 justify-between">
        {/* Logo and Description */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          <h4 className="font-semibold text-3xl sm:text-4xl text-green-950">
            <Link to="/">GoGuided</Link>
          </h4>
          <p className="text-gray-800 text-[15px] sm:text-[16px]">
            GoGuided offers exceptional travel experiences with handpicked tours
            and activities designed for every traveler. Explore new destinations
            and make memories that last forever.
          </p>
        </div>

        {/* Contact, Links, Social */}
        <div className="flex flex-col sm:flex-row gap-10 lg:w-2/3 justify-between">
          {/* Contact Info */}
          <div className="flex flex-col gap-3 min-w-[150px]">
            <h2 className="text-lg font-semibold text-green-900">
              Contact Information
            </h2>
            <ul className="flex flex-col gap-2 text-gray-800">
              <li className="flex gap-2 items-center">
                <FaLocationDot className="text-green-900" />
                <span className="text-[16px]">
                  404 Imaginary Street, Nowhere City, Planet Earth
                </span>
              </li>
              <li className="flex gap-2 items-center">
                <MdCall className="text-green-900" />
                <span className="text-[16px]">+91 12345-67890</span>
              </li>
              <li className="flex gap-2 items-center">
                <IoMdMail className="text-green-900" />
                <span className="text-[16px]">
                  definitelynotspam@goguided.fake
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3 min-w-[150px]">
            <h2 className="text-lg font-semibold text-green-900">
              Quick Links
            </h2>
            <ul className="flex flex-col gap-1 text-green-900">
              {/* Visible on Desktop Only */}
              <li className="hidden lg:block">
                <NavLink to="/tours" className="hover:text-green-700">
                  Tours
                </NavLink>
              </li>
              <li className="hidden lg:block">
                <NavLink to="/about" className="hover:text-green-700">
                  About Us
                </NavLink>
              </li>
              <li className="hidden lg:block">
                <NavLink to="/contact" className="hover:text-green-700">
                  Contact Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/careers" className="hover:text-green-700">
                  Join Us
                </NavLink>
              </li>

              {/* Always Visible: Terms & Policy */}
              <li>
                <NavLink to="/terms" className="hover:text-green-700">
                  Terms & Conditions
                </NavLink>
              </li>
              <li>
                <NavLink to="/privacy" className="hover:text-green-700">
                  Privacy Policy
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div className="flex flex-col gap-3 min-w-[150px]">
            <h2 className="text-lg font-semibold text-green-900">
              Stay in touch
            </h2>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook
                  size={28}
                  className="text-green-900 hover:text-green-700"
                />
              </a>
              <a
                href="https://www.x.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter
                  size={28}
                  className="text-green-900 hover:text-green-700"
                />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube
                  size={28}
                  className="text-green-900 hover:text-green-700"
                />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <AiFillInstagram
                  size={28}
                  className="text-green-900 hover:text-green-700"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className="text-center text-[16px] font-medium text-green-900">
        &copy; {new Date().getFullYear()} GoGuided. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
