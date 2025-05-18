import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { ENDPOINTS } from "@/lib/utility/config/config";
import TabHeader from "./TabBar/TabHeader";
import { TabContent } from "./TabBar/TabContent";
import { Tab, Profile, Page } from "./TabBar/types";

const TabBar: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { handleFacebookLogin, logout } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Initialize tabs from sessionStorage on component mount
  useEffect(() => {
    const savedTabs = sessionStorage.getItem("facebook-auto-poster-tabs");
    const activeTab = sessionStorage.getItem("facebook-auto-poster-active-tab");
    const darkModePreference = localStorage.getItem(
      "facebook-auto-poster-darkmode"
    );

    if (darkModePreference === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    if (savedTabs) {
      const parsedTabs: Tab[] = JSON.parse(savedTabs);
      setTabs(parsedTabs);

      if (activeTab) {
        setActiveTabId(activeTab);
      } else if (parsedTabs.length > 0) {
        setActiveTabId(parsedTabs[0].id);
      }
    } else {
      const defaultTab = createNewTab("Session 1");
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    }
  }, []);

  // Fetch profile and pages when accessToken is available
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    // Fetch profile
    setProfileLoading(true);
    setProfileError(null);
    fetch(`${ENDPOINTS.userProfile}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((err) => {
        setProfileError(`Failed to load profile: ${err.message}`);
        setProfileLoading(false);
      });

    // Fetch pages
    setPagesLoading(true);
    setPagesError(null);
    fetch(`${ENDPOINTS.userPages}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("[TabBar] Facebook Pages Data (raw):", data);
        setPages(Array.isArray(data) ? data : []);
        setPagesLoading(false);
        setTimeout(() => {
          console.log("[TabBar] Pages state after setPages:", pages);
        }, 1000);
      })
      .catch((err) => {
        setPagesError(`Failed to load pages: ${err.message}`);
        setPagesLoading(false);
      });
  }, []);

  // Save tabs to sessionStorage whenever tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      sessionStorage.setItem("facebook-auto-poster-tabs", JSON.stringify(tabs));

      if (!activeTabId || !tabs.find((tab) => tab.id === activeTabId)) {
        setActiveTabId(tabs[0].id);
      }

      if (activeTabId) {
        sessionStorage.setItem("facebook-auto-poster-active-tab", activeTabId);
      }
    } else {
      sessionStorage.removeItem("facebook-auto-poster-tabs");
      sessionStorage.removeItem("facebook-auto-poster-active-tab");
    }
  }, [tabs, activeTabId]);

  const createNewTab = (name: string): Tab => {
    return {
      id: Date.now().toString(),
      name,
      token: "",
      active: true,
      isLoggedIn: false,
    };
  };

  const addTab = () => {
    const newTabNumber = tabs.length + 1;
    const newTab = createNewTab(`Session ${newTabNumber}`);

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

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (id === activeTabId) {
      const currentIndex = tabs.findIndex((tab) => tab.id === id);
      if (tabs.length > 1) {
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

  const setActiveTab = (id: string) => {
    setActiveTabId(id);
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("facebook-auto-poster-darkmode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("facebook-auto-poster-darkmode", "light");
    }

    toast({
      title: newMode ? "Dark mode activated" : "Light mode activated",
      description: `Theme preference has been saved.`,
    });
  };

  const getActiveTab = () => {
    return tabs.find((tab) => tab.id === activeTabId) || null;
  };

  const handleLogin = async () => {
    try {
      await handleFacebookLogin();
      const activeTab = getActiveTab();
      if (activeTab) {
        updateTab(activeTab.id, {
          isLoggedIn: true,
          profileData: profile
            ? {
                name: profile.name,
                profilePicture:
                  profile.picture?.data?.url || "https://i.pravatar.cc/300",
              }
            : undefined,
        });
      }
      toast({
        title: "Login successful",
        description: "You have successfully logged in with Facebook.",
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
    const activeTab = getActiveTab();
    if (activeTab) {
      updateTab(activeTab.id, {
        isLoggedIn: false,
        profileData: undefined,
      });
    }
    toast({
      title: "Logout successful",
      description: "You have been logged out from Facebook.",
    });
  };

  return (
    <div className={`flex flex-col w-full ${isDarkMode ? "dark" : ""}`}>
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          className="rounded-full cursor-pointer"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </Button>
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
            profile={profile}
            profileLoading={profileLoading}
            profileError={profileError}
            pages={pages}
            pagesLoading={pagesLoading}
            pagesError={pagesError}
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

export default TabBar;
