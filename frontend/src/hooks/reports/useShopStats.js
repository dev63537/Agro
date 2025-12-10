import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useShopStats = () =>
  useQuery({
    queryKey: ["shop-stats"],
    queryFn: async () => {
      const res = await api.get("/reports/stats");
      return res.data;
    }
  });
