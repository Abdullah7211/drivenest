require("dotenv").config();

const cors = require("cors");
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const { google } = require("googleapis");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
const { Pool } = require("pg");

const app = express();
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const REQUIRED_ENV = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI", // Drive connect callback
  "GOOGLE_LOGIN_REDIRECT_URI", // Google sign-in callback
  "SESSION_SECRET",
  "DATABASE_URL",
  "TOKEN_ENCRYPTION_KEY", // base64 of 32 random bytes
];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing ${key} in backend/.env`);
}

const ENC_KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, "base64");
if (ENC_KEY.length !== 32) {
  throw new Error("TOKEN_ENCRYPTION_KEY must be base64 of exactly 32 bytes.");
}

const githubEnabled = Boolean(
  process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    process.env.GITHUB_REDIRECT_URI
);

/* ---------- Database ---------- */

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: dbUrl,
  ssl: /\.render\.com|neon\.tech|supabase/.test(dbUrl)
    ? { rejectUnauthorized: false }
    : false,
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

    CREATE TABLE IF NOT EXISTS identities (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (provider, provider_user_id)
    );

    CREATE TABLE IF NOT EXISTS drive_accounts (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      refresh_token_enc TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, email)
    );
  `);
}

/* ---------- Token encryption (AES-256-GCM) ---------- */

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64")).join(".");
}

function decrypt(payload) {
  const [iv, tag, enc] = payload.split(".").map((s) => Buffer.from(s, "base64"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/* ---------- Sessions ---------- */

const redisClient = process.env.REDIS_URL
  ? createClient({ url: process.env.REDIS_URL })
  : null;
if (redisClient) {
  redisClient.on("error", (err) => console.error("Redis error:", err.message));
}

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Block cross-site state-changing requests.
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.get("origin") !== FRONTEND_URL) {
    return res.status(403).json({ message: "Forbidden." });
  }
  next();
});

app.use(
  session({
    store: redisClient
      ? new RedisStore({ client: redisClient, prefix: "drivenest:sess:" })
      : undefined,
    name: "mydrivehub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days of inactivity
    },
  })
);

/* ---------- Helpers ---------- */

const GOOGLE_LOGIN_SCOPES = ["openid", "email", "profile"];
const DRIVE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.metadata.readonly";

function googleClient(redirectUri) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

function newState() {
  return crypto.randomBytes(32).toString("hex");
}

function saveSession(req) {
  return new Promise((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );
}

function regenerateSession(req) {
  return new Promise((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve()))
  );
}

function failLogin(res, message) {
  return res.redirect(`${FRONTEND_URL}/login?authError=${encodeURIComponent(message)}`);
}

