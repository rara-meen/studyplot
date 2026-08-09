import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser, loginUser, getUserById } from "../services/authService.js";

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const { user, token } = await registerUser({ username, email, password });

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user,
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    user,
    token,
  });
});

// Stateless JWT bearer tokens aren't tracked server-side, so there's no
// session to invalidate here — the frontend simply discards its stored
// token. This endpoint exists so the client has a real logout call to
// make (and a place to clear an auth cookie in the future, if this ever
// moves off bearer tokens).
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    user,
  });
});
