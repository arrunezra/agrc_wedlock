import React from 'react';
import { Pressable, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
//import { Box, VStack, HStack, Text, Heading, Icon, Pressable, Divider, ChevronRightIcon } from '@/components/ui';
import { User, Lock, Bell, Shield, Trash2, Eye, Calendar, Ban, Heart, Sparkles, LogOut, Info } from 'lucide-react-native';
import { Box, VStack, HStack, Text, Divider, Heading } from '@/src/components/common/GluestackUI';
import { ChevronRightIcon, Icon } from '@/src/components/common/IconUI';
import { useAuth } from '@/src/context/AuthContext';
import profileService from '@/src/services/profileService';
import { useAppToast } from '@/src/context/ToastContext';
import { useAlert } from '@/src/context/AlertContext';
import HeaderSession from '../common/HeaderSession';
import GradientView from '../component/GradientView';

export default function SettingsScreen({ navigation }: any) {

  const { logout, user } = useAuth();
  const { showToast } = useAppToast();
  const { showAlert, hideAlert } = useAlert();

  const confirmDelete = async () => {

    try {
      const res = await profileService.handle_member_actions({ action: 'accdelete', 'user_id': user?.userid });
      if (res && res.success) {

        showToast('Your profile has been successfully deleted', "success");
        logout();
      } else {
        showToast("Error", `Something wnet wrong`, "error");

      }
    } catch (e) {
    }
  }

  const onDeleteAccount = async () => {
    showAlert({
      type: 'warning',
      title: 'Delete Profile?',
      message: 'Are you sure you want to delete your profile?',
      confirmText: "Delete",
      onConfirm: async () => {
        hideAlert();
        confirmDelete();

      }
    });

  }

  const SettingsGradientCard = ({ title, icon, children, gradientColors }: any) => (
    <Box className="mb-6 px-5">
      <GradientView
        colors={gradientColors || ['#f0f9ff', '#ffffff']}
        style={{ borderRadius: 32, padding: 20, borderWidth: 1, borderColor: '#e0f2fe' }}
      >
        <HStack className="items-center" space="md"  >
          <Box className="p-2 rounded-lg bg-blue-100/50">
            <Icon as={icon} size="sm" className="text-blue-600" />
          </Box>
          <Heading size="md" className="text-typography-900">{title}</Heading>
        </HStack>
        {children}
      </GradientView>
    </Box >
  );
  return (
    <Box className="flex-1 bg-white">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
      <HeaderSession
        title="Settings"
        theme="forest"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showRightIcon={true}
        rightIconType="menu"
        onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>

        <VStack className="px-8 pb-6">
          <Heading size="2xl" className="text-slate-900 font-extrabold tracking-tighter">Settings</Heading>
          <Text size="sm" className="text-slate-500">Manage your account and preferences</Text>
        </VStack>

        {/* Section 1: Contact & Privacy */}
        <SettingsGradientCard title="Account Details" icon={Shield} gradientColors={['#f0f9ff', '#ffffff']}>
          <VStack className='mt-4' space="lg">
            {/* Item 1 */}
            <Pressable onPress={() => {
              navigation.navigate('Main', {
                screen: 'ProfileEdit'
              })
              // navigation.navigate('EditProfile')}
            }}>
              <HStack className='items-center justify-between'>
                <HStack className='items-center' space="md">
                  <Box className="p-2.5 rounded-xl bg-blue-50"><Icon as={User} size="lg" className="text-blue-600" /></Box>
                  <VStack>
                    <Text size="xs" className="text-typography-500 font-medium uppercase">Personal Info</Text>
                    <Text size="md" className="text-typography-900 font-bold">Profile Details</Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRightIcon} size="sm" className="text-blue-300" />
              </HStack>
            </Pressable>

            <Box className="h-[1px] bg-blue-100/50 w-full" />

            {/* Item 2 */}
            <Pressable onPress={() => navigation.navigate('ContactPrivacy')}>
              <HStack className='items-center justify-between'>
                <HStack className='items-center' space="md">
                  <Box className="p-2.5 rounded-xl bg-blue-50"><Icon as={Eye} size="lg" className="text-blue-600" /></Box>
                  <VStack>
                    <Text size="xs" className="text-typography-500 font-medium uppercase">Visibility</Text>
                    <Text size="md" className="text-typography-900 font-bold">Profile Privacy</Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRightIcon} size="sm" className="text-blue-300" />
              </HStack>
            </Pressable>

            <Box className="h-[1px] bg-blue-100/50 w-full" />

            {/* Item 3 */}
            <Pressable onPress={() => navigation.navigate('BlockedUsersScreen')}>
              <HStack className='items-center justify-between'>
                <HStack className='items-center' space="md">
                  <Box className="p-2.5 rounded-xl bg-blue-50"><Icon as={Ban} size="lg" className="text-blue-600" /></Box>
                  <VStack>
                    <Text size="xs" className="text-typography-500 font-medium uppercase">Restrictions</Text>
                    <Text size="md" className="text-typography-900 font-bold">Blocked Profiles</Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRightIcon} size="sm" className="text-blue-300" />
              </HStack>
            </Pressable>
          </VStack>
        </SettingsGradientCard>

        {/* Section 2: Smart Preferences */}
        <SettingsGradientCard title="Smart Preferences" icon={Sparkles} gradientColors={['#f5f3ff', '#ffffff']}>
          <VStack className='mt-4' space="lg">
            <Pressable onPress={() => navigation.navigate('PartnerPreferences')}>
              <HStack className='items-center justify-between'  >
                <HStack className='items-center' space="md">
                  <Box className="p-2.5 rounded-xl bg-purple-50"><Icon as={Heart} size="lg" className="text-purple-600" /></Box>
                  <VStack>
                    <Text size="xs" className="text-typography-500 font-medium uppercase">Matchmaking</Text>
                    <Text size="md" className="text-typography-900 font-bold">Partner Preferences</Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRightIcon} size="sm" className="text-purple-300" />
              </HStack>
            </Pressable>

            <HStack space="xs" items-center className="bg-purple-50/50 p-3 rounded-2xl mt-2 border border-purple-100">
              <Icon as={Info} size='sm' className="text-purple-400" />
              <Text size="xs" className="text-purple-600 italic">Adjust preferences to get better suggestions.</Text>
            </HStack>
          </VStack>
        </SettingsGradientCard>

        {/* Section 3: Security & Logout */}
        <SettingsGradientCard title="Security" icon={Lock} gradientColors={['#f8fafc', '#ffffff']}>
          <VStack className='mt-4' space="lg">
            <TouchableOpacity onPress={() => logout()}>
              <HStack className='items-center justify-between'>
                <HStack className='items-center' space="md">
                  <Box className="p-2.5 rounded-xl bg-slate-100"><Icon as={LogOut} size="lg" className="text-slate-600" /></Box>
                  <VStack>
                    <Text size="xs" className="text-typography-500 font-medium uppercase">Session</Text>
                    <Text size="md" className="text-typography-900 font-bold">Logout</Text>
                  </VStack>
                </HStack>
                <Icon as={ChevronRightIcon} size="sm" className="text-slate-300" />
              </HStack>
            </TouchableOpacity>
          </VStack>
        </SettingsGradientCard>

        {/* Danger Zone */}
        <Box className="px-5 mt-4">
          <Pressable onPress={onDeleteAccount} className="bg-red-50 rounded-[32px] p-6 border border-red-100 items-center">
            <HStack space="md" className='items-center '>
              <Icon as={Trash2} size="sm" className="text-red-500" />
              <Text className="text-red-600 font-bold">Delete Account Permanently</Text>
            </HStack>
          </Pressable>
        </Box>

      </ScrollView>
    </Box>
  );
}