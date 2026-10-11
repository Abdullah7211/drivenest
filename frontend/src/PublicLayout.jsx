import { useEffect } from "react";
import "./site.css";
import logoIcon from "./assets/logo-icon.png";
import { APP_NAME, SUPPORT_EMAIL } from "./siteConfig.js";

export function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z"/>
      <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/>
    </svg>
  );
}

export function GithubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
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
          <div className="site-actions">
            <a className="btn btn-ghost btn-small" href="/login">Log in</a>
            <a className="btn btn-primary btn-small" href="/signup">Sign up</a>
          </div>
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
