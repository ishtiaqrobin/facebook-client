// Type definitions for TabBar components
export interface Tab {
  id: string;
  name: string;
  token: string; // Facebook access token for this session
  refreshToken?: string; // Facebook refresh token for this session
  active: boolean;
  isLoggedIn: boolean;

  // Warning: eivabe pore korcho (UI te data show kore na)
  profile?: Profile | null; // Session-specific profile
  profileLoading?: boolean;
  profileError?: string | null;
  pages?: Page[]; // Session-specific pages
  pagesLoading?: boolean;
  pagesError?: string | null;
}

export interface Page {
  page_id: string;
  name: string;
  category: string;
  category_id: string;
  access_token: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface Profile {
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}
