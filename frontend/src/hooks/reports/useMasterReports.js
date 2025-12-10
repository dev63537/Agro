// useMasterReports.js
// Converted to @tanstack/react-query usage for v5+

import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useMasterSales = () =>
  useQuery({
    queryKey: ["master-sales"],
    queryFn: async () => {
      const res = await api.get("/master/reports/sales");
      return res.data;
    }
  });

export const useMasterTopFarmers = () =>
  useQuery({
    queryKey: ["master-top-farmers"],
    queryFn: async () => {
      const res = await api.get("/master/reports/farmers");
      return res.data;
    }
  });

export const useMasterLowStock = (threshold = 10) =>
  useQuery({
    queryKey: ["master-low-stock", threshold],
    queryFn: async () => {
      const res = await api.get(`/master/reports/low-stock?threshold=${threshold}`);
      return res.data;
    }
  });
