import PublicLayout, { SignInButton } from "./PublicLayout.jsx";
import { APP_NAME } from "./siteConfig.js";

const FEATURES = [
  ["Connect several Google accounts", "Add your personal, school and work accounts and keep them connected side by side."],
  ["See every Drive in one list", "Files and folders from all connected accounts appear together, each labeled with the account it belongs to."],
  ["Browse folders", "Open any folder, go back, and move between accounts without signing out and in again."],
  ["Search by name", "Type part of a file name to narrow the list instantly."],
  ["Open files in Google Drive", "Click a file to open it in Google Drive. Your files always stay where they are."],
  ["Disconnect with one click", "Remove an account from DriveNest at any time, or revoke access from your Google Account."],
];

const STEPS = [
  ["Sign in with Google", "Choose the Google account you want to add and approve read-only access to file details."],
  ["Add more accounts", "Use “Add Google Account” to connect as many accounts as you like."],
  ["Browse, search, open", "Switch between all Drives or a single account, search, and open files in Google Drive."],
];

const CAN = [
  "See file and folder names, types, last-modified dates and sizes",
  "Link you to a file so it opens in Google Drive",
  "Show several accounts at once in one list",
];
const CANT = [
  "Read the contents of your files",
  "Create, edit, move, share or delete anything",
  "Sell or share your data, or use it for advertising",
];

const FAQ = [
  ["What does DriveNest do?", `${APP_NAME} is a web app that lets you connect several Google accounts and browse their Google Drive files and folders together in one searchable list.`],
  ["What permission does it ask for?", "Read-only access to Google Drive file metadata (names, types, dates, sizes and links), plus your email address so it can tell your accounts apart. It cannot open or change the contents of your files."],
  ["Does DriveNest store my files?", "No. File listings are fetched from Google when you browse and are not saved in a database. Sign-in details are kept in a temporary, server-side session that expires after one hour."],
  ["How do I disconnect an account?", "Use the Disconnect button next to the account inside DriveNest. You can also remove access at myaccount.google.com/permissions."],
  ["Why am I asked to sign in again?", "For your security, sessions last one hour. After that, sign in with Google to reconnect your accounts."],
  ["Does it work with work or school accounts?", "It works with Google accounts, but some organizations restrict which apps can access Drive. If sign-in is blocked, ask your administrator."],
];

function Mockup() {
  const rows = [
    ["📁", "Project photos", "you@gmail.com", "a", "Oct 8, 2026", "—"],
    ["📄", "Thesis draft.docx", "you@university.edu", "b", "Oct 6, 2026", "240 KB"],
    ["📁", "Receipts 2026", "you@gmail.com", "a", "Sep 29, 2026", "—"],
    ["📄", "Lecture notes.pdf", "you@university.edu", "b", "Sep 21, 2026", "1.2 MB"],
    ["📄", "Budget.xlsx", "you@gmail.com", "a", "Sep 14, 2026", "88 KB"],
  ];
  return (
    <figure className="mock" aria-label="Example of the DriveNest file list">
      <div className="mock-bar">
        <span className="mock-title">All Drives</span>
        <span className="chip chip-ok">2 accounts connected</span>
      </div>
      <div className="mock-search">Search across all drives…</div>
      <ul className="mock-list">
        {rows.map(([icon, name, acc, tone, date, size]) => (
          <li key={name}>
            <span className="mock-name"><i>{icon}</i>{name}</span>
            <span className={`chip chip-${tone}`}>{acc}</span>
            <span className="mock-meta">{date}</span>
            <span className="mock-meta">{size}</span>
          </li>
        ))}
      </ul>
      <figcaption>Example view with sample files</figcaption>
    </figure>
  );
}

export default function Landing({ error }) {
  return (
    <PublicLayout title="DriveNest – All your Google Drives in one place">
      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              {error && <div className="site-error" role="alert">{error}</div>}
              <h1>Every Google Drive you own, in one list.</h1>
              <p className="lead">
                {APP_NAME} connects your Google accounts and lets you browse,
                search and open files from all of them in one place. It is
                read-only, so it can never change or delete a thing.
              </p>
              <div className="hero-actions">
                <SignInButton />
                <a className="btn btn-ghost" href="#how">See how it works</a>
              </div>
              <p className="fine">
                Requests read-only access to file details only. Read our{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </div>
            <Mockup />
          </div>
        </section>

        <section id="features" className="section">
          <div className="wrap">
            <h2>Everything you need to find your files</h2>
            <p className="section-lead">No more switching accounts to remember where a file lives.</p>
            <div className="feature-list">
              {FEATURES.map(([t, d]) => (
                <div className="feature-row" key={t}>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="section section-tint">
          <div className="wrap">
            <h2>How it works</h2>
            <ol className="steps">
              {STEPS.map(([t, d], i) => (
                <li key={t}>
                  <span className="step-n">{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="trust" className="section">
          <div className="wrap">
            <h2>Read-only, and clear about your data</h2>
            <p className="section-lead">
              {APP_NAME} asks only for the Google Drive metadata permission.
              Here is exactly what that means.
            </p>
            <div className="cancant">
              <div>
                <h3>{APP_NAME} can</h3>
                <ul className="tick">{CAN.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <h3>{APP_NAME} cannot</h3>
                <ul className="cross">{CANT.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <p className="fine">
              Details are in the <a href="/privacy">Privacy Policy</a>. Sessions
              expire after one hour and file listings are never stored.
            </p>
          </div>
        </section>

        <section id="faq" className="section section-tint">
          <div className="wrap narrow">
            <h2>Frequently asked questions</h2>
            <div className="faq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="wrap cta-inner">
            <h2>Bring your Drives together.</h2>
            <p>Sign in with Google and add your first account in under a minute.</p>
            <SignInButton className="btn-light" />
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
