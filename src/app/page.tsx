"use client";

import { useEffect, useState } from "react";
import TabBar from "@/components/TabBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      // Load dark mode preference from sessionStorage
      const darkModePreference = sessionStorage.getItem(
        "facebook-auto-poster-darkmode"
      );
      if (darkModePreference === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div
          className={`rounded-lg shadow-md overflow-hidden ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <div
            className={`p-4 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-b border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Token Sessions
            </h2>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {/* Manage your Facebook access tokens for auto-posting */}
              Last Updated: 21/05/2025
              <span className="text-red-500"> 9:35 PM</span>
            </p>
          </div>

          {/* Tab Bar */}
          <TabBar />
        </div>

        {/* Info Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            title="Get Started"
            description="Learn how to generate and use Facebook access tokens for posting."
            actionText="View Guide"
            isDarkMode={isDarkMode}
          />
          <InfoCard
            title="Manage Posts"
            description="Create, schedule, and manage your automated Facebook posts."
            actionText="Post Manager"
            isDarkMode={isDarkMode}
          />
          <InfoCard
            title="Account Settings"
            description="Configure your app settings and notification preferences."
            actionText="Settings"
            isDarkMode={isDarkMode}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

interface InfoCardProps {
  title: string;
  description: string;
  actionText: string;
  isDarkMode: boolean;
}

const InfoCard = ({
  title,
  description,
  actionText,
  isDarkMode,
}: InfoCardProps) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-sm transition-shadow hover:shadow-md
                    ${
                      isDarkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white border border-gray-100"
                    }`}
    >
      <h3
        className={`font-semibold mb-2 ${
          isDarkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-4 ${
          isDarkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {description}
      </p>
      <button
        className={`text-[#1877F2] hover:text-[#145db2] font-medium text-sm
                          ${
                            isDarkMode
                              ? "text-[#e7f3ff] hover:text-[#145db2]"
                              : ""
                          }`}
      >
        {actionText} →
      </button>
    </div>
  );
};
