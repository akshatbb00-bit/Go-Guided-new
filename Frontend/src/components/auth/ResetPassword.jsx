import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import useApi from "../../hooks/useApi";
import { resetPassword } from "../../services/authService";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";

function UpdatePassword() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const { request, loading } = useApi(resetPassword);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await request({ data, params: { token } });
      toast.success(response.message);
      navigate("/login");
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center h-[85vh] bg-white ">
      <div className="w-full max-w-md bg-green-50 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-900 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* New Password */}
          <label className="relative">
            <p className="mb-1 text-green-950">New Password</p>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              {...register("password", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full border border-black rounded-lg p-2 pr-10 focus:outline-none text-green-950"
            />
            <span
              className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </span>
            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </label>

          {/* Confirm Password */}
          <label className="relative">
            <p className="mb-1 text-green-950">Confirm Password</p>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              {...register("confirmPassword", {
                required: "Confirm your new password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              className="w-full border border-black rounded-lg p-2 pr-10 focus:outline-none text-green-950"
            />
            <span
              className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </span>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-md bg-green-600 text-white py-2 font-semibold cursor-pointer hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
