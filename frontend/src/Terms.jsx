import PublicLayout from "./PublicLayout.jsx";
import { APP_NAME, SUPPORT_EMAIL, LEGAL_DATE } from "./siteConfig.js";

export default function Terms() {
  return (
    <PublicLayout title={`Terms of Service – ${APP_NAME}`}>
      <article className="wrap doc">
        <h1>Terms of Service</h1>
        <p className="doc-date">Effective date: {LEGAL_DATE}</p>

        <h2>1. Agreement</h2>
        <p>
          By using {APP_NAME} (https://drivenest.app) you agree to these terms
          and to our <a href="/privacy">Privacy Policy</a>. If you do not agree,
          do not use the service.
        </p>

        <h2>2. The service</h2>
        <p>
          {APP_NAME} lets you connect Google accounts and browse the file
          metadata of their Google Drive in one interface. It requests
          read-only access and cannot read, change, share or delete the
          contents of your files.
        </p>

        <h2>3. Your accounts</h2>
        <p>
          You may only connect Google accounts that you own or are authorized
          to use. You are responsible for activity under your connected
          accounts and for following Google&apos;s terms and any policies of your
          organization.
        </p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to misuse the service, including by attempting to:</p>
        <ul>
          <li>access accounts or data that are not yours;</li>
          <li>disrupt, overload or probe the service for vulnerabilities;</li>
          <li>reverse engineer or automate the service in ways that harm others; or</li>
          <li>use it for any unlawful purpose.</li>
        </ul>

        <h2>5. Google services</h2>
        <p>
          {APP_NAME} depends on Google sign-in and the Google Drive API.
          Google&apos;s services are governed by Google&apos;s own terms. {APP_NAME} is
          independent and is not affiliated with or endorsed by Google.
        </p>

        <h2>6. Disconnecting and ending use</h2>
        <p>
          You can disconnect any account at any time inside {APP_NAME} or revoke
          access at myaccount.google.com/permissions. We may suspend or
          restrict access if these terms are violated or to protect the service.
        </p>

        <h2>7. Disclaimer</h2>
        <p>
          The service is provided “as is” and “as available”, without
          warranties of any kind. We do not guarantee that it will be
          uninterrupted or error-free.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the extent permitted by law, {APP_NAME} is not liable for indirect
          or consequential damages, or for loss of data, arising from your use
          of the service.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these terms. The current version is always published at
          https://drivenest.app/terms with its effective date.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </article>
    </PublicLayout>
  );
}
