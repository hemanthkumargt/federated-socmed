import TrustedServer from "../models/TrustedServer.js";
import { createError } from "../utils/error.js";

/**
 * Middleware for authenticating Server-to-Server GET requests.
 * Since GET requests have no body to RSA-verify, this verifies the
 * x-origin-server header against the TrustedServer database.
 */
export const verifyFederatedServer = async (req, res, next) => {
    try {
        const originServer = req.headers["x-origin-server"];

        if (!originServer) {
            return next(createError(401, "Missing x-origin-server header"));
        }

        const trustedServer = await TrustedServer.findOne({
            serverName: originServer,
            isActive: true
        });

        if (!trustedServer) {
            return next(createError(403, "Server is not trusted or federation is paused"));
        }

        req.federation = {
            originServer: trustedServer.serverName,
            serverUrl: trustedServer.serverUrl
        };

        next();
    } catch (err) {
        next(err);
    }
};
