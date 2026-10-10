
require("dotenv").config();

const cors = require("cors");
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const { google } = require("googleapis");

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const REQUIRED_ENV = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "SESSION_SECRET",
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing ${key} in backend/.env`);
  }
}

app.use(
  session({
    name: "mydrivehub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
    },
  })
);

const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function requireGoogleAuth(req, res, next) {
  if (!req.session.googleTokens) {
    return res.status(401).json({
      error: "NOT_CONNECTED",
      message: "Connect your Google account first.",
    });
  }

  next();
}

app.get("/auth/google", (req, res) => {
  const oauth2Client = createOAuthClient();
  const state = crypto.randomBytes(32).toString("hex");

  req.session.oauthState = state;

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    include_granted_scopes: true,
    scope: SCOPES,
    state,
  });

  req.session.save((err) => {
    if (err) {
      return res.status(500).send("Could not start Google sign-in.");
    }

    res.redirect(url);
  });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(
      `${FRONTEND_URL}/?authError=${encodeURIComponent(error)}`
    );
  }

  if (
    typeof state !== "string" ||
    !req.session.oauthState ||
    state !== req.session.oauthState
  ) {
    return res.status(403).send("Invalid OAuth state. Please try again.");
  }

  if (typeof code !== "string") {
    return res.status(400).send("Missing authorization code.");
  }

  delete req.session.oauthState;

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
      return res.status(401).send("Google did not return an ID token.");
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(401).send("Could not identify the Google account.");
    }

    const email = payload.email.toLowerCase();

    if (!req.session.googleAccounts) {
      req.session.googleAccounts = {};
    }

    const previous = req.session.googleAccounts[email];

    req.session.googleAccounts[email] = {
      email,
      name: payload.name || email,
      tokens: {
        ...(previous?.tokens || {}),
        ...tokens,
      },
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save failed:", err);
        return res.status(500).send("Could not save the account.");
      }

      res.redirect(FRONTEND_URL);
    });
  } catch (err) {
    console.error("Google OAuth error:", err.message);
    res.status(500).send("Google sign-in failed. Check the backend terminal.");
  }
});

app.get("/api/me", (req, res) => {
  const accounts = Object.values(req.session.googleAccounts || {}).map(
    ({ email, name }) => ({ email, name })
  );

  res.json({
    connected: accounts.length > 0,
    accounts,
  });
});

app.get("/api/files", async (req, res) => {
  const email =
    typeof req.query.account === "string"
      ? req.query.account.toLowerCase()
      : "";

  const account = req.session.googleAccounts?.[email];

  if (!account) {
    return res.status(401).json({
      message: "Connect or select a Google account first.",
    });
  }

  try {
    const folderId =
      typeof req.query.folderId === "string"
        ? req.query.folderId
        : "root";

    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(account.tokens);

    oauth2Client.on("tokens", (newTokens) => {
      const accounts = req.session.googleAccounts || {};
      const current = accounts[email];

      if (current) {
        accounts[email] = {
          ...current,
          tokens: {
            ...current.tokens,
            ...newTokens,
          },
        };

        req.session.googleAccounts = accounts;
        req.session.save(() => {});
      }
    });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

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

    res.status(500).json({
      message: "Could not load this account's Drive files.",
    });
  }
});

app.delete("/api/accounts/:email", (req, res) => {
  const email = req.params.email.toLowerCase();
  const accounts = req.session.googleAccounts || {};

  if (!accounts[email]) {
    return res.status(404).json({ message: "Account not found." });
  }

  delete accounts[email];
  req.session.googleAccounts = accounts;

  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not remove account." });
    }

    res.json({ success: true });
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "LOGOUT_FAILED",
      });
    }

    res.clearCookie("mydrivehub.sid");
    res.json({ success: true });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DriveNest backend running on port ${PORT}`);
});
