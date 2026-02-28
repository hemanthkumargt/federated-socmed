import { createError } from "../utils/error.js";
import Channel from "../models/Channel.js";
import ChannelFollow from "../models/ChannelFollow.js";
import {
  followChannelService,
  unFollowChannelService
} from "../services/channelService.js";
import { sendFederationEvent } from "../services/federationService.js";


export const createChannel = async (req, res, next) => {
    try {
        const { name, description, rules, visibility = 'public', image } = req.body;
        if (!name || !description || !rules) {
            return next(createError(400, "Missing required fields: name, description, and rules are required"));
        }

        const federatedId = `${name}@${req.user.serverName}`;
        const createdBy = req.user.federatedId;
        const newChannel = new Channel({
            name,
            description,
            rules,
            visibility,
            image: image || null,
            federatedId,
            originServer: req.user.serverName,
            serverName: req.user.serverName,
            createdBy: createdBy,
            followersCount: 0
        });

        const savedChannel = await newChannel.save();
        res.status(200).json({
            success: true,
            channel: savedChannel
        });

    } catch (err) {
        next(err);
    }
}

export const deleteChannel = async (req, res, next) => {
    try {
        const ChannelId = req.params.id;
        const channel = await Channel.findById(ChannelId);
        if (!channel) {
            return next(createError(404, "Channel not found"));
        }
        if (channel.isRemote) {
            return next(createError(403, "Cannot delete remote channel"));
        }
        if (
            channel.createdBy !== req.user.federatedId &&
            req.user.role !== "admin"
        ) {
            return next(createError(403, "Unauthorized action"));
        }
        await Channel.findByIdAndDelete(ChannelId);
        res.status(200).json({
            success: true,
            message: "Channel deleted successfully"
        });
    } catch (err) {
        next(err);
    }
}


export const getChannel = async (req, res, next) => {
  try {

    const searchInput = req.params.channelName;

    // 🟢 Case 1: No '@' → local fuzzy search (top 5)
    if (!searchInput.includes("@")) {

      const channels = await Channel.find({
        name: { $regex: searchInput, $options: "i" },
        serverName: process.env.SERVER_NAME
      })
      .limit(5);

      return res.status(200).json({
        success: true,
        channels
      });
    }

    // 🔵 Case 2: Contains '@'
    const parts = searchInput.split("@");

    if (parts.length !== 2) {
      return next(createError(400, "Invalid channel format"));
    }

    const name = parts[0];
    const targetServer = parts[1];

    // 🟢 If belongs to current server → local search
    if (targetServer === process.env.SERVER_NAME) {

      const channels = await Channel.find({
        name: { $regex: name, $options: "i" },
        serverName: process.env.SERVER_NAME
      })
      .limit(5);

      return res.status(200).json({
        success: true,
        channels
      });
    }

    // 🔵 True federated search
    const remoteResult = await sendFederationEvent({
      type: "SEARCH_CHANNEL",
      actorFederatedId: req.user.federatedId,
      objectFederatedId: searchInput,
      data: { query: name }
    });

    return res.status(200).json({
      success: true,
      channels: remoteResult
    });

  } catch (err) {
    next(err);
  }
};

export const getAllChannels = async (req, res, next) => {
    try {
        const channels = await Channel.find();
        res.status(200).json({
            success: true,
            channels
        });
    }
    catch (err) {
        next(err);
    }
}

export const updateChannelDescription = async (req, res, next) => {
    try {
        const channelName = req.params.channelName;
        const { description } = req.body;
        if (!description) {
            return next(createError(400, "Description is required"));
        }
        const channel = await Channel.findOne({
            name: channelName,
            serverName: req.user.serverName
        });
        if (!channel) {
            return next(createError(404, "Channel not found"));
        }
        if (channel.isRemote) {
            return next(createError(403, "Cannot modify remote channel"));
        }
        channel.description = description;
        const updatedChannel = await channel.save();
        res.status(200).json({
            success: true,
            channel: updatedChannel
        });
    } catch (err) {
        next(err);
    }
}

export const updateChannelImage = async (req, res, next) => {
    try {
        const channelName = req.params.channelName;
        const { image } = req.body;
        if (!image) {
            return next(createError(400, "Image is required"));
        }
        const channel = await Channel.findOne({ name: channelName, serverName: req.user.serverName });
        if (!channel) {
            return next(createError(404, "Channel not found"));
        }
        if (channel.isRemote) {
            return next(createError(403, "Cannot modify remote channel"));
        }
        channel.image = image;
        const updatedChannel = await channel.save();
        res.status(200).json({
            success: true,
            channel: updatedChannel
        });
    } catch (err) {
        next(err);
    }
}

