const path = require("path");
const fs = require("fs");

// Load environment variables
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Monkeypatch the emailSender utility
const emailSender = require("./utils/emailSender");

const originalSendInviteEmail = emailSender.sendInviteEmail;
emailSender.sendInviteEmail = async (email, name, token) => {
  console.log(`[QA_TOKEN] inviteToken:${token} email:${email}`);
  const tokenFile = path.resolve(__dirname, "../../qa-automation/latest_token.json");
  fs.writeFileSync(tokenFile, JSON.stringify({ type: 'invite', email, name, token }, null, 2));
  return originalSendInviteEmail(email, name, token);
};

const originalSendResetEmail = emailSender.sendResetEmail;
emailSender.sendResetEmail = async (email, name, token) => {
  console.log(`[QA_TOKEN] resetToken:${token} email:${email}`);
  const tokenFile = path.resolve(__dirname, "../../qa-automation/latest_token.json");
  fs.writeFileSync(tokenFile, JSON.stringify({ type: 'reset', email, name, token }, null, 2));
  return originalSendResetEmail(email, name, token);
};

// Start the server
require("./server.js");
