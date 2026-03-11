import User from "../models/User.js";
import Channel from "../models/Channel.js";
import Post from "../models/Post.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import crypto from "crypto";
import { sendUnlockEmail } from "../services/emailService.js";

export const unlockAccount = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return next(createError(400, "Unlock token is required"));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      unlockToken: hashedToken,
      unlockTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError(400, "Invalid or expired unlock token"));
    }

    user.isActive = true;
    user.failedLoginAttempts = 0;
    user.unlockToken = null;
    user.unlockTokenExpiry = null;
    user.tokenVersion += 1; // Invalidate any rogue active sessions

    await user.save();

    res.status(200).json({
      success: true,
      message: "Your account has been successfully unlocked."
    });

  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body;
    if ((!displayName && !email) || !password) {
      return next(createError(400, "Missing credentials"));
    }

    const user = await User.findOne({
      serverName: process.env.SERVER_NAME,
      isRemote: false,
      $or: [{ displayName }, { email }]
    });

    if (!user) {
      return next(createError(401, "Invalid credentials"));
    }

    if (!user.isActive) {
      return next(createError(403, "Account is locked or inactive due to multiple failed login attempts. Please check your email for unlock instructions."));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;

        // Generate a secure random hex token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.unlockToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.unlockTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

        await user.save();

        // Dispatch email asynchronously
        sendUnlockEmail(user.email, resetToken).catch(err => {
          console.error("Failed to send unlock email:", err);
        });

        return next(createError(403, "Maximum login attempts reached. Your account has been temporarily locked. Check your email to regain access."));
      }

      await user.save();
      return next(createError(401, `Invalid credentials. You have ${5 - user.failedLoginAttempts} attempts remaining.`));
    }

    // Reset attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        serverName: user.serverName,
        federatedId: user.federatedId,
        displayName: user.displayName,
        image: user.avatarUrl,
        tokenVersion: user.tokenVersion
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        image: user.avatarUrl,
        email: user.email,
        role: user.role,
        federatedId: user.federatedId,
        serverName: user.serverName
      }
    });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { displayName, firstName, lastName, dob, email, password } = req.body;

    if (
      !displayName || !firstName || !lastName || !dob || !email || !password
    ) {
      return next(createError(400, "All required fields must be provided"));
    }

    // Strip out all whitespace from displayName ONLY for federatedId generation
    const sanitizedDisplayName = displayName.replace(/\s+/g, '');
    const federatedId = `${sanitizedDisplayName}@${process.env.SERVER_NAME}`;

    const existingUser = await User.findOne({
      $or: [{ email }, { federatedId }]
    });

    if (existingUser) {
      return next(createError(409, "User with this email, or display name already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      displayName,
      firstName,
      lastName,
      dob,
      email,
      password: hashedPassword,
      serverName: process.env.SERVER_NAME,
      originServer: process.env.SERVER_NAME,
      isRemote: false,
      federatedId
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
        serverName: newUser.serverName,
        federatedId: newUser.federatedId,
        displayName: newUser.displayName,
        image: null,
        tokenVersion: newUser.tokenVersion
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        federatedId: newUser.federatedId,
        serverName: newUser.serverName,
        image: null
      }
    });
  } catch (err) {
    next(err);
  }
};

export const setupPresentationData = async (req, res, next) => {
  try {
    const server = process.env.SERVER_NAME;
    const commonPass = await bcrypt.hash("password123", 10);

    // 1. Create Channels
    const channelsData = [
      { name: "Football", description: "Global football news and discussions.", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop" },
      { name: "Cricket", description: "All things cricket - matches, stats and more.", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop" }
    ];

    for (const c of channelsData) {
      const federatedId = `${c.name}@${server}`;
      await Channel.findOneAndUpdate(
        { name: c.name, serverName: server },
        { 
          ...c, 
          visibility: "public", 
          isRemote: false,
          federatedId,
          originServer: server,
          serverName: server,
          createdBy: "system"
        },
        { upsert: true, new: true }
      );
    }

    // 2. Create Users
    const usersData = [
      { displayName: "sportsadmin", firstName: "Sports", lastName: "Admin", email: "sportsadmin@example.com", role: "admin" },
      { displayName: "hkadmin", firstName: "Hemanth", lastName: "Admin", email: "hkadmin@example.com", role: "admin" },
      { displayName: "MinecraftUser", firstName: "Alex", lastName: "Steve", email: "minecraft@test.com", role: "user" },
      { displayName: "bob", firstName: "Bob", lastName: "Builder", email: "bob@example.com", role: "user" }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const federatedId = `${u.displayName}@${server}`;
      let user = await User.findOne({ federatedId });
      if (!user) {
        user = new User({
          ...u,
          dob: new Date(1995, 0, 1),
          password: commonPass,
          serverName: server,
          originServer: server,
          isRemote: false,
          federatedId
        });
        await user.save();
      } else {
        // Reset locked/failed accounts and update credentials
        user.role = u.role;
        user.password = commonPass;
        user.isActive = true;
        user.failedLoginAttempts = 0;
        user.unlockToken = null;
        user.unlockTokenExpiry = null;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
      }
      createdUsers.push(user);
    }

    // 3. Create initial posts
    const postCount = await Post.countDocuments({ originServer: server });
    if (postCount < 3) {
      const posts = [
        { description: "System initialized. Welcome to the Realm!", user: createdUsers[0] },
        { description: "Just finished building a huge castle in Minecraft! Who wants to see?", user: createdUsers[1] },
        { description: "What a match today in the Premier League!", user: createdUsers[2], channel: "Football" }
      ];

      for (const p of posts) {
        const postFederatedId = p.channel ? `${p.channel}@${server}/post/${Date.now()}` : `${p.user.federatedId}/post/${Date.now()}`;
        const newPost = new Post({
          description: p.description,
          userDisplayName: p.user.displayName,
          authorFederatedId: p.user.federatedId,
          isUserPost: !p.channel,
          isChannelPost: !!p.channel,
          channelName: p.channel || null,
          federatedId: postFederatedId,
          originServer: server,
          serverName: server,
          isRemote: false
        });
        await newPost.save();
        await new Promise(r => setTimeout(r, 10)); // Ensure unique federatedId timestamps
      }
    }

    res.status(200).json({ success: true, message: "Presentation data prepared! Usernames: hkadmin, MinecraftUser, bob. Password: password123" });
  } catch (err) {
    next(err);
  }
};