async function findOrCreateUser({ provider, providerId, email, name }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let r = await client.query(
      `SELECT u.* FROM identities i JOIN users u ON u.id = i.user_id
       WHERE i.provider = $1 AND i.provider_user_id = $2`,
      [provider, providerId]
    );
    let user = r.rows[0];

    if (!user) {
      // Link to an existing DriveNest user with the same VERIFIED email.
      r = await client.query("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
      user = r.rows[0];

      if (!user) {
        r = await client.query(
          "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
          [email, name || email]
        );
        user = r.rows[0];
      }

      await client.query(
        `INSERT INTO identities (user_id, provider, provider_user_id, email)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [user.id, provider, providerId, email]
      );
    }

    await client.query("COMMIT");
    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function logInUser(req, res, user) {
  await regenerateSession(req); // prevents session fixation
  req.session.userId = user.id;
  await saveSession(req);
  res.redirect(FRONTEND_URL);
}

function requireUser(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "NOT_LOGGED_IN", message: "Please log in." });
  }
  next();
}

async function revokeGoogleToken(refreshToken) {
  try {
    await googleClient(process.env.GOOGLE_REDIRECT_URI).revokeToken(refreshToken);
  } catch (err) {
    console.error("Token revoke failed:", err.message);
  }
}

/* ---------- Log in / sign up with Google ---------- */

app.get("/auth/login/google", async (req, res) => {
  try {
    const state = newState();
    req.session.loginState = state;
    const url = googleClient(process.env.GOOGLE_LOGIN_REDIRECT_URI).generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: GOOGLE_LOGIN_SCOPES,
      state,
    });
    await saveSession(req);
    res.redirect(url);
  } catch (err) {
    console.error("Google login start failed:", err.message);
    failLogin(res, "Could not start Google sign-in.");
  }
});

app.get("/auth/login/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return failLogin(res, String(error));

  if (typeof state !== "string" || !req.session.loginState || state !== req.session.loginState) {
    return failLogin(res, "Invalid sign-in state. Please try again.");
  }
  if (typeof code !== "string") return failLogin(res, "Missing authorization code.");
  delete req.session.loginState;

  try {
    const client = googleClient(process.env.GOOGLE_LOGIN_REDIRECT_URI);
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();

    if (!p?.email || !p.email_verified) {
      return failLogin(res, "Your Google email address is not verified.");
    }

    const user = await findOrCreateUser({
      provider: "google",
      providerId: p.sub,
      email: p.email.toLowerCase(),
      name: p.name,
    });
    await logInUser(req, res, user);
  } catch (err) {
    console.error("Google login failed:", err.message);
    failLogin(res, "Google sign-in failed. Please try again.");
  }
});

/* ---------- Log in / sign up with GitHub ---------- */

app.get("/auth/login/github", async (req, res) => {
  if (!githubEnabled) return failLogin(res, "GitHub sign-in is not available.");
  try {
    const state = newState();
    req.session.loginState = state;
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
      scope: "read:user user:email",
      state,
    });
    await saveSession(req);
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  } catch (err) {
    console.error("GitHub login start failed:", err.message);
    failLogin(res, "Could not start GitHub sign-in.");
  }
});

app.get("/auth/login/github/callback", async (req, res) => {
  if (!githubEnabled) return failLogin(res, "GitHub sign-in is not available.");
  const { code, state, error } = req.query;
  if (error) return failLogin(res, String(error));

  if (typeof state !== "string" || !req.session.loginState || state !== req.session.loginState) {
    return failLogin(res, "Invalid sign-in state. Please try again.");
  }
  if (typeof code !== "string") return failLogin(res, "Missing authorization code.");
  delete req.session.loginState;

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return failLogin(res, "GitHub sign-in failed. Please try again.");

    const headers = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DriveNest",
    };
    const profile = await (await fetch("https://api.github.com/user", { headers })).json();
    const emails = await (await fetch("https://api.github.com/user/emails", { headers })).json();

    const verified = Array.isArray(emails) ? emails.filter((e) => e.verified) : [];
    const best = verified.find((e) => e.primary) || verified[0];
    if (!profile?.id || !best?.email) {
      return failLogin(res, "Your GitHub account needs a verified email address.");
    }

    const user = await findOrCreateUser({
      provider: "github",
      providerId: String(profile.id),
      email: best.email.toLowerCase(),
      name: profile.name || profile.login,
    });
    await logInUser(req, res, user);
  } catch (err) {
    console.error("GitHub login failed:", err.message);
    failLogin(res, "GitHub sign-in failed. Please try again.");
  }
});

/* ---------- Connect a Google Drive (needs a DriveNest login) ---------- */

app.get("/auth/google", async (req, res) => {
  if (!req.session.userId) return res.redirect(`${FRONTEND_URL}/login`);
  try {
    const state = newState();
    req.session.oauthState = state;
    const url = googleClient(process.env.GOOGLE_REDIRECT_URI).generateAuthUrl({
      access_type: "offline",
      prompt: "consent select_account",
      include_granted_scopes: true,
      scope: DRIVE_SCOPES,
      state,
    });
    await saveSession(req);
    res.redirect(url);
  } catch {
    res.status(500).send("Could not start Google sign-in.");
  }
});

app.get("/auth/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const back = (msg) => res.redirect(`${FRONTEND_URL}/?authError=${encodeURIComponent(msg)}`);

  if (!req.session.userId) return res.redirect(`${FRONTEND_URL}/login`);
  if (error) return back(String(error));

  if (typeof state !== "string" || !req.session.oauthState || state !== req.session.oauthState) {
    return res.status(403).send("Invalid OAuth state. Please try again.");
  }
  if (typeof code !== "string") return res.status(400).send("Missing authorization code.");
  delete req.session.oauthState;

  try {
    const client = googleClient(process.env.GOOGLE_REDIRECT_URI);
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) return back("Google did not return an ID token.");
    if (!String(tokens.scope || "").includes(DRIVE_SCOPE)) {
      return back("The Google Drive permission was not granted.");
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload();
    if (!p?.email) return back("Could not identify the Google account.");

    const email = p.email.toLowerCase();
    const name = p.name || email;

    if (tokens.refresh_token) {
      await pool.query(
        `INSERT INTO drive_accounts (user_id, email, name, refresh_token_enc)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, email)
         DO UPDATE SET name = EXCLUDED.name, refresh_token_enc = EXCLUDED.refresh_token_enc`,
        [req.session.userId, email, name, encrypt(tokens.refresh_token)]
      );
    } else {
      const r = await pool.query(
        "UPDATE drive_accounts SET name = $3 WHERE user_id = $1 AND email = $2",
        [req.session.userId, email, name]
      );
      if (r.rowCount === 0) {
        return back(
          "Google did not return long-term access. Remove DriveNest at myaccount.google.com/permissions and try again."
        );
      }
    }

    await saveSession(req);
    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error("Drive connect failed:", err.message);
    back("Connecting Google Drive failed. Please try again.");
  }
});

/* ---------- API ---------- */

app.get("/api/me", async (req, res) => {
  try {
    if (!req.session.userId) return res.json({ user: null, connected: false, accounts: [] });

    const u = await pool.query("SELECT email, name FROM users WHERE id = $1", [req.session.userId]);
    if (!u.rows[0]) {
      req.session.destroy(() => {});
      return res.json({ user: null, connected: false, accounts: [] });
    }
    const a = await pool.query(
      "SELECT email, name FROM drive_accounts WHERE user_id = $1 ORDER BY created_at",
      [req.session.userId]
    );
    res.json({ user: u.rows[0], connected: a.rows.length > 0, accounts: a.rows });
  } catch (err) {
    console.error("/api/me failed:", err.message);
    res.status(500).json({ message: "Could not load your account." });
  }
});

app.get("/api/files", requireUser, async (req, res) => {
  const email = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "";

  try {
    const r = await pool.query(
      "SELECT refresh_token_enc FROM drive_accounts WHERE user_id = $1 AND email = $2",
      [req.session.userId, email]
    );
    if (!r.rows[0]) {
      return res.status(404).json({ message: "Connect or select a Google account first." });
    }

    const folderId = typeof req.query.folderId === "string" ? req.query.folderId : "root";

    const oauth2Client = googleClient(process.env.GOOGLE_REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: decrypt(r.rows[0].refresh_token_enc) });

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const result = await drive.files.list({
      q: `'${folderId.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}' in parents and trashed = false`,
      pageSize: 100,
      orderBy: "folder,name",
      fields:
        "nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink,parents)",
    });

    res.json({
      account: email,
      files: result.data.files || [],
      nextPageToken: result.data.nextPageToken || null,
    });
  } catch (err) {
    console.error("Drive API error:", err.message);
    const revoked = /invalid_grant/i.test(err.message);
    res.status(revoked ? 401 : 500).json({
      message: revoked
        ? "Google access for this account was revoked. Disconnect it and add it again."
        : "Could not load this account's Drive files.",
    });
  }
});

app.delete("/api/accounts/:email", requireUser, async (req, res) => {
  const email = req.params.email.toLowerCase();
  try {
    const r = await pool.query(
      "DELETE FROM drive_accounts WHERE user_id = $1 AND email = $2 RETURNING refresh_token_enc",
      [req.session.userId, email]
    );
    if (!r.rows[0]) return res.status(404).json({ message: "Account not found." });

    await revokeGoogleToken(decrypt(r.rows[0].refresh_token_enc));
    res.json({ success: true });
  } catch (err) {
    console.error("Disconnect failed:", err.message);
    res.status(500).json({ message: "Could not remove account." });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "LOGOUT_FAILED" });
    res.clearCookie("mydrivehub.sid");
    res.json({ success: true });
  });
});

// Permanently delete the DriveNest account and everything stored for it.
app.delete("/api/me", requireUser, async (req, res) => {
  try {
    const accounts = await pool.query(
      "SELECT refresh_token_enc FROM drive_accounts WHERE user_id = $1",
      [req.session.userId]
    );
    for (const row of accounts.rows) {
      await revokeGoogleToken(decrypt(row.refresh_token_enc));
    }
    await pool.query("DELETE FROM users WHERE id = $1", [req.session.userId]); // cascades

    req.session.destroy(() => {
      res.clearCookie("mydrivehub.sid");
      res.json({ success: true });
    });
  } catch (err) {
    console.error("Account deletion failed:", err.message);
    res.status(500).json({ message: "Could not delete your account." });
  }
});

/* ---------- Start ---------- */

async function startServer() {
  if (redisClient) {
    await redisClient.connect();
    console.log("Redis session store connected.");
  } else {
    console.log("REDIS_URL not set; using local memory sessions.");
  }

  await initSchema();
  console.log("Database ready.");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DriveNest backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start DriveNest backend:", err.message);
  process.exit(1);
});