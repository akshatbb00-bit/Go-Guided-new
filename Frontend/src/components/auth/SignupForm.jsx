import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import useApi from "../../hooks/useApi";
import { sendOtp, registerUser } from "../../services/authService";

function SignupForm() {
  // ------------------- State -------------------
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasRequestedOtp, setHasRequestedOtp] = useState(false);

  // ------------------- Form -------------------
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // ------------------- API -------------------
  const { request: sendOtpRequest, loading: otpLoading } = useApi(sendOtp);

  const { request: registerRequest, loading: registerLoading } =
    useApi(registerUser);

  const navigate = useNavigate();

  // ------------------- Handlers -------------------

  const handleOtpRequest = async () => {
    try {
      const email = watch("email");

      if (!email) {
        toast.error("Enter email before requesting OTP.");
        return;
      }

      const response = await sendOtpRequest({ data: { email } });

      toast.success(response.message);

      // First-time request
      if (!hasRequestedOtp) setHasRequestedOtp(true);

      // Start resend cooldown
      setResendCooldown(60);
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (resendCooldown === 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const onSubmit = async (formData) => {
    try {
      const response = await registerRequest({ data: formData });
      toast.success(response.message);
      navigate("/login");
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  // ------------------- Render -------------------

  return (
    <div className="flex items-center justify-center h-auto py-2 max-h-screen px-4">
      <div className="w-full max-w-md p-6  rounded-lg shadow-lg bg-green-50">
        <h2 className="text-2xl font-semibold text-green-950 text-center mb-4">
          Create an Account
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4"
        >
          {/* First & Last Name */}
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="w-full">
              <p className="mb-1 text-lg text-green-950">First Name</p>
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="w-full focus:border-2 border-black rounded-lg p-2 text-green-950 focus:outline-none"
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </label>

            <label className="w-full">
              <p className="mb-1 text-lg text-green-950">Last Name</p>
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName", {
                  required: "Last name is required",
                })}
                className="w-full focus:border-2 border-black rounded-lg p-2 text-green-950 focus:outline-none"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs">
                  {errors.lastName.message}
                </p>
              )}
            </label>
          </div>

          {/* Email */}
          <label className="w-full">
            <p className="mb-1 text-lg text-green-950">Email Address</p>
            <input
              type="email"
              placeholder="Enter email address"
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

          {/* Phone */}
          <label className="w-full">
            <p className="mb-1 text-lg text-green-950">Phone Number</p>
            <input
              type="tel"
              placeholder="Enter 10-digit Indian phone number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message:
                    "Enter a valid 10-digit Indian phone number starting with 6-9",
                },
              })}
              className="w-full focus:border-2 border-black rounded-lg p-2 text-green-950 focus:outline-none"
            />
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </label>

          {/* Password Fields */}
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="relative w-full">
              <p className="mb-1 text-lg text-green-950">Create Password</p>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full focus:border-2 border-black rounded-lg p-2 pr-10 text-green-950 focus:outline-none"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] cursor-pointer text-gray-400"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
              {errors.password && (
                <p className="text-red-400 text-xs">
                  {errors.password.message}
                </p>
              )}
            </label>

            <label className="relative w-full">
              <p className="mb-1 text-lg text-green-950">Confirm Password</p>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                className="w-full focus:border-2 border-black rounded-lg p-2 pr-10 text-green-950 focus:outline-none"
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] cursor-pointer text-gray-400"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} />
                ) : (
                  <AiOutlineEye fontSize={24} />
                )}
              </span>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </label>
          </div>

          {/* OTP Field */}
          <div className="w-full">
            <p className="mb-1 text-lg text-green-950">OTP Code</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter the OTP code"
                {...register("otp", {
                  required: "OTP is required",
                  minLength: {
                    value: 4,
                    message: "OTP must be at least 4 digits",
                  },
                })}
                className="flex-1 focus:border-2 border-black rounded-lg p-2 text-green-950 focus:outline-none"
              />
              {!hasRequestedOtp && (
                <button
                  type="button"
                  onClick={handleOtpRequest}
                  className="sm:w-auto w-full rounded-md bg-green-500 text-white px-4 py-2 font-semibold cursor-pointer hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Sending" : "Get OTP"}
                </button>
              )}
            </div>

            {/* Resend OTP */}
            {hasRequestedOtp && (
              <p className="text-sm mt-1 text-green-900">
                Didn’t receive it?{" "}
                <button
                  type="button"
                  onClick={handleOtpRequest}
                  disabled={otpLoading || resendCooldown > 0}
                  className="text-green-700 font-medium underline hover:text-green-800 cursor-pointer disabled:text-green-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : otpLoading
                    ? "Sending..."
                    : "Resend OTP"}
                </button>
              </p>
            )}

            {errors.otp && (
              <p className="text-red-400 text-xs mt-1">{errors.otp.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerLoading}
            className="mt-4 rounded-md bg-green-600 text-white py-2 font-semibold cursor-pointer hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {registerLoading ? "Creating..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p className=" text-center text-green-950">
            Already have an account?{" "}
            <Link to="/login" className="text-green-800 font-semibold">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
