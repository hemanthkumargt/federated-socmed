import Express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { getPublicKey } from '../controllers/federationController.js';
import  { verifyFederationRequest } from '../middleware/verifyFederationRequest.js';

const router = Express.Router();

router.get("/public-key", getPublicKey);
// router.post("/inbox",verifyFederationRequest,federationInbox)

export default router;   