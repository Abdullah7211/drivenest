import { useEffect, useState } from "react";
import PublicLayout, { GoogleG, GithubMark } from "./PublicLayout.jsx";
import logoIcon from "./assets/logo-icon.png";
import { APP_NAME, BACKEND } from "./siteConfig.js";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    if (authError) {
      setError(authError);
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetch(`${BACKEND}/api/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) window.location.replace("/");
      })
      .catch(() => {});
  }, []);

  return (
    <PublicLayout title={`${isSignup ? "Sign up" : "Log in"} – ${APP_NAME}`}>
      <main className="auth-wrap">
        <div className="auth-card">
          <img src={logoIcon} alt="" width="56" height="56" />
          <h1>{isSignup ? "Create your DriveNest account" : "Welcome back"}</h1>
          <p className="auth-sub">
            {isSignup
              ? "Sign up with Google or GitHub. You will connect your Google Drives next."
              : "Log in with the account you used to sign up."}
          </p>

          {error && <div className="site-error" role="alert">{error}</div>}

          <a className="btn btn-google btn-block" href={`${BACKEND}/auth/login/google`}>
            <GoogleG />
            Continue with Google
          </a>
          <a className="btn btn-github btn-block" href={`${BACKEND}/auth/login/github`}>
            <GithubMark />
            Continue with GitHub
          </a>

          <p className="auth-note">
            Logging in only shares your name and email with {APP_NAME}. Access
            to Google Drive is a separate, optional step, and it is read-only.
          </p>

          <p className="auth-switch">
            {isSignup ? (
              <>Already have an account? <a href="/login">Log in</a></>
            ) : (
              <>New to {APP_NAME}? <a href="/signup">Sign up</a></>
            )}
          </p>

          <p className="auth-legal">
            By continuing you agree to the <a href="/terms">Terms</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </PublicLayout>
  );
}
