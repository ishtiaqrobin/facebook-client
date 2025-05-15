import { useCallback } from "react";

export function useUser() {
  const handleFacebookLogin = useCallback(async () => {
    // Implement Facebook login logic here
    const accessToken = "dummy_token"; // Replace with actual Facebook OAuth
    localStorage.setItem("access_token", accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
  }, []);

  return {
    handleFacebookLogin,
    logout,
  };
}
