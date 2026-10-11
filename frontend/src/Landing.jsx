import PublicLayout from "./PublicLayout.jsx";
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
  ["Create your account", "Sign up with Google or GitHub. This becomes your DriveNest account."],
  ["Connect your Drives", "Add each Google account you want to see and approve read-only access to file details."],
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
  ["Does DriveNest store my files?", "No. File listings are fetched from Google when you browse and are never saved. DriveNest stores your account (email and name) and, for each Drive you connect, an encrypted access key so it stays connected. You can delete all of it at any time."],
  ["How do I sign up?", "Choose Sign up and continue with Google or GitHub. That login becomes your DriveNest account. Connecting a Google Drive is a separate step."],
  ["How do I disconnect an account or delete mine?", "Use Disconnect next to a Drive inside DriveNest, or “Delete my account” in the account menu to erase everything. You can also remove access at myaccount.google.com/permissions."],
  ["Why am I asked to log in again?", "Logins expire after 7 days without activity. Your connected Drives stay linked to your account, so you only need to log in."],
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
                <a className="btn btn-primary" href="/signup">Sign up</a>
                <a className="btn btn-ghost" href="/login">Log in</a>
              </div>
              <p className="fine">
                Sign up with Google or GitHub. Connecting a Drive asks for
                read-only access to file details only.{" "}
                <a href="#how">See how it works</a> · <a href="/privacy">Privacy Policy</a>
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
              Details are in the <a href="/privacy">Privacy Policy</a>. File
              listings are never stored, and you can disconnect a Drive or
              delete your account at any time.
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
            <p>Sign up with Google or GitHub and add your first Drive in under a minute.</p>
            <a className="btn btn-google btn-light" href="/signup">Create your account</a>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
