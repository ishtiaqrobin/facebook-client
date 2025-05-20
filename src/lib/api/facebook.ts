import { ENDPOINTS } from "@/lib/utility/config/config";

interface CreatePostParams {
  pageId: string;
  file: File | null;
  hashtag: string;
  sessionToken: string;
}

export const createPost = async ({
  pageId,
  file,
  hashtag,
  sessionToken,
}: CreatePostParams) => {
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

  // Append each hashtag separately
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
      Authorization: `Bearer ${sessionToken.trim()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return await response.json();
};
