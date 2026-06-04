import { Avatar, AvatarFallbackText, AvatarImage, Box, Heading, HStack, Link, LinkText, VStack } from "@/src/components/common/GluestackUI";
import { AddIcon, Icon, UserCheck } from "@/src/components/common/IconUI";
import StaffService from "@/src/services/StaffService";
import { Activity, ChevronRight, Edit2, Edit3Icon, Phone, PhoneIcon, Plus, PlusIcon, Users, UserX } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StatusAlert } from "../common/StatusAlert";
import DashboardSkeleton from "./DashboardSkeleton";
import HeaderSession from "../common/HeaderSession";
import AnimatedMotiView from "../component/AnimateView";
import GradientView from "../component/GradientView";

const StaffDashboard = ({ navigation }: any) => {
    const [data, setData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await StaffService.getDashboardData();
            if (res.success) setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, []);
    return (
        <View className="flex-1 bg-slate-50">

            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Staff Overview"
                theme="blue"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />


            <KeyboardAwareScrollView bottomOffset={0} className="flex-1 bg-slate-50 p-4" showsVerticalScrollIndicator={false} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} tintColor="#0891b2" />
            } >

                <VStack space="xl" className=" pb-10">

                    {/* --- Main Total Card --- */}

                    <GradientView
                        colors={['#0891b2', '#0e7490', '#155e75']}

                        horizontal={true}
                        style={{ borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}
                    >
                        <Icon as={Users} size={'lg'} className="absolute -right-6 -bottom-6 text-white opacity-20" />
                        <HStack className="justify-between items-center">
                            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'StaffSummaryView' })}>

                                <VStack>
                                    <Text className="text-cyan-100 text-xs font-bold uppercase tracking-wider">Total Employees</Text>
                                    <Heading size="3xl" className="text-white mt-1">{data?.summary?.total_count || 0}</Heading>
                                </VStack>
                            </TouchableOpacity>
                            <Box className="bg-white/20 p-3 rounded-2xl">
                                <Icon as={Activity} className="text-white" size="lg" />
                            </Box>
                        </HStack>
                    </GradientView>

                    {/* --- Split Summary Cards --- */}
                    <HStack space="md">
                        {/* Active Gradient Card */}

                        <GradientView
                            colors={['#ffffff', '#f0fdf4']}
                            horizontal={true}
                            className="flex-1 rounded-3xl border border-emerald-100 p-5 relative overflow-hidden"
                        >
                            <Icon as={UserCheck} size={'xl'} className="absolute -right-4 -bottom-4 text-emerald-200 opacity-40" />
                            <VStack space="xs">
                                <Box className="bg-emerald-500 self-start p-1.5 rounded-lg">
                                    <Icon as={UserCheck} size="xs" className="text-white" />
                                </Box>
                                <Text className="text-slate-500 text-[10px] font-bold uppercase mt-2">Active</Text>
                                <Heading size="lg" className="text-emerald-700">{data?.summary?.active_count || 0}</Heading>
                            </VStack>
                        </GradientView>

                        {/* Inactive Gradient Card */}

                        <GradientView
                            horizontal={true}
                            colors={['#ffffff', '#fef2f2']}
                            className="flex-1 rounded-3xl border border-red-100 p-5 relative overflow-hidden"

                        >

                            <Icon as={UserX} size={'xl'} className="absolute -right-4 -bottom-4 text-red-200 opacity-40" />
                            <VStack space="xs">
                                <Box className="bg-red-500 self-start p-1.5 rounded-lg">
                                    <Icon as={UserX} size="xs" className="text-white" />
                                </Box>
                                <Text className="text-slate-500 text-[10px] font-bold uppercase mt-2">Inactive</Text>
                                <Heading size="lg" className="text-red-700">{data?.summary?.inactive_count || 0}</Heading>
                            </VStack>
                        </GradientView>
                    </HStack>
                    {/* --- Recent Records --- */}
                    <VStack space="md" className="mt-2">
                        <HStack className="justify-between items-center px-1">
                            <Heading size="md" className="text-slate-800">Recent Employees</Heading>
                            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'StaffSummaryView' })}>
                                <Text className="text-cyan-600 font-bold">View All</Text>
                            </TouchableOpacity>
                        </HStack>

                        {refreshing || !data ? (
                            <DashboardSkeleton />
                        ) : (
                            <>
                                {data?.recent_staff?.map((item: any, index: number) => {

                                    return <AnimatedMotiView
                                        key={item.staff_id}
                                        preset="springUp"
                                        animationType="timing"
                                        duration={450}
                                        damping={15}
                                        delay={index * 80}
                                        initialTranslateY={15}
                                        initialScale={0.9}
                                    >
                                        <Pressable
                                            className="mb-3 "
                                            onPress={() => navigation.navigate("Main", {
                                                screen: "ViewStaffinforamtion",
                                                params: { id: item.id, isEdit: true }
                                            })} >

                                            <GradientView
                                                colors={['#ffffff', '#f8fafc']}
                                                horizontal={true}
                                                style={{
                                                    borderLeftWidth: 6,
                                                    borderLeftColor: item.activeStatus === 'Active' ? '#1b5e32' : '#dc2626'

                                                }}
                                                className="p-4 rounded-[28px] border border-slate-100 flex-row items-center shadow-sm"

                                            >
                                                {/* Avatar Section */}
                                                <Box className="h-14 w-14 rounded-full bg-slate-100 border-2 border-white shadow-sm items-center justify-center overflow-hidden">
                                                    <Avatar className="h-full w-full rounded-full">
                                                        <AvatarFallbackText className="font-bold text-2xl">
                                                            {item?.full_name}
                                                        </AvatarFallbackText>
                                                        {/* <AvatarImage source={{ uri: "" }} className="h-full w-full" /> */}

                                                    </Avatar>
                                                </Box>

                                                {/* Info Section */}
                                                <VStack className="ml-4 flex-1">
                                                    <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>
                                                        {item.full_name}
                                                    </Text>
                                                    <Text className="text-xs text-slate-500 font-medium">{item.designation_name}</Text>

                                                    <Box className={`mt-2 self-start px-2 py-0.5 rounded-lg ${item.activeStatus === '1' ? 'bg-teal-50' : 'bg-slate-100'}`}>
                                                        <Text className={`text-[10px] font-bold uppercase tracking-tight ${item.activeStatus === '1' ? 'text-teal-600' : 'text-slate-400'}`}>
                                                            {item.activeStatus}
                                                        </Text>
                                                    </Box>
                                                </VStack>

                                                {/* ACTION GROUP: Edit & Call */}
                                                <HStack space="xs" className="items-center pl-2 border-l border-slate-50 gap-2">

                                                    {/* EDIT ACTION */}
                                                    <TouchableOpacity
                                                        onPress={() => navigation.navigate("Main", {
                                                            screen: "StaffRegistration",
                                                            params: { id: item.id, isEdit: true }
                                                        })}

                                                        className="h-10 w-10 bg-emerald-50 rounded-full items-center justify-center border border-emerald-100 shadow-sm  "                                            >
                                                        <Icon as={Edit3Icon} size="sm" className="text-slate-600" />
                                                    </TouchableOpacity>

                                                    {/* CALL ACTION */}
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            if (item.mobileNo) Linking.openURL(`tel:${item.mobileNo}`);
                                                        }}
                                                        className="h-10 w-10 bg-cyan-600 rounded-full items-center justify-center shadow-md  "
                                                    >
                                                        <Icon as={PhoneIcon} size="sm" className="text-white" />
                                                    </TouchableOpacity>

                                                </HStack>
                                            </GradientView>
                                        </Pressable>
                                    </AnimatedMotiView>

                                })
                                }

                            </>
                        )}

                    </VStack>

                    <StatusAlert
                        title={alertMessage} isOpen={showAlert}
                        onClose={() => { setShowAlert(false) }} type={"error"} message={""} />
                    {/**/}

                    {/* --- FIXED FLOATING BUTTON   --- */}
                    {/* Positioned outside ScrollView to stay fixed on screen */}

                </VStack>
            </KeyboardAwareScrollView>

            <AnimatedMotiView
                preset="springUp"
                damping={15}          // Lower damping = way more bouncy physics layout
                stiffness={200}      // Higher stiffness = moves faster
                initialTranslateY={120} // Drops lower down before entry lifting begins
                initialScale={0.3}   // Pops out starting from 30% sizing instead of 0
                delay={400}
                className="absolute bottom-8 right-8"
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("Main", {
                        screen: "StaffRegistration",
                        params: { isEdit: false }
                    })}
                    // Added rounded-full and overflow-hidden here
                    className="h-20 w-20 rounded-full overflow-hidden shadow-2xl shadow-cyan-500/50"
                    style={{ elevation: 10 }}
                >

                    <GradientView
                        colors={['#0891b2', '#0e7490']}
                        horizontal={true}
                        className="h-full w-full rounded-full items-center justify-center"
                    >
                        <Icon as={AddIcon} size="xl" className="text-cyan-400" style={{ width: 38, height: 38 }} />
                    </GradientView>
                </TouchableOpacity>
            </AnimatedMotiView>
        </View>
    );
}

export default StaffDashboard;
