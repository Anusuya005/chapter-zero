import { useState } from "react";
import "./Auth.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = isRegister
        ? {
            name,
            email,
            password,
          }
        : {
            email,
            password,
          };

      const response = await fetch(
        `${API}${endpoint}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Authentication failed."
        );
      }

      localStorage.setItem(
        "chapterZeroToken",
        data.token
      );

      localStorage.setItem(
        "chapterZeroUser",
        JSON.stringify({
          userId: data.userId,
          name: data.name,
          email: data.email,
        })
      );

      onLogin(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(
      (previous) =>
        previous === "login"
          ? "register"
          : "login"
    );

    setError("");
    setPassword("");
  };

  return (
    <div className="auth-page">

      <div className="auth-stars">
        <span>✦</span>
        <span>✧</span>
        <span>✦</span>
        <span>·</span>
        <span>✧</span>
        <span>✦</span>
      </div>

      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <main className="auth-card">

        <div className="auth-brand">

          <div className="auth-symbol">
            ✦
          </div>

          <span className="auth-eyebrow">
            CHAPTER ZERO
          </span>

          <h1>
            {isRegister
              ? "Begin your story."
              : "Welcome back."}
          </h1>

          <p>
            {isRegister
              ? "Create your reading universe."
              : "Your books have been waiting for you."}
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {isRegister && (
            <div className="auth-field">

              <label htmlFor="name">
                Your name
              </label>

              <input
                id="name"
                type="text"
                placeholder="What should we call you?"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                autoComplete="name"
                required
              />

            </div>
          )}

          <div className="auth-field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              required
            />

          </div>

          <div className="auth-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder={
                isRegister
                  ? "At least 6 characters"
                  : "Enter your password"
              }
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete={
                isRegister
                  ? "new-password"
                  : "current-password"
              }
              minLength={6}
              required
            />

          </div>

          {error && (
            <div className="auth-error">

              <span>!</span>

              {error}

            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Opening your universe..."
              : isRegister
              ? "Create my universe"
              : "Enter Chapter Zero"}

            {!loading && (
              <span>→</span>
            )}

          </button>

        </form>

        <div className="auth-switch">

          <span>
            {isRegister
              ? "Already have an account?"
              : "New to Chapter Zero?"}
          </span>

          <button
            type="button"
            onClick={switchMode}
          >
            {isRegister
              ? "Sign in"
              : "Create an account"}
          </button>

        </div>

        <div className="auth-footer">

          <span>✦</span>

          <p>
            A quiet place for the stories
            that stay with you.
          </p>

          <span>✦</span>

        </div>

      </main>

    </div>
  );
}

export default Auth;