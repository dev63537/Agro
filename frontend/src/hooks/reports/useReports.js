import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useSalesReport = () =>
  useQuery({
    queryKey: ["shop-sales"],
    queryFn: async () => {
      const res = await api.get("/reports/sales");
      return res.data.data;

    },
  });

export const useTopFarmers = () =>
  useQuery({
    queryKey: ["top-farmers"],
    queryFn: async () => {
      const res = await api.get("/reports/farmers/top");
      return res.data;
    },
  });

export const useLowStock = () =>
  useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      const res = await api.get("/reports/low-stock");
      return res.data;
    },
  });
