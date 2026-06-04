import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, ScrollView, Alert, TouchableOpacity, Linking, Image, Platform, Animated, RefreshControl, ActivityIndicator, View, StatusBar } from 'react-native';
import {
    Box, VStack, HStack, Input, InputField, Button, ButtonText, Text, Heading, Spinner,
    FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText, Select, SelectTrigger,
    SelectInput, SelectPortal, SelectBackdrop, SelectContent, SelectItem, Modal,
    ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter, Fab, FabIcon,
    BadgeText,
    Badge,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    Divider,
    InputSlot
} from '@/src/components/GluestackUI';
import api from '@/src/api/api';
import { AddIcon, Building2, CheckCircle2, Globe, Hash, Icon, Mail, MapPin, Phone, SearchIcon, Trash2, User } from '@/src/components/IconUI';
const denominations = ["Baptist", "Catholic", "Pentecostal", "Methodist", "Anglican"];
const statuses = ["Active", "Inactive", "Merged", "Closed"];
import { AdminStackParamList } from '@/src/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AnimatedListItem, { ChurchSkeleton } from './AnimattedSummary';
import { Edit3, Settings2, XIcon } from 'lucide-react-native';
import { ChruchService } from '@/src/services/ChruchService';
import HeaderSession from '@/src/components/HeaderSession';
import { launchImageLibrary } from 'react-native-image-picker';
type Props = NativeStackScreenProps<AdminStackParamList, 'ChurchSummary'>;
export default function ChurchSummary({ route, navigation }: any) {
    const [list, setList] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState('Active');

    // Form & Filter State
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [filters, setFilters] = useState({ church_name: '', denomination: '', active_status: 'Active' });
    const [form, setForm] = useState<any>({
        id: null, church_id: '', church_name: '', denomination: '', address: '', city: '', state: '',
        country: 'IND', postal_code: '', pastor_name: '', pastor_phone: '', church_phone: '', church_email: '', active_status: 'Active'
    });

    const [previewStaff, setPreviewStaff] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [image, setImage] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const fieldConfig = [
        { id: 'church_name', label: 'Church Name', icon: Building2, placeholder: 'Holy Trinity' },
        { id: 'pastor_name', label: 'Pastor Name', icon: User, placeholder: 'Rev. John Doe' },
        { id: 'church_email', label: 'Email Address', icon: Mail, placeholder: 'office@church.com' },
        { id: 'church_phone', label: 'Church Phone', icon: Phone, placeholder: '+1...' },
        { id: 'address', label: 'Street Address', icon: MapPin, placeholder: '123 Grace St.' },
        { id: 'city', label: 'City', icon: MapPin, placeholder: 'Metropolis', halfWidth: true },
        { id: 'postal_code', label: 'Zip Code', icon: Hash, placeholder: '12345', halfWidth: true },
    ];

    useEffect(() => {
        // Set a timer to update filters after 500ms of inactivity
        const delayDebounceFn = setTimeout(() => {
            setFilters(prev => ({ ...prev, church_name: searchTerm }));
        }, 500);

        // Cleanup: If the user types again within 500ms, the previous timer is cancelled
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);
    useEffect(() => { fetchChurches(1, false); }, [filters]);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChurches(1, false);
        setRefreshing(false);
    }, []);
    useFocusEffect(
        useCallback(() => {
            // Check if we arrived here with the refresh flag
            if (route.params?.refreshed) {
                fetchChurches(1, false);

                // Clear the params so it doesn't refetch again on every minor tap
                navigation.setParams({ refreshed: false });
            }
        }, [route.params?.refreshed])
    );
    const resetForm = () => {
        setForm({
            id: null, church_id: '', church_name: '', denomination: '', address: '', city: '', state: '',
            country: 'IND', postal_code: '', pastor_name: '', pastor_phone: '', church_phone: '', church_email: '', active_status: 'Active'
        });
        setErrors({});
    };
    const fetchChurches = async (p = 1, append = false) => {
        setLoading(true);
        try {
            const res = await api.post('/church/churchmanagment.php', { action: 'fetch', page: p, ...filters });
            //console.log('fetchChurches', res);

            if (res.data.success) {
                setList(append ? [...list, ...res.data.data] : res.data.data);
                setTotalPages(res.data.totalPages);
                setPage(p);
            }
        } finally { setLoading(false); }
    };
    const StatusBadge = ({ status }: { status: string }) => {
        console.log(status);
        // Define color mapping based on your ENUM: 'Active', 'Inactive', 'Merged', 'Closed'
        const getBadgeAction = () => {
            switch (status) {
                case 'Active': return 'success';   // Green
                case 'Inactive': return 'warning'; // Yellow/Orange
                case 'Closed': return 'error';     // Red
                case 'Merged': return 'info';      // Blue
                default: return 'muted';           // Gray
            }
        };

        return (
            <Badge size="md" variant="solid" action={getBadgeAction()} className="rounded-full px-3">
                <BadgeText className="text-xs font-bold uppercase">{status}</BadgeText>
            </Badge>
        );
    };

    const validate = () => {
        let errs: any = {};
        Object.keys(form).forEach(key => {
            if (!form[key] && key !== 'id' && key !== 'church_id') errs[key] = "Required";
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const res = form.id
                ? await api.put('/church/churchmanagment.php', form)
                : await api.post('/church/churchmanagment.php', { action: 'add', data: form });
            if (res.data.success) { setShowModal(false); fetchChurches(1, false); }
        } catch (e) { console.log(e) }
        finally { setIsSubmitting(false); }
    };
    const RoleBadge = ({ role }: { role: string }) => (
        <Badge size="sm" variant="outline" action="info" className="rounded-md">
            <BadgeText>{role}</BadgeText>
        </Badge>
    );
    const handleOpenPreview = (item: any) => {
        setPreviewStaff(item);
        setShowPreview(true);
        handlePickAndCrop();
    };
    const handlePickAndCrop = async () => {
        console.log('handlePickAndCrop', previewStaff);

        // Ensure previewStaff exists before starting
        if (!previewStaff?.id) {
            Alert.alert("Error", "No staff member selected");
            return;
        }

        try {
            // 1. Launch the safe, privacy-compliant System Photo Picker
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8, // Built-in compression quality matching your old config
                selectionLimit: 1,
            });

            // Handle user cancellation gracefully up front
            if (result.didCancel || !result.assets || result.assets.length === 0) {
                return;
            }

            const selectedImage = result.assets[0];
            const rawUri = selectedImage.uri || '';

            // 2. Set UI states for previewing the chosen photo
            setImage(selectedImage);
            setShowPreview(true);

            // 3. Assemble Multipart Form Data
            const formData = new FormData();

            // Standardizing URI paths for both iOS and Android platforms
            const cleanUri = Platform.OS === 'ios' ? rawUri.replace('file://', '') : rawUri;

            const fileToUpload = {
                uri: cleanUri,
                type: selectedImage.type || 'image/jpeg', // react-native-image-picker returns 'type'
                name: selectedImage.fileName || `staff_avatar_${previewStaff.id}.jpg`,
            };

            formData.append('profile_image', fileToUpload as any);
            formData.append('staff_id', previewStaff.id.toString());
            formData.append('action', 'upload_avatar');

            // 4. Fire Async Network Upload Request
            const response = await api.post('/church/staffmanagement.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload progress: ${percentCompleted}%`);
                    }
                },
            });

            if (response.data.success) {
                Alert.alert("Success", "Profile photo updated!");
                // Refresh local components or data collections
                fetchChurches(1, false);
            } else {
                Alert.alert("Error", response.data.message || "Server rejected upload");
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            Alert.alert("Error", "Failed to upload image to server.");
        }
    };
    const handleConfirm = (result: any) => {
        console.log('handleConfirm', result);
        setImage(result);
        setShowPreview(false);
    };
    const handleCancel = () => {
        setImage(null);
        setShowPreview(false);
    };
    const uploadImage = async () => {
        console.log('uploadImage', image);
        if (!image) return;
        setUploading(true);
        try {
            // const response = await api.post('/church/staffmanagement.php', {
            //     action: 'upload_avatar',
            //     data: {
            //         // Send as base64 string
            //         file: `data:${image.mime};base64,${image.data}`,
            //         staff_id: 123 // Replace with actual ID
            //     }
            // });

            // if (response.data.success) {
            //     Alert.alert("Success", "Profile photo updated!");
            //     setShowPreview(false);
            // }

        } catch (error) {
            Alert.alert("Upload Failed", "Check your server connection.");
        } finally {
            setUploading(false);
        }
    };

    const deleteChurch = async (id: string) => {
        try {
            var response = await ChruchService.deleteChurchByID(id);
            if (response.success) {
                setList(list.filter((item) => item.id !== id));
                //fetchChurches(1, false);
                Alert.alert("Success", "Church deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting church:", error);
            Alert.alert("Error", "Failed to delete church");
        }
    };
    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Church",
            "Are you sure you want to delete this church?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteChurch(id) }
            ]
        );
    };



    return (
        <Box className="flex-1 bg-background-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <HeaderSession
                title="Church Summary"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />
            {/* 1. SEARCH BAR (Keep your existing code here) */}
            <Box className="px-5 pt-6 pb-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <VStack space="md">
                    {/* 1. THE FLOATING SEARCH BAR */}
                    <HStack space="sm" className="items-center">
                        <Input
                            variant="rounded"
                            className="flex-1 h-12 bg-slate- border-0 shadow-sm focus:border-cyan-500"
                        >
                            <InputSlot className="pl-4">
                                <Icon as={SearchIcon} className="text-cyan-600" size="sm" />
                            </InputSlot>
                            <InputField
                                placeholder="Search churches..."
                                value={searchTerm}
                                onChangeText={(v) => setSearchTerm(v)}
                                className="text-sm font-semibold text-slate-800"
                            />
                            {/* 2. CONTEXTUAL RESET (Only shows when searching) */}
                            {searchTerm.length > 0 && (
                                <InputSlot className="pr-3">
                                    <TouchableOpacity
                                        onPress={() => setSearchTerm('')}
                                        className="bg-slate-800 rounded-full p-1"
                                    >
                                        <Icon as={XIcon} size="xs" className="text-slate-500" />
                                    </TouchableOpacity>
                                </InputSlot>
                            )}
                        </Input>

                        {/* 3. NEUMORPHIC FILTER BUTTON */}
                        <TouchableOpacity
                            className="w-12 h-12 bg-secondary-900 rounded-2xl items-center justify-center shadow-lg shadow-slate-300"
                            onPress={() => {/* Trigger Filter Sheet */ }}
                        >
                            <Icon as={Settings2} className="text-white" size="sm" />
                        </TouchableOpacity>
                    </HStack>

                    {/* 4. HORIZONTAL QUICK-FILTER CHIPS */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        <HStack space="xs" className="px-1">

                            {['Active', 'Inactive'].map((filter) => {
                                // Strictly check if this specific filter is the active one
                                const isActive = filters.active_status === filter;

                                return (
                                    <TouchableOpacity
                                        key={filter}
                                        onPress={() => {
                                            // SINGLE SELECT LOGIC: 
                                            // Set the active_status to the clicked filter, 
                                            // and ensure other status fields are cleared
                                            setCurrentTab(filter)
                                            setFilters({
                                                ...filters,
                                                active_status: filter // Overwrites previous status
                                            });
                                        }}
                                        className={`px-5 py-2.5 rounded-2xl border  ${isActive
                                            ? 'bg-slate-900 border-slate-900 shadow-md shadow-slate-400'
                                            : 'bg-white border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <HStack space="xs" className="items-center">
                                            {isActive && (
                                                <View className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1" />
                                            )}
                                            <Text className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-600'
                                                }`}>
                                                {filter}
                                            </Text>
                                        </HStack>
                                    </TouchableOpacity>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </VStack>
            </Box>

            {/* 2. REFINED LIST WITH SKELETONS & REFRESH */}
            <FlatList
                data={isLoading && page === 1 ? [1, 2, 3, 4, 5] : list}
                keyExtractor={(item, index) => (isLoading && page === 1 ? `skeleton-${index}` : item.id.toString())}
                contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#4F46E5"]}
                    />
                }

                onEndReached={() => page < totalPages && !isLoading && fetchChurches(page + 1, true)}
                onEndReachedThreshold={0.5}

                renderItem={({ item, index }) => {
                    if (isLoading && page === 1) return <ChurchSkeleton />;

                    return (
                        <AnimatedListItem key={item.id} index={index % 10}>
                            <Box className="mx-4 mb-4 overflow-hidden rounded-3xl bg-white border border-outline-100 shadow-sm">
                                <HStack className="items-stretch">
                                    {/* 1. STATUS ACCENT */}
                                    <Box className={`w-2 ${item.active_status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                                    <VStack className="flex-1 p-5" space="lg">
                                        <HStack className="justify-between items-start">
                                            <HStack space="md" className="flex-1">
                                                {/* 2. AVATAR & IDENTITY */}
                                                <Avatar size="lg" className="bg-primary-300 rounded-2xl border-2 border-white shadow-sm">
                                                    <AvatarImage source={{ uri: item.profile_image }} />
                                                    <AvatarFallbackText className="font-bold text-primary-800">{item.church_name}</AvatarFallbackText>
                                                </Avatar>

                                                <VStack className="flex-1 justify-center">
                                                    <Text className="text-lg font-black text-typography-900 leading-tight">
                                                        {item.church_name}
                                                    </Text>
                                                    <Text size="sm" className="text-typography-500 font-medium">
                                                        {item.pastor_name}
                                                    </Text>
                                                </VStack>
                                            </HStack>

                                            {/* 3. QUICK UTILITY ICONS */}
                                            <HStack space="xs">
                                                <TouchableOpacity
                                                    className="w-10 h-10 rounded-full bg-cyan-50 items-center justify-center border border-cyan-100  "
                                                    onPress={() => Linking.openURL(`tel:${item.church_phone}`)}
                                                >
                                                    <Icon as={Phone} size="sm" className="text-cyan-600" />
                                                </TouchableOpacity>

                                                {item?.active_status === "Active" && <TouchableOpacity
                                                    className="w-10 h-10 rounded-full bg-red-50 items-center justify-center border border-red-100  "
                                                    onPress={() => handleDelete(item.id)}
                                                >
                                                    <Icon as={Trash2} size="sm" className="text-red-500" />
                                                </TouchableOpacity>
                                                }
                                            </HStack>
                                        </HStack>

                                        {/* 4. METADATA TAGS */}
                                        <HStack space="sm" className="items-center">
                                            <Box className="bg-slate-100 px-3 py-1 rounded-full flex-row items-center">
                                                <Icon as={MapPin} size="xs" className="mr-1 text-slate-500" />
                                                <Text className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{item.city}</Text>
                                            </Box>
                                            <Box className="bg-primary-50 px-3 py-1 rounded-full flex-row items-center">
                                                <Icon as={Globe} size="xs" className="mr-1 text-primary-600" />
                                                <Text className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">{item.denomination}</Text>
                                            </Box>
                                        </HStack>

                                        {/* 5. PRIMARY ACTION */}
                                        {/* 5. PRIMARY ACTION - 2026 REFINEMENT */}
                                        <HStack className="items-center justify-between mt-2">
                                            {/* Secondary Info/Status */}
                                            <VStack>
                                                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Last Modified</Text>
                                                <Text className="text-xs font-semibold text-slate-600">{item?.updated_at}</Text>
                                            </VStack>

                                            {/* The New Action Button */}
                                            <Button
                                                onPress={() => { setForm(item); navigation.navigate('ChurchRegistration', { profile: item }); }}
                                                className="h-11 px-6 rounded-2xl bg-primary-600 shadow-lg shadow-primary-200  "
                                                style={{
                                                    elevation: 8,
                                                    shadowColor: '#1c916aff',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 8,
                                                }}
                                            >
                                                <HStack space="xs" className="items-center">
                                                    <Icon as={Edit3} size="xs" className="text-white" />
                                                    <ButtonText className="text-xs font-black text-white uppercase tracking-widest">
                                                        Manage
                                                    </ButtonText>
                                                </HStack>
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </Box>
                        </AnimatedListItem>
                    );
                }}

                // Loading indicator for pagination (at the bottom)
                ListFooterComponent={() => (
                    isLoading && page > 1 ? (
                        <Box className="py-4"><ActivityIndicator color="#4F46E5" /></Box>
                    ) : null
                )}
            />

            {/* 3. FLOATING ACTION BUTTON (Modern Pulse) */}
            {currentTab === "Active" && <Fab
                className="bg-primary-900 bottom-8 right-8 w-16 h-16 rounded-[22px] shadow-2xl  "
                style={{
                    shadowColor: "#4F46E5",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 15,
                }}
                onPress={() => {
                    resetForm();
                    navigation.navigate('ChurchRegistration', { profile: null });
                }}
            >
                <FabIcon as={AddIcon} size="xl" className="text-white" />
            </Fab>
            }
        </Box>
    );
}