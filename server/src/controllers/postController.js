import { Post } from "../models/Post.js";

export async function listPosts(req, res, next) {
  try {
    const posts = await Post.find()
      .populate("author", "name email username bio location avatarUrl headerUrl following")
      .populate("likes", "name email username avatarUrl")
      .populate("reposts", "name email username avatarUrl")
      .populate("comments.author", "name email username bio location avatarUrl headerUrl following")
      .sort({ updatedAt: -1 });

    return res.json({ posts });
  } catch (error) {
    return next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: "Posts must be 280 characters or fewer" });
    }

    const post = await Post.create({
      title: title || content.slice(0, 70),
      content,
      author: req.user._id
    });

    await post.populate("author", "name email username bio location avatarUrl headerUrl following");
    await post.populate("likes", "name email username avatarUrl");
    await post.populate("reposts", "name email username avatarUrl");
    await post.populate("comments.author", "name email username bio location avatarUrl headerUrl following");
    return res.status(201).json({ post });
  } catch (error) {
    return next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    if (req.body.content && req.body.content.length > 280) {
      return res.status(400).json({ message: "Posts must be 280 characters or fewer" });
    }

    post.title = req.body.title ?? req.body.content?.slice(0, 70) ?? post.title;
    post.content = req.body.content ?? post.content;
    await post.save();
    await post.populate("author", "name email username bio location avatarUrl headerUrl following");
    await post.populate("likes", "name email username avatarUrl");
    await post.populate("reposts", "name email username avatarUrl");
    await post.populate("comments.author", "name email username bio location avatarUrl headerUrl following");

    return res.json({ post });
  } catch (error) {
    return next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function toggleLike(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.some((userId) => userId.equals(req.user._id));

    if (hasLiked) {
      post.likes = post.likes.filter((userId) => !userId.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    await post.populate("author", "name email username bio location avatarUrl headerUrl following");
    await post.populate("likes", "name email username avatarUrl");
    await post.populate("reposts", "name email username avatarUrl");
    await post.populate("comments.author", "name email username bio location avatarUrl headerUrl following");

    return res.json({ post });
  } catch (error) {
    return next(error);
  }
}

export async function toggleRepost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasReposted = post.reposts.some((userId) => userId.equals(req.user._id));

    if (hasReposted) {
      post.reposts = post.reposts.filter((userId) => !userId.equals(req.user._id));
    } else {
      post.reposts.push(req.user._id);
    }

    await post.save();
    await post.populate("author", "name email username bio location avatarUrl headerUrl following");
    await post.populate("likes", "name email username avatarUrl");
    await post.populate("reposts", "name email username avatarUrl");
    await post.populate("comments.author", "name email username bio location avatarUrl headerUrl following");

    return res.json({ post });
  } catch (error) {
    return next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { content, parentCommentId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (content.length > 280) {
      return res.status(400).json({ message: "Comments must be 280 characters or fewer" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (parentCommentId) {
      const parentExists = post.comments.some((comment) => comment._id.equals(parentCommentId));

      if (!parentExists) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    post.comments.push({
      author: req.user._id,
      content,
      parentComment: parentCommentId || null
    });

    await post.save();
    await post.populate("author", "name email username bio location avatarUrl headerUrl following");
    await post.populate("likes", "name email username avatarUrl");
    await post.populate("reposts", "name email username avatarUrl");
    await post.populate("comments.author", "name email username bio location avatarUrl headerUrl following");

    return res.status(201).json({ post });
  } catch (error) {
    return next(error);
  }
}
