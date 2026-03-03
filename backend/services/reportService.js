import Post from "../models/Post.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";

/**
 * Core report creation logic.
 * Used by:
 * - REST createReport controller
 * - Federation inbox REPORT event
 */
export const createReportService = async ({
  reporterId,
  reportedId,
  targetType,
  reason,
  description,
  targetOriginServer,
  isRemoteTarget
}) => {

  if (!reportedId || !targetType || !reason) {
    throw createError(400, "Missing required fields");
  }

  if (!["user", "post"].includes(targetType)) {
    throw createError(400, "Invalid target type");
  }


  if (targetType === "post" && !isRemoteTarget) {
    const post = await Post.findOne({ federatedId: reportedId });

    if (!post) {
      throw createError(404, "Post not found");
    }
  }

  if (targetType === "user" && !isRemoteTarget) {
    const user = await User.findOne({ federatedId: reportedId });

    if (!user) {
      throw createError(404, "User not found");
    }
  }


  const newReport = new Report({
    reporterId,
    reportedId,
    targetType,
    reason,
    description,
    targetOriginServer,
    isRemoteTarget
  });

  return await newReport.save();
};