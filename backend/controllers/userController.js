import User from "../models/User.js";
import UserFollow from "../models/UserFollow.js";
import Post from "../models/Post.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";


export const getAllProfiles = async (req, res, next) => {
  try {
    const users = await User.find({}, { displayName: 1, avatarUrl: 1, federatedId: 1, email: 1, role: 1, isSuspended: 1, isActive: 1 });
    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
}

export const getTopUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      { displayName: 1, avatarUrl: 1, federatedId: 1, followersCount: 1 }
    )
      .sort({ followersCount: -1 })
      .limit(5);

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
    const user = await User.findOne({ federatedId: federatedId });
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
    if (targetFederatedId === userId) {
      return next(createError(400, "You cannot follow yourself"));
    }

    const FollowStatus = await UserFollow.findOne({ followerFederatedId: userId, followingFederatedId: targetFederatedId });
    if (FollowStatus) {
      return next(createError(400, "You are already following this user"));
    }

    const newFollow = new UserFollow({
      followerFederatedId: userId,
      followingFederatedId: targetFederatedId,
      serverName: req.user.serverName
    });
    await newFollow.save();

    await User.findOneAndUpdate({ federatedId: userId }, { $inc: { followingCount: 1 } });
    await User.findOneAndUpdate({ federatedId: targetFederatedId }, { $inc: { followersCount: 1 } });

    res.status(200).json({
      success: true,
      message: "User followed successfully"
    });
  } catch (err) {
    next(err);
  }
}

export const unfollowUser = async (req, res, next) => {
  try {
    const targetFederatedId = req.params.federatedId;
    const userId = req.user.federatedId;

    if (targetFederatedId === userId) {
      return next(createError(400, "You cannot unfollow yourself"));
    }

    const FollowStatus = await UserFollow.findOne({ followerFederatedId: userId, followingFederatedId: targetFederatedId });
    if (!FollowStatus) {
      return next(createError(400, "You are not following this user"));
    }

    await UserFollow.findOneAndDelete({ followerFederatedId: userId, followingFederatedId: targetFederatedId });
    await User.findOneAndUpdate({ federatedId: userId }, { $inc: { followingCount: -1 } });
    await User.findOneAndUpdate({ federatedId: targetFederatedId }, { $inc: { followersCount: -1 } });

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully"
    });
  } catch (err) {
    next(err);
  }
}

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


// update profile fields (displayName, email, dob)
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.federatedId;
    const { displayName, email, dob } = req.body;

    const updateFields = {};
    if (displayName) updateFields.displayName = displayName;
    if (email) updateFields.email = email;
    if (dob) updateFields.dob = new Date(dob);

    const updatedUser = await User.findOneAndUpdate(
      { federatedId: userId },
      { $set: updateFields },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.federatedId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError(400, "Current password and new password are required"));
    }

    if (newPassword.length < 8) {
      return next(createError(400, "New password must be at least 8 characters"));
    }

    const user = await User.findOne({ federatedId: userId });
    if (!user) return next(createError(404, "User not found"));

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(createError(400, "Current password is incorrect"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate(
      { federatedId: userId },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    next(err);
  }
};

// delete account and all associated data on local server
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.federatedId;

    // delete user's posts on local server
    await Post.deleteMany({ federatedId: { $regex: `^${userId}` } });

    // remove follow relationships
    await UserFollow.deleteMany({
      $or: [
        { followerFederatedId: userId },
        { followingFederatedId: userId }
      ]
    });

    // delete the user
    await User.findOneAndDelete({ federatedId: userId });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
