import { useForm } from "react-hook-form";
import useApi from "../../hooks/useApi";
import { submitFeedback } from "../../services/feedbackService";
import toast from "react-hot-toast";

function ReachoutForm() {
  const { loading: submitLoading, request: submitFeedbackApi } =
    useApi(submitFeedback);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await submitFeedbackApi({ data }); // Sends form data to API
      toast.success(response.message);
      reset(); // Clear form after success
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-md shadow-black/50 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4 pb-5 border-b-2 border-black/20">
        <span className="text-green-950 text-4xl md:text-6xl font-semibold">
          Let's Chat, Reach Out to Us
        </span>
        <p className="text-base md:text-lg font-medium text-black/80">
          Have questions or feedback? We are here to help. Send us a message and
          we'll respond within 24 hours.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 pt-5"
      >
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-lg font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name", { required: "Name is required" })}
            className={`p-2 border-2 rounded-md ${
              errors.name ? "border-red-500" : "border-black/20"
            }`}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-lg font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            className={`p-2 border-2 rounded-md ${
              errors.email ? "border-red-500" : "border-black/20"
            }`}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="text-lg font-medium">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            {...register("subject", { required: "Subject is required" })}
            className={`p-2 border-2 rounded-md ${
              errors.subject ? "border-red-500" : "border-black/20"
            }`}
          />
          {errors.subject && (
            <span className="text-sm text-red-500">
              {errors.subject.message}
            </span>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-lg font-medium">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            {...register("message", { required: "Message is required" })}
            className={`p-2 border-2 rounded-md resize-y ${
              errors.message ? "border-red-500" : "border-black/20"
            }`}
          ></textarea>
          {errors.message && (
            <span className="text-sm text-red-500">
              {errors.message.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitLoading}
          className={`text-lg font-medium text-white bg-green-600 rounded-md py-3 hover:bg-green-700 hover:shadow-sm hover:shadow-black/50 ${
            submitLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {submitLoading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default ReachoutForm;
