import crypto from "crypto";

/**
 * Verifies RSA SHA256 signature
 * @param {Object} payload - The federation payload object
 * @param {String} signature - Base64 encoded signature
 * @param {String} publicKey - PEM formatted public key
 * @returns {Boolean}
 */
export const verifySignature = (payload, signature, publicKey) => {
  try {
    const verify = crypto.createVerify("RSA-SHA256");

    // Important: stringify payload consistently
    const payloadString = JSON.stringify(payload);

    verify.update(payloadString);
    verify.end();

    return verify.verify(
      publicKey,
      Buffer.from(signature, "base64")
    );

  } catch (err) {
    return false;
  }
};