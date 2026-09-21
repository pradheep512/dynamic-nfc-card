"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    setMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created! Check your email if confirmation is required.");
  }

  async function login() {
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        color: "#111",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1>Just Tap</h1>

        <p style={{ color: "#666" }}>
          Sign in to manage your NFC cards.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            marginTop: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            marginTop: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "20px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Log In
        </button>

        <button
          onClick={signUp}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            background: "white",
            color: "black",
            border: "1px solid #ccc",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>

        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}