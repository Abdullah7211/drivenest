import { useCallback, useEffect, useState } from "react";
import "./App.css";
import SiteFooter from "./SiteFooter.jsx";
import { APP_NAME } from "./siteConfig.js";

const BACKEND =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const FOLDER_MIME = "application/vnd.google-apps.folder";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSize(size) {
  if (size == null) return "—";

  const bytes = Number(size);

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;

  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function App() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [files, setFiles] = useState([]);
  const [folderId, setFolderId] = useState("root");
  const [folderStack, setFolderStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const connected = accounts.length > 0;

  const checkAccounts = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND}/api/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not check connected accounts.");
      }

      const data = await response.json();
      const connectedAccounts = data.accounts || [];

      setAccounts(connectedAccounts);

      setSelectedAccount((current) => {
        if (
          current !== "all" &&
          !connectedAccounts.some((account) => account.email === current)
        ) {
          return "all";
        }

        return current;
      });
    } catch {
      setError(
        "Cannot reach the backend. Start the Node.js server on port 3000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFiles = useCallback(async () => {
    if (!accounts.length) {
      setFiles([]);
      return;
    }

    setFilesLoading(true);
    setError("");

    try {
      const accountsToLoad =
        selectedAccount === "all"
          ? accounts
          : accounts.filter(
              (account) => account.email === selectedAccount
            );

      const results = await Promise.all(
        accountsToLoad.map(async (account) => {
          const params = new URLSearchParams({
            account: account.email,
            folderId,
          });

          const response = await fetch(`${BACKEND}/api/files?${params}`, {
            credentials: "include",
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              `${account.email}: ${
                data.message || "Could not load files."
              }`
            );
          }

          return (data.files || []).map((file) => ({
            ...file,
            accountEmail: account.email,
            accountName: account.name || account.email,
          }));
        })
      );

      setFiles(results.flat());
    } catch (err) {
      setFiles([]);
      setError(err.message || "Could not load files.");
    } finally {
      setFilesLoading(false);
    }
  }, [accounts, selectedAccount, folderId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");

    if (authError) {
      setError(`Google sign-in was not completed: ${authError}`);
      window.history.replaceState({}, "", "/");
    }

    checkAccounts();
  }, [checkAccounts]);

  useEffect(() => {
    if (connected) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [connected, loadFiles]);

  function resetFolderNavigation() {
    setFolderId("root");
    setFolderStack([]);
    setSearch("");
  }

  function changeAccount(email) {
    setSelectedAccount(email);
    resetFolderNavigation();
  }

  function openFolder(folder) {
    setFolderStack((previous) => [
      ...previous,
      {
        account: selectedAccount,
        folderId,
        name: folder.name,
      },
    ]);

    // A folder always belongs to one particular Google account.
    setSelectedAccount(folder.accountEmail);
    setFolderId(folder.id);
    setSearch("");
  }

  function goBack() {
    const previous = folderStack[folderStack.length - 1];

    if (!previous) return;

    setFolderStack((stack) => stack.slice(0, -1));
    setSelectedAccount(previous.account);
    setFolderId(previous.folderId);
    setSearch("");
  }

  async function removeAccount(email) {
    const confirmed = window.confirm(
      `Disconnect ${email} from ${APP_NAME}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${BACKEND}/api/accounts/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not disconnect account.");
      }

      const remaining = accounts.filter(
        (account) => account.email.toLowerCase() !== email.toLowerCase()
      );

      setAccounts(remaining);

      if (
        selectedAccount.toLowerCase() === email.toLowerCase()
      ) {
        setSelectedAccount("all");
        setFolderId("root");
        setFolderStack([]);
      }

      setError("");
    } catch (err) {
      setError(err.message || "Could not disconnect account.");
    }
  }

  const visibleFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">D</div>
          <div>
            <h1>{APP_NAME}</h1>
            <p>All your Google Drives, one place</p>
          </div>
        </div>

        <div className="account">
          {connected && (
            <>
              <span className="status-dot" />
              <span>
                {accounts.length} account
                {accounts.length === 1 ? "" : "s"} connected
              </span>
            </>
          )}

          <button
            className="primary-button"
            onClick={() => {
              window.location.href = `${BACKEND}/auth/google`;
            }}
          >
            + Add Google Account
          </button>
        </div>
      </header>

      <section className="content">
        {error && <div className="error">{error}</div>}

        {!connected ? (
          <div className="landing">
            <div className="welcome">
              <div className="welcome-icon">☁</div>
              <h2>Your Google Drives, organized in one place.</h2>
              <p>
                {APP_NAME} is a web application that lets you connect one or
                more Google accounts and browse their Google Drive files and
                folders together in a single, searchable list.
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  window.location.href = `${BACKEND}/auth/google`;
                }}
              >
                Sign in with Google
              </button>

              <small>
                {APP_NAME} requests read-only access to Google Drive file
                metadata (names, types, dates, sizes, and links). It cannot
                read file contents or change, upload, or delete anything. See
                our <a href="/privacy">Privacy Policy</a>.
              </small>
            </div>

            <div className="feature-grid">
              <div className="feature">
                <h3>Connect multiple accounts</h3>
                <p>Add as many Google accounts as you need and see them side by side.</p>
              </div>
              <div className="feature">
                <h3>Browse files and folders</h3>
                <p>View names, last-modified dates, and sizes, and open folders to go deeper.</p>
              </div>
              <div className="feature">
                <h3>Search and switch accounts</h3>
                <p>Search listed files by name and filter by a single account or all of them.</p>
              </div>
              <div className="feature">
                <h3>Disconnect any time</h3>
                <p>Remove an account from {APP_NAME} with one click, or revoke access in your Google Account.</p>
              </div>
            </div>

            <p className="landing-note">
              {APP_NAME}'s use of information received from Google APIs adheres
              to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </div>
        ) : (
          <>
            <div className="heading-row">
              <div>
                <h2>
                  {selectedAccount === "all"
                    ? "All Drives"
                    : accounts.find(
                        (account) => account.email === selectedAccount
                      )?.name || selectedAccount}
                </h2>

                <p>
                  {selectedAccount === "all"
                    ? "Browse files from all connected Google accounts"
                    : selectedAccount}
                </p>
              </div>

              <span className="file-count">
                {visibleFiles.length} items
              </span>
            </div>

            <div className="toolbar">
              <input
                className="search"
                type="search"
                placeholder={
                  selectedAccount === "all"
                    ? "Search across all drives..."
                    : "Search this Drive folder..."
                }
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                className="account-select"
                value={selectedAccount}
                onChange={(event) => changeAccount(event.target.value)}
                aria-label="Choose Google Drive account"
              >
                <option value="all">All Drives</option>

                {accounts.map((account) => (
                  <option key={account.email} value={account.email}>
                    {account.email}
                  </option>
                ))}
              </select>

              <button
                className="secondary-button"
                disabled={folderStack.length === 0}
                onClick={goBack}
              >
                ← Back
              </button>
            </div>

            <div className="connected-accounts">
              <strong>Connected accounts</strong>

              {accounts.map((account) => (
                <div className="connected-account" key={account.email}>
                  <button
                    className="account-link"
                    onClick={() => changeAccount(account.email)}
                  >
                    <span className="status-dot" />
                    <span>{account.email}</span>
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => removeAccount(account.email)}
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>

            {filesLoading ? (
              <div className="center">Loading files…</div>
            ) : visibleFiles.length === 0 ? (
              <div className="empty">
                {search
                  ? "No matching files found."
                  : "No files found in this folder."}
              </div>
            ) : (
              <div className="file-list">
                <div className="file-row file-header">
                  <span>Name</span>
                  <span>Google account</span>
                  <span>Last modified</span>
                  <span>Size</span>
                </div>

                {visibleFiles.map((file) => {
                  const isFolder = file.mimeType === FOLDER_MIME;

                  return (
                    <div
                      className="file-row"
                      key={`${file.accountEmail}:${file.id}`}
                    >
                      <button
                        className="file-name"
                        title={file.name}
                        onClick={() => {
                          if (isFolder) {
                            openFolder(file);
                          } else if (file.webViewLink) {
                            window.open(
                              file.webViewLink,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                      >
                        <span className="file-icon">
                          {isFolder ? "📁" : "📄"}
                        </span>
                        <span className="name-text">{file.name}</span>
                      </button>

                      <span className="file-account">
                        {file.accountEmail}
                      </span>

                      <span className="file-date">
                        {formatDate(file.modifiedTime)}
                      </span>

                      <span className="file-size">
                        {isFolder ? "—" : formatSize(file.size)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="footer-note">
              Files remain in their original Google Drives. All Drives
              combines the root folders and files from every connected
              account. Search covers the currently listed files.
            </p>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

export default App;