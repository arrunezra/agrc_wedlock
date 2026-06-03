import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, RefreshControl, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { Box, VStack, HStack, Text, Heading, Spinner, useToast } from '@/src/components/common/GluestackUI';
import {
    Users,
    Church as ChurchIcon,
    UserCheck,
    CreditCard,
    TrendingUp,
    ChevronRight,
    Menu,
    Bell,
    ArrowUpRight
} from 'lucide-react-native';
import { Icon } from '@/src/components/common/IconUI';
import { MotiText, MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import HeaderSession from '../common/HeaderSession';
import AdminServices from '@/src/services/AdminServices';
import { CHURCH_COLORS, formatCurrency, getCurrentDate, getCurrentMonthYear, getCurrentYear, getDetailedFY, getFinancialYear } from '@/src/utils/common';
import { useAuth } from '@/src/context/AuthContext';

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
                title: 'Profile Ops',
                count: data?.summary?.total_profiles || 0,
                trend: '45 Alerts',
                icon: UserCheck,
                colors: ['#0ba360', '#3cba92'],
                screen: 'Profile'
            },
            {
                title: 'Contribution',
                count: data?.summary?.overall_revenue || 0,
                trend: '+15% Trend',
                icon: CreditCard,
                colors: ['#f83600', '#f9d423'],
                screen: 'Contribute'
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
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 400 }}
                >
                    <Heading
                        size="sm"
                        className="text-slate-500 font-bold uppercase tracking-[2px] ml-2 mb-4"
                    >
                        Overall Summary
                    </Heading>
                </MotiView>

                {/* --- 2. INTERACTIVE GRADIENT GRID --- */}
                <Box className="mb-6 px-4">
                    <HStack space="md" className="flex-wrap justify-between">
                        {modules.map((item, index) => {
                            // --- DYNAMIC CARD WIDTH LOGIC ---
                            // If there's an odd number of modules and this is the last card, make it 100% width
                            const isLastOddCard = modules.length % 2 !== 0 && index === modules.length - 1;
                            const cardWidth = isLastOddCard ? '100%' : '48%';

                            return (
                                <MotiView
                                    key={item.title}
                                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                    transition={{
                                        type: 'spring',
                                        delay: index * 100,
                                        damping: 15
                                    }}
                                    // Injected the dynamic calculation directly here
                                    style={{ width: cardWidth, marginBottom: 16 }}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => navigation.navigate(item.screen)}
                                    >
                                        <LinearGradient
                                            colors={item.colors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                borderRadius: 25,
                                                padding: 20,
                                                elevation: 8,
                                                shadowColor: item.colors[0],
                                                shadowOpacity: 0.25,
                                                shadowRadius: 10
                                            }}
                                        >
                                            {/* Card Content Row */}
                                            <HStack className="justify-between items-start mb-4">
                                                <Box className="bg-white/20 p-2 rounded-xl">
                                                    <Icon as={item.icon} size="md" color="white" />
                                                </Box>
                                                <Icon as={ArrowUpRight} size="sm" className="text-white/70" />
                                            </HStack>

                                            <HStack className="justify-between items-end mt-2 w-full">
                                                {/* Left-aligned Title */}
                                                <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest flex-1">
                                                    {item.title}
                                                </Text>

                                                {/* Right-aligned Number/Amount Value */}
                                                <Heading size="xl" className="text-white font-black text-right">
                                                    {item.title === "Contribution" ? formatCurrency(item?.count || 0) : item?.count}
                                                </Heading>
                                            </HStack>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </MotiView>
                            );
                        })}
                    </HStack>
                </Box>

                {/* --- 3. REVENUE & INSIGHTS SECTION --- */}
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 800 }}
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
                        <LinearGradient
                            colors={['#e6f4f1', '#ffffff']} // Smooth transition from an ultra-light mint tint to crisp white
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
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
                        </LinearGradient>

                        {/* FOOTER */}
                        <Box className="bg-slate-50 p-3 items-center border-t border-slate-100">
                            <Text className="text-slate-400 text-[10px] font-medium text-center">
                                * Values updated as of today {getCurrentDate()}
                            </Text>
                        </Box>
                    </Box>
                </MotiView>
                {/* --- 4. CHURCH-WISE BREAKDOWN --- */}
                {user?.role !== 'admin' && <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 1000 }}
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

                </MotiView>
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