import { useUser } from "../../../context/UserContext";
import { UserRound } from "lucide-react";
import Avatar from "../../common/Avatar";

function Profile() {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-4 p-1 md:p-6 text-green-100 relative">
      <div className="relative inline-block cursor-pointer">
        {user ? (
          user?.profilePicUrl ? (
            <Avatar size={80} imageURL={user.profilePicUrl} />
          ) : (
            <Avatar
              size={64}
              bgColor="bg-white"
              textColor="text-green-800"
              textSize="text-2xl"
              fontWeight="font-semibold"
              fullName={user.name}
            />
          )
        ) : (
          <div className="bg-green-600 text-white p-2 rounded-full flex items-center justify-center shadow-sm shadow-nav-highlighted">
            <UserRound className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <span className="font-medium text-base sm:text-lg">{user.name}</span>
        <span className="text-sm sm:text-base">{user.email}</span>
      </div>

      <div className="absolute -bottom-5 left-[10%] w-[80%] border-b-2 border-gray-400" />
    </div>
  );
}

export default Profile;
