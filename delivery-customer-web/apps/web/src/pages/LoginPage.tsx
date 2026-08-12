import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (ok) navigate("/");
    else setError("Incorrect username or password.");
  };

  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <BrandLogo size={90} />
        <h1>RENGAS BORONG</h1>
        <p>Customer order portal</p>

        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Enter username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter Password"
            required
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "LOGGING IN..." : "LOGIN"}
        </button>
      </form>
    </main>
  );
}
