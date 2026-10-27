import { toast } from "react-hot-toast";

export const showError = (message) => {
  toast.error(message || "Something went wrong");
};

export const showSuccess = (message) => {
  toast.success(message || "Success");
};
