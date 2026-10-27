import { useForm } from "react-hook-form";
import useSafeNavigate from "../../../../utils/useSafeNavigate";
import useApi from "../../../../hooks/useApi";
import { addAdmin } from "../../../../services/manageAdminsService";
import toast from "react-hot-toast";

function AddNewAdmin() {
  const { loading, request: addAdminApi } = useApi(addAdmin);

  const navigate = useSafeNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await addAdminApi({ data: data });
      toast.success(response.message);
      reset();
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Add New Admin
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-green-700 font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-green-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-green-700 font-medium mb-1">
              Phone
            </label>
            <input
              type="number"
              {...register("phone", { required: "Phone number is required" })}
              className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/2 py-2 cursor-pointer rounded-md bg-gray-200 hover:bg-gray-300 text-green-700 font-semibold transition"
            >
              Discard
            </button>
            <button
              type="submit"
              className="w-1/2 cursor-pointer py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition"
            >
              {loading ? "Adding" : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNewAdmin;
