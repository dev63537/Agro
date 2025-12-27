import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useSalesReport = () =>
  useQuery({
    queryKey: ["shop-sales"],
    queryFn: async () => {
      try {
        const res = await api.get("/reports/sales");
        
        // Handle different response structures
        if (res?.data?.bills) {
          return res.data; // Already has bills, total, count
        } else if (res?.data?.data?.bills) {
          return res.data.data; // Nested structure
        } else {
          return {
            total: 0,
            count: 0,
            bills: [],
          };
        }
      } catch (error) {
        console.error("Sales report error:", error);
        return {
          total: 0,
          count: 0,
          bills: [],
        };
      }
    },
    retry: 1,
  });

export const useTopFarmers = () =>
  useQuery({
    queryKey: ["top-farmers"],
    queryFn: async () => {
      try {
        const res = await api.get("/reports/farmers/top");
        return res?.data || [];
      } catch (error) {
        console.error("Top farmers error:", error);
        return [];
      }
    },
    retry: 1,
  });

export const useLowStock = () =>
  useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      try {
        const res = await api.get("/reports/low-stock");
        return res?.data || [];
      } catch (error) {
        console.error("Low stock error:", error);
        return [];
      }
    },
    retry: 1,
  }); 