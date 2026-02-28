import User from "../models/User.js";
import UserFollow from "../models/UserFollow.js";
import { createError } from "../utils/error.js";
import {
  followUserService,
  unfollowUserService
} from "../services/userService.js";
import { sendFederationEvent } from "../services/federationService.js";


// Federation need to be added

export const getAllProfiles = async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      { displayName: 1, avatarUrl: 1, federatedId: 1, followersCount: 1, followingCount: 1 }
    );

    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
}

export const getUserProfile = async (req, res, next) => {
  try {
    const federatedId = req.params.federatedId;
    const user = await User.findOne(
      { federatedId: federatedId },
      { displayName: 1, avatarUrl: 1, federatedId: 1, followersCount: 1, followingCount: 1 }
    );
    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
}

export const followUser = async (req, res, next) => {
  try {
    const targetFederatedId = req.params.federatedId;
    const userId = req.user.federatedId;

    const parts = targetFederatedId.split("@");

    if (parts.length < 2) {
      return next(createError(400, "Invalid federatedId format"));
    }

    const targetOriginServer = parts[1];
    const isRemoteUser = targetOriginServer !== process.env.SERVER_NAME;

    if (targetOriginServer !== process.env.SERVER_NAME) {
      const response = await sendFederationEvent({
        type: "FOLLOW_USER",
        actorFederatedId: userId,
        objectFederatedId: targetFederatedId
      });

      if (!response.success) {
        return next(createError(500, "Failed to send follow event to remote server"));
      }

      return res.status(200).json({
        success: true,
        message: "Follow event sent to remote server"
      });
    }

    const targetUser = await User.findOne({ federatedId: targetFederatedId });

    if (!targetUser) {
      return next(createError(404, "User not found"));
    }

    // Delegate DB logic to service
    await followUserService(
      userId,
      targetFederatedId,
      req.user.serverName,
      targetOriginServer
    );

    res.status(200).json({
      success: true,
      message: "User followed successfully"
    });

  } catch (err) {
    next(err);
  }
};


export const unfollowUser = async (req, res, next) => {
  try {
    const targetFederatedId = req.params.federatedId;
    const userId = req.user.federatedId;

    const parts = targetFederatedId.split("@");

    if (parts.length < 2) {
      return next(createError(400, "Invalid federatedId format"));
    }

    const targetOriginServer = parts[1];

    if (targetOriginServer !== process.env.SERVER_NAME) {
      const response = await sendFederationEvent({
        type: "UNFOLLOW_USER",
        actorFederatedId: userId,
        objectFederatedId: targetFederatedId
      });

      if (!response.success) {
        return next(createError(500, "Failed to send unfollow event to remote server"));
      }
      return res.status(200).json({
        success: true,
        message: "Unfollow event sent to remote server"
      });
    }

    await unfollowUserService(userId, targetFederatedId);

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully"
    });

  } catch (err) {
    next(err);
  }
};


export const checkFollowStatus = async (req, res, next) => {
  try {
    const targetFederatedId = req.params.federatedId;
    const userId = req.user.federatedId;
    if (targetFederatedId === userId) {
      return next(createError(400, "You cannot check follow status for yourself"));
    }

    const FollowStatus = await UserFollow.findOne({ followerFederatedId: userId, followingFederatedId: targetFederatedId });
    res.status(200).json({
      success: true,
      isFollowing: !!FollowStatus
    });
  } catch (err) {
    next(err);
  }
}

export const getMyFollowers = async (req, res, next) => {
  try {
    const userId = req.user.federatedId;

    const follow = await UserFollow.find({
      followingFederatedId: userId
    });

    if (follow.length === 0) {
      return res.status(200).json({
        success: true,
        followers: []
      });
    }

    const followerIds = follow.map(f => f.followerFederatedId);

    const followers = await User.find(
      { federatedId: { $in: followerIds } },
      { displayName: 1, avatarUrl: 1, federatedId: 1 }
    );

    res.status(200).json({
      success: true,
      followers
    });
  } catch (err) {
    next(err);
  }
};


export const getMyFollowing = async (req, res, next) => {
  try {
    const userId = req.user.federatedId;

    const follow = await UserFollow.find({
      followerFederatedId: userId
    });

    if (follow.length === 0) {
      return res.status(200).json({
        success: true,
        following: []
      });
    }

    const followingIds = follow.map(f => f.followingFederatedId);

    const following = await User.find(
      { federatedId: { $in: followingIds } },
      { displayName: 1, avatarUrl: 1, federatedId: 1 }
    );

    res.status(200).json({
      success: true,
      following
    });
  } catch (err) {
    next(err);
  }
};


