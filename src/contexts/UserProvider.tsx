"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ENDPOINTS } from "@/lib/utility/config/config";

interface User {
  id: string;
  name: string;
  email?: string;
  profile_image?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  handleFacebookLogin: () => Promise<void>;
  handleFacebookCallback: (
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const refreshToken = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const activeTabId = sessionStorage.getItem(
      "facebook-auto-poster-active-tab"
    );
    if (!activeTabId) return false;

    const refreshToken = sessionStorage.getItem(
      `fb_refresh_token_${activeTabId}`
    );
    if (!refreshToken) return false;

    try {
      const response = await fetch(ENDPOINTS.tokenRefresh, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(`fb_token_${activeTabId}`, data.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  const fetchUserData = useCallback(async () => {
    if (typeof window === "undefined") return;

    const activeTabId = sessionStorage.getItem(
      "facebook-auto-poster-active-tab"
    );
    if (!activeTabId) {
      setLoading(false);
      return;
    }

    const token = sessionStorage.getItem(`fb_token_${activeTabId}`);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileResponse = await fetch(ENDPOINTS.userProfile, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData);
        // Save profile data in sessionStorage
        sessionStorage.setItem(
          `fb_profile_${activeTabId}`,
          JSON.stringify(profileData)
        );
      } else if (profileResponse.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          await fetchUserData();
        } else {
          // Clear only this tab's data
          sessionStorage.removeItem(`fb_token_${activeTabId}`);
          sessionStorage.removeItem(`fb_refresh_token_${activeTabId}`);
          sessionStorage.removeItem(`fb_profile_${activeTabId}`);
          setUser(null);
          toast({
            title: "Session Expired",
            description: "Please login again to continue",
            variant: "destructive",
          });
        }
      } else {
        console.error(
          "Error fetching user profile:",
          await profileResponse.text()
        );
        setUser(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial user data fetch
  useEffect(() => {
    fetchUserData();
  }, []); // Empty dependency array since we only want to fetch on mount

  // Facebook login callback & token management
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const profileImage = urlParams.get("profile_image");
    const redirectUrl = urlParams.get("redirect");
    const error = urlParams.get("error");

    if (error) {
      toast({
        title: "Error",
        description: `Facebook login failed: ${error}`,
        variant: "destructive",
      });
      return;
    }

    if (accessToken) {
      // Wait until activeTabId is available
      const trySetToken = (retry = 0) => {
        const activeTabId = sessionStorage.getItem(
          "facebook-auto-poster-active-tab"
        );
        if (!activeTabId) {
          if (retry < 20) {
            // wait up to 2 seconds
            setTimeout(() => trySetToken(retry + 1), 100);
          } else {
            console.error(
              "[DEBUG] No activeTabId found in sessionStorage after retry!"
            );
          }
          return;
        }
        // Now set token
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        sessionStorage.setItem(`fb_token_${activeTabId}`, accessToken);
        sessionStorage.setItem(
          `fb_token_expiration_${activeTabId}`,
          expirationTime.toString()
        );
        if (refreshToken) {
          sessionStorage.setItem(
            `fb_refresh_token_${activeTabId}`,
            refreshToken
          );
        }
        if (profileImage) {
          sessionStorage.setItem(
            `fb_profile_image_${activeTabId}`,
            profileImage
          );
        }
        fetchUserData();
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      };
      trySetToken();
    }
    if (redirectUrl) {
      sessionStorage.setItem(
        "redirect_url",
        redirectUrl || "https://www.facebook-poster.ezbitly.com"
      );
    }
  }, [toast]);

  // Token expiration check
  useEffect(() => {
    const checkTokenExpiration = () => {
      const activeTabId = sessionStorage.getItem(
        "facebook-auto-poster-active-tab"
      );
      if (!activeTabId) return;

      const expirationTime = sessionStorage.getItem(
        `fb_token_expiration_${activeTabId}`
      );
      if (!expirationTime) return;

      const now = Date.now();
      const timeUntilExpiration = parseInt(expirationTime) - now;

      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiration < 5 * 60 * 1000) {
        refreshToken();
      }
    };

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFacebookLogin = async () => {
    try {
      console.log("Initiating Facebook login...", {
        endpoint: ENDPOINTS.facebookLogin,
      });

      // Check if backend is accessible
      try {
        const healthCheck = await fetch(ENDPOINTS.facebookLogin, {
          method: "OPTIONS",
        });
        console.log("Backend health check:", healthCheck.status);
      } catch (error) {
        console.error("Backend health check failed:", error);
        throw new Error(
          "Backend server is not accessible. Please check if the server is running."
        );
      }

      const response = await fetch(ENDPOINTS.facebookLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          next: window.location.origin,
        }),
      });

      // Log the raw response for debugging
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Try to get the response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Server returned invalid response format");
      }

      if (!response.ok) {
        console.error("Facebook login failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(data.detail || "Failed to initiate Facebook login");
      }

      // console.log("Facebook login initiated successfully");

      if (!data.redirect_url) {
        throw new Error("No redirect URL received from server");
      }

      window.location.href = data.redirect_url;
    } catch (error) {
      console.error("Facebook login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during Facebook login";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleFacebookCallback = async (
    accessToken: string,
    refreshToken: string
  ) => {
    try {
      const activeTabId = sessionStorage.getItem(
        "facebook-auto-poster-active-tab"
      );
      if (!activeTabId) {
        throw new Error("No active tab found");
      }

      // Store tokens in sessionStorage for the active tab
      sessionStorage.setItem(`fb_token_${activeTabId}`, accessToken);
      sessionStorage.setItem(`fb_refresh_token_${activeTabId}`, refreshToken);

      // Fetch user data with the new token
      await fetchUserData();

      toast({
        title: "Success",
        description: "Successfully logged in with Facebook!",
      });
    } catch (error) {
      console.error("Error handling Facebook callback:", error);
      toast({
        title: "Error",
        description: "Failed to complete Facebook login",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    const activeTabId = sessionStorage.getItem(
      "facebook-auto-poster-active-tab"
    );
    if (activeTabId) {
      // Clear only this tab's data
      sessionStorage.removeItem(`fb_token_${activeTabId}`);
      sessionStorage.removeItem(`fb_refresh_token_${activeTabId}`);
      sessionStorage.removeItem(`fb_profile_${activeTabId}`);
      sessionStorage.removeItem(`fb_profile_image_${activeTabId}`);
    }
    setUser(null);
    router.push("/");
  };

  console.log(user, "user data from user context");

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        logout,
        fetchUserData,
        handleFacebookLogin,
        handleFacebookCallback,
        refreshToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
