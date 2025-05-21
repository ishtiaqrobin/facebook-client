import React from "react";
import { Page } from "./types";

interface PagesSectionProps {
  pages: Page[];
  pagesLoading: boolean;
  pagesError: string | null;
}

export const PagesSection: React.FC<PagesSectionProps> = ({
  pages,
  pagesLoading,
  pagesError,
}) => {
  // console.log("Pages in PagesSection:", pages);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
        Pages
      </h4>
      {pagesLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : pagesError ? (
        <div className="text-red-500 dark:text-red-400">{pagesError}</div>
      ) : pages.length > 0 ? (
        <div className="space-y-4">
          {pages.map((page) => (
            <div
              key={page.page_id}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  {page.name ? page.name.charAt(0) : "?"}
                </span>
              </div>
              <div>
                <h6 className="font-medium text-gray-900 dark:text-gray-100">
                  {page.name}
                </h6>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {page.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {page.page_id}
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
  );
};
