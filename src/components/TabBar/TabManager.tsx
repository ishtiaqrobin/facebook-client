import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { TabContent } from "./TabContent";
import { Tab } from "./types";
import TabHeader from "./TabHeader";
import DarkModeToggle from "./DarkModeToggle";
import { ENDPOINTS } from "@/lib/utility/config/config";
import { useUser } from "@/hooks/useUser";

// Encryption utility with better security
class Encryption {
  // Generate a secure key if not available in environment
  private static generateSecureKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let key = "";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  // Get encryption key from environment or generate a new one
  private static readonly KEY = (() => {
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey && envKey.length >= 32) {
      return envKey;
    }
    // Generate and store a new key in localStorage for persistence
    const generatedKey = Encryption.generateSecureKey();
    localStorage.setItem("fb_auto_poster_encryption_key", generatedKey);
    return generatedKey;
  })();

  // Simple XOR encryption with key rotation
  static encrypt(text: string): string {
    const keyChars = this.KEY.split("").map((c) => c.charCodeAt(0));
    const textChars = text.split("").map((c) => c.charCodeAt(0));

    return textChars
      .map((char, i) => {
        const keyChar = keyChars[i % keyChars.length];
        return ("0" + (char ^ keyChar).toString(16)).substr(-2);
      })
      .join("");
  }

  static decrypt(encoded: string): string {
    const keyChars = this.KEY.split("").map((c) => c.charCodeAt(0));

    return encoded
      .match(/.{1,2}/g)!
      .map((hex, i) => {
        const charCode = parseInt(hex, 16);
        const keyChar = keyChars[i % keyChars.length];
        return String.fromCharCode(charCode ^ keyChar);
      })
      .join("");
  }

  // Rotate encryption key periodically
  static rotateKey(): void {
    const newKey = Encryption.generateSecureKey();
    localStorage.setItem("fb_auto_poster_encryption_key", newKey);
    // Note: In a real application, you would need to re-encrypt all stored tokens
    // with the new key
  }
}

