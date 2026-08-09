import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { getErrorMessage } from "../utils/getErrorMessage";

const AuthContext = createContext(null);

const TOKEN_KEY = "studyplot-token";
const USER_KEY = "studyplot-user";

const readStoredUser = () => {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify the stored token is still valid on load, so a stale/expired
    // token doesn't let the UI think the user is logged in.
    const hydrate = async () => {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await authService.getMe();
        setUser(data.user);
        window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = (nextUser, nextToken) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const signup = async ({ username, email, password }) => {
    try {
      const data = await authService.signup({ username, email, password });
      persistSession(data.user, data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, "Couldn't create your account.") };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const data = await authService.login({ email, password });
      persistSession(data.user, data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, "Couldn't log you in.") };
    }
  };

  const logout = () => {
    // Fire-and-forget: JWTs here are stateless bearer tokens, so there's
    // nothing server-side that must succeed before the client can log
    // out. We still call the endpoint (useful if this ever moves to
    // cookie-based sessions), but never block clearing local state on it.
    authService.logout().catch(() => {});
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
