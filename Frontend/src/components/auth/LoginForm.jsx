import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import useApi from "../../hooks/useApi";
import { loginUser } from "../../services/authService";
import ForgotPasswordModal from "./ForgotPassword";
import { useUser } from "../../context/UserContext";

function LoginForm() {
  // ------------------- State -------------------
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { setUserContext } = useUser();

  // ------------------- Form -------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  // ------------------- API -------------------
  const { request: loginRequest, loading: loginLoading } = useApi(loginUser);

  // ------------------- Handler -------------------
  const onSubmit = async (formData) => {
    try {
      const response = await loginRequest({ data: formData });
      setUserContext(response?.user);
      toast.success(response.message);
      navigate("/");
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  // ------------------- UI -------------------
  return (
    <div className="flex items-center justify-center h-[85vh] px-4 relative">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-lg shadow-lg bg-green-50 ">
        <h2 className="text-2xl font-semibold text-green-950 text-center mb-4">
          Log In
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4"
        >
          {/* Email Field */}
          <label className="w-full">
            <p className="mb-1 text-lg text-green-950">Email</p>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full focus:border-2 border-black rounded-lg p-2 text-green-950 focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </label>

          {/* Password Field */}
          <label className="relative w-full">
            <p className="mb-1 text-lg text-green-950">Password</p>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full focus:border-2 border-black rounded-lg p-2 text-green-950 focus:outline-none"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] cursor-pointer text-green-900"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={24} />
              ) : (
                <AiOutlineEye fontSize={24} />
              )}
            </span>
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
            <p
              onClick={() => setShowForgotModal(true)}
              className="mt-1 text-md text-green-900 hover:underline cursor-pointer"
            >
              Forgot Password?
            </p>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginLoading}
            className="mt-4 rounded-md bg-green-600 text-white py-2 font-semibold cursor-pointer hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loginLoading ? "Logging in..." : "Log In"}
          </button>

          {/* Signup Link */}
          <p className="mt-2 text-center text-green-950">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-800 font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

export default LoginForm;
