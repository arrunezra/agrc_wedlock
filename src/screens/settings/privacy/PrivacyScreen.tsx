import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import {
    Box, VStack, HStack, Text, Heading, Switch, Divider
} from '@/src/components/common/GluestackUI';
import { Eye, Calendar, ShieldCheck, Lock, Fingerprint, Info, Icon } from '@/src/components/common/IconUI';
import LinearGradient from 'react-native-linear-gradient';
import profileService from '@/src/services/profileService';
import { useAppToast } from '@/src/context/ToastContext';
import { useAlert } from '@/src/context/AlertContext';
import { useAuth } from '@/src/context/AuthContext';
import { User } from '@/src/utils/models';
import HeaderSession from '../../common/HeaderSession';

export default function ContactPrivacyScreen({ navigation }: any) {
    const { showToast } = useAppToast();
    const { showAlert, hideAlert } = useAlert();
    const { user, updateUser } = useAuth();
    //console.log('user', user)
    const [isVisible, setIsVisible] = useState<any>(undefined);
    const [showFullDOB, setShowFullDOB] = useState(false);

    useEffect(() => {

        if (user) {
            setIsVisible(user?.is_visible === 1);
        }
    }, [user?.is_visible]); // Watch the visibility property, not verification
    const updateVisibleState = async (val: boolean) => {
        try {
            const res = await profileService.handle_member_actions({ action: 'visible', status: val ? 1 : 0 });
            if (res && res.success) {
                await updateUser({
                    ...user,
                    is_visible: val ? 1 : 0
                } as User);
                showToast(`${val === true ? 'Disable' : 'Visible'}`, `${val === true ? 'Your profile has been successfully updated' : 'Your profile has been successfully updated'}`, "success");

            } else {
                showToast("Error", `Something wnet wrong`, "error");

            }
        } catch (e) {
            // Rollback on error
            setIsVisible(!val);
        }
    }
    const toggleVisibility = async (val: boolean) => {
        setIsVisible(val);

        if (!val) {
            showAlert({
                type: 'warning',
                title: 'Disable Profile?',
                message: 'Are you sure you want to disable your profile? Your profile will be hidden from everyone.',
                confirmText: "Disable",
                onConfirm: async () => {
                    hideAlert();
                    updateVisibleState(val);
                }
            });
        } else {
            updateVisibleState(val);
        }
    };

    return (
        <Box className="flex-1 bg-white">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Privacy"
                theme="forest"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>

                {/* Screen Title */}
                <VStack className="px-8 pb-8">
                    <Heading size="2xl" className="text-slate-900 font-extrabold tracking-tighter">Privacy Vault</Heading>
                    <Text size="sm" className="text-slate-500 font-medium">Manage how you appear to others</Text>
                </VStack>

                {/* Profile Visibility - Using your Gradient Model */}
                <SettingsGradientCard
                    title="Visibility"
                    icon={Eye}
                    gradientColors={['#f5f3ff', '#ffffff']}
                >
                    <VStack className="mt-4" space="lg">
                        <HStack className="items-center justify-between">
                            <HStack className="items-center" space="md">
                                <Box className="p-2.5 rounded-xl bg-purple-50">
                                    <Icon as={Eye} size="lg" className="text-purple-600" />
                                </Box>
                                <VStack>
                                    <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Search Discovery</Text>
                                    <Text size="md" className="text-typography-900 font-bold">Profile Visibility</Text>
                                </VStack>
                            </HStack>
                            <Switch
                                size="lg"
                                value={isVisible}
                                onValueChange={(value) => {
                                    toggleVisibility(value)
                                }}
                                trackColor={{ false: '#e2e8f0', true: '#a78bfa' }}
                                thumbColor={isVisible ? '#7c3aed' : '#f4f4f5'}
                            />
                        </HStack>

                        <HStack space="xs" items-center className="bg-purple-50/50 p-3 rounded-2xl mt-2 border border-purple-100">
                            <Icon as={Info} size='sm' className="text-purple-400" />
                            <Text size="xs" className="text-purple-600 italic leading-4 flex-1">
                                {isVisible
                                    ? "Others can find you in search results."
                                    : "Your profile is currently hidden from everyone."}
                            </Text>
                        </HStack>
                    </VStack>
                </SettingsGradientCard>

                {/* Date of Birth - Using your Gradient Model */}
                <SettingsGradientCard
                    title="Identity Shield"
                    icon={ShieldCheck}
                    gradientColors={['#f0f9ff', '#ffffff']} // Subtle Blue shift for contrast
                >
                    <VStack className="mt-4" space="lg">
                        <HStack className="items-center justify-between">
                            <HStack className="items-center" space="md">
                                <Box className="p-2.5 rounded-xl bg-blue-50">
                                    <Icon as={Calendar} size="lg" className="text-blue-600" />
                                </Box>
                                <VStack>
                                    <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Display Format</Text>
                                    <Text size="md" className="text-typography-900 font-bold">Full Date of Birth</Text>
                                </VStack>
                            </HStack>
                            <Switch
                                size="lg"
                                value={showFullDOB}
                                onValueChange={setShowFullDOB}
                                trackColor={{ false: '#e2e8f0', true: '#7dd3fc' }}
                                thumbColor={showFullDOB ? '#0284c7' : '#f4f4f5'}
                            />
                        </HStack>

                        <Box className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <Text size="xs" className="text-blue-600 font-medium italic">
                                When enabled, matches will see: <Text className="font-bold">XX-08-1996</Text>
                            </Text>
                            <Text size="xs" className="text-slate-400 mt-1">
                                When disabled, only the full date format (e.g., DD-MM-YYYY) is shown.
                            </Text>
                        </Box>
                    </VStack>
                </SettingsGradientCard>

            </ScrollView>
        </Box>
    );


}

const SettingsGradientCard = ({ title, icon, children, gradientColors }: any) => (
    <Box className="mb-6 px-5">
        <LinearGradient
            colors={gradientColors || ['#f5f3ff', '#ffffff']}
            style={{
                borderRadius: 32,
                padding: 24,
                borderWidth: 1,
                borderColor: '#ede9fe', // Light purple border
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
                elevation: 2
            }}
        >
            <HStack items-center space="md" className="mb-2">
                <Box className="p-2 rounded-lg bg-purple-100/50">
                    <Icon as={icon} size="sm" className="text-purple-600" />
                </Box>
                <Heading size="md" className="text-typography-900">{title}</Heading>
            </HStack>
            {children}
        </LinearGradient>
    </Box>
);