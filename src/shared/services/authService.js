import apiClient from "./apiClient";

const authService = {
  register: async (payload) => {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  login: async (payload) => {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  forgotPassword: async (payload) => {
    const { data } = await apiClient.post("/auth/forgot-password", payload);
    return data;
  },

  verifyResetOtp: async (payload) => {
    const { data } = await apiClient.post("/auth/verify-reset-otp", payload);
    return data;
  },

  resetPassword: async (payload) => {
    const { data } = await apiClient.post("/auth/reset-password", payload);
    return data;
  },

  // Uses the existing /progress route (progressService pattern)
  markProblemSolved: async (problemId) => {
    const { data } = await apiClient.post(
      `/progress/problems/${problemId}/complete`,
    );
    return data;
  },

  updateNotificationPreferences: async (optedOut) => {
    const { data } = await apiClient.patch("/auth/notifications", { optedOut });
    return data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const { data } = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  deleteAccount: async ({ password }) => {
    const { data } = await apiClient.delete("/auth/account", {
      data: { password },
    });
    return data;
  },
};

export default authService;
