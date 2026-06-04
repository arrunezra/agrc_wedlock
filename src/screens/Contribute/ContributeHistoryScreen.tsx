import React, { useState, useEffect, useMemo, useCallback, Activity, use } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, Platform, StatusBar as RNStatusBar, Pressable } from 'react-native';
import { Box, VStack, HStack, Text, Heading, useToast, Toast, ToastTitle } from '@/src/components/GluestackUI'
import { Calendar, Filter, ChevronDown, Landmark, RefreshCw, ArrowRight, ChurchIcon, Search, X, HeartIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from '@/src/components/IconUI';
import HeaderSession from '@/src/components/HeaderSession';
import FuturisticDropdown from '@/src/components/FuturisticDropdown';
import AdminServices from '@/src/services/AdminServices';
import { useAuth } from '@/src/context/AuthContext';
import ChruchService from '@/src/services/ChruchService';
import AnimatedMotiView from '@/src/components/AnimateView';
import GradientView from '@/src/components/GradientView';
// --- CONFIG PALETTE ---
const REVENUE_PALETTE = ['#087a46ff', '#1b5945ff']; // Deep slate sleek theme
const LIMIT = 20;

// --- INITIAL STATES MEMORY CONFIG ---
const getDefaultFromDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
};
const getDefaultToDate = () => new Date();

interface contributionDetails {
    id: string;
    church_name: string;
    amount: number;
    status: string;
    contribute_method: string;
    created_at: string;
}

