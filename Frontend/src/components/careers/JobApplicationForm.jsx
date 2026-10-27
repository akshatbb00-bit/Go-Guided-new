import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { useRef } from "react";
import useSafeNavigate from "../../utils/useSafeNavigate";
import { applyTojob } from "../../services/applicationService";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";

const JobApplicationForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const { loading: isApplyingToJob, request: submitApplication } =
    useApi(applyTojob);

  const { name, jobId } = useParams();
  const navigate = useSafeNavigate();

  const resumeFile = watch("resume");
  const resumeInputRef = useRef(null);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("linkedin", data.linkedin || "");
    formData.append("experience", data.experience || "");
    formData.append("message", data.message || "");

    if (data.resume?.[0]) {
      formData.append("resume", data.resume[0]);
    }

    try {
      const response = await submitApplication({
        identifier: jobId,
        data: formData,
      });

      toast.success(response?.message || "Application submitted.");
      reset();
      if (resumeInputRef.current) resumeInputRef.current.value = null;
      navigate(-1);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Application failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-10 min-h-screen bg-green-50 text-green-950">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl px-6 py-8">
        <h2 className="text-3xl font-semibold text-center text-green-900 mb-8">
          Apply for <span className="text-green-700">{name}</span>
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="grid gap-6"
        >
          {/* === Contact Info Section === */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...register("fullName", { required: "Name is required" })}
                className={`w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* === Phone & LinkedIn === */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="9876543210"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9+\-() ]{7,}$/,
                    message: "Invalid phone number",
                  },
                })}
                className={`w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium mb-1"
              >
                LinkedIn Profile<span className="text-red-500">*</span>
              </label>
              <input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/your-profile"
                {...register("linkedin", {
                  pattern: {
                    value: /^https?:\/\/(www\.)?linkedin\.com\/.*$/i,
                    message: "Enter a valid LinkedIn URL",
                  },
                })}
                className={`w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none ${
                  errors.linkedin ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.linkedin && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.linkedin.message}
                </p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label
              htmlFor="experience"
              className="block text-sm font-medium mb-1"
            >
              Years of Experience<span className="text-red-500">*</span>
            </label>
            <input
              id="experience"
              type="number"
              min="0"
              placeholder="0"
              {...register("experience", { min: 0 })}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 border-gray-300 focus:outline-none"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Resume <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={resumeInputRef}
                type="file"
                id="resume"
                accept=".pdf"
                {...register("resume", { required: "Resume is required" })}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border px-3 py-2 rounded-md bg-white flex justify-between items-center">
                <span className="text-gray-700 truncate max-w-[70%]">
                  {resumeFile?.[0]?.name || "Upload your resume"}
                </span>
                <label
                  htmlFor="resume"
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              {errors.resume && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.resume.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isApplyingToJob}
              className={`bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition font-medium ${
                isApplyingToJob ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isApplyingToJob ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