export const updateChannelRules = async (req, res, next) => {
    try {
        const channelName = req.params.channelName;
        const { rules } = req.body;
        if (!rules || !Array.isArray(rules)) {
            return next(createError(400, "Rules must be an array"));
        }
        const channel = await Channel.findOne({
            name: channelName,
            serverName: req.user.serverName
        });
        if (!channel) {
            return next(createError(404, "Channel not found"));
        }
        if (channel.isRemote) {
            return next(createError(403, "Cannot modify remote channel"));
        }
        channel.rules = rules;
        const updatedChannel = await channel.save();
        res.status(200).json({
            success: true,
            channel: updatedChannel
        });
    } catch (err) {
        next(err);
    }
}

// User actions on channels (follow/unfollow) 

export const followChannel = async (req, res, next) => {
  try {

    const channelInput = req.params.channelName;

    // 🟢 CASE 1: No '@' → Local channel
    if (!channelInput.includes("@")) {

      const channel = await Channel.findOne({
        name: channelInput,
        serverName: process.env.SERVER_NAME
      });

      if (!channel) {
        return next(createError(404, "Channel not found"));
      }

      await followChannelService(req.user.federatedId, channel);

      return res.status(200).json({
        success: true,
        message: `You are now following the channel: ${channel.name}`
      });
    }

    // 🔵 CASE 2: Contains '@' → Federated channel
    const parts = channelInput.split("@");

    if (parts.length !== 2) {
      return next(createError(400, "Invalid channel format"));
    }

    const name = parts[0];
    const targetServer = parts[1];

    // If it belongs to this server → treat as local
    if (targetServer === process.env.SERVER_NAME) {

      const channel = await Channel.findOne({
        name,
        serverName: process.env.SERVER_NAME
      });

      if (!channel) {
        return next(createError(404, "Channel not found"));
      }

      await followChannelService(req.user.federatedId, channel);

      return res.status(200).json({
        success: true,
        message: `You are now following the channel: ${channel.name}`
      });
    }

    // 🔵 TRUE REMOTE CASE
    const remoteResponse = await sendFederationEvent({
      type: "FOLLOW_CHANNEL",
      actorFederatedId: req.user.federatedId,
      objectFederatedId: channelInput
    });

    return res.status(200).json({
      remoteResponse
    });

  } catch (err) {
    next(err);
  }
};

export const unFollowChannel = async (req, res, next) => {
  try {

    const channelInput = req.params.channelName;

    // 🟢 Local case (no @)
    if (!channelInput.includes("@")) {

      const channel = await Channel.findOne({
        name: channelInput,
        serverName: process.env.SERVER_NAME
      });

      if (!channel) {
        return next(createError(404, "Channel not found"));
      }

      await unFollowChannelService(req.user.federatedId, channel);

      return res.status(200).json({
        success: true,
        message: `You have unfollowed the channel: ${channel.name}`
      });
    }

    // 🔵 Contains @ → federated logic
    const parts = channelInput.split("@");

    if (parts.length !== 2) {
      return next(createError(400, "Invalid channel format"));
    }

    const name = parts[0];
    const targetServer = parts[1];

    // If belongs to this server → treat as local
    if (targetServer === process.env.SERVER_NAME) {

      const channel = await Channel.findOne({
        name,
        serverName: process.env.SERVER_NAME
      });

      if (!channel) {
        return next(createError(404, "Channel not found"));
      }

      await unFollowChannelService(req.user.federatedId, channel);

      return res.status(200).json({
        success: true,
        message: `You have unfollowed the channel: ${channel.name}`
      });
    }

    // 🔵 True remote case
    const remoteResponse = await sendFederationEvent({
      type: "UNFOLLOW_CHANNEL",
      actorFederatedId: req.user.federatedId,
      objectFederatedId: channelInput
    });

    return res.status(200).json({
      remoteResponse
    });

  } catch (err) {
    next(err);
  }
};

export const checkFollowStatus = async (req, res, next) => {
    const channelName = req.params.channelName;
    const channel = await Channel.findOne({ name: channelName, serverName: req.user.serverName });
    if (!channel) {
        return next(createError(404, "Channel not found"));
    }
    const userFederatedId = req.user.federatedId;
    const existingFollow = await ChannelFollow.findOne({ userFederatedId: userFederatedId, channelFederatedId: channel.federatedId });
    const isFollowing = existingFollow !== null;
    res.status(200).json({
        success: true,
        isFollowing
    });
}

export const getChannelFollowers = async (req, res, next) => {
    const channelName = req.params.channelName;
    const channel = await Channel.findOne({ name: channelName, serverName: req.user.serverName });
    if (!channel) {
        return next(createError(404, "Channel not found"));
    }

    const followers = await ChannelFollow.find({ channelFederatedId: channel.federatedId });
    res.status(200).json({
        success: true,
        followers
    });
}




