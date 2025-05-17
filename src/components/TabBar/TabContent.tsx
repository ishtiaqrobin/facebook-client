import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Tab, Profile, Page } from "./types";
import { ProfileSection } from "./ProfileSection";
import { PagesSection } from "./PagesSection";
import { AdminPanel } from "./AdminPanel";
import { SessionInfo } from "./SessionInfo";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";

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
  const { toast } = useToast();

  return (
    <div className="space-y-1">
      {/* Session Information */}
      <SessionInfo tab={tab} updateTab={updateTab} />

      {/* Facebook Login Button */}
      <div className="flex justify-center py-5">
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

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Profile & Pages
          </h3>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile Section */}
          <ProfileSection
            profile={profile}
            profileLoading={profileLoading}
            profileError={profileError}
          />

          {/* Pages Section */}
          <PagesSection
            pages={pages}
            pagesLoading={pagesLoading}
            pagesError={pagesError}
          />
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        pages={pages}
        onVisitPage={(page) =>
          window.open(`https://facebook.com/${page.id}`, "_blank")
        }
        onUpload={(page, file, hashtag) => {
          toast({
            title: "Upload",
            description: `Uploading to ${page.name} with hashtag #${hashtag}`,
          });
        }}
      />
    </div>
  );
};
