import React, { useState } from "react";
import { Upload, Link, FileImage, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tab } from "./types";

interface AdminPanelProps {
  tab: Tab;
  onVisitPage: () => void;
  onUpload: (file: File | null, hashtag: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tab,
  onVisitPage,
  onUpload,
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

    onUpload(selectedFile, hashtag);
    setSelectedFile(null);
    setHashtag("");
  };

  return (
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
                      {tab.profileData.name
                        ? tab.profileData.name.charAt(0)
                        : "?"}
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
                      onClick={onVisitPage}
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
  );
};
