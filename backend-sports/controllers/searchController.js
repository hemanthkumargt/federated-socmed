import {
    parseSearchQuery,
    searchLocalUsers,
    searchRemoteUsers,
    enrichWithFollowStatus
} from "../services/searchService.js";

/**
 * GET /api/search/users?q=<query>&limit=<limit>
 *
 * Supports:
 *   q=alice           → searches local users
 *   q=alice@serverB   → searches users on serverB via federation
 */
export const searchUsersController = async (req, res, next) => {
    try {
        const rawQuery = (req.query.q || req.query.query || "").trim();
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        if (!rawQuery) {
            return res.status(200).json({ success: true, users: [], count: 0 });
        }

        const { username, serverName, isRemote } = parseSearchQuery(rawQuery);

        const currentFederatedId = req.user?.federatedId || null;

        let users = [];
        let searchType = "local";

        if (isRemote && serverName) {
            searchType = "remote";
            // Only allow remote search if env flag is enabled (default: true)
            const remoteEnabled = process.env.ENABLE_REMOTE_SEARCH !== "false";
            if (!remoteEnabled) {
                return res.status(403).json({
                    success: false,
                    message: "Remote search is disabled on this server"
                });
            }
            users = await searchRemoteUsers(username, serverName, limit);
        } else {
            users = await searchLocalUsers(username, limit);
        }

        // Enrich with follow status
        const enrichedUsers = await enrichWithFollowStatus(users, currentFederatedId);

        return res.status(200).json({
            success: true,
            searchType,
            query: rawQuery,
            count: enrichedUsers.length,
            users: enrichedUsers
        });

    } catch (err) {
        next(err);
    }
};
