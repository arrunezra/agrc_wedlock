import React, { useCallback, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminDashboard from "../screens/Admin/AdminDashboard";
import ProfileSummary from "../screens/profile/ProfileSummary";
import StaffDashboard from "../screens/staff/StaffDashboard";
import StaffRegistration from "../screens/staff/StaffRegistration";
import StaffDetailsScreen from "../screens/staff/StaffDetailScreen";
import ChurchRegistrationScreen from "../screens/Church/ChurchRegistrationScreen";
import { Box, Button, Center, Heading, Spinner, Text, VStack } from "@/src/components/GluestackUI";

import { HomeIcon, HeartIcon, MessageCircleIcon, Icon, LockIcon } from "@/src/components/IconUI"
import ProfileHomeScreen from "../screens/profile/ProfileHomeScreen";
import MatchesScreen from "../screens/profile/MatchesScreen";
import ViewStaffinforamtion from "../screens/staff/ViewStaffinforamtion";
import StaffSummaryView from "../screens/staff/SummaryView";
import PartnerPreferences from "../screens/profile/PartnerPreferences";
import ChurchDashboard from "../screens/Church/ChurchDashboard";
import ChurchSummary from "../screens/Church/ChurchSummary";
import BaptismScreen from "../screens/Document/BaptismScreen";
import ProfileDetailScreen from "../screens/profile/ProfileDetailScreen";
import ProfileEditScreen from "../screens/profile/ProfileEditScreen";
import DMSUploadScreen from "../screens/DMS/DMSUploadScreen";
import DMSSummaryScreen from "../screens/DMS/DMSSummaryScreen";
import UserDocumentUpload from "../screens/members/UserDocumentUpload";
import ShowProfileGalleryScreen from "../screens/profile/ShowProfileGalleryScreen";
import FavoritesScreen from "../screens/favorites/FavoritesScreen";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler, Platform, ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BlockedUsersScreen from "../screens/profile/BlockedUsersScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import ContactPrivacyScreen from "../screens/settings/privacy/PrivacyScreen";
import SummryListViewScreen from "../screens/profile/dashboard/SummryListViewScreen";
import DocumentSummary from "../screens/members/DocumentSummary";
import StaffInboxScreen from "../screens/staff/StaffInboxScreen";
import StaffDocumentSummary from "../screens/staff/StaffDocumentSummary";
import StaffProfileSummaryView from "../screens/profile/StaffProfileSummaryView";
import { HistoryIcon, UserIcon } from "lucide-react-native";
import ProfileUploadScreen from "../screens/Admin/ProfileUploadScreen";
import ContributeHistoryScreen from "../screens/Contribute/ContributeHistoryScreen";
import ContributionScreen from "../screens/Contribute/ContributionScreen";
import CommunitySupportScreen from "../screens/Razorpay/CommunitySupportScreen";
import ContributionSuccessScreen from "../screens/Contribute/ContributionSuccessScreen";
import DocumentViewer from "@/src/components/DocumentViewer";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const ROLE_DRAWER_CONFIG: Record<string, any[]> = {
  admin: [
    { name: "StaffDashboard", component: StaffDashboard, options: { title: "Staff Details", headerShown: false } },
    { name: "ChurchDashboard", component: ChurchDashboard, options: { title: "Church Details", headerShown: false } },
  ],
  super_admin: [
    { name: "StaffDashboard", component: StaffDashboard, options: { title: "Staff Details", headerShown: false } },
    { name: "ChurchDashboard", component: ChurchDashboard, options: { title: "Church Details", headerShown: false } },
  ],
  root_admin: [
    { name: "StaffDashboard", component: StaffDashboard, options: { title: "Staff Details", headerShown: false } },
    { name: "ChurchDashboard", component: ChurchDashboard, options: { title: "Church Details", headerShown: false } },
  ],
  member: [
    // { name: "ReceivedRequests", component: ReceivedScreen },
    // { name: "AcceptedRequests", component: AcceptedScreen },
    // { name: "MyPhotos", component: MyPhotos, options: { title: "My Photos" } }, Dont delete 
    { name: "PartnerPreferences", component: PartnerPreferences, options: { title: "Partner Preferences", headerShown: false } },
    { name: "DocumentSummary", component: DocumentSummary, options: { title: "My Files", headerShown: false } },
  ],
  staff: [
    { name: "BaptismRecords", component: BaptismScreen, options: { title: "Documents", headerShown: false } },
  ],
};

// 1. Define the Tab Configuration
const TAB_CONFIG = {
  admin: [
    { name: "Dashboard", component: AdminDashboard, icon: HomeIcon, title: "Home" },
    { name: "Profile", component: ProfileSummary, icon: UserIcon, title: "Profile" },
    { name: "ContributeHistory", component: ContributeHistoryScreen, icon: HistoryIcon, title: "Contribute" },
  ],
  super_admin: [
    { name: "Dashboard", component: AdminDashboard, icon: HomeIcon, title: "Home" },
    { name: "Profile", component: ProfileSummary, icon: UserIcon, title: "Profile" },
    { name: "ContributeHistory", component: ContributeHistoryScreen, icon: HistoryIcon, title: "Contribute" },
  ],
  root_admin: [
    { name: "Dashboard", component: AdminDashboard, icon: HomeIcon, title: "Home" },
    { name: "Profile", component: ProfileSummary, icon: UserIcon, title: "Profile" },
    { name: "ContributeHistory", component: ContributeHistoryScreen, icon: HistoryIcon, title: "Contribute" },
  ],
  staff: [
    { name: "Home", component: StaffDashboard, icon: HomeIcon, options: { title: "Home" } },
    { name: "Profile", component: ProfileSummary, icon: HeartIcon, title: "Profile" },
    { name: "staffInbox", component: StaffInboxScreen, icon: MessageCircleIcon, title: "Inbox" },
  ],
  member: [
    { name: "Home", component: ProfileHomeScreen, icon: HomeIcon, title: "Home" },
    { name: "Matches", component: MatchesScreen, icon: HeartIcon, title: "Matches" },
    { name: "Favourites", component: FavoritesScreen, icon: MessageCircleIcon, title: "Favourites" },
  ],
};

// 2. Define Shared Stack Screens (DRY - Don't Repeat Yourself)
const SHARED_STACKS = (role: string) => (
  <Stack.Group screenOptions={{ headerShown: false }}>
    {/* Common Staff Screens available to both Admin and Staff */}
    {((role === 'admin' || role === 'super_admin' || role === 'root_admin') || role === 'staff') && (
      <>
        <Stack.Screen name="StaffRegistration" component={StaffRegistration} />
        <Stack.Screen name="StaffDetail" component={StaffDetailsScreen} />
        <Stack.Screen name="ViewStaffinforamtion" component={ViewStaffinforamtion} />
        <Stack.Screen name="StaffSummaryView" component={StaffSummaryView} />
        <Stack.Screen name="staffInbox" component={StaffInboxScreen} options={{ title: 'Recent verification photo' }} />
        <Stack.Screen name="DMSUpload" component={DMSUploadScreen} />
        <Stack.Screen name="DMSSummary" component={DMSSummaryScreen} />
        <Stack.Screen name="StaffDocumentSummary" component={StaffDocumentSummary} options={{ title: 'Documents', headerShown: false }} />
        <Stack.Screen name="staffProfileSummaryView" component={StaffProfileSummaryView} options={{ title: 'Profiles' }} />




      </>
    )}
    {/* Admin Only Modals */}
    {(role === 'admin' || role === 'super_admin' || role === 'root_admin') && (
      <><Stack.Screen name="ChurchRegistration" component={ChurchRegistrationScreen} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="ChurchSummary" component={ChurchSummary} options={{ title: 'Church Summary' }} />
      </>
    )}
    {role === 'member' && (
      <>
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="MemberSettings" component={SettingsScreen} />
        <Stack.Screen name="ContactPrivacy" component={ContactPrivacyScreen} options={{ title: 'Contact Privacy' }} />
        <Stack.Screen name="BlockedUsersScreen" component={BlockedUsersScreen} options={{ title: 'Blocked Profile' }} />
        <Stack.Screen name="SummryListView" component={SummryListViewScreen} options={{ title: 'Profile Summary' }} />
        <Stack.Screen name="UserDocumentUpload" component={UserDocumentUpload} options={{ title: 'My Documents' }} />



      </>
    )}

    <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
    <Stack.Screen name="ShowProfileGallery" component={ShowProfileGalleryScreen} />
    <Stack.Screen
      name="DocumentViewer"
      component={DocumentViewer}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Contribute" component={ContributionScreen} options={{ title: 'Church Contribution' }} />
    <Stack.Screen name="ProfileUpload" component={ProfileUploadScreen} options={{ title: 'Profile Upload' }} />
    <Stack.Screen name="CommunitySupport" component={CommunitySupportScreen} options={{ title: 'Community Support' }} />
    <Stack.Screen name="Contributionsuccess" component={ContributionSuccessScreen} options={{ title: 'Contribution Details' }} />


  </Stack.Group>
);

// 3. Dynamic Tab Component
const DynamicTabs = ({ route }: any) => {

  const lastBackPressed = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const currentTime = Date.now();
        // 1. Check if this is the second press (within 2 seconds)
        if (lastBackPressed.current && currentTime - lastBackPressed.current < 2000) {
          (async () => {
            try {
              const rememberMe = await AsyncStorage.getItem('rememberMe');
              if (rememberMe === 'false') {
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
              }
            } catch (e) {
              console.error("Exit cleanup error:", e);
            } finally {
              BackHandler.exitApp();
            }
          })();

          return true;
        }

        // 4. Handle first press
        lastBackPressed.current = currentTime;

        if (Platform.OS === 'android') {
          ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
        }

        return true; // Tells the system: "I've handled this, don't close yet."
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
        lastBackPressed.current = 0;
      };
    }, [])
  );
  const { role } = route.params;
  const tabs = TAB_CONFIG[role as keyof typeof TAB_CONFIG] || TAB_CONFIG.staff;
  const firstTabName = role === 'member' ? 'Matches' : tabs[0]?.name;
  return (
    <Tab.Navigator
      initialRouteName={firstTabName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        tabBarIcon: ({ color }) => {
          const config = tabs.find(t => t.name === route.name);
          return <Icon as={config?.icon} color={color} size="lg" />;
        },
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.title }}
        />
      ))}
    </Tab.Navigator>
  );
};



