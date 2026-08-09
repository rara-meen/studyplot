import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
});

export const registerUser = async ({ username, email, password }) => {
  const cleanUsername = String(username || "").trim().replace(/^@/, "").toLowerCase();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");

  if (!USERNAME_PATTERN.test(cleanUsername)) {
    const error = new Error(
      "Username must be 3-24 characters and can only contain letters, numbers, and underscores."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    const error = new Error("Please enter a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (cleanPassword.length < 8) {
    const error = new Error("Password must be at least 8 characters long.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await User.findOne({
    $or: [{ username: cleanUsername }, { email: cleanEmail }],
  });

  if (existing) {
    const field = existing.username === cleanUsername ? "username" : "email";
    const error = new Error(
      field === "username"
        ? "That username is already taken."
        : "An account with that email already exists."
    );
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(cleanPassword);
  const user = await User.create({
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
  });

  const token = signToken({ sub: user._id.toString() });

  return { user: formatUser(user), token };
};

export const loginUser = async ({ email, password }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");

  const genericError = () => {
    const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    return error;
  };

  if (!cleanEmail || !cleanPassword) {
    throw genericError();
  }

  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    throw genericError();
  }

  const isValid = await verifyPassword(cleanPassword, user.passwordHash);
  if (!isValid) {
    throw genericError();
  }

  const token = signToken({ sub: user._id.toString() });

  return { user: formatUser(user), token };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user ? formatUser(user) : null;
};

export { formatUser };
