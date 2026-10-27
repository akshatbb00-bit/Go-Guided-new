import { useState } from "react";

const useApi = (apiFunc) => {
  const [loading, setLoading] = useState(false);

  const request = async ({ identifier, data, params }) => {
    setLoading(true);

    try {
      const res = await apiFunc({ identifier, data, params });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);

      throw err;
    }
  };

  return { loading, request };
};

export default useApi;
