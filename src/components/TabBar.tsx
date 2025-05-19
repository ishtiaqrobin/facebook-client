import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/lib/utility/config/config";
import TabHeader from "./TabBar/TabHeader";
import { TabContent } from "./TabBar/TabContent";
import { AdminPanel } from "./TabBar/AdminPanel";
import { Tab, Page } from "./TabBar/types";

const TabBar: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      refreshToken: "",
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

  const getActiveTab = () => {
    return tabs.find((tab) => tab.id === activeTabId) || null;
  };

  // Session-specific Facebook login
  const handleLogin = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    try {
      // ... your Facebook login logic here ...
      // For now, simulate login and token fetch
      const fakeToken = `token_${activeTab.id}`;
      updateTab(activeTab.id, {
        isLoggedIn: true,
        token: fakeToken,
        profileLoading: true,
        profileError: null,
      });
      // Fetch profile
      const profileRes = await fetch(ENDPOINTS.userProfile, {
        headers: { Authorization: `Bearer ${fakeToken}` },
      });
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();
      updateTab(activeTab.id, {
        profile: profileData,
        profileLoading: false,
        profileError: null,
      });
      // Fetch pages
      updateTab(activeTab.id, { pagesLoading: true, pagesError: null });
      const pagesRes = await fetch(ENDPOINTS.userPages, {
        headers: { Authorization: `Bearer ${fakeToken}` },
      });
      if (!pagesRes.ok) throw new Error("Failed to fetch pages");
      const pagesData = await pagesRes.json();
      updateTab(activeTab.id, {
        pages: Array.isArray(pagesData) ? pagesData : [],
        pagesLoading: false,
        pagesError: null,
      });
      toast({
        title: "Login successful",
        description: "You have successfully logged in with Facebook.",
      });
    } catch (error: unknown) {
      updateTab(activeTab.id, {
        isLoggedIn: false,
        token: "",
        profile: null,
        profileLoading: false,
        profileError:
          error instanceof Error ? error.message : "Failed to login",
        pages: [],
        pagesLoading: false,
        pagesError:
          error instanceof Error ? error.message : "Failed to fetch pages",
      });
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    }
  };

  // Session-specific Facebook logout
  const handleLogout = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;
    updateTab(activeTab.id, {
      isLoggedIn: false,
      token: "",
      profile: null,
      profileLoading: false,
      profileError: null,
      pages: [],
      pagesLoading: false,
      pagesError: null,
    });
    toast({
      title: "Logout successful",
      description: "You have been logged out from Facebook.",
    });
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
          <>
            <TabContent
              tab={getActiveTab()!}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
            <AdminPanel
              pages={getActiveTab()!.pages || []}
              onVisitPage={(page: Page) =>
                window.open(`https://facebook.com/${page.page_id}`, "_blank")
              }
              sessionToken={getActiveTab()!.token}
            />
          </>
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
