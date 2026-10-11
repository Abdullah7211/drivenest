import { APP_NAME, SUPPORT_EMAIL } from "./siteConfig.js";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} {APP_NAME}</span>
      <nav aria-label="Legal and support">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms</a>
        <a href="/support">Support</a>
        <a href={`mailto:${SUPPORT_EMAIL}`}>Contact</a>
      </nav>
    </footer>
  );
}
