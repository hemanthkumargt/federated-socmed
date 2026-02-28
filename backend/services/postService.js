import Post from "../models/Post.js";

/*
  Like / Unlike Post Business Logic
  Used by:
  - Controller
  - Federation Inbox (remote like handling)
*/
export const toggleLikePostService = async (post, actorFederatedId) => {

    const alreadyLiked = post.likedBy.includes(actorFederatedId);

    if (alreadyLiked) {
        post.likedBy.pull(actorFederatedId);
        post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
        post.likedBy.push(actorFederatedId);
        post.likeCount += 1;
    }

    await post.save();

    return {
        liked: !alreadyLiked,
        likeCount: post.likeCount
    };
};


/*
  Add Comment Business Logic
  Used by:
  - Controller
  - Federation Inbox (remote comment replication)
*/
export const addCommentService = async (post, {
    displayName,
    image,
    content,
    commentFederatedId,
    originServer
}) => {

    const newComment = {
        displayName,
        image: image || null,
        content,
        commentFederatedId,
        originServer
    };

    post.comments.push(newComment);
    await post.save();

    return newComment;
};
