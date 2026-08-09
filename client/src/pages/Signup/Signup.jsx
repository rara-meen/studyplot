import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Button from "../../components/shared/Button";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await signup({ username, email, password });
    setIsSubmitting(false);
    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12 dark:bg-night">
      <Link
        to="/"
        className="mb-8 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
      >
        <FiArrowLeft size={15} />
        Back to home
      </Link>

      <div className="surface-card w-full max-w-sm p-8">
        <Link to="/" className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
          Study<span className="text-brand-primary">Plot</span>
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-ink-dark-muted">
          Start studying smarter with AI.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-dark-muted">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint dark:text-ink-dark-faint">
                @
              </span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_]+"
                title="Letters, numbers, and underscores only"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-card py-2.5 pl-7 pr-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-dark-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-muted dark:text-ink-dark-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
            />
            <p className="mt-1 text-xs text-ink-faint dark:text-ink-dark-faint">At least 8 characters.</p>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted dark:text-ink-dark-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
