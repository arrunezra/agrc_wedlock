import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Avatar, AvatarImage, AvatarFallbackText, Center } from '@/src/components/common/GluestackUI';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { AddIcon, CheckIcon, EditIcon, Icon, StarIcon } from '@/components/ui/icon';
import { getExtension } from '@/src/utils/common';
import { Briefcase, Camera, CheckCircle, CheckCircle2, ChevronRight, Edit3, Eye, GraduationCap, Heart, HeartHandshake, MapPin, Share2, Star, TrendingUp, Users, Zap } from 'lucide-react-native';
import profileService from '@/src/services/profileService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LookupContext } from '@/src/context/LookupContext';
import { useAppToast } from '@/src/context/ToastContext';
import GradientView from '../../component/GradientView';

const UserTopProfile = ({ user, onEdit, onAddPhoto, onContribution }: any) => {
    const navigation = useNavigation<any>();
    const { lookups } = useContext(LookupContext);
    const { showToast } = useAppToast();

    const [profiles, setProfiles] = useState<string>('');
    // Initialize with safe default values so rendering doesn't crash or read undefined variables
    const [summary, setSummary] = useState<any>({
        likes: 0,
        views: 0,
        accepted: 0,
        requests: 0,
        isContributed: false,
        contributionAmount: 0
    });

    // FIX 1: Move side effect out of useMemo and handle profile picture sync cleanly inside useEffect
    useEffect(() => {
        if (user?.profilePic) {
            const calculatedUrl = getExtension(user.profilePic, 'addthumnail');
            setProfiles(calculatedUrl);
        }
    }, [user?.profilePic]);

    // Optimized Fetch Function
    const fetchSummaryDetails = useCallback(async () => {
        if (!user?.profile_id) return; // Prevent calling if profile_id hasn't mounted yet

        try {
            const response = await profileService.fetchSummaryDetails({
                profile_id: user?.profile_id,
                role: 'Profile',
                view_mode: 'COUNT',
                filter_by: ''
            });

            if (response?.success) {
                //console.log('Summary response fetched successfully:', response);
                let items = {
                    ...response.summary,
                    isContributed: response?.isContributed,
                    contributionAmount: response?.contributionAmount

                }
                setSummary(items);
            }
        } catch (error) {
            console.error("Summary Fetch Error:", error);
        }
    }, [user?.profile_id]);

    // Combined Lifecycle Hook
    useFocusEffect(
        useCallback(() => {
            fetchSummaryDetails();
            return () => { };
        }, [fetchSummaryDetails])
    );

    const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : "Guest User";

    return (
        <VStack className="px-5 py-8 bg-[#f8fafc] gap-8">

            {/* Profile Card Overlay */}
            <HStack space="lg" className="items-center bg-white p-3 rounded-[32px] shadow-sm border border-slate-100">
                <Box className="relative">
                    <Pressable onPress={onAddPhoto} className=" ">
                        <Box className="p-1 rounded-full bg-indigo-50 border border-indigo-100">
                            <Avatar size="2xl" className="rounded-full bg-slate-200">
                                <AvatarFallbackText className="font-bold text-slate-600" >
                                    {fullName}
                                </AvatarFallbackText>
                                {!!profiles && (
                                    <AvatarImage source={{ uri: profiles }} />
                                )}
                            </Avatar>
                        </Box>

                        <Box
                            className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md border border-slate-50"
                            style={{ elevation: 4 }}
                        >
                            <Center className="bg-indigo-600 p-1.5 rounded-full">
                                <Icon as={Camera} size="xs" color="white" />
                            </Center>
                        </Box>
                    </Pressable>
                </Box>

                <VStack className="flex-1">
                    <HStack items-center space="xs">
                        <Heading size="xl" className="text-slate-900 font-black ">
                            {fullName}
                        </Heading>
                        <Icon as={CheckCircle2} size="sm" className="text-blue-500 fill-blue-50" />
                    </HStack>

                    <Box className="bg-slate-100 self-start px-2.5 py-1 rounded-lg mt-1">
                        <Text size="xs" className="text-slate-600 font-bold tracking-tighter uppercase">
                            ID: {user?.role === 'member' ? user?.profile_id : user?.userid}
                        </Text>
                    </Box>
                </VStack>
            </HStack>

            {/* Action Buttons Row */}
            <HStack space="md" className="w-full px-4 items-center">
                {/* Edit Profile */}
                <TouchableOpacity
                    onPress={onEdit}
                    activeOpacity={0.7}
                    className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                    <View className="h-14 flex-row items-center justify-center px-4">
                        <Edit3 size={18} color="#475569" strokeWidth={2.5} />
                        <Text className="ml-2 font-bold text-slate-600 text-sm">
                            Edit Profile
                        </Text>
                    </View>
                </TouchableOpacity>

                {summary?.isContributed === false && (
                    <TouchableOpacity
                        onPress={() => onContribution(summary?.contributionAmount ?? 0)}
                        activeOpacity={0.9}
                        style={{ elevation: 8 }}
                        className="flex-[1.5] overflow-hidden rounded-2xl shadow-lg shadow-emerald-500/40"
                    >
                        <GradientView
                            colors={['#10b981', '#059669']}
                            className="h-14 flex-row items-center justify-center px-4"
                        >
                            <Heart size={18} color="white" strokeWidth={2.5} />

                            <Text className="ml-2 text-white font-black text-sm tracking-wide uppercase">
                                Donate Securely
                            </Text>
                        </GradientView>
                    </TouchableOpacity>
                )}
            </HStack>

            {/* Bento Grid Analytics */}
            <VStack className="flex-1 bg-white px-6 pt-4 pb-10">
                <Box className="mb-8">
                    <HStack space="md" className="mb-4">
                        {/* Likes Card */}
                        <VStack className="flex-1 p-5 rounded-[32px] bg-indigo-50/50 border border-indigo-100 items-center relative">
                            <TouchableOpacity className='items-center ' onPress={() => {
                                if (summary?.isContributed) {
                                    navigation.navigate('SummryListView', { filter: 'Likes' });
                                } else {

                                    onContribution(summary?.contributionAmount ?? 0);
                                }
                            }}>
                                <Center className="w-10 h-10 rounded-2xl bg-indigo-100 mb-2">
                                    <Icon as={Users} size="sm" className="text-indigo-600" />
                                </Center>
                                <Text className="text-indigo-900 font-black text-xl">{summary?.likes ?? 0}</Text>
                                <Text className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest">Likes</Text>
                            </TouchableOpacity>
                        </VStack>

                        {/* Views Card */}
                        <VStack className="flex-1 p-5 rounded-[32px] bg-emerald-50/50 border border-emerald-100 items-center relative">
                            <TouchableOpacity className='items-center ' onPress={() => {
                                if (summary?.isContributed) {
                                    navigation.navigate('SummryListView', { filter: 'Views' });
                                } else {
                                    onContribution(summary?.contributionAmount ?? 0);
                                }
                            }}>
                                <Center className="w-10 h-10 rounded-2xl bg-emerald-100 mb-2">
                                    <Icon as={Eye} size="sm" className="text-emerald-600" />
                                </Center>
                                <Text className="text-emerald-900 font-black text-xl">{summary?.views ?? 0}</Text>
                                <Text className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">Views</Text>
                                <Box className="absolute top-4 right-4 bg-emerald-500 w-2 h-2 rounded-full border-2 border-white" />
                            </TouchableOpacity>
                        </VStack>
                    </HStack>

                    <HStack space="md">
                        {/* Accepted Card */}
                        <VStack className="flex-1 p-5 rounded-[32px] bg-purple-50/50 border border-purple-100 items-center">
                            <TouchableOpacity className='items-center ' onPress={() => {
                                if (summary?.isContributed) {
                                    navigation.navigate('SummryListView', { filter: 'Accepted' });
                                } else {
                                    onContribution(summary?.contributionAmount ?? 0);
                                }
                            }}>
                                <Center className="w-10 h-10 rounded-2xl bg-purple-100 mb-2 shadow-sm shadow-purple-200">
                                    <Icon as={CheckCircle2} size="sm" className="text-purple-600" />
                                </Center>
                                <Text className="text-purple-900 font-black text-xl">{summary?.accepted ?? 0}</Text>
                                <Text className="text-purple-400 text-[9px] font-bold uppercase tracking-widest">Accepted</Text>
                            </TouchableOpacity>
                        </VStack>

                        {/* Requests Card */}
                        <VStack className="flex-1 p-5 rounded-[32px] bg-rose-50/50 border border-rose-100 items-center relative">
                            <TouchableOpacity className='items-center ' onPress={() => {
                                if (summary?.isContributed) {
                                    navigation.navigate('SummryListView', { filter: 'Requests' });
                                } else {
                                    let cont = summary?.contributionAmount ?? 0;
                                    if (cont == 0) {
                                        showToast("Service Unavailable", "Check your admin", "error");

                                    }
                                    else onContribution(summary?.contributionAmount ?? 0);
                                }
                            }}>
                                <Center className="w-10 h-10 rounded-2xl bg-rose-100 mb-2">
                                    <Icon as={HeartHandshake} size="sm" className="text-rose-600" />
                                </Center>
                                <Text className="text-rose-900 font-black text-xl">{summary?.requests ?? 0}</Text>
                                <Text className="text-rose-400 text-[9px] font-bold uppercase tracking-widest">Requests</Text>
                            </TouchableOpacity>
                        </VStack>
                    </HStack>
                </Box>

                {/* Footer Section */}
                <Box className="mt-auto mb-10 relative">
                    <GradientView
                        colors={['#10b981', '#3b82f6', '#6366f1']}
                        style={{
                            position: 'absolute',
                            inset: -1,
                            borderRadius: 40,
                            opacity: 0.3,
                        }}
                    />

                    <Box className="bg-white rounded-[38px] p-10 shadow-2xl shadow-slate-200 items-center">
                        <VStack space="xl" className="items-center">
                            <Box className="relative mb-2">
                                <Center className="w-14 h-14 rounded-[22px] bg-slate-50 border border-slate-100 shadow-sm">
                                    <Icon as={Heart} size="sm" className="text-rose-500" />
                                </Center>
                                <Box className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                            </Box>

                            <VStack className="items-center" space="md">
                                <Text className="text-slate-400 font-black text-[9px] uppercase tracking-[5px]">Daily Verse</Text>
                                <Text className="text-slate-800 text-[20px] text-center font-bold leading-8 tracking-tight">
                                    "Let all that you do{"\n"}
                                    <Text className="text-emerald-600 italic">be done in love.</Text>"
                                </Text>
                                <Box className="mt-4 px-3 py-1 rounded-full bg-slate-100/50">
                                    <Text className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">1 Corinthians 16:14</Text>
                                </Box>
                            </VStack>

                            <VStack className="items-center mt-4">
                                <Text className="text-slate-300 font-black text-[8px] uppercase tracking-[3px]">
                                    {lookups?.appName || "Rock City AG Church"}
                                </Text>
                            </VStack>
                        </VStack>
                    </Box>
                </Box>
            </VStack>
        </VStack>
    );
};

export default UserTopProfile;
