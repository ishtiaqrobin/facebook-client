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
  id: string;
  name: string;
  access_token: string;
  category: string;
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
