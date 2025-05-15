import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { TabContent, Tab } from "../TabBar";
import TabHeader from "./TabHeader";
import DarkModeToggle from "./DarkModeToggle";
import { useUser } from "@/hooks/useUser";
import { ENDPOINTS } from "@/lib/utility/config/config";

interface Profile {
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface Page {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

const TabManager: React.FC = () => {
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

  // Get the currently active tab
  const getActiveTab = useCallback(() => {
    return tabs.find((tab) => tab.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  // Fetch profile and pages data when active tab changes
  useEffect(() => {
    const activeTab = getActiveTab();
    if (!activeTab?.token) return;

    setProfileLoading(true);
    setPagesLoading(true);

    // Fetch profile
    fetch(`${ENDPOINTS.userProfile}`, {
      headers: { Authorization: `Bearer ${activeTab.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((err) => {
        setProfileError(err.message);
        setProfileLoading(false);
      });

    // Fetch pages
    fetch(`${ENDPOINTS.userPages}`, {
      headers: { Authorization: `Bearer ${activeTab.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPages(data.data || []);
        setPagesLoading(false);
      })
      .catch((err) => {
        setPagesError(err.message);
        setPagesLoading(false);
      });
  }, [activeTabId, getActiveTab]);

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

  // Create a new tab
  const createNewTab = (name: string): Tab => {
    return {
      id: Date.now().toString(),
      name,
      token: "",
      active: true,
      isLoggedIn: false,
    };
  };

  // Add a new tab
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

  // Update tab data
  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  };

  // Toggle dark mode
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
  };

  return (
    <div className={`flex flex-col w-full ${isDarkMode ? "dark" : ""}`}>
      {/* Dark Mode Toggle */}
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Tab Header */}
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
            updateTab={updateTab}
            onLogin={handleFacebookLogin}
            onLogout={logout}
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

export default TabManager;
