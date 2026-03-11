import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createError } from "./error.js";
import stringify from "fast-json-stable-stringify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load private key once when file loads
const privateKeyPath = path.join(__dirname, "../keys/private.pem");

if (!fs.existsSync(privateKeyPath)) {
  throw new Error("Private key not found. Generate keys first.");
}

const privateKey = fs.readFileSync(privateKeyPath, "utf8");

/**
 * Sign federation payload using RSA-SHA256
 * @param {Object} payload - JSON object to sign
 * @returns {String} Base64 signature
 */
export const signPayload = (payload) => {
  try {
    const sign = crypto.createSign("RSA-SHA256");

    // IMPORTANT: Always stringify the exact same way with fast-json-stable-stringify
    const payloadString = stringify(payload);

    sign.update(payloadString);
    sign.end();

    const signature = sign.sign(privateKey, "base64");

    return signature;

  } catch (error) {
    throw createError(500, "Failed to sign payload");
  }
};
