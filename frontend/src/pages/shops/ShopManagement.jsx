import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";

export default function ShopManagement() {
  const queryClient = useQueryClient();

  const fetchShops = async () => {
    const res = await api.get("/master/shops");
    return res.data.shops;
  };

  const { data: shops = [], isLoading, error } = useQuery({
    queryKey: ["master-shops"],
    queryFn: fetchShops,
  });

  const updateShop = useMutation({
    mutationFn: ({ shopId, payload }) => api.patch(`/master/shops/${shopId}`, payload),
    onSuccess: () => queryClient.invalidateQueries(["master-shops"]),
  });

  const resetPassword = useMutation({
    mutationFn: (shopId) => api.post(`/master/shops/${shopId}/reset-password`),
    onSuccess: (res) => showSuccess(res.data.message || "Reset email sent!"),
    onError: (err) => showError(err?.response?.data?.error || "Failed to send reset email"),
  });


  const resendInvite = useMutation({
    mutationFn: (shopId) => api.post(`/master/shops/${shopId}/resend-invite`),
    onSuccess: (res) => showSuccess(res.data.message || "Invite resent!"),
    onError: (err) => showError(err?.response?.data?.error || "Failed to resend invite"),
  });

  if (isLoading) return <div className="p-6 text-secondary-400">Loading shops...</div>;
  if (error) return <div className="alert-error">Failed to load shops</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Shop Management</h1>
        <span className="badge-info">{shops.length} shops</span>
      </div>

      {shops.length === 0 ? (
        <div className="text-secondary-400">No shops found</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop._id}>
                  <td>
                    <div className="font-medium text-secondary-800">{shop.name}</div>
                    <div className="text-xs text-secondary-400">{shop.code} • {shop.email || '—'}</div>
                  </td>

                  <td>
                    {shop.status === "ACTIVE"
                      ? <span className="badge-success">Active</span>
                      : <span className="badge-danger">Suspended</span>
                    }
                  </td>

                  <td>
                    <select
                      value={shop.plan || "FREE"}
                      onChange={(e) => updateShop.mutate({ shopId: shop._id, payload: { plan: e.target.value } })}
                      className="select text-xs py-1.5"
                    >
                      <option value="FREE">FREE</option>
                      <option value="BASIC">BASIC</option>
                      <option value="PRO">PRO</option>
                    </select>
                  </td>

                  <td>
                    <input
                      type="date"
                      value={shop.expiryDate?.slice(0, 10) || ""}
                      onChange={(e) => updateShop.mutate({ shopId: shop._id, payload: { expiryDate: e.target.value } })}
                      className="input text-xs py-1.5"
                    />
                  </td>

                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        className={`btn btn-sm ${shop.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200"}`}
                        onClick={() => updateShop.mutate({ shopId: shop._id, payload: { status: shop.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } })}
                      >
                        {shop.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>

                      <button
                        className="btn btn-sm bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200"
                        onClick={() => resetPassword.mutate(shop._id)}
                        disabled={resetPassword.isPending}
                      >
                        🔑 Reset
                      </button>


                      <button
                        className="btn btn-sm bg-info-50 text-info-700 hover:bg-info-100 border border-info-200"
                        onClick={() => resendInvite.mutate(shop._id)}
                        disabled={resendInvite.isPending}
                      >
                        📧 Invite
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
