import { NavigatorScreenParams } from '@react-navigation/native';

// 3. The Bottom Tab Navigator types
export type AdminTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Inbox: undefined;
};

// 2. The Stack Navigator types
export type AdminStackParamList = {
  Tabs: NavigatorScreenParams<AdminTabParamList>;
  ProfileDetail: { userId: string };
  ProfileEdit: undefined;
  Staffmanager: undefined;
  ChurchDashboard: undefined; // Fixed spelling here 
  StaffRegistration: undefined;
  ChurchSummary: { refreshed?: boolean }; // Standardizing the param here  
  ChurchRegistration: undefined;
  StaffDetail: undefined;
  StaffDashboard: undefined;
  StaffScreen: undefined;
  ChurchManagement: undefined;

  // ... add others
};

// 1. The Root Drawer types
export type RootDrawerParamList = {
  Main: NavigatorScreenParams<AdminStackParamList>;
  ReceivedRequests: undefined;
  MyPhotos: undefined;
  ChurchSummary: undefined; // If it's also in the drawer
  BaptismRecords: undefined;
};
