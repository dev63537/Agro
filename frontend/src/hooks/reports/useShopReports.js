import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useSalesReport = () =>
  useQuery({
    queryKey: ["shop-sales"],
    queryFn: async () => {
      const res = await api.get("/reports/sales");
      return res.data;
    }
  });

export const useTopFarmers = () =>
  useQuery({
    queryKey: ["shop-top-farmers"],
    queryFn: async () => {
      const res = await api.get("/reports/top-farmers");
      return res.data;
    }
  });

export const useLowStock = () =>
  useQuery({
    queryKey: ["shop-low-stock"],
    queryFn: async () => {
      const res = await api.get("/reports/low-stock");
      return res.data;
    }
  });
