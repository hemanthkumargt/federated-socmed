import FederationEvent from "../models/FederationEvent.js";
import TrustedServer from "../models/TrustedServer.js";
import { verifySignature } from "../utils/verifySignature.js";
import { createError } from "../utils/error.js";

import { followUserService, unfollowUserService } from "../services/userService.js";
import { followChannelService, unFollowChannelService } from "../services/channelService.js";
import {createPostService , deletePostService, toggleLikePostService, addCommentService } from "../services/postService.js";
import { createReportService } from "../services/reportService.js";

import User from "../models/User.js";
import Channel from "../models/Channel.js";
import Post from "../models/Post.js";

// export const federationInbox = async (req, res, next) => {
//   try {
//     const { payload, signature, senderServer } = req.body;

//     if (!payload || !signature || !senderServer) {
//       return next(createError(400, "Invalid federation request format"));
//     }

//     // 🔐 1. Verify sender is trusted
//     const trusted = await TrustedServer.findOne({
//       serverName: senderServer,
//       isActive: true
//     });

//     if (!trusted) {
//       return next(createError(403, "Untrusted server"));
//     }

//     // 🔐 2. Verify digital signature
//     const isValid = verifySignature(payload, signature, trusted.publicKey);

//     if (!isValid) {
//       return next(createError(403, "Invalid digital signature"));
//     }

//     // 🔁 3. Prevent duplicate event processing
//     const existingEvent = await FederationEvent.findOne({
//       eventId: payload.eventId
//     });

//     if (existingEvent) {
//       return res.status(200).json({ message: "Event already processed" });
//     }

//     // 📝 4. Store event as pending
//     const eventDoc = await FederationEvent.create({
//       ...payload,
//       direction: "incoming",
//       senderServer,
//       processingStatus: "pending"
//     });

//     // ⚙️ 5. Process event by type
//     switch (payload.type) {

//       case "FOLLOW_USER": {
//         const targetUser = await User.findOne({
//           federatedId: payload.object.federatedId
//         });

//         if (!targetUser) throw createError(404, "Target user not found");

//         await followUserService(
//           payload.actor.federatedId,
//           payload.object.federatedId,
//           payload.actor.server,
//           process.env.SERVER_NAME
//         );
//         break;
//       }

//       case "UNFOLLOW_USER": {
//         await unfollowUserService(
//           payload.actor.federatedId,
//           payload.object.federatedId
//         );
//         break;
//       }

//       case "FOLLOW_CHANNEL": {
//         const channel = await Channel.findOne({
//           federatedId: payload.object.federatedId
//         });

//         if (!channel) throw createError(404, "Channel not found");

//         await followChannelService(payload.actor.federatedId, channel);
//         break;
//       }

//       case "UNFOLLOW_CHANNEL": {
//         const channel = await Channel.findOne({
//           federatedId: payload.object.federatedId
//         });

//         if (!channel) throw createError(404, "Channel not found");

//         await unFollowChannelService(payload.actor.federatedId, channel);
//         break;
//       }

//       case "LIKE_POST": {
//         const post = await Post.findOne({
//           federatedId: payload.object.federatedId
//         });

//         if (!post) throw createError(404, "Post not found");

//         await likePostService(payload.actor.federatedId, post);
//         break;
//       }

//       case "COMMENT_POST": {
//         const post = await Post.findOne({
//           federatedId: payload.object.federatedId
//         });

//         if (!post) throw createError(404, "Post not found");

//         await commentPostService(
//           payload.actor,
//           post,
//           payload.data.content
//         );
//         break;
//       }

//       case "REPORT": {
//         await createReportService({
//           reporterId: payload.actor.federatedId,
//           reportedId: payload.object.federatedId,
//           targetType: payload.data.targetType,
//           reason: payload.data.reason,
//           description: payload.data.description,
//           targetOriginServer: process.env.SERVER_NAME,
//           isRemoteTarget: false
//         });
//         break;
//       }

//       default:
//         throw createError(400, "Unsupported federation event type");
//     }

//     // ✅ 6. Mark as processed
//     eventDoc.processingStatus = "processed";
//     await eventDoc.save();

//     return res.status(200).json({
//       success: true,
//       message: "Federation event processed"
//     });

//   } catch (err) {

//     // ❌ If failure happens after event creation, mark as failed
//     if (req.body?.payload?.eventId) {
//       await FederationEvent.findOneAndUpdate(
//         { eventId: req.body.payload.eventId },
//         { processingStatus: "failed" }
//       );
//     }

//     next(err);
//   }
// };

export const federationInbox = async (req, res, next) => {
  try {

    console.log("📩 Incoming Federation Event:", req.body);

    return res.status(200).json({
      success: true,
      message: "Event received on " + process.env.SERVER_NAME,
      Post : "federated post"
    });

  } catch (err) {
    next(err);
  }
};