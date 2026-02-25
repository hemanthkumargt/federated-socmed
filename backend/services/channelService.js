import Channel from "../models/Channel.js";
import ChannelFollow from "../models/ChannelFollow.js";



/*
  Follow channel business logic.
  Used by:
  - Controller
  - Federation Inbox
*/
export const followChannelService = async (actorFederatedId, channel) => {

  const existingFollow = await ChannelFollow.findOne({
    userFederatedId: actorFederatedId,
    channelFederatedId: channel.federatedId
  });

  if (existingFollow) {
    return; // Avoid duplicate follows
  }

  await ChannelFollow.create({
    userFederatedId: actorFederatedId,
    channelFederatedId: channel.federatedId,
    channelName: channel.name,
    serverName: channel.serverName,
    userOriginServer: actorFederatedId.split("@")[1],
    channelOriginServer: channel.originServer
  });

  channel.followersCount += 1;
  await channel.save();
};


/*
  Unfollow channel business logic.
  Used by:
  - Controller
  - Federation Inbox
*/
export const unFollowChannelService = async (actorFederatedId, channel) => {

  const existingFollow = await ChannelFollow.findOneAndDelete({
    userFederatedId: actorFederatedId,
    channelFederatedId: channel.federatedId
  });

  if (!existingFollow) {
    return; // Nothing to delete
  }

  channel.followersCount = Math.max(0, channel.followersCount - 1);
  await channel.save();
};
