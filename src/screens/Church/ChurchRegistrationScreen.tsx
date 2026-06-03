import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, DimensionValue, Easing, Platform, Pressable, ScrollView, StatusBar, StyleSheet } from 'react-native';
import {
    Building2, MapPin, User, Phone, Mail, Hash, Globe, CheckCircle2, X, Icon
} from '@/src/components/common/IconUI';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter,
    VStack, HStack, Heading, Text, FormControl, FormControlLabel,
    FormControlLabelText, Input, InputField, FormControlError,
    FormControlErrorText, Select, SelectTrigger, SelectInput, SelectPortal,
    SelectBackdrop, SelectContent, SelectItem, Button, ButtonText, Divider,
    Box,
    ButtonSpinner
} from '@/src/components/common/GluestackUI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@/src/types/navigation';
import { ChevronDown, ChevronLeft, Edit3, Navigation, Network, Plus, User2Icon } from 'lucide-react-native';
import { AnimateError } from '../common/AnimateError';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Dropdown } from 'react-native-element-dropdown';
import profileService from '@/src/services/profileService';
import api from '@/src/api/api';
import { SuccessOverlay } from '../common/SuccessOverlay';
import FailedScreen from '../common/FailedScreen';
import AnimatedFormRow from './AnimatedViewForRegistration';
import LoadingScreen from '../common/LoadingScreen';
import ChruchService from '@/src/services/ChruchService';
import HeaderSession from '../common/HeaderSession';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import { LookupContext } from '@/src/context/LookupContext';
type Props = {
    navigation: NativeStackNavigationProp<AdminStackParamList, 'ChurchManagement'>;
    route: any;
};
interface FormFieldSkeletonProps {
    height?: number;
    width?: DimensionValue; // Use this specific type
}
const ChurchRegistrationScreen = ({ navigation, route }: any) => {// Mock State - Replace with your actual logic
    //console.log('route', route)
    const { profile } = route.params;
    const { lookups } = useContext(LookupContext);

    // console.log('params', profile)
    const [cities, setCities] = useState<any[]>([]);
    const [form, setForm] = useState<any>({
        church_name: '',
        pastor_name: '',
        church_email: '',
        church_phone: '',
        address: '',
        state: '',
        city: '',
        postal_code: '',
        active_status: 'active',
        denomination: '',
    });
    const [errors, setErrors] = useState<any>({
        church_name: '',
        pastor_name: '',
        church_email: '',
        church_phone: '',
        address: '',
        state: '',
        city: '',
        postal_code: '',
        active_status: '',
        denomination: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isLoadingForCities, setIsLoadingForCities] = useState(false);
    const fetchCities = async (stateId: string, searchQuery: string | null = null) => {
        console.log('stateId', stateId, searchQuery)
        setIsLoadingForCities(true); // Start loading
        try {
            const response = await profileService.getCities(stateId, searchQuery);
            console.log('cities', response.data)
            setCities(response.data);
        } catch (error) {
            console.error("Error fetching cities", error);
        } finally {
            setIsLoadingForCities(false); // Stop loading
        }
    };
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    // Data arrays
    const statusData = [
        { label: 'Active', value: 'Active' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Inactive', value: 'Inactive' },
    ];

    const denominationData = [
        { label: 'Baptist', value: 'Baptist' },
        { label: 'Catholic', value: 'Catholic' },
        { label: 'Pentecostal', value: 'Pentecostal' },
    ];

    const validate = () => {
        let newErrors: any = {};

        // 1. Pastor Name Check
        if (!form?.pastor_name?.trim()) {
            newErrors.pastor_name = "Pastor name is required";
        }

        // 2. Email Regex Check
        const emailRegex = /\S+@\S+\.\S+/;
        if (!form?.church_email) {
            newErrors.church_email = "Email is required";
        } else if (!emailRegex.test(form.church_email)) {
            newErrors.church_email = "Please enter a valid email address";
        }

        // 3. Phone Check
        if (!form?.church_phone) {
            newErrors.church_phone = "Phone number is required";
        } else if (form.church_phone.length < 10) {
            newErrors.church_phone = "Enter a valid phone number";
        }

        // 4. Address Check
        if (!form?.address?.trim()) {
            newErrors.address = "Street address is required";
        }

        // 5. Select/Dropdown Checks
        if (!form?.active_status) {
            newErrors.active_status = "Please select a status";
        }

        setErrors(newErrors);

        // Returns true if the newErrors object is empty
        return Object.keys(newErrors).length === 0;
    };
    const updateField = (fieldName: string, value: string) => {
        // 1. Safe Form Update
        setForm((prev: any) => ({
            ...(prev || {}),
            [fieldName]: value
        }));

        // 2. Safe Error Clearing
        if (errors && typeof errors === 'object' && errors[fieldName]) {
            setErrors((prev: any) => {
                const newErrors = { ...(prev || {}) };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };
    const handleSave = async () => {
        // 1. Prevent double-taps
        if (isSubmitting) return;

        if (validate()) {
            setIsSubmitting(true);

            try {
                const isUpdate = !!profile?.church_id;
                const payload = {
                    action: isUpdate ? 'update' : 'add',
                    data: form,
                    id: profile?.church_id
                };
                const response = await ChruchService.addUpdateChurch(payload);
                if (response.success) {
                    setIsSuccess(true);
                    setIsSubmitting(false);

                    setTimeout(() => {
                        setIsSuccess(false);
                        navigation.navigate('ChurchSummary', { refreshed: true });
                    }, 2500);
                } else {
                    throw new Error("Backend validation failed");
                }

            } catch (error) {
                console.error(error);
                setIsError(true);
                setIsSubmitting(false); // Allow them to try again
            }
            // Note: We removed 'finally' to control state transitions precisely
        }
    };

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        // Simulate fetch/prep
        const timer = setTimeout(() => {
            if (isMounted) {
                setIsLoading(false);
                if (profile?.church_id) {
                    setForm(profile);
                    profile?.city ? fetchCities(profile.state) : '';
                }
            }
        }, 800);

        return () => { isMounted = false; clearTimeout(timer); };
    }, [profile]);


    // 1. FORM FIELD SKELETON COMPONENT
    const FormFieldSkeleton = ({ height = 64, width = "100%" }: FormFieldSkeletonProps) => {
        const pulseAnim = useRef(new Animated.Value(0.4)).current;

        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }, []);

        return (
            <VStack space="xs" className="mb-6">
                <Animated.View style={{ opacity: pulseAnim }}>
                    <Box className="w-32 h-3 rounded bg-slate-200 ml-1 mb-2" />
                </Animated.View>

                <Animated.View style={{ opacity: pulseAnim }}>
                    <Box
                        className="rounded-2xl bg-slate-100 border border-slate-200"
                        // Use a style object that TS recognizes
                        style={{
                            height: height,
                            width: width
                        }}
                    />
                </Animated.View>
            </VStack>
        );
    };


    // 2. FULL PROFILE SKELETON
    const ProfileSkeleton = () => (
        <Box className="flex-1 bg-white">
            {/* Header Skeleton */}
            <Box className="px-6 pt-12 pb-6 bg-white">
                <HStack space="lg" className="items-center">
                    <Box className="w-12 h-12 rounded-full bg-slate-100" />
                    <VStack space="xs">
                        <Box className="w-48 h-8 rounded-lg bg-slate-200" />
                        <Box className="w-64 h-4 rounded bg-slate-100" />
                    </VStack>
                </HStack>
            </Box>

            <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
                <FormFieldSkeleton />
                <FormFieldSkeleton />
                <FormFieldSkeleton />

                <HStack space="md">
                    <Box className="flex-1">
                        <FormFieldSkeleton />
                    </Box>
                    <Box className="flex-1">
                        <FormFieldSkeleton />
                    </Box>
                </HStack>

                <FormFieldSkeleton height={128} />

                <HStack space="md">
                    <Box className="flex-1">
                        <FormFieldSkeleton />
                    </Box>
                    <Box className="flex-1">
                        <FormFieldSkeleton />
                    </Box>
                </HStack>
            </ScrollView>

            {/* Footer Skeleton */}
            <Box className="p-6 bg-white border-t border-slate-100">
                <HStack space="md">
                    <Box className="flex-1 h-16 rounded-2xl bg-slate-100" />
                    <Box className="flex-1 h-16 rounded-2xl bg-slate-200" />
                </HStack>
            </Box>
        </Box>
    );



    // Switch to Skeleton while loading
    if (isLoading) return <ProfileSkeleton />;
    if (isSubmitting) return <LoadingScreen />;
    return (
        <Box className="flex-1 bg-white">
            {/* HEADER */}

            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <HeaderSession
                title={profile && profile?.church_id ? 'Update Church Profile' : 'Church Profile'}
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />


            {/* Content wrapped in your logic */}
            <KeyboardAwareScrollView bottomOffset={0} className="flex-1" showsVerticalScrollIndicator={false}>

                <VStack space="xl" className="px-6 py-4 mb-50">
                    {/* Your Form Controls here (Church Name, Pastor, etc.) */}
                    {/* Example: */}
                    <AnimatedFormRow index={0}>
                        <FormControl isInvalid={!!errors?.church_name}>
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={User2Icon} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase">Church Name</FormControlLabelText>
                                </HStack>
                            </FormControlLabel>
                            <Input className="h-16 rounded-2xl bg-white border-slate-200 focus:border-cyan-500">
                                <InputField value={form?.church_name} placeholder="AG Rock City" onChangeText={(v) => updateField('church_name', v)} />
                            </Input>
                            <AnimateError isVisible={errors.church_name}>
                                {errors.church_name}
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>

                    {/* Lead Pastor */}
                    <AnimatedFormRow index={1}>
                        <FormControl isInvalid={!!errors?.pastor_name} className="w-full">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={User} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                                        Lead Pastor
                                    </FormControlLabelText>
                                </HStack>
                            </FormControlLabel>
                            <Input className="h-16 rounded-2xl bg-white border-slate-200 focus:border-cyan-500">
                                <InputField
                                    placeholder="Rev. John Doe"
                                    value={form?.pastor_name || ""}
                                    onChangeText={(v) => updateField('pastor_name', v)}
                                    className="text-md font-semibold text-slate-900"
                                />
                            </Input>
                            <AnimateError isVisible={!!errors?.pastor_name}>
                                {errors?.pastor_name}
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>

                    {/* Official Email */}
                    <AnimatedFormRow index={2}>
                        <FormControl isInvalid={!!errors?.church_email} className="w-full">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={Mail} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                                        Official Email
                                    </FormControlLabelText>
                                </HStack>
                            </FormControlLabel>
                            <Input className="h-16 rounded-2xl bg-white border-slate-200 focus:border-cyan-500">
                                <InputField
                                    placeholder="office@church.com"
                                    keyboardType="email-address"
                                    value={form?.church_email}
                                    onChangeText={(v) => updateField('church_email', v)}
                                    className="text-md font-semibold text-slate-900"
                                />
                            </Input>
                            <AnimateError isVisible={!!errors?.church_email}>
                                <FormControlErrorText className="text-xs text-red-500 mt-1">
                                    {errors?.church_email}
                                </FormControlErrorText>
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>

                    {/* State*/}
                    <AnimatedFormRow index={3}>
                        <FormControl className="w-full">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={MapPin} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                                        State
                                    </FormControlLabelText>
                                </HStack>
                            </FormControlLabel>
                            <FuturisticDropdown
                                data={lookups?.state}
                                value={form?.state}
                                onChange={(item: any) => {
                                    updateField('state', item.value);
                                    updateField('city', '');
                                    fetchCities(item.value);
                                }}
                                placeholder="Select State "
                                icon={{ icon: MapPin, color: 'text-blue-500' }}
                                search={false}
                                isInvalid={errors.state}
                            />


                            {/* <Dropdown
                                style={[
                                    dropdownStyles.dropdown,
                                    errors?.active_status && { borderColor: '#ef4444' } // red-500 if error
                                ]}
                                placeholderStyle={dropdownStyles.placeholderStyle}
                                selectedTextStyle={dropdownStyles.selectedTextStyle}
                                data={STATES}
                                maxHeight={300}
                                labelField="StateName"
                                valueField="StateCode"
                                placeholder="Select"
                                value={form?.state}
                                onChange={item => {
                                    updateField('state', item.StateCode);
                                    updateField('city', '');
                                    fetchCities(item.StateCode);
                                }}
                                renderRightIcon={() => <Icon as={ChevronDown} size="xs" className="text-slate-400" />}
                            /> */}
                            <AnimateError isVisible={!!errors?.state}>
                                <FormControlErrorText className="text-xs text-red-500 mt-1">
                                    {errors?.state}
                                </FormControlErrorText>
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>

                    {/*  city*/}
                    <AnimatedFormRow index={4}>
                        <FormControl isInvalid={!!errors?.city} className="w-full">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={Building2} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase">City</FormControlLabelText>
                                </HStack>
                            </FormControlLabel>

                            <FuturisticDropdown
                                data={cities || []}
                                value={form?.city}
                                onChange={(item: any) => updateField('city', item.value)}
                                placeholder="Select City"
                                icon={{ icon: Navigation, color: 'text-cyan-600' }}
                                search={true}
                                isInvalid={errors.city}
                            />


                            {/* <Dropdown
                                style={[
                                    dropdownStyles.dropdown,
                                    errors?.active_status && { borderColor: '#ef4444' } // red-500 if error
                                ]}
                                placeholderStyle={dropdownStyles.placeholderStyle}
                                selectedTextStyle={dropdownStyles.selectedTextStyle}
                                data={cities}
                                mode="modal"
                                search
                                searchPlaceholder="Search your city"
                                maxHeight={300}
                                labelField="CityName"
                                valueField="CityCode"
                                placeholder="Select"
                                value={form?.city}
                                renderLeftIcon={() => isLoadingForCities ? <ActivityIndicator size="small" color="#0891b2" className="mr-3" /> : null}
                                renderRightIcon={() => <Icon as={ChevronDown} size="xs" className="text-slate-400" />}
                                onChange={item => updateField('city', item.CityCode)}
                            /> */}
                        </FormControl>
                    </AnimatedFormRow>

                    {/* Street Address Field */}
                    <AnimatedFormRow index={5}>
                        <FormControl isInvalid={!!errors?.address} className="w-full">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={MapPin} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase">
                                        Street Address
                                    </FormControlLabelText>
                                </HStack>
                            </FormControlLabel>

                            <Input className="h-32 rounded-2xl bg-white border-slate-200 focus:border-cyan-500">
                                <InputField
                                    multiline={true}
                                    numberOfLines={4}
                                    placeholder="123 Grace Avenue..."
                                    value={form?.address}
                                    onChangeText={(v) => updateField('address', v)}
                                    // This style fixes the "starting in center" issue
                                    style={{
                                        textAlignVertical: 'top',
                                        paddingTop: 12,
                                        height: '100%',
                                        fontSize: 16
                                    }}
                                    className="font-semibold text-slate-900"
                                />
                            </Input>

                            <AnimateError isVisible={!!errors?.address}>
                                {errors?.address}
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>

                    {/* Two Column Row Example */}

                    <HStack space="md" className="w-full">
                        {/* Zip Field Wrapper */}
                        <AnimatedFormRow index={6} className="flex-1">
                            <FormControl isInvalid={!!errors?.postal_code} className="w-full">
                                <FormControlLabel className="mb-2 ml-1">
                                    <HStack className="items-center">
                                        <Icon as={Hash} size="xs" className="mr-2 text-cyan-600" />
                                        <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase">Zip</FormControlLabelText>
                                    </HStack>
                                </FormControlLabel>
                                <Input className="h-16 rounded-2xl border-slate-200">
                                    <InputField
                                        placeholder="12345"
                                        keyboardType="phone-pad"
                                        value={form?.postal_code}
                                        onChangeText={(v) => updateField('postal_code', v)}
                                        className="text-md font-semibold text-slate-900"
                                    />
                                </Input>
                            </FormControl>
                        </AnimatedFormRow>

                        {/* Primary Contact Field Wrapper */}
                        <AnimatedFormRow index={7} className="flex-1">
                            <FormControl isInvalid={!!errors.church_phone} className="w-full">
                                <FormControlLabel className="mb-2 ml-1">
                                    <HStack className="items-center">
                                        <Icon as={Phone} size="xs" className="mr-2 text-cyan-600" />
                                        <FormControlLabelText className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                                            Primary Contact
                                        </FormControlLabelText>
                                    </HStack>
                                </FormControlLabel>
                                <Input className="h-16 rounded-2xl bg-white border-slate-200 focus:border-cyan-500">
                                    <InputField
                                        placeholder="+1 234 567 890"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={form.church_phone}
                                        onChangeText={(v) => updateField('church_phone', v)}
                                        className="text-md font-semibold text-slate-900"
                                    />
                                </Input>
                            </FormControl>
                        </AnimatedFormRow>
                    </HStack>

                    {/* Denomination */}
                    <AnimatedFormRow index={8} style={{ zIndex: 2000 }}>
                        <FormControl isInvalid={!!errors?.denomination} className="mb-6">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={Globe} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Denomination
                                    </FormControlLabelText>
                                </HStack>
                            </FormControlLabel>

                            <FuturisticDropdown
                                data={lookups?.sub_community || []}
                                value={form?.denomination}
                                onChange={(item: any) => updateField('denomination', item.value)}
                                placeholder="Select"
                                icon={{ icon: Network, color: 'text-typography-400' }}
                                search={false}
                                isInvalid={errors?.denomination}
                            />

                            {/* <Dropdown
                                style={[
                                    dropdownStyles.dropdown,
                                    { height: 64, backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16 },
                                    errors?.denomination && { borderColor: '#ef4444' }
                                ]}
                                placeholderStyle={dropdownStyles.placeholderStyle}
                                selectedTextStyle={dropdownStyles.selectedTextStyle}
                                data={lookups?.sub_community} 
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder="Select"
                                value={form?.denomination}
                                onChange={item => updateField('denomination', item.value)}
                            /> */}
                            <AnimateError isVisible={!!errors?.denomination}>
                                <FormControlErrorText className="text-xs text-red-500 mt-1">
                                    {errors?.denomination}
                                </FormControlErrorText>
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>

                    {/* Active Status */}
                    <AnimatedFormRow index={9} style={{ zIndex: 1000 }}>
                        <FormControl isInvalid={!!errors?.active_status} className="mb-6">
                            <FormControlLabel className="mb-2 ml-1">
                                <HStack className="items-center">
                                    <Icon as={CheckCircle2} size="xs" className="mr-2 text-cyan-600" />
                                    <FormControlLabelText className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Status
                                    </FormControlLabelText>
                                </HStack>
                            </FormControlLabel>
                            <Dropdown
                                style={[
                                    dropdownStyles.dropdown,
                                    { height: 56, backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16 },
                                    errors?.active_status && { borderColor: '#ef4444' }
                                ]}
                                placeholderStyle={dropdownStyles.placeholderStyle}
                                selectedTextStyle={dropdownStyles.selectedTextStyle}
                                data={statusData}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder="Select"
                                value={form?.active_status}
                                onChange={item => updateField('active_status', item.value)}
                            />
                            <AnimateError isVisible={!!errors?.active_status}>
                                <FormControlErrorText className="text-xs text-red-500 mt-1">
                                    {errors?.active_status}
                                </FormControlErrorText>
                            </AnimateError>
                        </FormControl>
                    </AnimatedFormRow>
                </VStack>

            </KeyboardAwareScrollView>

            {/* FOOTER */}
            <Box className="p-6 bg-white border-t border-slate-100 shadow-2xl">
                <HStack space="md">
                    {/* CANCEL BUTTON */}
                    <Button
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        className="flex-1 h-16 rounded-2xl border-slate-200 "
                    >
                        <ButtonText className="text-slate-600 font-bold uppercase tracking-tight">Cancel</ButtonText>
                    </Button>

                    {/* DYNAMIC SAVE/UPDATE BUTTON */}
                    <Button
                        onPress={handleSave}
                        isDisabled={isSubmitting || !form?.church_name}
                        className={`flex-[1.5] h-16 rounded-2xl border-0 shadow-lg  }`}
                    >
                        <HStack space="sm" className="items-center justify-center">
                            {isSubmitting ? (
                                <ButtonSpinner color="white" />
                            ) : (
                                <Icon
                                    as={profile?.church_id ? Edit3 : Plus}
                                    size="sm"
                                    className="text-white mr-1"
                                />
                            )}
                            <ButtonText className="font-black text-white uppercase tracking-widest text-sm">
                                {isSubmitting
                                    ? (profile?.church_id ? "Updating..." : "Saving...")
                                    : (profile?.church_id ? "Update Details" : "Register Church")
                                }
                            </ButtonText>
                        </HStack>
                    </Button>
                </HStack>
            </Box>

            <SuccessOverlay
                isVisible={isSuccess}
                message={
                    profile?.church_id
                        ? "Church details updated successfully!"
                        : "Church registered successfully!"
                }
                onClose={() => {
                    setIsSuccess(false);
                    navigation.goBack();
                }}
            />

            <FailedScreen
                isVisible={isError}
                title="Operation Failed"
                // Use the same ID logic for the error description
                description={
                    profile?.church_id
                        ? "We couldn't update the church details. Please check your connection and try again."
                        : "We couldn't register the church. Please check your connection and try again."
                }
                onRetry={() => {
                    setIsError(false);
                    handleSave(); // Assuming your submit function is called handleSave
                }}
                onClose={() => {
                    setIsError(false);
                }}
            />
        </Box>
    );
}
const dropdownStyles = StyleSheet.create({
    dropdown: {
        height: 56,
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#94a3b8', // slate-400
    },
    selectedTextStyle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a', // slate-900
    },
});
export default ChurchRegistrationScreen;

