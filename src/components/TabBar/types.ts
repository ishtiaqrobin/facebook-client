// Type definitions for TabBar components
export interface Tab {
  id: string;
  name: string;
  token: string;
  active: boolean;
  isLoggedIn: boolean;
  profileData?: {
    name: string;
    profilePicture: string;
  };
}

export interface Page {
  page_id: string;
  name: string;
  category: string;
  category_id: string;
  tasks: string;
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
