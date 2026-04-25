import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/apiClient";
import { useAuthContext } from "../../context/AuthContext";
import { showError } from "../../lib/toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (!res.data || !res.data.token) {
        showError("Login failed: token missing in response.");
        return;
      }
      login({ token: res.data.token, user: res.data.user });
      localStorage.setItem("token", res.data.token);
      if (res.data.user.role === "master") {
        navigate("/master");
      } else {
        navigate("/shop");
      }
    } catch (err) {
      const message = err?.response?.data?.error || err.message || "Unknown error";
      showError(`Login failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      <div className="card w-full max-w-md">
        <div className="card-body p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-3xl text-white mx-auto mb-4 shadow-lg">
              🌾
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">Agro Billing</h1>
            <p className="text-secondary-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>



            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