// 4. The Master Dynamic Router
const DynamicStackRouter = ({ userRole, logout }: { userRole: string, logout: any }) => {
  // 1. Role Guard: Check if user exists\
  //console.log('userRole', userRole)
  if (!userRole) {
    return (
      <Center className="flex-1 bg-white p-6">
        <VStack space="lg" className="items-center">
          <Box className="p-4 bg-error-50 rounded-full">
            <Icon as={LockIcon} size="xl" className="text-error-600" />
          </Box>
          <VStack space="xs" className="items-center">
            <Heading size="md">Access Denied</Heading>
            <Text className="text-center text-slate-500">
              You are not authorized to view this section or your session has expired.
            </Text>
          </VStack>
          <Button onPress={logout} variant="outline" className="mt-4 border-error-600">
            <Text className="text-error-600 font-bold">Back to Login</Text>
          </Button>
        </VStack>
      </Center>
    );
  }

  // 2. Allowed Roles: Check if role is valid
  const allowedRoles = ['admin', 'staff', 'member', 'super_admin', 'root_admin'];
  if (!allowedRoles.includes(userRole)) {
    return (
      <Center className="flex-1">
        <Spinner size="large" color="#0891b2" />
        <Text className="mt-4 text-slate-400 font-medium">Configuring your workspace...</Text>
      </Center>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Set initial params so the Tab navigator knows which role to render */}
      <Stack.Screen
        name="MainTabs"
        component={DynamicTabs}
        initialParams={{ role: userRole }}
      />

      {/* Inject Shared Stack Screens */}
      {SHARED_STACKS(userRole)}
    </Stack.Navigator>
  );
};

export default DynamicStackRouter;