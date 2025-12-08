import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export const useSalesReport = () =>
  useQuery({
    queryKey: ["sales-report"],
    queryFn: async () => (await api.get("/reports/sales")).data
  });

export const useTopFarmers = () =>
  useQuery({
    queryKey: ["top-farmers"],
    queryFn: async () => (await api.get("/reports/farmers")).data
  });

export const useLowStock = () =>
  useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => (await api.get("/reports/low-stock")).data
  });
