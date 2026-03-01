import TrustedServer from "../models/TrustedServer.js";
import crypto from "crypto";
   import stringify from "fast-json-stable-stringify";

export const verifyFederationRequest = async (req, res, next) => {
  try {
    const originServer = req.headers["x-origin-server"];
    const signature = req.headers["x-signature"];

    if (!originServer || !signature) {
      return res.status(401).json({ message: "Missing federation headers" });
    }

    // Check trusted server
    const trustedServer = await TrustedServer.findOne({
      serverName: originServer,
      isActive: true
    });

    if (!trustedServer) {
      return res.status(403).json({ message: "Untrusted server" });
    }

    const publicKey = trustedServer.publicKey;

    // Verify signature using stable stringify
    const verify = crypto.createVerify("RSA-SHA256");
    const payloadString = stringify(req.body);

    verify.update(payloadString);
    verify.end();

    const isValid = verify.verify(publicKey, signature, "base64");

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Attach verified server info
    req.federation = {
      originServer
    };

    next();

  } catch (error) {
    return res.status(500).json({ message: "Federation verification failed" });
  }
};
