import axios from "axios";
import { createError } from "../utils/error.js";


export const sendFederationEvent = async ({
    type,
    actorFederatedId,
    objectFederatedId,
    data = {}
}) => {

    const parts = objectFederatedId.split("@");

    if (parts.length < 2) {
        throw createError(400, "Invalid federatedId format");
    }

    const afterAt = parts[1];
    const targetServer = afterAt.split("/")[0];

    if (targetServer === process.env.SERVER_NAME) {
        throw createError(400, "Cannot federate to local server");
    }

    // TEMP: assume all servers run on localhost with different ports
    // food → 5000
    // sports → 5001
    const serverPortMap = {
        food: 5000,
        sports: 5001
    };

    const port = serverPortMap[targetServer];

    if (!port) {
        throw createError(400, "Unknown target server");
    }

    const payload = {
        type,
        actorFederatedId,
        objectFederatedId,
        data,
        timestamp: Date.now()
    };

    const response = await axios.post(
        `http://localhost:${port}/api/federation/inbox`,
        payload,
    );

    return response.data;
};
