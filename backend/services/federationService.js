import axios from "axios";
import TrustedServer from "../models/TrustedServer.js";
import FederationEvent from "../models/FederationEvent.js";
import { signPayload } from "../utils/signPayload.js";
import stringify from "fast-json-stable-stringify";
import { createError } from "../utils/error.js";

// export const sendFederationEvent = async ({
//   type,
//   actorFederatedId,
//   objectFederatedId,
//   data = {}
// }) => {

//   // 1️⃣ Extract target server from object
//   const parts = objectFederatedId.split("@");

//   if (parts.length < 2) {
//     throw createError(400, "Invalid federatedId format");
//   }

//   //might be error if objectFederatedId is something like  announcement@food
//   const afterAt = parts[1];
//   const targetServer = afterAt.split("/")[0];

//   if (targetServer === process.env.SERVER_NAME) {
//     throw createError(400, "Cannot federate to local server");
//   }

//   // 2️⃣ Get trusted server info
//   const trusted = await TrustedServer.findOne({
//     serverName: targetServer,
//     isActive: true
//   });

//   if (!trusted) {
//     throw createError(403, "Target server not trusted");
//   }

//   // 3️⃣ Build event payload
//   const payload = {
//     eventId: `${process.env.SERVER_NAME}-${Date.now()}-${type}`,
//     type,
//     actor: {
//       federatedId: actorFederatedId,
//       server: process.env.SERVER_NAME
//     },
//     object: {
//       federatedId: objectFederatedId
//     },
//     data,
//     timestamp: Date.now()
//   };

//   // 4️⃣ Sign payload
//   const signature = signPayload(
//     payload,
//     process.env.PRIVATE_KEY
//   );

//   // 5️⃣ Log outgoing event
//   await FederationEvent.create({
//     ...payload,
//     direction: "outgoing",
//     senderServer: process.env.SERVER_NAME,
//     processingStatus: "pending"
//   });

//   // 6️⃣ Send request
//   try {
//     await axios.post(
//       `${trusted.serverUrl}/api/federation/inbox`,
//       {
//         payload,
//         signature,
//         senderServer: process.env.SERVER_NAME
//       },
//       {
//         timeout: 5000
//       }
//     );

//     // Mark as processed
//     await FederationEvent.findOneAndUpdate(
//       { eventId: payload.eventId },
//       { processingStatus: "processed" }
//     );

//   } catch (err) {

//     await FederationEvent.findOneAndUpdate(
//       { eventId: payload.eventId },
//       { processingStatus: "failed" }
//     );

//     throw createError(500, "Federation delivery failed");
//   }
// };  


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

  // 🔥 TEMP: assume all servers run on localhost with different ports
  // food → 5000
  // sports → 5001
  // You can adjust this mapping manually

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
    `http://localhost:${5000}/api/federation/inbox`,
    payload,
  );

  return response.data;
};