import Profile from "./Profile";

function Sidebar({ children }) {
  return (
    <div
      className="flex flex-col 
       max-h-[92vh]
      py-2 space-y-4 
      w-full md:w-auto bg-green-700 shadow-lg shadow-black/50"
    >
      <Profile />
      <div className="mt-8 bg-green-100/50">
        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
}

export default Sidebar;
