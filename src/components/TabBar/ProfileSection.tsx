import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "./types";

interface ProfileSectionProps {
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  profileLoading,
  profileError,
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
        Profile
      </h4>
      {profileLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : profileError ? (
        <div className="text-red-500 dark:text-red-400">{profileError}</div>
      ) : profile ? (
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.picture?.data?.url} alt={profile.name} />
            <AvatarFallback>
              {profile.name ? profile.name.charAt(0) : "?"}
            </AvatarFallback>
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
  );
};
