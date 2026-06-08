#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { readFile, writeFile, chmod } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

const clientPath = process.argv[2];
const outputPath =
  process.argv[3] || "/private/tmp/agentics-google-docs-secrets.env";

if (!clientPath) {
  console.error(
    "Usage: node .github/scripts/google-oauth-authorize.mjs <client-json> [output-env-file]",
  );
  process.exit(1);
}

const clientConfig = JSON.parse(await readFile(clientPath, "utf8"));
const client = clientConfig.installed || clientConfig.web;

if (!client?.client_id || !client?.client_secret) {
  throw new Error("OAuth client JSON is missing client_id or client_secret.");
}

const state = randomBytes(24).toString("hex");
const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
];

let resolveCallback;
let rejectCallback;
const callback = new Promise((resolve, reject) => {
  resolveCallback = resolve;
  rejectCallback = reject;
});

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");

  if (url.pathname !== "/oauth2/callback") {
    response.writeHead(404).end("Not found");
    return;
  }

  const error = url.searchParams.get("error");
  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (error || returnedState !== state || !code) {
    response
      .writeHead(400, { "content-type": "text/plain" })
      .end("Authorization failed. You can close this window.");
    rejectCallback(
      new Error(error || "OAuth callback state or authorization code invalid."),
    );
    return;
  }

  response
    .writeHead(200, { "content-type": "text/plain" })
    .end("Authorization complete. You can close this window.");
  resolveCallback(code);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
const redirectUri = `http://127.0.0.1:${address.port}/oauth2/callback`;
const authorizationUrl = new URL(client.auth_uri);
authorizationUrl.search = new URLSearchParams({
  client_id: client.client_id,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: scopes.join(" "),
  access_type: "offline",
  prompt: "consent",
  include_granted_scopes: "true",
  state,
}).toString();

console.log("Opening Google authorization in your browser...");
console.log(`If it does not open, visit:\n${authorizationUrl}\n`);
spawn("open", [authorizationUrl.toString()], {
  detached: true,
  stdio: "ignore",
}).unref();

try {
  const code = await callback;
  const tokenResponse = await fetch(client.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: client.client_id,
      client_secret: client.client_secret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(
      `Token exchange failed: ${tokens.error_description || tokens.error}`,
    );
  }
  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke the app grant and authorize again.",
    );
  }

  const envFile = [
    `GOOGLE_OAUTH_CLIENT_ID=${client.client_id}`,
    `GOOGLE_OAUTH_CLIENT_SECRET=${client.client_secret}`,
    `GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`,
    "",
  ].join("\n");

  await writeFile(outputPath, envFile, { mode: 0o600 });
  await chmod(outputPath, 0o600);
  console.log(`Credentials written to ${outputPath} with mode 600.`);
  console.log("Credential values were not printed.");
} finally {
  server.close();
}
