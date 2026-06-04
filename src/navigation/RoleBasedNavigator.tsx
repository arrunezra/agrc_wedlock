import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import CustomDrawerContent from './CustomDrawerContent';
import { HeartIcon, HomeIcon, Icon, MessageCircleIcon } from '@/src/components/IconUI';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileDetailScreen from '../screens/profile/ProfileDetailScreen';
import DynamicStackRouter, { ROLE_DRAWER_CONFIG } from './DynamicStackRouter';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
// --- TABS BASED ON ROLE ---



// --- MAIN DRAWER (The Wrapper) ---
export function RoleBasedNavigator({ userRole, user, logout }: any) {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} userRole={userRole} user={user} logout={logout} />}
        >
            <Drawer.Screen name="Main" options={{ headerShown: false, title: userRole === 'member' ? 'My Profile' : 'Dashboard' }}>
                {() => <DynamicStackRouter userRole={userRole} logout={logout} />}
            </Drawer.Screen>

            {ROLE_DRAWER_CONFIG[userRole]?.map(({ name, component, options }) => (
                <Drawer.Screen key={name} name={name} component={component} options={options} />
            ))}

        </Drawer.Navigator>
    );
}