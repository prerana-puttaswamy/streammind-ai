"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await fetch("http://streammind-backend.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      window.location.href = "/";
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #020617, #0f172a)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 32,
          borderRadius: 20,
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(148,163,184,0.2)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>StreamMind AI</h1>
        <p style={{ color: "#94a3b8", marginBottom: 28 }}>
          Event Intelligence Login
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        <p
          style={{
            marginTop: 20,
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Powered by FastAPI + Redis + Celery
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginBottom: 16,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.3)",
  background: "rgba(2,6,23,0.8)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};