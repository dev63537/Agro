import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useShopSales = () =>
  useQuery({
    queryKey: ["shop-sales-monthly"],
    queryFn: async () => {
      const res = await api.get("/reports/sales");
      return res.data;
    }
  });
