import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import useApi from "../../../../hooks/useApi";
import { createJob } from "../../../../services/jobService";

function CreateJob() {
  const { loading: isJobCreating, request: createJobRequest } =
    useApi(createJob);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      salary: {
        min: 0,
        max: 0,
      },
    },
  });

  const submitJob = async (data) => {
    try {
      const response = await createJobRequest({ data: data });
      toast.success(response.message);
      reset();
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className=" p-4 flex justify-center w-full h-full overflow-y-scroll scrollbar-hide  ">
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full h-fit"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[30px] font-bold mb-4 text-green-950">
          Create a Job
        </h2>
        <form onSubmit={handleSubmit(submitJob)} className="space-y-3">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-green-700">
              Job Title:
            </label>
            <input
              {...register("title", { required: "Job title is required" })}
              type="text"
              placeholder="Job Title"
              className="border p-3 w-full rounded-md "
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>
          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-green-700">
              Job Description:
            </label>
            <textarea
              {...register("description", {
                required: "Job description is required",
              })}
              placeholder="Job Description"
              className="border p-3 w-full rounded-md"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-green-700">
              Location:
            </label>
            <input
              {...register("location", { required: "Location is required" })}
              type="text"
              placeholder="Location"
              className="border p-3 w-full rounded-md"
            />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location.message}</p>
            )}
          </div>
          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Salary Range(INR)
            </label>
            <div className="flex gap-3">
              {/* Min Salary */}
              <div className="flex-1">
                <input
                  {...register("salary.min", {
                    required: "Minimum salary is required",
                    min: { value: 0, message: "Must be positive" },
                  })}
                  type="number"
                  placeholder="Min Salary"
                  className="border p-3 w-full rounded-md"
                />
                {errors.salary?.min && (
                  <p className="text-red-500 text-sm">
                    {errors.salary.min.message}
                  </p>
                )}
              </div>

              {/* Max Salary */}
              <div className="flex-1">
                <input
                  {...register("salary.max", {
                    required: "Maximum salary is required",
                    min: { value: 0, message: "Must be positive" },
                  })}
                  type="number"
                  placeholder="Max Salary"
                  className="border p-3 w-full rounded-md"
                />
                {errors.salary?.max && (
                  <p className="text-red-500 text-sm">
                    {errors.salary.max.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Last Date */}
          <div>
            <label className="block text-sm font-medium text-green-700">
              Last Date:
            </label>
            <input
              {...register("lastDateToApply", {
                required: "Last date is required",
              })}
              type="date"
              className="border p-3 w-full rounded-md"
            />
            {errors.lastDateToApply && (
              <p className="text-red-500 text-sm">
                {errors.lastDateToApply.message}
              </p>
            )}
          </div>
          {/* Number of Posts */}
          <div>
            <label className="block text-sm font-medium text-green-700">
              Number of Posts:
            </label>
            <input
              {...register("numberOfPosts", {
                required: "Number of posts is required",
                min: { value: 1, message: "Must be at least 1 post" },
              })}
              type="number"
              placeholder="Number of Posts"
              className="border p-3 w-full rounded-md"
            />
            {errors.numberOfPosts && (
              <p className="text-red-500 text-sm">
                {errors.numberOfPosts.message}
              </p>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            {isJobCreating ? (
              <button
                type="button"
                className="bg-green-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                disabled
              >
                Creating...
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer"
              >
                Create
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJob;
