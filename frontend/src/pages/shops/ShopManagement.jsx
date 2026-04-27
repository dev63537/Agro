import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";

export default function ShopManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Edit modal state
  const [editShop, setEditShop] = useState(null);
  const [editForm, setEditForm] = useState({});

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
    onSuccess: () => {
      queryClient.invalidateQueries(["master-shops"]);
      showSuccess("Shop updated");
    },
    onError: (err) => showError(err?.response?.data?.error || "Update failed"),
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

  // Filter logic
  const filteredShops = shops.filter(shop => {
    const matchSearch = !search || 
      shop.name?.toLowerCase().includes(search.toLowerCase()) ||
      shop.code?.toLowerCase().includes(search.toLowerCase()) ||
      shop.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      shop.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = !filterPlan || shop.plan === filterPlan;
    const matchStatus = !filterStatus || shop.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const openEdit = (shop) => {
    setEditShop(shop);
    setEditForm({
      name: shop.name || '',
      ownerName: shop.ownerName || '',
      email: shop.email || '',
      phone: shop.phone || '',
      address: shop.address || '',
    });
  };

  const saveEdit = () => {
    if (!editShop) return;
    updateShop.mutate(
      { shopId: editShop._id, payload: editForm },
      { onSuccess: () => setEditShop(null) }
    );
  };

  if (isLoading) return <div className="p-6 text-secondary-400">Loading shops...</div>;
  if (error) return <div className="alert-error">Failed to load shops</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Shop Management</h1>
        <span className="badge-info">{filteredShops.length} / {shops.length} shops</span>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Search</label>
              <input
                className="input"
                placeholder="Search by name, code, owner, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Plan</label>
              <select className="select" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
                <option value="">All Plans</option>
                <option value="FREE">FREE</option>
                <option value="BASIC">BASIC</option>
                <option value="PRO">PRO</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredShops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-title">No shops found</div>
          <div className="empty-state-message">
            {shops.length > 0 ? 'Try adjusting your filters.' : 'Create your first shop to get started.'}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop._id}>
                  <td>
                    <div className="font-medium text-secondary-800">{shop.name}</div>
                    <div className="text-xs text-secondary-400">{shop.code} • {shop.email || '—'}</div>
                  </td>

                  <td>
                    <div className="text-sm text-secondary-700">{shop.ownerName || '—'}</div>
                    {shop.phone && <div className="text-xs text-secondary-400">{shop.phone}</div>}
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
                        className="btn btn-sm bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border border-secondary-200"
                        onClick={() => openEdit(shop)}
                      >
                        ✏️ Edit
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

      {/* Edit Shop Modal */}
      {editShop && (
        <div className="modal-backdrop" onClick={() => setEditShop(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-secondary-900">Edit Shop — {editShop.code}</h3>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="label">Shop Name</label>
                <input
                  className="input"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Owner Name</label>
                  <input
                    className="input"
                    value={editForm.ownerName}
                    onChange={e => setEditForm({...editForm, ownerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={editForm.address}
                  onChange={e => setEditForm({...editForm, address: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setEditShop(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={updateShop.isPending}>
                {updateShop.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
