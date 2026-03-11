import Message from '../models/Message.js';
import User from '../models/User.js';
import { io, onlineUsers } from '../index.js';

// Get message history between current user and target user (mark as read)
export const getMessages = async (req, res, next) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id; // from verifyToken

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mark unread messages from the target user as read
        await Message.updateMany(
            { sender: targetUserId, receiver: currentUserId, read: false },
            { $set: { read: true } }
        );

        // Notify the sender that their messages were read (read receipt)
        const senderSocketId = onlineUsers.get(targetUserId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', {
                byUserId: currentUserId,
                fromUserId: targetUserId
            });
        }

        res.status(200).json({ success: true, messages });
    } catch (err) {
        next(err);
    }
};

// Send a message via HTTP
export const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, messageText } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !messageText) {
            return res.status(400).json({ success: false, message: 'Receiver and message text are required' });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message: messageText,
            read: false
        });

        await newMessage.save();

        // Broadcast to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', {
                ...newMessage.toObject(),
                // Include sender info for real-time display
                senderDisplayName: req.user.displayName
            });
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch (err) {
        next(err);
    }
};

// Get a list of users the current user has chatted with (with unread counts)
export const getChatHistoryUsers = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        }).populate('sender receiver', 'displayName avatarUrl serverName');

        const usersMap = new Map();

        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === currentUserId
                ? msg.receiver
                : msg.sender;

            if (!otherUser || !otherUser._id) return;

            const otherId = otherUser._id.toString();
            if (!usersMap.has(otherId)) {
                usersMap.set(otherId, {
                    _id: otherUser._id,
                    displayName: otherUser.displayName,
                    avatarUrl: otherUser.avatarUrl,
                    serverName: otherUser.serverName,
                    unreadCount: 0
                });
            }

            // Count unread messages from this user
            if (!msg.read && msg.receiver.toString() === currentUserId) {
                const existing = usersMap.get(otherId);
                existing.unreadCount = (existing.unreadCount || 0) + 1;
            }
        });

        res.status(200).json({ success: true, users: Array.from(usersMap.values()) });
    } catch (err) {
        next(err);
    }
};
