import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.ok) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user.role === "master") navigate("/master");
      else navigate("/shop");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-6 shadow rounded w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <form className="space-y-3" onSubmit={submit}>
          <input
            className="border p-2 w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn-primary w-full" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
