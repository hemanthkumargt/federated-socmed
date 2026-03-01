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

const router = Express.Router();

// Public / Inbox
router.get("/public-key", getPublicKey);
router.post("/inbox", verifyFederationRequest, federationInbox);

// Trusted Server Management (Admin Only)
router.post("/trusted-servers", verifyToken, verifyAdmin, addTrustedServer);
router.get("/trusted-servers", verifyToken, verifyAdmin, getTrustedServers);
router.patch("/trusted-servers/:id/toggle", verifyToken, verifyAdmin, toggleTrustedServer);
router.delete("/trusted-servers/:id", verifyToken, verifyAdmin, removeTrustedServer);

export default router;   