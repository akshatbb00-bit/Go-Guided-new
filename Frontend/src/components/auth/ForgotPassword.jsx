import { useState } from "react";
import { toast } from "react-hot-toast";
import useApi from "../../hooks/useApi";
import { forgotPassword } from "../../services/authService";

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");

  const { request, loading } = useApi(forgotPassword);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required.");
      return;
    }

    try {
      const response = await request({ data: { email } });
      toast.success(response.message);
      onClose();
      setEmail("");
    } catch (err) {
      const { response } = err;
      const msg = response?.data?.message || "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-green-900">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="w-full">
            <p className="mb-1 text-green-950">Registered Email Address</p>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black focus:border-2 rounded-lg p-2 text-green-950 focus:outline-none"
              required
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEmail("");
                onClose();
              }}
              className="px-4 py-2 text-sm rounded-md cursor-pointer bg-gray-300  hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-green-500 cursor-pointer hover:bg-green-600 text-black font-semibold transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
