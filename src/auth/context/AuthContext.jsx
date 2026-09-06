import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import authService from "../../shared/services/authService";
import { isPrerendering } from "../../shared/utils/prerender";

const AuthContext = createContext(null);

const toSolvedProblemSet = (user) =>
  new Set(
    Array.isArray(user?.solvedProblems)
      ? user.solvedProblems
          .map((problemId) => Number(problemId))
          .filter((problemId) => Number.isInteger(problemId))
      : [],
  );

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState(new Set());

  const applyUserState = useCallback((nextUser) => {
    setUser(nextUser || null);
    setSolvedProblems(toSolvedProblemSet(nextUser));
  }, []);

  useEffect(() => {
    if (isPrerendering()) {
      applyUserState(null);
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const data = await authService.getCurrentUser();
        applyUserState(data.user);
      } catch {
        applyUserState(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [applyUserState]);

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login({ email, password });
      applyUserState(data.user);
      return data;
    },
    [applyUserState],
  );

  const register = useCallback(
    async (name, email, password) => {
      const data = await authService.register({ name, email, password });
      applyUserState(data.user);
      return data;
    },
    [applyUserState],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      applyUserState(null);
    }
  }, [applyUserState]);

  const hasSolvedProblem = useCallback(
    (problemId) => {
      const normalizedProblemId = Number(problemId);
      return Number.isInteger(normalizedProblemId) && solvedProblems.has(normalizedProblemId);
    },
    [solvedProblems],
  );

  const markProblemSolved = useCallback(
    async (problemId) => {
      const data = await authService.markProblemSolved(problemId);
      if (data?.user) {
        applyUserState(data.user);
      }
      return data;
    },
    [applyUserState],
  );

  const updateNotificationPreferences = useCallback(
    async (optedOut) => {
      const data = await authService.updateNotificationPreferences(optedOut);
      if (data?.user) {
        applyUserState(data.user);
      }
      return data;
    },
    [applyUserState],
  );

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return authService.changePassword({ currentPassword, newPassword });
  }, []);

  const deleteAccount = useCallback(
    async (password) => {
      const data = await authService.deleteAccount({ password });
      applyUserState(null);
      return data;
    },
    [applyUserState],
  );

  // `authService.updateProfile` now exists and is wired to
  // PATCH /api/auth/profile, so the earlier "not connected to the backend
  // yet" guard has been removed — it was throwing a plain Error (no
  // `.response`/`.status`), which Settings' getErrorMessage() misread as a
  // network failure and displayed as "Cannot reach the server."
  const updateProfile = useCallback(
    async (updates) => {
      const data = await authService.updateProfile(updates);
      if (data?.user) {
        applyUserState(data.user);
      }
      return data;
    },
    [applyUserState],
  );

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    solvedProblems,
    markProblemSolved,
    hasSolvedProblem,
    emailNotificationsOptedOut: !!user?.emailNotificationsOptedOut,
    updateNotificationPreferences,
    changePassword,
    deleteAccount,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}

export default AuthContext;
