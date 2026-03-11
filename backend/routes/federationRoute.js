import Express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import {
    getPublicKey,
    addTrustedServer,
    getTrustedServers,
    removeTrustedServer,
    toggleTrustedServer
} from '../controllers/federationController.js';
import { verifyFederationRequest } from '../middleware/verifyFederationRequest.js';
import { federationInbox } from '../controllers/federationInboxController.js';
import { verifyFederatedServer } from '../middleware/verifyFederatedServer.js';
import { federationFeed } from '../controllers/federationFeedController.js';
import { searchLocalUsers } from '../services/searchService.js';

const router = Express.Router();

// Public / Inbox / Feed
router.get("/public-key", getPublicKey);
router.post("/inbox", verifyFederationRequest, federationInbox);
router.get("/feed", verifyFederatedServer, federationFeed);

// Federation user search — called by other servers to search users on this server
router.get("/search", async (req, res) => {
    try {
        const { username, limit = 10 } = req.query;
        if (!username) return res.json({ success: true, users: [] });
        const users = await searchLocalUsers(username, parseInt(limit));
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Trusted Server Management (Admin Only)
router.post("/trusted-servers", verifyToken, verifyAdmin, addTrustedServer);
router.get("/trusted-servers", verifyToken, verifyAdmin, getTrustedServers);
router.put("/trusted-servers/:id/toggle", verifyToken, verifyAdmin, toggleTrustedServer);
router.delete("/trusted-servers/:id", verifyToken, verifyAdmin, removeTrustedServer);

export default router;