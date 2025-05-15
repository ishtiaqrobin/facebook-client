import React, { useState, useEffect } from "react";
import { Plus, X, Upload, Link, FileImage, Hash, Facebook } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/useUser";
import { ENDPOINTS } from "@/lib/utility/config/config";

export interface Tab {
  id: string;
  name: string;
  token: string;
  active: boolean;
  isLoggedIn: boolean;
  profileData?: {
    name: string;
    profilePicture: string;
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

interface Profile {
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

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
        setPages(data.data || []);
        setPagesLoading(false);
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
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex flex-grow items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center min-w-[150px] max-w-[200px] h-10 px-4 
                          border-r border-gray-200 dark:border-gray-700 cursor-pointer
                          ${
                            tab.id === activeTabId
                              ? "bg-white dark:bg-gray-900 text-[#1877F2] dark:text-[#e7f3ff] border-t-2 border-t-[#1877F2] font-medium"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex-grow truncate">{tab.name}</div>
              <button
                className="ml-2 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                onClick={(e) => removeTab(tab.id, e)}
                aria-label="Close tab"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          className="flex-shrink-0 h-10 px-3 text-gray-600 dark:text-gray-300 hover:text-[#1877F2] dark:hover:text-[#e7f3ff] hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          onClick={addTab}
          aria-label="Add new tab"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 bg-white dark:bg-gray-900 flex-grow animate-fadeIn">
        {getActiveTab() ? (
          <TabContent
            tab={getActiveTab()!}
            updateTab={updateTab}
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

interface TabContentProps {
  tab: Tab;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  onLogin: () => void;
  onLogout: () => void;
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  pages: Page[];
  pagesLoading: boolean;
  pagesError: string | null;
}

export const TabContent: React.FC<TabContentProps> = ({
  tab,
  updateTab,
  onLogin,
  onLogout,
  profile,
  profileLoading,
  profileError,
  pages,
  pagesLoading,
  pagesError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashtag, setHashtag] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);

      toast({
        title: "File selected",
        description: `${e.target.files[0].name} has been selected.`,
      });
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Upload failed",
        description: "Please select a file first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Upload successful",
      description: `${selectedFile.name} has been uploaded${
        hashtag ? " with hashtag: " + hashtag : ""
      }.`,
    });

    setSelectedFile(null);
    setHashtag("");
  };

  const handleVisitPage = () => {
    toast({
      title: "Visit page",
      description: "Redirecting to your Facebook page (simulated).",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {tab.name}
        </h2>
        <span className="px-3 py-1 bg-[#e7f3ff] dark:bg-[#145db2] text-[#1877F2] dark:text-[#e7f3ff] text-sm rounded-full">
          Active Session
        </span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <label
          htmlFor={`token-${tab.id}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Facebook Access Token
        </label>
        <textarea
          id={`token-${tab.id}`}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#1877f2] focus:border-[#1877f2]
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          rows={3}
          placeholder="Paste your Facebook access token here..."
          value={tab.token}
          onChange={(e) => updateTab(tab.id, { token: e.target.value })}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This token is stored in your browser&apos;s session storage and will
          be lost when you close the browser.
        </p>
      </div>

      {/* Facebook Login Button */}
      <div className="flex justify-center">
        {!tab.isLoggedIn ? (
          <Button
            className="bg-[#1877F2] hover:bg-[#145db2] text-white font-bold py-2 px-6 rounded-md flex items-center gap-2"
            onClick={onLogin}
          >
            <Facebook size={20} />
            Login with Facebook
          </Button>
        ) : (
          <Button
            variant="outline"
            className="text-[#1877F2] dark:text-[#e7f3ff] border-[#1877F2] dark:border-[#e7f3ff] hover:bg-[#e7f3ff] dark:hover:bg-[#145db2] font-bold py-2 px-6 rounded-md"
            onClick={onLogout}
          >
            Logout from Facebook
          </Button>
        )}
      </div>

      {/* Profile and Pages Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Profile & Pages
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Profile
              </h4>
              {profileLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : profileError ? (
                <div className="text-red-500 dark:text-red-400">
                  {profileError}
                </div>
              ) : profile ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={profile.picture?.data?.url}
                      alt={profile.name}
                    />
                    <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {profile.name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No profile data available
                </div>
              )}
            </div>

            {/* Pages Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Pages
              </h4>
              {pagesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : pagesError ? (
                <div className="text-red-500 dark:text-red-400">
                  {pagesError}
                </div>
              ) : pages.length > 0 ? (
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={page.picture?.data?.url}
                          alt={page.name}
                        />
                        <AvatarFallback>{page.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                          {page.name}
                        </h6>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {page.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  No pages available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel Interface */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Admin Panel
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Profile data */}
            <div className="col-span-1">
              {tab.isLoggedIn && tab.profileData ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={tab.profileData.profilePicture}
                        alt={tab.profileData.name}
                      />
                      <AvatarFallback>
                        {tab.profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {tab.profileData.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Connected with Facebook
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Status
                    </h5>
                    <div className="flex items-center">
                      <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    Please log in with Facebook to view profile data
                  </div>
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                </div>
              )}
            </div>

            {/* Middle and Right columns: Upload form */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File upload */}
                <div>
                  <Label
                    htmlFor={`file-upload-${tab.id}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Upload Media
                  </Label>
                  <div className="flex items-center">
                    <label
                      htmlFor={`file-upload-${tab.id}`}
                      className={`flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-gray-800 
                                  border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md appearance-none 
                                  hover:border-[#1877F2] focus:outline-none ${
                                    !tab.isLoggedIn
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                    >
                      <span className="flex items-center space-x-2">
                        <FileImage
                          size={24}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to select a file"}
                        </span>
                      </span>
                      <input
                        id={`file-upload-${tab.id}`}
                        name="file_upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={!tab.isLoggedIn}
                        accept="image/*,video/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, GIF, or MP4 up to 10MB
                  </p>
                </div>

                {/* Hashtag input */}
                <div>
                  <div className="space-y-6">
                    <div>
                      <Label
                        htmlFor={`hashtag-${tab.id}`}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Hashtag
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash size={18} className="text-gray-400" />
                        </div>
                        <Input
                          id={`hashtag-${tab.id}`}
                          placeholder="Enter hashtag without # symbol"
                          className="pl-10"
                          value={hashtag}
                          onChange={(e) => setHashtag(e.target.value)}
                          disabled={!tab.isLoggedIn}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        className={`flex items-center gap-2 ${
                          !tab.isLoggedIn
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={handleVisitPage}
                        disabled={!tab.isLoggedIn}
                      >
                        <Link size={18} />
                        Visit Page
                      </Button>

                      <Button
                        className={`bg-[#1877F2] hover:bg-[#145db2] text-white flex items-center gap-2 ${
                          !tab.isLoggedIn
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={handleUpload}
                        disabled={!tab.isLoggedIn}
                      >
                        <Upload size={18} />
                        Upload Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional tab content can go here */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
          Session Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Session ID
            </p>
            <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
              {tab.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Token Status
            </p>
            <p className="text-sm">
              {tab.token ? (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Token set
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  ⚠ No token
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
