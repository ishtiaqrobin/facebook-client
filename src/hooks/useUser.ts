import { useCallback } from "react";
import { useUser as useUserContext } from "@/contexts/UserProvider";

export function useUser() {
  const context = useUserContext();
  if (!context) throw new Error("useUser must be used within UserProvider");

  const {
    handleFacebookLogin: contextHandleFacebookLogin,
    logout: contextLogout,
  } = context;

  const handleFacebookLogin = useCallback(async () => {
    await contextHandleFacebookLogin();
  }, [contextHandleFacebookLogin]);

  const logout = useCallback(() => {
    contextLogout();
  }, [contextLogout]);

  return {
    handleFacebookLogin,
    logout,
  };
}
