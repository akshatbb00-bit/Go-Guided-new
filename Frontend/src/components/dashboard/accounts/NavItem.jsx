import { NavLink } from "react-router";
import useSafeNavigate from "../../../utils/useSafeNavigate";
import useApi from "../../../hooks/useApi";
import { logoutUser } from "../../../services/authService";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import { useState } from "react";
import ConfirmationModal from "../../common/ConfirmationModal";

function NavItem({ to, children, onClick }) {
  const { setUserContext } = useUser();
  const [modal, setModal] = useState(false);

  const safeNavigate = useSafeNavigate();
  const { request: logoutRequest } = useApi(logoutUser);

  const handleLogout = async () => {
    try {
      const response = await logoutRequest({});
      toast.success(response.message);
      setUserContext(null);
      safeNavigate("/login");
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  const style = `flex items-center px-2 md:px-8 py-2 md:py-3 md:text-xl uppercase  bg-green-700 text-green-100  space-x-3 transition-all duration-75 ease-in-out `;

  if (to === "logout") {
    return (
      <>
        <button
          onClick={() => {
            setModal(true);
          }}
          className={`${style} hover:ml-1 cursor-pointer`}
        >
          <div className="flex items-center space-x-3">{children}</div>
        </button>
        {modal && (
          <ConfirmationModal
            text="Are you sure you want to log out?"
            onConfirm={handleLogout}
            onCancel={() => setModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <NavLink
      onClick={onClick}
      to={to}
      end
      className={({ isActive: navIsActive }) =>
        `${style} ${
          navIsActive
            ? "text-white order-b-0 border-l-4 border-l-green-500"
            : "hover:ml-1 border-l-0"
        }`
      }
    >
      <div className="flex items-center space-x-3">{children}</div>
    </NavLink>
  );
}

export default NavItem;
