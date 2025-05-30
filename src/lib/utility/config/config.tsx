export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000/api";

export const ENDPOINTS = {
  // Authentication & Registration
  logout: `${API_BASE_URL}/logout/`,
  tokenRefresh: `${API_BASE_URL}/token/refresh/`,

  // Facebook Login & User Data
  facebookLogin: `${API_BASE_URL}/facebook/login/`,
  facebookUserData: `${API_BASE_URL}/facebook/callback/`,

  // User Profile & Dashboard
  user: `${API_BASE_URL}/user/`,
  userProfile: `${API_BASE_URL}/facebook/profile/`,
  userPages: `${API_BASE_URL}/facebook/pages/`,
  createPost: `${API_BASE_URL}/facebook/create_post/`,
};
