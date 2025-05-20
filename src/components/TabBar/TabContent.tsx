import React from "react";
// import { useToast } from "@/hooks/use-toast";
import { Tab } from "./types";
import { ProfileSection } from "./ProfileSection";
import { PagesSection } from "./PagesSection";
import { AdminPanel } from "./AdminPanel";
import { SessionInfo } from "./SessionInfo";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";

interface TabContentProps {
  tab: Tab;
  onLogin: () => void;
  onLogout: () => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  tab,
  onLogin,
  onLogout,
}) => {
  // const { toast } = useToast();

  console.log("tab from TabContent", tab);

  return (
    <div className="space-y-6">
      {/* Session Information */}
      <SessionInfo tab={tab} />

      {/* Facebook Login Button */}
      <div className="flex justify-center py-5">
        {!tab.isLoggedIn ? (
          <Button
            className="bg-[#1877F2] hover:bg-[#145db2] text-white font-bold py-2 px-6 rounded-md flex items-center gap-2 cursor-pointer"
            onClick={onLogin}
          >
            <Facebook size={20} />
            Login with Facebook
          </Button>
        ) : (
          <Button
            variant="outline"
            className="text-[#1877F2] dark:text-[#e7f3ff] border-[#1877F2] dark:border-[#e7f3ff] hover:bg-[#e7f3ff] dark:hover:bg-[#145db2] font-bold py-2 px-6 rounded-md cursor-pointer"
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
            profile={tab.profile ?? null}
            profileLoading={tab.profileLoading || false}
            profileError={tab.profileError || null}
          />

          {/* Pages Section */}
          <PagesSection
            pages={tab.pages || []}
            pagesLoading={tab.pagesLoading || false}
            pagesError={tab.pagesError || null}
          />
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        pages={tab.pages || []}
        onVisitPage={(page) =>
          window.open(`https://facebook.com/${page.page_id}`, "_blank")
        }
        sessionToken={tab.token}
      />
    </div>
  );
};
