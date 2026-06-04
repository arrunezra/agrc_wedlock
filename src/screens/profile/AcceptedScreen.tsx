import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, VStack, HStack, Text, Button, ButtonText, Heading, Avatar, AvatarFallbackText,
    AvatarImage
} from '@/src/components/GluestackUI';
import { User, UserMinus } from "lucide-react-native";
import { Alert, FlatList, Pressable, RefreshControl, ScrollView } from 'react-native';
import profileService from '@/src/services/profileService';
import { useAuth } from '@/src/context/AuthContext';
import { getExtension } from '@/src/utils/common';
import { useAlert } from '@/src/context/AlertContext';
import { useAppToast } from '@/src/context/ToastContext';
import NotFoundScreen from '@/src/components/NotFoundScreen';
import GradientView from '@/src/components/GradientView';

const AcceptedScreen = () => {
    const { showAlert, hideAlert } = useAlert();
    const { showToast } = useAppToast();
    const { user } = useAuth();

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => { fetchBlockedUsers(); }, []);
    const fetchBlockedUsers = async () => {

        const response = await profileService.fetchBlockedUsers();
        if (response.success) {
            const newData = response.data;
            setBlockedUsers(newData);
        } else {

        }


    };
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchBlockedUsers();
        setRefreshing(false);
    }, []);
    const handleUnblock = (targetId: any, targetName: any) => {
        showAlert({
            type: 'success',
            title: 'Unblock Profile?',
            message: `Are you sure you want to unblock ${targetName}?`,
            confirmText: "Unblock",
            onConfirm: async () => {
                hideAlert();
                try {
                    let body = { action: 'unblock', user_id: user?.profile_id, target_id: targetId }
                    const res = await profileService.handle_member_actions(body);

                    if (res.success) {
                        showToast("Unblocked", `${targetName} has been unblocked`, "success");
                        setBlockedUsers((prev: any) => prev.filter((u: any) => u.profile_id !== targetId));

                    }
                    else {
                        showToast("Error", `Something wnet wrong`, "error");

                    }
                } catch (err) {
                    console.error(err);
                } finally {

                }

            }
        });
    };

    return (
        <Box className="flex-1 bg-white p-4">
            {blockedUsers.length !== 0 && <Heading size="lg" className="mb-4">Blocked Profiles  </Heading>}

            {blockedUsers.length === 0 && !refreshing ? (
                <ScrollView
                    contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <NotFoundScreen title={"No blocked users found."} description={'No blocked users yet. If you block someone, they’ll appear here.'} />
                </ScrollView>
            ) :

                (
                    <FlatList
                        data={blockedUsers}
                        keyExtractor={(item: any) => item.profile_id}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#10b981']} // Android spinner color (Emerald)
                                tintColor={'#10b981'} // iOS spinner color
                            />
                        }
                        renderItem={({ item }) => (
                            <HStack className="justify-between items-center p-3 border-b border-outline-100">
                                <Pressable className="items-center flex-1">
                                    <HStack space="md"  >
                                        <Avatar size="lg">
                                            <AvatarFallbackText>{item.first_name}</AvatarFallbackText>
                                            <AvatarImage
                                                source={{ uri: getExtension(item.file_name, 'addthumnail') }}
                                            />
                                        </Avatar>

                                        <VStack className="flex-1">
                                            <Text size="xl" className="font-bold text-typography-900" numberOfLines={1}>
                                                {item.full_name}
                                            </Text>
                                            <Text size="md" className="text-typography-500" numberOfLines={1}>
                                                {item.city_name}, {item.state_name}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </Pressable>
                                <Pressable onPress={() => handleUnblock(item.profile_id, item.full_name)}>
                                    <GradientView
                                        colors={['#10b981', '#059669', '#047857']}
                                        style={{
                                            borderRadius: 12,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            minWidth: 90,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text className="text-white font-bold text-xs tracking-wide">
                                            Unblock
                                        </Text>
                                    </GradientView>
                                </Pressable>
                            </HStack>
                        )}
                    />
                )


            }
        </Box>
    );
};


export default AcceptedScreen