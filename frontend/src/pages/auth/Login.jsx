// frontend/src/pages/auth/Login.jsx
import React, { useState } from "react";
import api from "../../lib/apiClient";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting login:", { email });

    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("Login response status:", res.status);
      console.log("Login response data:", res.data);

      if (!res.data || !res.data.token) {
        alert(
          "Login failed: token missing in response. See console for response."
        );

        console.log("LOGIN SUCCESS — RES.DATA →", res.data);
        console.log("ROLE =", res.data.user.role);

        return;
      }

      // call context login
      login({
        token: res.data.token,
        user: res.data.user,
      });

      // persist token (AuthContext might also do this; this is safe redundancy)
      localStorage.setItem("token", res.data.token);
      console.log("NAVIGATING TO DASHBOARD...");

      // navigate based on role
      if (res.data.user.role === "master") {
        navigate("/master");
      } else {
        navigate("/shop");
      }
    } catch (err) {
      console.error("Login request error:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data ||
        err.message ||
        "Unknown error";
      alert(`Login failed: ${message}`);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
