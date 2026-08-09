import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    const error = new Error("Please log in to continue.");
    error.statusCode = 401;
    return next(error);
  }

  const payload = verifyToken(token);

  if (!payload?.sub) {
    const error = new Error("Your session has expired. Please log in again.");
    error.statusCode = 401;
    return next(error);
  }

  req.user = { id: payload.sub };
  next();
};
