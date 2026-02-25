import { createError } from "../utils/error.js";
import Post from "../models/Post.js";
import Channel from "../models/Channel.js";
import {
  createPostService,
  deletePostService,
  toggleLikePostService,
  addCommentService
} from "../services/postService.js";


export const createPost = async (req, res, next) => {
  try {
    const { description, image, isChannelPost, channelName } = req.body;

    if (!description || description.trim() === "") {
      return next(createError(400, "Post description is required"));
    }

    const isUserPost = !isChannelPost;

    let channel = null;

    // Channel validation remains in controller (HTTP validation layer)
    if (isChannelPost) {
      if (!channelName) {
        return next(createError(400, "Channel name is required for channel posts"));
      }

      channel = await Channel.findOne({
        name: channelName,
        serverName: req.user.serverName
      });

      if (!channel) {
        return next(createError(404, "Channel not found"));
      }

      if (channel.isRemote) {
        return next(createError(403, "Cannot post directly to a remote channel"));
      }

      if (channel.visibility === "read-only" && req.user.role !== "admin") {
        return next(createError(403, "This channel is read-only"));
      }

      if (channel.visibility === "private") {
        return next(createError(403, "This channel is private"));
      }
    }

    // Federated ID generation stays here (request context logic)
    let postFederatedId;
    if (isChannelPost) {
      postFederatedId = `${channelName}@${req.user.serverName}/post/${Date.now()}`;
    } else {
      postFederatedId = `${req.user.federatedId}/post/${Date.now()}`;
    }

    // Delegate DB creation to service layer
    const savedPost = await createPostService({
      description: description.trim(),
      image,
      isUserPost,
      userDisplayName: req.user.displayName,
      isChannelPost,
      channelName,
      federatedId: postFederatedId,
      originServer: req.user.serverName
    });

    res.status(201).json({
      success: true,
      post: savedPost
    });

  } catch (err) {
    next(err);
  }
};


export const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return next(createError(404, "Post not found"));
    }

    if (post.isRemote) {
      return next(createError(403, "Cannot modify remote content"));
    }

    if (
      post.userDisplayName !== req.user.displayName &&
      req.user.role !== "admin"
    ) {
      return next(createError(403, "Unauthorized action"));
    }

    // Delegate deletion to service
    await deletePostService(post);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};


export const likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.federatedId;

    const post = await Post.findById(postId);

    if (!post) {
      return next(createError(404, "Post not found"));
    }

    if (post.isRemote) {
      return next(createError(403, "Remote like forwarding not implemented yet"));
    }

    // Delegate like/unlike logic to service
    const result = await toggleLikePostService(post, userId);

    return res.status(200).json({
      success: true,
      liked: result.liked,
      likeCount: result.likeCount
    });

  } catch (err) {
    return next(err);
  }
};


export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts
    });

  } catch (err) {
    next(err);
  }
};


export const createComment = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return next(createError(400, "Comment content is required"));
    }

    const post = await Post.findById(postId);

    if (!post) {
      return next(createError(404, "Post not found"));
    }

    if (post.isRemote) {
      return next(createError(403, "Remote comment forwarding not implemented yet"));
    }

    // Generate federated comment ID in controller
    const commentFederatedId =
      `${req.user.federatedId}/comment/${Date.now()}`;

    // Delegate comment creation to service
    await addCommentService(post, {
      displayName: req.user.displayName,
      image: req.user.image,
      content: content.trim(),
      commentFederatedId,
      originServer: req.user.serverName
    });

    res.status(200).json({
      success: true,
    });

  } catch (err) {
    next(err);
  }
};