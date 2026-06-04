import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, RefreshControl, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { Box, VStack, HStack, Text, Heading, Spinner, useToast } from '@/src/components/common/GluestackUI';
import {
    Users,
    Church as ChurchIcon,
    UserCheck,
    TrendingUp,
    ChevronRight,
    Menu,
    Bell,
    ArrowUpRight,
    HeartIcon
} from 'lucide-react-native';
import { Icon } from '@/src/components/common/IconUI';
import HeaderSession from '../common/HeaderSession';
import AdminServices from '@/src/services/AdminServices';
import { CHURCH_COLORS, formatCurrency, getCurrentDate, getCurrentMonthYear, getCurrentYear, getDetailedFY, getFinancialYear } from '@/src/utils/common';
import { useAuth } from '@/src/context/AuthContext';
import AnimatedMotiView from '../component/AnimateView';
import GradientView from '../component/GradientView';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }: any) => {
    const { user } = useAuth();

    const [data, setData] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const result = await AdminServices.getDashboard({ action: '' })
            if (result.success) {
                //console.log('result', result)
                setData(result);
            }

        } catch (error) {

        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    // Make sure 'userRole' is included in your component's dependencies
    const modules = React.useMemo(() => {
        // 1. Define all available grid modules exactly as before
        const allModules = [
            {
                title: 'Staff Details',
                count: data?.summary?.total_staff || 0,
                trend: '+3 new requests',
                icon: Users,
                colors: ['#4facfe', '#00f2fe'],
                screen: 'StaffDashboard'
            },
            {
                title: 'Church Hub',
                count: data?.summary?.total_churches || 0,
                trend: '2 Pending Verify',
                icon: ChurchIcon,
                colors: ['#667eea', '#764ba2'],
                screen: 'ChurchDashboard',
            },
            {
                title: 'Profile',
                count: data?.summary?.total_profiles || 0,
                trend: '45 Alerts',
                icon: UserCheck,
                colors: ['#0ba360', '#3cba92'],
                screen: 'Profile'
            },
            {
                title: 'Donation',
                count: data?.summary?.overall_revenue || 0,
                trend: '+15% Trend',
                icon: HeartIcon,
                colors: ['#f83600', '#f9d423'],
                screen: 'Donation'
            }
        ];

        // 2. If the user's role is strictly 'admin', filter out the 'Church Hub' item
        if (user?.role === 'admin') {
            return allModules.filter(module => module.title !== 'Church Hub');
        }

        // 3. Super Admins or Root Admins will see all modules
        return allModules;

    }, [data, user?.role]); // Added userRole to the dependency array to trigger updates if it changes
    // Only recalculate when 'data' state changes
    const onRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    if (isLoading) {
        return (
            <VStack className="flex-1 justify-center items-center bg-white">
                <Spinner size="large" color="$emerald600" />
            </VStack>
        );
    }

    return (
        <Box className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 1. Put the header at the top */}
            <HeaderSession
                title="Control Center"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
                showLogo={true}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{
                    paddingTop: 20, // Clean gap from the header curve
                    paddingHorizontal: 16,
                    paddingBottom: 60 // Extra space for bottom tab bars
                }}
            >
                {/* --- 1. OVERALL SUMMARY HEADER --- */}
                <AnimatedMotiView
                    preset="slideUp"
                    duration={350}
                    delay={400}
                >
                    <Heading
                        size="sm"
                        className="text-slate-500 font-bold uppercase tracking-[2px] ml-2 mb-4"
                    >
                        Overall Summary
                    </Heading>
                </AnimatedMotiView>

                {/* --- 2. INTERACTIVE GRADIENT GRID --- */}
                <Box className="mb-6 px-4">
                    <HStack space="md" className="flex-wrap justify-between">
                        {modules.map((item, index) => {
                            // --- DYNAMIC CARD WIDTH LOGIC ---
                            // If there's an odd number of modules and this is the last card, make it 100% width
                            const isLastOddCard = modules.length % 2 !== 0 && index === modules.length - 1;
                            const cardWidth = isLastOddCard ? '100%' : '48%';

                            return (
                                <AnimatedMotiView
                                    key={item.title}
                                    preset="springUp"
                                    damping={15}             // Exactly matches Moti's damping: 15
                                    initialTranslateY={20}   // Exactly matches Moti's translateY: 20
                                    initialScale={0.9}       // Exactly matches Moti's scale: 0.9
                                    delay={index * 100}      // Exactly matches Moti's staggered layout calculation
                                    style={{ width: cardWidth, marginBottom: 16 }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            let screen = item.screen == 'Donation' ? "ContributeHistory" : item.screen
                                            navigation.navigate(screen)
                                        }}
                                    ><GradientView
                                        colors={item.colors}
                                        horizontal={true}
                                        style={{
                                            borderRadius: 25,
                                            padding: 18,
                                            elevation: 8,
                                            shadowColor: item.colors[0],
                                            shadowOpacity: 0.25,
                                            shadowRadius: 10
                                        }}
                                    >


                                            {/* TOP ROW: Icon and Title centered together, with Arrow on the right */}
                                            <HStack className="justify-between items-center mb-6 w-full">
                                                <HStack className="items-center gap-3 flex-1">
                                                    {/* Left Side: Icon Container */}
                                                    <Box className="bg-white/20 p-1 rounded-xl">
                                                        <Icon as={item.icon} size="xl" color="white" />
                                                    </Box>

                                                    {/* Vertically Centered Title Text */}
                                                    <Box className="flex-1">
                                                        <Text
                                                            className="text-white text-md font-bold   tracking-wider"
                                                            numberOfLines={1}
                                                        >
                                                            {item.title}
                                                        </Text>
                                                    </Box>
                                                </HStack>


                                            </HStack>

                                            {/* BOTTOM ROW: Cleanly forced to the right hand side */}
                                            <Box className="w-full items-end mt-2">
                                                <Heading size="xl" className="text-white font-black text-right">
                                                    {item.title === "Contribution" || item.title === "Donation"
                                                        ? formatCurrency(item?.count || 0)
                                                        : item?.count}
                                                </Heading>
                                            </Box>
                                        </GradientView>
                                    </TouchableOpacity>
                                </AnimatedMotiView>
                            );
                        })}
                    </HStack>
                </Box>

                {/* --- 3. REVENUE & INSIGHTS SECTION --- */}

                <AnimatedMotiView
                    preset="slideUp"
                    duration={350}
                    delay={800}
                >

                    {/* SECTION HEADER */}
                    <HStack className="justify-between items-end px-2 mb-4">
                        <VStack>
                            <Heading size="md" className="text-slate-900 font-extrabold tracking-tight">
                                Subscription Revenue
                            </Heading>
                            <Text size="xs" className="text-slate-400 font-medium italic">Church-wise totals</Text>
                        </VStack>
                        <Box className="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            <Text className="text-emerald-700 text-[10px] font-bold">LIVE STATS</Text>
                        </Box>
                    </HStack>

                    {/* MAIN REVENUE CARD */}
                    <Box className="bg-white rounded-[30px] border border-slate-100 shadow-xl overflow-hidden mx-4">

                        <GradientView
                            colors={['#e6f4f1', '#ffffff']}
                            horizontal={true}
                            style={{ padding: 24 }}
                        >


                            <VStack space="xl">
                                {/* OVERALL AMOUNT */}
                                <VStack>
                                    <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[2px]">Total Collection</Text>
                                    <HStack className="items-baseline" space="xs">
                                        <Heading className="text-slate-900 font-black text-3xl mt-1">
                                            {formatCurrency(data?.summary.overall_revenue || 0)}
                                        </Heading>
                                    </HStack>
                                </VStack>

                                <Box className="h-[1px] bg-slate-200/60 w-full" />

                                {/* MONTHLY & YEARLY SPLIT */}
                                <HStack className="justify-between">
                                    <VStack className="flex-1">
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">{getCurrentMonthYear()}</Text>
                                        <Text className="text-slate-900 font-black text-xl">{formatCurrency(data?.summary.monthly_revenue || 0)}</Text>
                                        <Text className="text-slate-400 text-[9px] mt-1 font-medium">Monthly</Text>
                                    </VStack>

                                    <Box className="w-[1px] bg-slate-200/60 h-10 mx-4" />

                                    <VStack className="flex-1">
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Current {getCurrentYear()}</Text>
                                        <Text className="text-slate-900 font-black text-xl">{formatCurrency(data?.summary.yearly_revenue || 0)}</Text>
                                        <Text className="text-slate-400 text-[9px] mt-1 font-medium">Annual</Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </GradientView>

                        {/* FOOTER */}
                        <Box className="bg-slate-50 p-3 items-center border-t border-slate-100">
                            <Text className="text-slate-400 text-[10px] font-medium text-center">
                                * Values updated as of today {getCurrentDate()}
                            </Text>
                        </Box>
                    </Box>
                </AnimatedMotiView>
                {/* --- 4. CHURCH-WISE BREAKDOWN --- */}
                {user?.role !== 'admin' && <AnimatedMotiView
                    preset="slideUp"
                    duration={350}
                    delay={1000}
                    className="px-5 mt-8 mb-10"
                >
                    <HStack className="justify-between items-center px-1 mb-4">
                        <Heading size="sm" className="text-slate-500 font-bold uppercase tracking-[2px]">
                            Church Breakdown
                        </Heading>
                        {/* <TouchableOpacity>
                            <Text size="xs" className="text-cyan-600 font-bold">Export PDF</Text>
                        </TouchableOpacity> */}
                    </HStack>


                    <VStack space="sm">
                        {/* Map this through your database results */}
                        {data?.churches.map((church: any, index: number) => {
                            // This picks a color from the array based on the index
                            const dynamicColor = CHURCH_COLORS[index % CHURCH_COLORS.length];

                            return <Box
                                key={church.church_id}
                                className="bg-white p-4 rounded-[22px] border border-slate-100 shadow-sm"
                            >
                                <HStack className="justify-between items-center">
                                    <HStack space="md" className="items-center flex-1">
                                        {/* Icon/Avatar for Church */}
                                        <Box className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center border border-slate-100">
                                            <Icon as={ChurchIcon} size="sm" className="text-slate-500" style={{ color: dynamicColor }} />
                                        </Box>

                                        <VStack className="flex-1">
                                            <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                                                {church.church_name}
                                            </Text>
                                            <Text className="text-slate-400 text-[10px] font-medium">
                                                {formatCurrency(church.profile_count || 0)} Active Subscriptions
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <VStack className="items-end">
                                        <Text className="text-slate-900 font-black text-sm">
                                            {formatCurrency(church.total_amount || 0)}

                                        </Text>
                                        <HStack space="xs" className="items-center">
                                            <Box className={`w-1.5 h-1.5 rounded-full ${church.trend === 'up' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            <Text className="text-slate-400 text-[9px] uppercase font-bold">
                                                {church.trend === 'up' ? 'Growth' : 'Steady'}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </Box>
                        })}
                    </VStack>

                </AnimatedMotiView>
                }
            </ScrollView>
        </Box>
    );
};

export default AdminDashboard;

export interface DashboardData {
    summary: {
        total_churches: number;
        total_profiles: number;
        overall_revenue: string; // From SQL DECIMAL
        monthly_revenue: string;
        yearly_revenue: string;
    };
    churches: Array<{
        church_name: string;
        profile_count: number;
        total_amount: string;
        trend: 'up' | 'stable';
    }>;
}