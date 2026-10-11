import PublicLayout from "./PublicLayout.jsx";
import { APP_NAME, SUPPORT_EMAIL } from "./siteConfig.js";

export default function Support() {
  return (
    <PublicLayout title={`Support – ${APP_NAME}`}>
      <main className="wrap doc">
        <h1>Support</h1>
        <p className="doc-date">We usually reply within a few days.</p>

        <h2>Contact us</h2>
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for
          help, feedback, or privacy and data-deletion requests.
        </p>

        <h2>Disconnect an account</h2>
        <p>
          Sign in to {APP_NAME}, find the account under “Connected accounts”,
          and click <strong>Disconnect</strong>. This removes the account and
          its access details from your session immediately.
        </p>

        <h2>Revoke access from Google</h2>
        <p>
          Go to{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            myaccount.google.com/permissions
          </a>
          , choose {APP_NAME}, and select <strong>Delete all connections</strong>.
        </p>

        <h2>Troubleshooting</h2>
        <ul>
          <li><strong>I was signed out:</strong> sessions last one hour. Sign in with Google again.</li>
          <li><strong>Sign-in is blocked:</strong> some work or school organizations restrict third-party apps. Ask your administrator to allow {APP_NAME}.</li>
          <li><strong>Files are missing:</strong> {APP_NAME} lists the files in the folder you are viewing, up to 100 items per account. Open the folder or use another account filter.</li>
          <li><strong>An account shows an error:</strong> disconnect it and add it again.</li>
        </ul>

        <h2>Policies</h2>
        <p>
          <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a>
        </p>
      </main>
    </PublicLayout>
  );
}
