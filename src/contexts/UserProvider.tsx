"use client";

import { createContext, useContext, useState, useEffect } from "react";
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        // Fetch user profile
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
        } else {
          console.log("Error fetching user profile.");
          setUser(null);
        }
      } catch (error) {
        console.error("Error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Facebook login callback & token management (global)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const profileImage = urlParams.get("profile_image");
    const redirectUrl = urlParams.get("redirect");
    const error = urlParams.get("error");

    if (error) {
      // Optional: toast error if you use toast
      // toast.error(`Facebook login failed: ${error}`);
      return;
    }

    if (accessToken) {
      try {
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        localStorage.setItem("token_expiration", expirationTime.toString());
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
        if (profileImage) localStorage.setItem("profile_image", profileImage);
        document.cookie = `access_token=${accessToken}; path=/; Secure`;
        if (refreshToken)
          document.cookie = `refresh_token=${refreshToken}; path=/; Secure`;
        // Remove token from URL for security
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (e) {
        console.error("Invalid token received:", e);
        // Optional: toast.error('Invalid token received');
      }
    }
    if (redirectUrl) {
      localStorage.setItem(
        "redirect_url",
        redirectUrl || "https://www.facebook-poster.ezbitly.com"
      );
    }
  }, [router]);

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

      console.log("Facebook login initiated successfully");

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
      // Store tokens in localStorage
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

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
    localStorage.clear();
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie =
      "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
