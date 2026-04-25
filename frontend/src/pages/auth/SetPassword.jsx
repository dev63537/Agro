import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";

const SetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { showError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { showError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await api.post("/auth/set-password", { token, password });
      showSuccess(res.data.message || "Password set successfully!");
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      showError(err?.response?.data?.error || "Failed to set password. Token may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
      <div className="card w-full max-w-md">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-3xl text-white mx-auto mb-4 shadow-lg">🌾</div>
            <h1 className="text-2xl font-bold text-secondary-900">Set Your Password</h1>
            <p className="text-secondary-400 mt-1">Create a secure password to activate your account</p>
          </div>

          {done ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-primary-600 mb-2">Account Activated!</h2>
              <p className="text-secondary-400">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">New Password</label>
                <input type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required minLength={6} />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Setting Password..." : "Set Password & Activate"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