const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { handleFacebookLogin } = useUser();

  // Get the currently active tab
  const getActiveTab = useCallback(() => {
    return tabs.find((tab) => tab.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  // Initialize tabs from sessionStorage on component mount
  useEffect(() => {
    const savedTabs = sessionStorage.getItem("facebook-auto-poster-tabs");
    const activeTab = sessionStorage.getItem("facebook-auto-poster-active-tab");
    const darkModePreference = localStorage.getItem(
      "facebook-auto-poster-darkmode"
    );

    if (darkModePreference === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark-mode");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark-mode");
    }

    if (savedTabs) {
      const parsedTabs: Tab[] = JSON.parse(savedTabs);
      setTabs(parsedTabs);

      // If there's a saved active tab, set it
      if (activeTab) {
        setActiveTabId(activeTab);
      } else if (parsedTabs.length > 0) {
        setActiveTabId(parsedTabs[0].id);
      }
    } else {
      // Create a default tab if no tabs exist
      const defaultTab = createNewTab("Session 1");
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    }
  }, []);

  // Save tabs to sessionStorage whenever tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      sessionStorage.setItem("facebook-auto-poster-tabs", JSON.stringify(tabs));

      // Make sure we have an active tab if there are tabs
      if (!activeTabId || !tabs.find((tab) => tab.id === activeTabId)) {
        setActiveTabId(tabs[0].id);
      }

      // Save active tab ID
      if (activeTabId) {
        sessionStorage.setItem("facebook-auto-poster-active-tab", activeTabId);
      }
    } else {
      sessionStorage.removeItem("facebook-auto-poster-tabs");
      sessionStorage.removeItem("facebook-auto-poster-active-tab");
    }
  }, [tabs, activeTabId]);

  // Rotate encryption key every 24 hours
  useEffect(() => {
    const lastRotation = localStorage.getItem("fb_auto_poster_key_rotation");
    const now = Date.now();

    if (!lastRotation || now - parseInt(lastRotation) > 24 * 60 * 60 * 1000) {
      Encryption.rotateKey();
      localStorage.setItem("fb_auto_poster_key_rotation", now.toString());
    }
  }, []);

  // Create a new tab
  const createNewTab = (name: string): Tab => {
    return {
      id: Date.now().toString(),
      name,
      token: "",
      active: true,
      isLoggedIn: false,
      profile: null,
      profileLoading: false,
      profileError: null,
      pages: [],
      pagesLoading: false,
      pagesError: null,
    };
  };

  // Helper functions for sessionStorage keys
  const getTokenKey = (id: string) => `fb_token_${id}`;
  const getProfileKey = (id: string) => `fb_profile_${id}`;
  const getPagesKey = (id: string) => `fb_pages_${id}`;

  // Helper to get next available session number
  const getNextSessionNumber = () => {
    const numbers = tabs
      .map((tab) => parseInt(tab.name.replace("Session ", ""), 10))
      .filter((n) => !isNaN(n));
    let n = 1;
    while (numbers.includes(n)) n++;
    return n;
  };

  // Add a new tab
  const addTab = () => {
    const newTabNumber = getNextSessionNumber();
    const newTab = createNewTab(`Session ${newTabNumber}`);
    // Remove any sessionStorage data for this new tab id (shouldn't exist, but for safety)
    sessionStorage.removeItem(getTokenKey(newTab.id));
    sessionStorage.removeItem(getProfileKey(newTab.id));
    sessionStorage.removeItem(getPagesKey(newTab.id));
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((tab) => ({
        ...tab,
        active: false,
      }));
      return [...updatedTabs, newTab];
    });
    setActiveTabId(newTab.id);
    toast({
      title: "New session created",
      description: `Session ${newTabNumber} has been added.`,
    });
  };

  // Remove a tab
  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // If we're removing the active tab, we need to activate another tab
    if (id === activeTabId) {
      const currentIndex = tabs.findIndex((tab) => tab.id === id);
      if (tabs.length > 1) {
        // Activate the previous tab if available, otherwise the next one
        const newActiveIndex = currentIndex > 0 ? currentIndex - 1 : 1;
        setActiveTabId(tabs[newActiveIndex].id);
      } else {
        setActiveTabId(null);
      }
    }

    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));

    toast({
      title: "Session closed",
      description: "The session tab has been removed.",
    });
  };

  // Set active tab
  const setActiveTab = (id: string) => {
    setActiveTabId(id);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("facebook-auto-poster-darkmode", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("facebook-auto-poster-darkmode", "light");
    }

    toast({
      title: newMode ? "Dark mode activated" : "Light mode activated",
      description: `Theme preference has been saved.`,
    });
  };

  // TabManager component-এর ভিতরে
  const syncActiveTabFromSessionStorage = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    const token = sessionStorage.getItem(getTokenKey(activeTab.id)) || "";
    const profileStr = sessionStorage.getItem(getProfileKey(activeTab.id));
    const pagesStr = sessionStorage.getItem(getPagesKey(activeTab.id));
    const profile = profileStr ? JSON.parse(profileStr) : null;
    const pages = pagesStr ? JSON.parse(pagesStr) : [];
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              token,
              profile,
              pages,
              isLoggedIn: !!token,
            }
          : tab
      )
    );
  };

  // Handle Facebook login for a session
  const handleLogin = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    try {
      // Initiate Facebook OAuth login flow
      await handleFacebookLogin();
      // After OAuth, token should be available in localStorage
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found after login");
      // Save to sessionStorage for this tab
      sessionStorage.setItem(getTokenKey(activeTab.id), accessToken);
      // Update tab state
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                isLoggedIn: true,
                token: accessToken,
                profileLoading: true,
                profileError: null,
                pagesLoading: true,
                pagesError: null,
              }
            : tab
        )
      );
      // Fetch profile
      const profileRes = await fetch(ENDPOINTS.userProfile, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();
      sessionStorage.setItem(
        getProfileKey(activeTab.id),
        JSON.stringify(profileData)
      );
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                profile: profileData,
                profileLoading: false,
                profileError: null,
              }
            : tab
        )
      );
      // Fetch pages
      const pagesRes = await fetch(ENDPOINTS.userPages, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!pagesRes.ok) throw new Error("Failed to fetch pages");
      const pagesData = await pagesRes.json();
      sessionStorage.setItem(
        getPagesKey(activeTab.id),
        JSON.stringify(pagesData)
      );
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                pages: Array.isArray(pagesData) ? pagesData : [],
                pagesLoading: false,
                pagesError: null,
              }
            : tab
        )
      );
      toast({
        title: "Login successful",
        description: "You have successfully logged in with Facebook.",
      });
      // sessionStorage থেকে ডাটা নিয়ে active tab-এর state-এ বসাও
      syncActiveTabFromSessionStorage();
    } catch (error: unknown) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id
            ? {
                ...tab,
                isLoggedIn: false,
                token: "",
                profile: null,
                profileLoading: false,
                profileError:
                  error instanceof Error ? error.message : "Failed to login",
                pages: [],
                pagesLoading: false,
                pagesError:
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch pages",
              }
            : tab
        )
      );
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
      // sessionStorage থেকে ডাটা নিয়ে active tab-এর state-এ বসাও
      syncActiveTabFromSessionStorage();
    }
  };

  // Handle Facebook logout for a session
  const handleLogout = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    // Clear only this tab's sessionStorage data
    sessionStorage.removeItem(getTokenKey(activeTab.id));
    sessionStorage.removeItem(getProfileKey(activeTab.id));
    sessionStorage.removeItem(getPagesKey(activeTab.id));
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              isLoggedIn: false,
              token: "",
              profile: null,
              profileLoading: false,
              profileError: null,
              pages: [],
              pagesLoading: false,
              pagesError: null,
            }
          : tab
      )
    );
    toast({
      title: "Logout successful",
      description: "You have been logged out from Facebook.",
    });
    // sessionStorage থেকে ডাটা নিয়ে active tab-এর state-এ বসাও
    syncActiveTabFromSessionStorage();
  };

  // When switching tabs, load session-specific data
  useEffect(() => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    // Load token/profile/pages from sessionStorage
    const token = sessionStorage.getItem(getTokenKey(activeTab.id)) || "";
    const profileStr = sessionStorage.getItem(getProfileKey(activeTab.id));
    const pagesStr = sessionStorage.getItem(getPagesKey(activeTab.id));
    const profile = profileStr ? JSON.parse(profileStr) : null;
    const pages = pagesStr ? JSON.parse(pagesStr) : [];
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              token,
              profile,
              pages,
              isLoggedIn: !!token,
            }
          : tab
      )
    );
  }, [activeTabId]);

  return (
    <div className={`flex flex-col w-full ${isDarkMode ? "dark" : ""}`}>
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Tab Bar */}
      <TabHeader
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTab={setActiveTab}
        removeTab={removeTab}
        addTab={addTab}
      />

      {/* Tab Content */}
      <div className="p-6 bg-white dark:bg-gray-900 flex-grow animate-fadeIn">
        {getActiveTab() ? (
          <TabContent
            tab={getActiveTab()!}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No active session. Create a new tab to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabManager;
