import { useEffect } from "react";
import "./site.css";
import logoIcon from "./assets/logo-icon.png";
import { APP_NAME, BACKEND, SUPPORT_EMAIL } from "./siteConfig.js";

export function startSignIn() {
  window.location.href = `${BACKEND}/auth/google`;
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z"/>
      <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/>
    </svg>
  );
}

export function SignInButton({ className = "", children = "Sign in with Google" }) {
  return (
    <button type="button" className={`btn btn-google ${className}`} onClick={startSignIn}>
      <GoogleG />
      {children}
    </button>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      Drive<span>Nest</span>
    </span>
  );
}

export default function PublicLayout({ title, children }) {
  useEffect(() => {
    document.body.classList.add("public-body");
    return () => document.body.classList.remove("public-body");
  }, []);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  return (
    <div className="site">
      <header className="site-header">
        <div className="wrap site-header-inner">
          <a className="site-brand" href="/" aria-label={`${APP_NAME} home`}>
            <img src={logoIcon} alt="" width="40" height="40" />
            <Wordmark />
          </a>
          <nav className="site-nav" aria-label="Main">
            <a href="/#features">Features</a>
            <a href="/#how">How it works</a>
            <a href="/#faq">FAQ</a>
            <a href="/support">Support</a>
          </nav>
          <SignInButton className="btn-small" />
        </div>
      </header>

      {children}

      <footer className="site-footer-public">
        <div className="wrap footer-grid">
          <div>
            <a className="site-brand" href="/">
              <img src={logoIcon} alt="" width="36" height="36" />
              <Wordmark />
            </a>
            <p className="footer-blurb">
              Browse the Google Drive files of all your accounts from one place.
              Read-only by design.
            </p>
          </div>
          <nav aria-label="Footer">
            <h4>Product</h4>
            <a href="/#features">Features</a>
            <a href="/#how">How it works</a>
            <a href="/#faq">FAQ</a>
          </nav>
          <nav aria-label="Legal and support">
            <h4>Legal &amp; support</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/support">Support</a>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </nav>
        </div>
        <div className="wrap footer-legal">
          <p>
            {APP_NAME}&apos;s use and transfer of information received from Google APIs
            adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <p>
            {APP_NAME} is an independent app and is not affiliated with or endorsed by
            Google. Google and Google Drive are trademarks of Google LLC.
          </p>
          <p>© {new Date().getFullYear()} {APP_NAME}</p>
        </div>
      </footer>
    </div>
  );
}
