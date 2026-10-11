import "./App.css";
import SiteFooter from "./SiteFooter.jsx";
import { APP_NAME, SUPPORT_EMAIL, PRIVACY_EFFECTIVE_DATE } from "./siteConfig.js";

export default function Privacy() {
  return (
    <main className="app">
      <header className="topbar">
        <a className="brand brand-link" href="/">
          <div className="brand-icon">D</div>
          <div>
            <h1>{APP_NAME}</h1>
            <p>All your Google Drives, one place</p>
          </div>
        </a>
      </header>

      <article className="content legal">
        <h2>Privacy Policy for {APP_NAME}</h2>
        <p className="legal-date">Effective date: {PRIVACY_EFFECTIVE_DATE}</p>

        <h3>1. Introduction</h3>
        <p>
          {APP_NAME} (https://drivenest.app) is a web application that lets you
          connect one or more Google accounts and browse the file listings of
          their Google Drive in a single interface. This policy explains what
          information {APP_NAME} accesses, why, how it is stored, and how you
          can disconnect your accounts.
        </p>

        <h3>2. Information we access</h3>
        <p>When you connect a Google account, {APP_NAME} requests these Google OAuth scopes:</p>
        <ul>
          <li><strong>openid</strong> and <strong>email</strong>: to identify the Google account you connected (your email address and, if Google provides it, your display name).</li>
          <li>
            <strong>https://www.googleapis.com/auth/drive.metadata.readonly</strong>:
            read-only access to Google Drive file metadata. {APP_NAME} reads
            only each item's ID, name, type, last-modified time, size, link,
            icon, thumbnail link, and parent folder. This scope does not allow
            {" "}{APP_NAME} to read the contents of your files, and {APP_NAME} cannot create, edit, move, or delete anything in your Drive.
          </li>
        </ul>
        <p>
          {APP_NAME} also uses a session cookie to keep you signed in, and
          standard server logs (such as request time and errors) to operate and
          secure the service.
        </p>

        <h3>3. How we use information</h3>
        <p>
          Google user data is used only to provide the features you see in the
          app: listing the files and folders of the Google accounts you
          connect, letting you search the listed files by name, switching
          between connected accounts, and opening a file in Google Drive using
          its link. We do not use Google user data for advertising, profiling,
          or any purpose unrelated to these features.
        </p>

        <h3>4. Google API Services User Data Policy (Limited Use)</h3>
        <p>
          {APP_NAME}'s use and transfer to any other app of information
          received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We do not sell Google user
          data, do not transfer it to third parties except as needed to
          provide the service or as required by law, and do not allow humans to
          read it except with your consent, for security purposes, or to comply
          with the law. We do not use Google user data to develop, improve, or
          train generalized AI or machine-learning models.
        </p>

        <h3>5. How data is stored and protected</h3>
        <ul>
          <li>Your connected accounts' email addresses, display names, and Google OAuth tokens (including the refresh token) are kept in a server-side session, stored in a Redis database on {APP_NAME}'s backend. They are not exposed to your browser; your browser only holds an opaque, HTTP-only session cookie.</li>
          <li>Sessions expire automatically after one hour of the session cookie's lifetime. After that, the stored tokens and account details are removed and you need to connect your account again.</li>
          <li>Drive file metadata is fetched from Google each time you browse and is passed through to your browser. {APP_NAME} does not keep a database or copy of your file listings.</li>
          <li>All traffic between your browser, {APP_NAME}, and Google is encrypted with HTTPS. Session cookies are marked secure and HTTP-only.</li>
        </ul>

        <h3>6. Data sharing</h3>
        <p>
          We do not sell or rent your data and do not share it with advertisers.
          Data is processed only by the infrastructure providers needed to run
          the service: Cloudflare (website hosting and delivery), Render (backend
          hosting), and our managed Redis provider (session storage). We may
          also disclose information if required by law or to protect against
          security threats or abuse.
        </p>

        <h3>7. Retention, disconnecting, and deletion</h3>
        <ul>
          <li>Use the <strong>Disconnect</strong> button next to an account in {APP_NAME} to immediately remove that account and its tokens from your session.</li>
          <li>Any remaining session data is deleted automatically when the session expires (within one hour).</li>
          <li>You can also revoke {APP_NAME}'s access to your Google account at any time at{" "}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.
          </li>
          <li>To ask about or request deletion of any data related to you, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</li>
        </ul>

        <h3>8. Third-party services</h3>
        <p>
          {APP_NAME} relies on Google for sign-in and Google Drive API access.
          Google processes your data under its own{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>

        <h3>9. Children's privacy</h3>
        <p>
          {APP_NAME} is not directed to children under 13, and we do not
          knowingly collect personal information from them. If you believe a
          child has used the service, contact us and we will take appropriate action.
        </p>

        <h3>10. Changes to this policy</h3>
        <p>
          We may update this policy when the app or legal requirements change.
          The current version is always available at https://drivenest.app/privacy
          with its effective date.
        </p>

        <h3>11. Contact</h3>
        <p>
          Questions about privacy or data deletion:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}