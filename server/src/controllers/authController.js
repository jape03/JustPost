import { User } from "../models/User.js";
import { createToken } from "../utils/token.js";

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    headerUrl: user.headerUrl,
    following: user.following || []
  };
}

function normalizeUsername(value) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

async function createAvailableUsername(email) {
  const baseUsername = normalizeUsername(email.split("@")[0]) || "justpost";
  let username = baseUsername;
  let suffix = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  return username;
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const username = await createAvailableUsername(email);
    const user = await User.create({ name, email, password, username });
    const token = createToken(user);

    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    const isValidPassword = user ? await user.comparePassword(password) : false;

    if (!user || !isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);
    return res.json({ token, user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  return res.json({ user: serializeUser(req.user) });
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    return res.json({ users: users.map(serializeUser) });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, username, bio, location, avatarUrl, headerUrl } = req.body;
    const normalizedUsername = normalizeUsername(username);

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!normalizedUsername) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        username: normalizedUsername,
        bio: bio?.trim() || "",
        location: location?.trim() || "",
        avatarUrl: avatarUrl?.trim() || "",
        headerUrl: headerUrl?.trim() || ""
      },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function toggleFollow(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(req.params.id).select("-password");

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(req.user._id).select("-password");
    const isFollowing = currentUser.following.some((userId) => userId.equals(targetUser._id));

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((userId) => !userId.equals(targetUser._id));
    } else {
      currentUser.following.push(targetUser._id);
    }

    await currentUser.save();

    const users = await User.find().select("-password");
    return res.json({
      user: serializeUser(currentUser),
      profile: serializeUser(targetUser),
      users: users.map(serializeUser)
    });
  } catch (error) {
    return next(error);
  }
}
