import { api, tokenStore } from "../client";
import type { AuthUser, LoginResponse } from "./types";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>("/auth/login", { email, password });
    tokenStore.set(data.accessToken, data.refreshToken);
    tokenStore.setUser(data.user);
    return data;
  },
  async register(input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthUser> {
    return api.post<AuthUser>("/auth/register", input);
  },
  async me(): Promise<AuthUser> {
    return api.get<AuthUser>("/auth/me");
  },
  async logout(): Promise<void> {
    try {
      await api.post<void>("/auth/logout");
    } catch {
      /* ignore — always clear client state */
    } finally {
      tokenStore.clear();
    }
  },
  async forgotPassword(email: string): Promise<void> {
    await api.post<void>("/auth/forgot-password", { email });
  },
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    await api.post<void>("/auth/reset-password", { email, otp, newPassword });
  },
  async updateProfile(input: Partial<AuthUser>): Promise<AuthUser> {
    const user = await api.put<AuthUser>("/users/me", input);
    tokenStore.setUser(user);
    return user;
  },
  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post<void>("/auth/change-password", input);
  },
};
