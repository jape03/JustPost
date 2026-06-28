import { Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand.jsx";

export function AuthPanel({ onSubmit, error, isLoading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const isRegister = mode === "register";

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(mode, form);
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <Brand />
        <h1>Publish quiet, polished posts from one focused workspace.</h1>
        <p>
          JustPost keeps writing, editing, and account access direct with a clean
          database-backed login flow.
        </p>
      </section>

      <section className="auth-card" aria-label="Account access">
        <div className="segmented-control" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {isRegister && (
            <label>
              Name
              <span className="input-wrap">
                <UserRound size={18} />
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Alex Rivera"
                  autoComplete="name"
                  required
                />
              </span>
            </label>
          )}

          <label>
            Email
            <span className="input-wrap">
              <Mail size={18} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label>
            Password
            <span className="input-wrap">
              <Lock size={18} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                placeholder="Minimum 8 characters"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait" : isRegister ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
