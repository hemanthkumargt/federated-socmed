import User from "../models/User.js";
import TrustedServer from "../models/TrustedServer.js";
import UserFollow from "../models/UserFollow.js";
import axios from "axios";

const DEFAULT_RESULT_LIMIT = 10;

/**
 * Parse a raw search query into username and optional server name.
 * Supports username or username@serverName format.
 */
export const parseSearchQuery = (rawQuery) => {
    if (!rawQuery || rawQuery.trim() === "") {
        return { username: "", serverName: null, isRemote: false };
    }

    const trimmed = rawQuery.trim();
    if (trimmed.includes("@")) {
        const [username, serverName] = trimmed.split("@");
        return { username: username.trim(), serverName: serverName.trim(), isRemote: true };
    }

    return { username: trimmed, serverName: null, isRemote: false };
};


/**
 * Search for local users by displayName.
 * Returns user objects with _id, displayName, federatedId, serverName, avatarUrl.
 */
export const searchLocalUsers = async (partialUsername, limit = DEFAULT_RESULT_LIMIT) => {
    if (!partialUsername) return [];

    const users = await User.find(
        {
            displayName: { $regex: new RegExp(partialUsername, "i") },
            isRemote: false
        },
        { _id: 1, displayName: 1, federatedId: 1, serverName: 1, avatarUrl: 1, followersCount: 1 }
    ).limit(limit);

    return users.map(u => ({
        _id: u._id,
        displayName: u.displayName,
        federatedId: u.federatedId,
        serverName: u.serverName,
        avatarUrl: u.avatarUrl || null,
        followersCount: u.followersCount || 0,
        isRemote: false
    }));
};


/**
 * Search for a user on a remote federated server.
 * Calls /api/federation/search?username=X on the trusted server.
 */
export const searchRemoteUsers = async (username, serverName, limit = DEFAULT_RESULT_LIMIT) => {
    try {
        const server = await TrustedServer.findOne({ serverName, isActive: true });
        if (!server) return [];

        const { data } = await axios.get(
            `${server.serverUrl}/api/federation/search`,
            {
                params: { username, limit },
                headers: { "x-origin-server": process.env.SERVER_NAME },
                timeout: 4000
            }
        );

        return (data.users || []).map(u => ({ ...u, isRemote: true, serverName }));
    } catch (err) {
        console.error(`Remote search failed on ${serverName}:`, err.message);
        return [];
    }
};


/**
 * Enrich user results with follow status for the current user.
 */
export const enrichWithFollowStatus = async (users, currentFederatedId) => {
    if (!currentFederatedId || !users.length) return users;

    const targetIds = users.map(u => u.federatedId);
    const existingFollows = await UserFollow.find({
        followerFederatedId: currentFederatedId,
        followingFederatedId: { $in: targetIds }
    });

    const followedSet = new Set(existingFollows.map(f => f.followingFederatedId));

    return users.map(u => ({
        ...u,
        isFollowing: followedSet.has(u.federatedId)
    }));
};
