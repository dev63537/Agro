import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      showError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      showSuccess(res.data.message || "Password reset successfully!");
      navigate("/login");
    } catch (err) {
      showError(err?.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      <div className="card w-full max-w-md">
        <div className="card-body p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center text-3xl text-white mx-auto mb-4 shadow-lg">
              🔑
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">Reset Password</h1>
            <p className="text-secondary-400 mt-1">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
