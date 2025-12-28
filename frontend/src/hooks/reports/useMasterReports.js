import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

// 🔹 REFRESH EVERY 10 SECONDS
const LIVE_INTERVAL = 10000;

export const useMasterSales = () =>
  useQuery({
    queryKey: ["master-sales"],
    queryFn: async () => {
      const res = await api.get("/master/reports/sales");
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: LIVE_INTERVAL,
    staleTime: 0,
  });

export const useMasterTopFarmers = () =>
  useQuery({
    queryKey: ["master-top-farmers"],
    queryFn: async () => {
      const res = await api.get("/master/reports/farmers");
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: LIVE_INTERVAL,
    staleTime: 0,
  });

export const useMasterShopCount = () =>
  useQuery({
    queryKey: ["master-shop-count"],
    queryFn: async () => {
      const res = await api.get("/master/reports/shops/count");
      return res.data.total || 0;
    },
  });

