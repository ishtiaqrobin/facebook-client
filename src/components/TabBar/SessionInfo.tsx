import React from "react";
import { Tab } from "./types";

interface SessionInfoProps {
  tab: Tab;
}

export const SessionInfo: React.FC<SessionInfoProps> = ({ tab }) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
        Session Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Session Name
          </p>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            {tab.name}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Session ID</p>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {tab.id}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Facebook Status
          </p>
          <p className="text-sm">
            {tab.isLoggedIn ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Connected
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Not connected
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Token Status
          </p>
          <p className="text-sm">
            {tab.token ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Token active
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                No token
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
