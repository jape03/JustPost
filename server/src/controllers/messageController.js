import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

const publicUserFields = "name email username avatarUrl";

export async function listConversations(req, res, next) {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
      .populate("sender", publicUserFields)
      .populate("recipient", publicUserFields)
      .sort({ updatedAt: -1 });

    const conversationUsersById = new Map();

    messages.forEach((message) => {
      const otherUser =
        message.sender._id.toString() === req.user._id.toString()
          ? message.recipient
          : message.sender;

      if (!conversationUsersById.has(otherUser._id.toString())) {
        conversationUsersById.set(otherUser._id.toString(), otherUser);
      }
    });

    return res.json({ users: [...conversationUsersById.values()] });
  } catch (error) {
    return next(error);
  }
}

export async function listConversation(req, res, next) {
  try {
    const otherUser = await User.findById(req.params.userId).select("-password");

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Message.updateMany(
      {
        sender: otherUser._id,
        recipient: req.user._id,
        readAt: null
      },
      { readAt: new Date() }
    );

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUser._id },
        { sender: otherUser._id, recipient: req.user._id }
      ]
    })
      .populate("sender", publicUserFields)
      .populate("recipient", publicUserFields)
      .sort({ createdAt: 1 });

    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
}

export async function listUnreadCounts(req, res, next) {
  try {
    const unreadMessages = await Message.find({
      recipient: req.user._id,
      readAt: null
    }).select("sender");

    const counts = unreadMessages.reduce((currentCounts, message) => {
      const senderId = message.sender.toString();
      return {
        ...currentCounts,
        [senderId]: (currentCounts[senderId] || 0) + 1
      };
    }, {});

    return res.json({
      counts,
      total: unreadMessages.length
    });
  } catch (error) {
    return next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const recipient = await User.findById(req.params.userId).select("-password");

    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipient._id,
      content
    });

    await message.populate("sender", publicUserFields);
    await message.populate("recipient", publicUserFields);

    return res.status(201).json({ message });
  } catch (error) {
    return next(error);
  }
}
