import React, { useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, Hash, Link, Upload } from "lucide-react";
import { Page } from "./types";
import { ENDPOINTS } from "@/lib/utility/config/config";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  pages: Page[];
  onVisitPage: (page: Page) => void;
}

// Backend API call utility
const createPost = async ({
  pageId,
  file,
  hashtag,
}: {
  pageId: string;
  file: File | null;
  hashtag: string;
}) => {
  const hashtagsArray = hashtag
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  const formData = new FormData();
  formData.append("page_id", pageId);

  if (file) {
    if (file.type.startsWith("image/")) {
      formData.append("image", file);
    } else if (file.type.startsWith("video/")) {
      formData.append("video", file);
    }
  }

  // এখানে প্রতিটা tag আলাদা করে append করো
  hashtagsArray.forEach((tag) => formData.append("hashtag", tag));

  // Log data before API call
  console.log("Sending data:", {
    page_id: pageId,
    hashtag: hashtagsArray,
    file: file
      ? {
          name: file.name,
          type: file.type,
          size: file.size,
        }
      : null,
  });

  const response = await fetch(ENDPOINTS.createPost, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  console.log(response, "response from create post");
  console.log(formData, "from data from create post");

  if (!response.ok) {
    throw new Error("Failed to create post");
  }
  return await response.json();
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  pages,
  onVisitPage,
}) => {
  // State for each page's file and hashtag
  const [pageStates, setPageStates] = useState<{
    [pageId: string]: { file: File | null; hashtag: string };
  }>(() =>
    Object.fromEntries(
      pages.map((p) => [p.page_id, { file: null, hashtag: "" }])
    )
  );

  // Update state if pages change
  React.useEffect(() => {
    setPageStates((prev) => {
      const newState = { ...prev };
      pages.forEach((p) => {
        if (!newState[p.page_id])
          newState[p.page_id] = { file: null, hashtag: "" };
      });
      // Remove states for pages that no longer exist
      Object.keys(newState).forEach((id) => {
        if (!pages.find((p) => p.page_id === id)) delete newState[id];
      });
      return newState;
    });
  }, [pages]);

  const handleFileChange = (pageId: string, file: File | null) => {
    setPageStates((prev) => ({
      ...prev,
      [pageId]: { ...prev[pageId], file },
    }));
  };

  const handleHashtagChange = (pageId: string, hashtag: string) => {
    setPageStates((prev) => ({
      ...prev,
      [pageId]: { ...prev[pageId], hashtag },
    }));
  };

  const { toast } = useToast();

  const handleUpload = async (page: Page) => {
    const { file, hashtag } = pageStates[page.page_id] || {};
    try {
      const result = await createPost({
        pageId: page.page_id,
        file,
        hashtag,
      });
      toast({
        title: "Post created!",
        description: result.message || "Your post was successfully created.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create post.",
        variant: "destructive",
      });
    }
    setPageStates((prev) => ({
      ...prev,
      [page.page_id]: { file: null, hashtag: "" },
    }));
  };

  return (
    <div className="space-y-6">
      {pages.map((page) => (
        <div
          key={page.page_id}
          className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden"
        >
          {/* Left: Page Info */}
          <div className="flex flex-col items-center md:items-start md:w-1/3 p-6 space-y-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
            {/* <Avatar className="h-16 w-16 bg-gray-100 dark:bg-gray-700 mb-2">
              <AvatarImage src={page.picture?.data?.url} alt={page.name} />
              <AvatarFallback>
                {page.name ? page.name.charAt(0) : "?"}
              </AvatarFallback>
            </Avatar> */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {page.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {page.category}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                ID: {page.page_id}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg w-full mt-2">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Status
              </h5>
              <div className="flex items-center">
                <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Active
                </span>
              </div>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Connected with Facebook
            </div>
          </div>

          {/* Right: Upload Form */}
          <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File upload */}
              <div>
                <Label
                  htmlFor={`file-upload-${page.page_id}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Upload Media
                </Label>
                <div className="flex items-center">
                  <label
                    htmlFor={`file-upload-${page.page_id}`}
                    className={`flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-gray-800 
                      border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md appearance-none 
                      hover:border-[#1877F2] focus:outline-none cursor-pointer`}
                  >
                    <span className="flex items-center space-x-2">
                      <FileImage
                        size={24}
                        className="text-gray-500 dark:text-gray-400"
                      />
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        {pageStates[page.page_id]?.file
                          ? pageStates[page.page_id].file!.name
                          : "Click to select a file"}
                      </span>
                    </span>
                    <input
                      id={`file-upload-${page.page_id}`}
                      name="file_upload"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(
                          page.page_id,
                          e.target.files?.[0] || null
                        )
                      }
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
                <Label
                  htmlFor={`hashtag-${page.page_id}`}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Hashtags (comma separated)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash size={18} className="text-gray-400" />
                  </div>
                  <Input
                    id={`hashtag-${page.page_id}`}
                    placeholder="Enter hashtags separated by commas (e.g. tag1, tag2)"
                    className="pl-10"
                    value={pageStates[page.page_id]?.hashtag || ""}
                    onChange={(e) =>
                      handleHashtagChange(page.page_id, e.target.value)
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter multiple hashtags separated by commas
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => onVisitPage(page)}
                  >
                    <Link size={18} />
                    Visit Page
                  </Button>
                  <Button
                    className="bg-[#1877F2] hover:bg-[#145db2] text-white flex items-center gap-2"
                    onClick={() => handleUpload(page)}
                    disabled={!pageStates[page.page_id]?.file}
                  >
                    <Upload size={18} />
                    Upload Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
