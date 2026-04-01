import { useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";

/**
 * Mounts an Axios interceptor that shows a toast on network / 5xx errors.
 * Render once near the app root.
 */
export function NetworkErrorToast() {
  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (error) => {
        if (!error.response) {
          toast.error("Connection lost", {
            description: "Unable to reach the server. Check your internet connection.",
            action: { label: "Retry", onClick: () => window.location.reload() },
          });
        } else if (error.response.status >= 500 && error.response.status !== 501) {
          toast.error("Server error", {
            description: "Something went wrong on the server. Please try again later.",
          });
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(id);
    };
  }, []);
  return null;
}
