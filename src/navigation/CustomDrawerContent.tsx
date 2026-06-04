import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Box, VStack, HStack, Avatar, AvatarImage, Text, Divider, AvatarFallbackText, Center, Heading } from '@/src/components/common/GluestackUI';
import { Alert, Image, ImageBackground, Platform, Pressable, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Camera, CheckIcon, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentYear, getExtension } from '../utils/common';
import { LookupContext } from '../context/LookupContext';
import { useAuth } from '../context/AuthContext';
import GradientView from '../screens/component/GradientView';

export default function CustomDrawerContent(props: any) {
    const { state, userRole, navigation, logout } = props;
    const { user } = useAuth();

    // Add a timestamp to force the Avatar to re-render when the image changes
    const { lookups } = useContext(LookupContext);

    const currentYear = new Date().getFullYear();
    const activeRouteName = state.routeNames[state.index];
    const [profile, setProfile] = useState<any>('');

    useFocusEffect(
        useCallback(() => {
            if (user?.role == 'member')
                setProfile(getExtension(user?.profilePic, 'addthumnail'))
            else setProfile(getExtension(user?.profilePic, 'url'))

        }, [user])
    );

    // useEffect(() => {
    //     if (user.role == 'member')
    //         setProfile(getExtension(user?.profilePic, 'addthumnail'))
    //     else setProfile(getExtension(user?.profilePic, 'url'))

    // }, [])


    const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : "Guest User";

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flexGrow: 1, backgroundColor: 'transparent' }} // Keeps container transparent and fully scrollable
            style={{ backgroundColor: '#033729' }} // Prevents flashing white on load by matching your gradient's base color
        >
            <GradientView
                horizontal={false}
                colors={['#ffffffff', '#e0f5f0ff', '#04231bff']}
                style={{ flex: 1, minHeight: '100%', paddingBottom: 24 }}
            >
                <VStack className="justify-between h-full flex-1">

                    {/* TOP SECTION: Header with ImageBackground */}
                    <Box className="relative pb-10" style={{ borderBottomLeftRadius: 60 }}>
                        <ImageBackground
                            source={require('../assets/images/bgimage_hd.jpg')} // Using your detailed high-def asset
                            style={{
                                height: 160,
                                borderBottomLeftRadius: 60,
                                overflow: 'hidden', // Ensures the image content respects the border radius curve
                                paddingHorizontal: 20,
                                paddingTop: Platform.OS === 'ios' ? 44 : 20,
                            }}
                        >
                            {/* If you ever want to put a logo or text inside the background image, it goes here */}
                        </ImageBackground>

                        {/* Floating User Profile Card */}
                        <GradientView
                            colors={['#ffffff', '#ecfaf5ff']} // Soft, ultra-clean premium vertical white gradient cascade
                            style={{
                                marginTop: -55,
                                borderRadius: 40,      // ✅ Explicitly handles component radius clipping on Android & iOS
                                overflow: 'hidden',    // ✅ Forces the gradient canvas layer to respect the round corners
                                elevation: 20,
                                shadowColor: '#02120e',
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.25,
                                shadowRadius: 16,
                            }}
                            className="mx-6 p-4 border border-white" // Removed rounded-[40px] from here to keep style unified
                        >
                            <VStack space="xl">
                                <HStack space="lg" className="items-center">
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('Main', { screen: user?.role === 'member' ? 'ShowProfileGallery' : 'ProfileUpload' })
                                    }}>
                                        <Box className="relative">
                                            <Box className="p-1 rounded-[24px] bg-slate-100 border-2 border-slate-50">
                                                <Avatar style={{ height: 100, width: 100 }} className="rounded-[20px] bg-emerald-50">
                                                    <AvatarFallbackText className="font-bold text-emerald-700">{fullName}</AvatarFallbackText>
                                                    {profile && <AvatarImage source={{ uri: profile }} />}
                                                </Avatar>
                                            </Box>
                                            <Pressable
                                                onPress={() => navigation.navigate('Main', { screen: user?.role === 'member' ? 'ShowProfileGallery' : 'ProfileUpload' })}
                                                className="absolute -bottom-1 -right-1 bg-green-100 p-2 rounded-2xl shadow-lg border border-slate-100  "
                                            >
                                                <Icon as={Camera} size="sm" className="text-slate-600" />
                                            </Pressable>
                                        </Box>
                                    </TouchableOpacity>

                                    <VStack className="flex-1 gap-2">
                                        <HStack space="xs" className="items-center">
                                            <Heading size="md" className="text-slate-900 font-black tracking-tighter flex-shrink">
                                                {fullName}
                                            </Heading>
                                            <Center className="bg-blue-100 w-5 h-5 rounded-full flex-shrink-0">
                                                <Icon as={CheckIcon} size={'md'} className="text-blue-600" />
                                            </Center>
                                        </HStack>
                                        <Text className="text-slate-400 font-medium text-xs mb-2"> ID: {user?.role === 'member' ? user?.profile_id : user?.userid}</Text>

                                        {user?.role !== 'member' && (
                                            <Box className="bg-slate-100 self-start px-3 py-1 rounded-full border border-slate-200/40">
                                                <Text className="text-slate-700 font-black uppercase text-[8px] tracking-[1px]">
                                                    Role: {user?.role}
                                                </Text>
                                            </Box>
                                        )}
                                    </VStack>
                                </HStack>

                                <Box className="bg-green-50 rounded-2xl p-3 border border-slate-100/50">
                                    <HStack space="sm" className="items-center">
                                        <Box className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <Text className="text-slate-600 font-bold text-[11px] italic">
                                            {user?.email}
                                        </Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        </GradientView>
                    </Box>

                    {/* MIDDLE SECTION: Menu Items Navigation Links */}
                    <Box className="px-2 my-2">
                        <DrawerItemList {...props} />

                        <Divider className="my-4 mx-4 bg-white/20" />

                        {user?.role === 'member' && (
                            <Pressable
                                className="mx-2 p-3 rounded-2xl   "
                                onPress={() => navigation.navigate('Main', { screen: 'MemberSettings' })}
                            >
                                <HStack className="items-center justify-between">
                                    <HStack space="md" className="items-center">
                                        {/* <Center className="w-8 h-8 rounded-xl bg-white/10">
                                            <Icon as={Settings} size="sm" className="text-typography-700" />
                                        </Center> */}
                                        <Text className="font-bold text-typography-700">Settings</Text>
                                    </HStack>
                                    <Icon as={ChevronRight} size="xs" className="text-typography/40" />
                                </HStack>
                            </Pressable>
                        )}
                    </Box>

                    {/* BOTTOM SECTION: Branding Card with Logout Below It */}
                    <Box className="pb-10 mt-auto">
                        <Pressable
                            className="mx-8 mt-2 p-3 mb-4 rounded-2xl   bg-white/5 border border-white/10"
                            onPress={() => logout()}
                        >
                            <HStack className="items-center justify-between">
                                <HStack space="md" className="items-center">
                                    <Center className="w-8 h-8 rounded-xl bg-red-500/20">
                                        <Icon as={LogOut} size="sm" className="text-red-400" />
                                    </Center>
                                    <Text className="font-bold text-white">Logout</Text>
                                </HStack>
                                <Icon as={ChevronRight} size="xs" className="text-white/40" />
                            </HStack>
                        </Pressable>

                        {/* The Floating Footer Card */}
                        <Box className="mx-6 rounded-[40px] p-5  ">
                            <Box className="bg-slate-50 rounded-2xl p-4">
                                <VStack space="xs" className="items-center">
                                    <Text className="text-slate-900 font-black text-[10px] tracking-[2px]">
                                        <Text className="text-emerald-600">{lookups.appName}</Text>
                                    </Text>
                                    <HStack space="xs" className="items-center">
                                        <Text className="text-[9px] font-bold text-slate-400">V {lookups.appVersion}</Text>
                                        <Box className="w-1 h-1 rounded-full bg-slate-300" />
                                        <Text className="text-[9px] font-bold text-slate-400">© {getCurrentYear()}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </Box>
                    </Box>

                </VStack>
            </GradientView>
        </DrawerContentScrollView>
    );
}