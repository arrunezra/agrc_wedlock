import React from 'react';
import { Image } from 'react-native'; // Added for profile picture rendering
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '../../context/AuthContext';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Pressable } from '@/components/ui/pressable';
import { Divider } from '@/components/ui/divider';
import { HomeIcon, UserIcon, UsersIcon, ShieldCheckIcon, SettingsIcon, Icon, LogOutIcon, HelpCircleIcon } from './IconUI';
import authService from '@/src/services/authService';

const CustomDrawer = (props: any) => {
  const { user, logout } = useAuth();
  const { navigation } = props;
  const userData: any = authService.getUser();
  // Added dynamic icons to your menu items
  const menuItems = [
    { label: 'Dashboard', icon: HomeIcon, route: 'Home' },
    { label: 'My Profile', icon: UserIcon, route: 'Profile' },
    { label: 'Staff Management', icon: UsersIcon, route: 'Staff' },
    { label: 'Profile Access', icon: ShieldCheckIcon, route: 'ProfileAccess' },
    { label: 'Settings', icon: SettingsIcon, route: 'Settings' },
    { label: 'Staff Management', icon: UsersIcon, route: 'StaffManagement' },
    { label: 'Church Management', icon: UsersIcon, route: 'Church' },
    { label: 'Church Dashboard', icon: UsersIcon, route: 'ChurchDashboard' },
    { label: 'Wizard For Profile creator', icon: UsersIcon, route: 'WizardScreen' },


  ];

  const handleLogout = async () => {
    // Optional: Add a confirmation dialog here
    await logout();
    // AuthContext usually handles the navigation switch automatically 
    // if your AppNavigator listens to isAuthenticated
  };

  return (
    <Box className="flex-1 bg-background-0">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Profile Header Section */}
        <Box className="bg-primary-600 px-4 py-10">
          <HStack className="items-center gap-4">
            <Avatar size="xl" className="bg-amber-100 border-2 border-white">
              <AvatarFallbackText className="text-primary-700 font-bold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallbackText>
              {/* If user.profile_thumb exists, it will show the image */}
              {userData?.profile_thumb && (
                <AvatarImage
                  source={{ uri: userData?.profile_thumb }}
                  alt="Profile Image"
                />
              )}
            </Avatar>
            <VStack className="flex-1">
              <Text className="text-white font-bold text-xl no-underline">
                {user?.name || 'Guest User'}
              </Text>
              <Text className="text-primary-100 text-sm italic">
                {user?.email || 'Not logged in'}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Dynamic Menu Items */}
        <VStack className="gap-1 mt-6 px-4">
          {menuItems.map((item: any) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route)}

              className="py-3 px-3 rounded-xl "
            >
              <HStack className="items-center gap-4">
                <Icon as={item.icon} className="text-typography-500" size="md" />
                <Text className="text-md font-medium text-typography-800">
                  {item.label}
                </Text>
              </HStack>
            </Pressable>
          ))}
        </VStack>

        <Divider className="my-6 mx-4 bg-outline-100" />

        {/* Support Section */}
        <VStack className="px-4">
          <Pressable
            onPress={() => { }}
            className="py-3 px-3 rounded-xl  "
          >
            <HStack className="items-center gap-4">
              <Icon as={HelpCircleIcon} className="text-typography-500" size="md" />
              <Text className="text-md text-typography-700">
                Help & Support
              </Text>
            </HStack>
          </Pressable>
        </VStack>
      </DrawerContentScrollView>

      {/* Footer / Logout Section */}
      <Box className="border-t border-outline-100 p-4">
        <Pressable
          onPress={handleLogout}
          className="py-4 px-4 rounded-xl "
        >
          <HStack className="items-center gap-4">
            <Icon as={LogOutIcon} className="text-error-600" size="md" />
            <Text className="text-md font-bold text-error-600">
              Logout
            </Text>
          </HStack>
        </Pressable>
        <Text className="text-center text-xs text-typography-400 mt-2">
          App Version 1.0.2
        </Text>
      </Box>
    </Box>
  );
};

export default CustomDrawer;