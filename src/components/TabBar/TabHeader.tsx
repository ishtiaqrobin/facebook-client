import React from "react";
import { Plus, X } from "lucide-react";
import { Tab } from "./types";

interface TabHeaderProps {
  tabs: Tab[];
  activeTabId: string | null;
  setActiveTab: (id: string) => void;
  removeTab: (id: string, e: React.MouseEvent) => void;
  addTab: () => void;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  tabs,
  activeTabId,
  setActiveTab,
  removeTab,
  addTab,
}) => {
  return (
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
        className="flex-shrink-0 h-10 px-3 text-gray-600 dark:text-gray-300 hover:text-[#1877F2] dark:hover:text-[#e7f3ff] hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={addTab}
        aria-label="Add new tab"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};

export default TabHeader;
