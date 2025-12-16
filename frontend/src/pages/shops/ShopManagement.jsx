import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export default function ShopManagement() {
  const queryClient = useQueryClient();

  // ✅ Fetch shops (MASTER)
  const fetchShops = async () => {
    const res = await api.get("/master/shops");
    return res.data.shops;
  };

  const { data: shops = [], isLoading, error } = useQuery({
    queryKey: ["master-shops"],
    queryFn: fetchShops,
  });

  // ✅ Update shop (status / plan / expiry)
  const updateShop = useMutation({
    mutationFn: ({ shopId, payload }) =>
      api.patch(`/master/shops/${shopId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["master-shops"]);
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading shops...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed to load shops</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Shop Management</h2>

      {shops.length === 0 ? (
        <div className="text-gray-500">No shops found</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Plan</th>
              <th className="border p-2">Expiry</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop._id}>
                <td className="border p-2">
                  {shop.name} ({shop.code})
                </td>

                <td className="border p-2">
                  {shop.status === "ACTIVE" ? "🟢 ACTIVE" : "🔴 SUSPENDED"}
                </td>

                <td className="border p-2">
                  <select
                    value={shop.plan || "FREE"}
                    onChange={(e) =>
                      updateShop.mutate({
                        shopId: shop._id,
                        payload: { plan: e.target.value },
                      })
                    }
                  >
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PRO">PRO</option>
                  </select>
                </td>

                <td className="border p-2">
                  <input
                    type="date"
                    value={shop.expiryDate?.slice(0, 10) || ""}
                    onChange={(e) =>
                      updateShop.mutate({
                        shopId: shop._id,
                        payload: { expiryDate: e.target.value },
                      })
                    }
                  />
                </td>

                <td className="border p-2">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() =>
                      updateShop.mutate({
                        shopId: shop._id,
                        payload: {
                          status:
                            shop.status === "ACTIVE"
                              ? "SUSPENDED"
                              : "ACTIVE",
                        },
                      })
                    }
                  >
                    {shop.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
