import Sidebar from "./Sidebar";
import { Outlet } from "react-router";

function AccountLayout({ children }) {
  return (
    <div className="px-4 md:px-12 lg:px-32 mt-16 md:py-10 grid grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-6 lg:gap-10 bg-primary rounded-md overflow-hidden h-fit ">
      <Sidebar>{children}</Sidebar>
      <div className="bg-primary-dark overflow-y-auto min-h-[70vh] h-fit  scrollbar-hide border border-button rounded">
        {/* max-h-[87vh] */}
        <Outlet />
      </div>
    </div>
  );
}

export default AccountLayout;
