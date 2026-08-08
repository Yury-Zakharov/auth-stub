"use client";

import { useState, SubmitEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("http://localhost:5222/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessage(data ?? "no token received");
      setStatus("success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setMessage(errorMessage);
      setStatus("error");
    }
  }

  return (
    <main
      style={{
        maxWidth: 360,
        margin: "4rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem" }}>Login</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username" style={{ display: "block", marginBottom: 4 }}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            disabled={status === "loading"}
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 4 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={status === "loading"}
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%",
            padding: "0.65rem",
            fontSize: "1rem",
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading" ? "Logging in…" : "Login"}
        </button>
      </form>

      <div style={{ marginTop: "1.5rem", minHeight: "1.5rem" }}>
        {status === "loading" && <p>Loading…</p>}
        {status === "success" && <p>Success! Token: {message}</p>}
        {status === "error" && <p style={{ color: "crimson" }}>Error: {message}</p>}
      </div>
    </main>
  );
}