const ContributeHistoryScreen = ({ navigation }: any) => {
    const { user } = useAuth();

    const [contributionDetails, setContributionDetails] = useState<contributionDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [churches, setChurches] = useState<any>([]);

    // --- PAGINATION STATES ---
    const [page, setPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [overallAmount, setOverallAmount] = useState<number>(0);

    // --- INTERACTIVE UI STATES ---
    const [selectedChurchId, setSelectedChurchId] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('completed');
    const [fromDate, setFromDate] = useState<Date>(getDefaultFromDate());
    const [toDate, setToDate] = useState<Date>(getDefaultToDate());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // --- COMMITTED STATE ENGINE ---
    const [searchCriteria, setSearchCriteria] = useState({
        church_id: 'all',
        status: 'completed',
        from_date: getDefaultFromDate().toISOString().split('T')[0],
        to_date: getDefaultToDate().toISOString().split('T')[0]
    });

    const toast = useToast();



    const statusDropdownData = [
        { label: 'All Statuses', value: 'all' },
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
    ];

    const churchDropdownData = useMemo(() => {
        return [
            { label: 'All Churches', value: 'all' },
            ...churches.map((c: any) => ({ label: c.label, value: c.church_id }))
        ];
    }, [churches]);

    // Track if any filter options deviate from default structures
    const isFilterApplied = useMemo(() => {
        return searchCriteria.church_id !== 'all' ||
            searchCriteria.status !== 'all' ||
            searchCriteria.from_date !== getDefaultFromDate().toISOString().split('T')[0] ||
            searchCriteria.to_date !== getDefaultToDate().toISOString().split('T')[0];
    }, [searchCriteria]);

    // Active descriptive metadata getters for the UI indicator chips
    const activeChurchName = useMemo(() => {
        return churches.find((c: any) => c.id === searchCriteria.church_id)?.name || 'All Registered';
    }, [searchCriteria.church_id]);

    // --- CORE API LAYER ---
    const fetchFilteredLedger = useCallback(async (targetPage: number, resetData: boolean = false) => {
        try {
            if (targetPage === 1 && !isRefreshing) setIsLoading(true);
            if (targetPage > 1) setIsLoadingMore(true);

            const bodyPayload = {
                church_id: searchCriteria.church_id,
                status: searchCriteria.status,
                from_date: searchCriteria.from_date,
                to_date: searchCriteria.to_date,
                page: targetPage,
                limit: LIMIT
            };
            //console.log('bodyPayload', bodyPayload);
            const response = await AdminServices.getContributtionHistory(bodyPayload);

            if (response.success) {
                setTotalRecords(response.total_records || 0);
                if (resetData) {
                    setOverallAmount(Number(response.total_amount) || 0);
                }
                setContributionDetails(prev => resetData ? response.data : [...prev, ...response.data]);
                setPage(targetPage);
            } else {
                throw new Error(response.message || "Failed data verification validation");
            }
        } catch (error: any) {
            console.error("Ledger query failed", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
        }
    }, [searchCriteria, isRefreshing]);
    useEffect(() => {
        const fetchChurches = async () => {
            try {
                const res = await ChruchService.getChurchDetails({ action: 'all', id: '' });
                //console.log('res', res);
                if (res.success) {

                    setChurches(res.churches);
                } else {
                    setChurches([]);
                }
            } catch (err) {
                console.error("Failed to load churches:", err);
            } finally {
            }
        };

        fetchChurches();
    }, []); // Empty array means this runs once on mount
    useEffect(() => {
        fetchFilteredLedger(1, true);
    }, [searchCriteria]);

    // --- ACTION HANDLERS ---
    const handleSearchPress = () => {
        setSearchCriteria({
            church_id: selectedChurchId,
            status: selectedStatus,
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : ''
        });
    };

    const handleResetPress = () => {
        const resetFrom = getDefaultFromDate();
        const resetTo = getDefaultToDate();

        setSelectedChurchId('all');
        setSelectedStatus('all');
        setFromDate(resetFrom);
        setToDate(resetTo);

        setSearchCriteria({
            church_id: 'all',
            status: 'all',
            from_date: resetFrom.toISOString().split('T')[0],
            to_date: resetTo.toISOString().split('T')[0]
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchFilteredLedger(1, true);
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && contributionDetails.length < totalRecords) {
            fetchFilteredLedger(page + 1, false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    const formatDateLabel = (date: Date) => {
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    const onFromDateChange = (event: any, selectedDate?: Date) => {
        setShowFromPicker(false);
        if (selectedDate) setFromDate(selectedDate);
    };

    const onToDateChange = (event: any, selectedDate?: Date) => {
        setShowToPicker(false);
        if (selectedDate) setToDate(selectedDate);
    };
    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <Box className="py-6 items-center justify-center">
                <ActivityIndicator size="small" color="#1e293b" />
            </Box>
        );
    };
    const renderContributionDetailsItem = ({ item }: { item: contributionDetails }) => {
        const isCompleted = item.status.toLowerCase() === 'completed';
        return (
            <AnimatedMotiView
                preset="slideUp"
                duration={350}
                delay={1000}
                className="bg-white p-4 mx-4 mb-3 rounded-[24px] border border-slate-100 shadow-sm flex-row justify-between items-center"
            >
                <HStack space="md" className="items-center flex-1">
                    <Box className="w-12 h-12 rounded-2xl bg-slate-50 items-center justify-center border border-slate-100">
                        <Icon as={item.contribute_method === 'UPI' ? Landmark : HeartIcon} size="md" className="text-slate-600" />
                    </Box>
                    <VStack className="flex-1">
                        <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>{item.church_name}</Text>
                        <Text className="text-slate-400 text-[10px] font-medium mt-0.5">{item.id} • {item.created_at}</Text>
                    </VStack>
                </HStack>
                <VStack className="items-end">
                    <Text className="text-slate-900 font-black text-base">{formatCurrency(item.amount)}</Text>
                    <Box className={`px-2 py-0.5 rounded-full mt-1 ${isCompleted ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <Text className={`text-[9px] font-black uppercase ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</Text>
                    </Box>
                </VStack>
            </AnimatedMotiView>
        );
    };

    return (
        <VStack className="flex-1 bg-white">
            <RNStatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <HeaderSession
                title="Contribution Summary"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()}
                showLogo={true}
            />

            {/* --- REVENUE HERO SUMMARY DISPLAY --- */}
            <AnimatedMotiView
                preset="slideUp"
                duration={350}
                delay={1000}
                initialScale={0.95}
                className="mx-4 mt-4"            >
                <GradientView
                    colors={REVENUE_PALETTE}
                    horizontal={true}
                    style={{ borderRadius: 28, padding: 24, elevation: 8 }}
                >

                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px]">Aggregated Statement</Text>
                    <Heading className="text-white font-black text-3xl mt-1">{formatCurrency(overallAmount)}</Heading>
                    <Text className="text-slate-400 text-[9px] mt-2 italic">* Summing active committed parameters filter ledger rules</Text>
                </GradientView>
            </AnimatedMotiView>
            {/* --- DYNAMIC FILTER CHIPS PANEL SUMMARY --- */}
            {isFilterApplied && (user?.role == 'super_admin' || user?.role == 'root_admin') && (
                <AnimatedMotiView
                    preset="accordion"
                    targetHeight={42}
                    duration={300} // Speed up layout shift timeline slightly for quick responses
                    className="px-4 mt-3 flex-row items-center overflow-hidden"
                >

                    <Box className="bg-slate-100 px-2.5 py-1.5 rounded-xl mr-2 flex-row items-center">
                        <Text className="text-slate-700 text-[10px] font-extrabold uppercase">{searchCriteria.status}</Text>
                    </Box>
                    <Box className="bg-slate-100 px-2.5 py-1.5 rounded-xl mr-2 flex-row items-center max-w-[140px]">
                        <Text className="text-slate-700 text-[10px] font-extrabold uppercase" numberOfLines={1}>{activeChurchName}</Text>
                    </Box>

                    <Box className="bg-slate-100 px-2.5 py-1.5 rounded-xl flex-row items-center">
                        <Text className="text-slate-700 text-[10px] font-extrabold uppercase">{searchCriteria.from_date} ➔ {searchCriteria.to_date}</Text>
                    </Box>
                </AnimatedMotiView>


            )}
            {/* --- INTERACTIVE CONTROL BOX FILTER INPUT FILTERS --- */}
            <VStack className="mt-3 px-4 pb-4 border-b border-slate-100 bg-white" space="md">

                {/* HEADERS WITH CONDITIONAL RESET BUTTON WRAPPER */}
                <HStack className="justify-between items-center px-1  mt-6">
                    <TouchableOpacity onPress={() => {
                        setShowFilter(pre => !pre)
                    }}>
                        <HStack space="xs" className="items-center">
                            <Filter size={16} color="#64748b" />
                            <Text className="text-slate-500 text-[14px] font-bold uppercase tracking-wider">Filter</Text>
                        </HStack>
                    </TouchableOpacity>
                    {isFilterApplied && (
                        <TouchableOpacity onPress={handleResetPress} activeOpacity={0.6} className="flex-row items-center bg-rose-50 px-2 py-1 rounded-lg">
                            <X size={12} color="#f43f5e" className="mr-1" />
                            <Text className="text-rose-600 text-[12px] font-black uppercase">Clear All</Text>
                        </TouchableOpacity>
                    )}
                </HStack>

                <HStack space="md" className="w-full">
                    {showFilter && (user?.role == 'super_admin' || user?.role == 'root_admin') && <VStack space="xs" className="flex-1">
                        <FuturisticDropdown data={churchDropdownData} value={selectedChurchId} onChange={(item: any) => setSelectedChurchId(item.value)} placeholder="Select Church" icon={{ icon: ChurchIcon, color: 'text-emerald-500' }} search={true} isInvalid={false} />
                    </VStack>}

                    {showFilter && <VStack space="xs" className="flex-1">
                        <FuturisticDropdown data={statusDropdownData} value={selectedStatus} onChange={(item: any) => setSelectedStatus(item.value)} placeholder="Select Status" icon={{ icon: Activity, color: 'text-blue-500' }} search={false} isInvalid={false} />
                    </VStack>}
                </HStack>


                {showFilter && (user?.role == 'super_admin' || user?.role == 'root_admin' || user?.role === 'admin') && <VStack space="xs">
                    <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider ml-1">Statement Duration</Text>
                    <HStack space="sm" className="items-center justify-between w-full">
                        <TouchableOpacity onPress={() => setShowFromPicker(true)} activeOpacity={0.7} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex-row items-center space-x-3">
                            <Box className="p-2 bg-indigo-50 rounded-xl"><Calendar size={16} color="#6366f1" /></Box>
                            <VStack>
                                <Text className="text-slate-400 text-[8px] font-bold uppercase">From Date</Text>
                                <Text className="text-slate-800 text-xs font-extrabold mt-0.5">{fromDate ? formatDateLabel(fromDate) : "No Limit"}</Text>
                            </VStack>
                        </TouchableOpacity>

                        <Box className="items-center justify-center px-1"><ArrowRight size={14} color="#94a3b8" /></Box>

                        <TouchableOpacity onPress={() => setShowToPicker(true)} activeOpacity={0.7} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex-row items-center space-x-3">
                            <Box className="p-2 bg-cyan-50 rounded-xl"><Calendar size={16} color="#06b6d4" /></Box>
                            <VStack>
                                <Text className="text-slate-400 text-[8px] font-bold uppercase">To Date</Text>
                                <Text className="text-slate-800 text-xs font-extrabold mt-0.5">{toDate ? formatDateLabel(toDate) : "No Limit"}</Text>
                            </VStack>
                        </TouchableOpacity>

                        {/* --- SEARCH TRIGGER OPERATION MAIN ACTION BUTTON --- */}
                        <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.8} className="bg-slate-900 h-14 w-14 rounded-2xl items-center justify-center shadow-md border border-slate-800">
                            <Search size={20} color="white" />
                        </TouchableOpacity>
                    </HStack>
                </VStack>
                }
                {showFromPicker && <DateTimePicker value={fromDate || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onFromDateChange} maximumDate={toDate || new Date()} />}
                {showToPicker && <DateTimePicker value={toDate || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onToDateChange} maximumDate={new Date()} minimumDate={fromDate || undefined} />}
            </VStack>

            {/* FLATLIST STREAM TRANSITIONS RECORD TRAILING DESIGNS */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#0f172a" /></View>
            ) : (
                <FlatList
                    data={contributionDetails}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={renderContributionDetailsItem}
                    contentContainerStyle={{ paddingTop: 15, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.15}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <VStack className="items-center justify-center py-20 px-10">
                            <Text className="text-slate-400 font-bold text-sm text-center">No contribution verified within this selection range.</Text>
                        </VStack>
                    }
                />
            )}
        </VStack>
    );
};
export default ContributeHistoryScreen;