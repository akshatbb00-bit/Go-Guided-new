import { useState } from "react";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import Avatar from "../../common/Avatar";
import toast from "react-hot-toast";
import useApi from "../../../hooks/useApi";
import { updateName, updateProfilePic } from "../../../services/accountService";
import { updatePassword } from "../../../services/authService";

function Settings() {
  const { user, setUserContext } = useUser();

  const { loading: isNameUpdating, request: updateNameRequest } =
    useApi(updateName);

  const { loading: isProfilePicUpdating, request: uploadProfilePic } =
    useApi(updateProfilePic);

  const { loading: isPasswordUpdating, request: updatePasswordRequest } =
    useApi(updatePassword);

  const [profileImage, setProfileImage] = useState(user?.profilePicUrl);

  // Editable name
  const [editableName, setEditableName] = useState(user?.name || "");
  const [isNameEdited, setIsNameEdited] = useState(false);

  // Password section
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmNewPassword: false,
  });

  const handleNameChange = (e) => {
    const value = e.target.value;
    setEditableName(value);

    setIsNameEdited(value.trim() !== user?.name?.trim());
  };

  const handleNameSubmit = async () => {
    const trimmedName = editableName.trim();

    if (!trimmedName) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (trimmedName === user?.name?.trim()) {
      toast.info("Name is unchanged.");
      setIsNameEdited(false);
      return;
    }

    try {
      const response = await updateNameRequest({
        data: { name: trimmedName },
      });

      toast.success(response.message);
      setUserContext((prevUser) => ({
        ...prevUser,
        name: response?.data?.user?.name,
      }));
      setEditableName(response?.data?.user?.name);
      setIsNameEdited(false);
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await uploadProfilePic({ data: formData });
      toast.success(response.message);

      setUserContext((prev) => ({
        ...prev,
        profilePicUrl: response?.data?.user?.profilePicUrl,
      }));
      setProfileImage(response?.data?.user?.profilePicUrl);
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmNewPassword } = passwordFields;

    // Validation

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await updatePasswordRequest({
        data: { currentPassword, newPassword, confirmNewPassword },
      });

      toast.success(response.message);

      // Clear form
      setPasswordFields({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-32 py-8 space-y-6 h-full overflow-y-auto scrollbar-none">
      {/* Account Settings Section */}
      <div className="p-4 sm:p-6 flex flex-col space-y-6 shadow-sm bg-white rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-semibold uppercase text-green-700">
          Your Account Settings
        </h3>
        <form className="grid grid-cols-1 gap-4 pt-4">
          {/* Editable Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-base sm:text-lg font-medium text-green-900"
            >
              Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="name"
                value={editableName}
                onChange={handleNameChange}
                className="flex-1 p-2 border border-green-300 rounded-md outline-none text-green-950"
              />
              {isNameEdited && (
                <button
                  type="button"
                  onClick={handleNameSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                >
                  {isNameUpdating ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-base sm:text-lg font-medium text-green-900"
            >
              Email
            </label>
            <input
              defaultValue={user?.email}
              disabled
              type="email"
              id="email"
              className="p-2 border border-green-300 rounded-md outline-none text-green-950 cursor-not-allowed"
            />
          </div>

          {/* Profile Picture Upload */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-x-6">
            <label className="relative cursor-pointer">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-20 h-20 object-cover object-center rounded-full"
                />
              ) : (
                <Avatar
                  size={48}
                  bgColor="bg-white"
                  textColor="text-green-800"
                  textSize="text-xl"
                  fontWeight="font-semibold"
                  fullName={user.name}
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <FaCamera className="absolute bottom-0 right-0 bg-white rounded-full p-1 text-green-700 w-6 h-6 shadow-md" />
            </label>
            {isProfilePicUpdating && (
              <span className="text-green-600">Uploading...</span>
            )}
          </div>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="p-4 sm:p-6 flex flex-col space-y-6 shadow-sm rounded-lg bg-white">
        <h3 className="text-2xl sm:text-3xl font-semibold uppercase text-green-700">
          Change Password
        </h3>
        <form
          className="grid grid-cols-1 gap-4 pt-4"
          onSubmit={handlePasswordSubmit}
        >
          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="currentPassword"
              className="text-base sm:text-lg font-medium text-green-900"
            >
              Current password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordFields.currentPassword}
              onChange={handlePasswordChange}
              className="p-2 border border-green-300 rounded-md outline-none text-green-950"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2 relative">
            <label
              htmlFor="newPassword"
              className="text-base sm:text-lg font-medium text-green-900"
            >
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword.newPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={passwordFields.newPassword}
                onChange={handlePasswordChange}
                className="p-2 border border-green-300 outline-none rounded-md text-green-950 w-full"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("newPassword")}
                className="absolute inset-y-0 right-3 flex items-center text-green-600 hover:text-green-800 cursor-pointer"
              >
                {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2 relative">
            <label
              htmlFor="confirmNewPassword"
              className="text-base sm:text-lg font-medium text-green-900"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirmNewPassword ? "text" : "password"}
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={passwordFields.confirmNewPassword}
                onChange={handlePasswordChange}
                className="p-2 border border-green-300 outline-none rounded-md text-green-950 w-full"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirmNewPassword")}
                className="absolute inset-y-0 right-3 flex items-center text-green-600 hover:text-green-800 cursor-pointer"
              >
                {showPassword.confirmNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={` p-3 sm:p-4 mt-4 text-base sm:text-lg uppercase font-semibold rounded-md transition-all duration-200
    ${
      isPasswordUpdating ||
      !passwordFields.currentPassword ||
      !passwordFields.newPassword ||
      !passwordFields.confirmNewPassword
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700 hover:shadow-md cursor-pointer"
    }`}
            disabled={
              isPasswordUpdating ||
              !passwordFields.currentPassword ||
              !passwordFields.newPassword ||
              !passwordFields.confirmNewPassword
            }
          >
            {isPasswordUpdating ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
