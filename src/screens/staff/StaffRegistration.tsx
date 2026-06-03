import React, { useState, useRef, useMemo, useCallback, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Platform, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import {
    VStack, HStack, Text, Input, InputField, InputSlot,
    Box, Button, ButtonText,
    Heading,
    FormControl,
    ButtonIcon,
    FormControlLabelText,
    FormControlLabel,
    Switch
} from '@/src/components/common/GluestackUI';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker'; // Used as the engine
import { Calendar, ChevronRight, Check, Hash, Briefcase, Building2, Phone, Mail, MapPin, Save, Navigation } from '@/src/components/common/IconUI';
import { Icon } from '@/components/ui/icon';
import { AnimateError } from '../common/AnimateError';
import api from '@/src/api/api';
import profileService from '@/src/services/profileService';
import { Dropdown } from 'react-native-element-dropdown';
import { STATES } from '@/src/utils/utils';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ArrowRight, Home, ShieldCheck, User, UserCheck } from 'lucide-react-native';
import { LookupContext } from '@/src/context/LookupContext';
import ChruchService from '@/src/services/ChruchService';
import _, { cloneDeep } from 'lodash';
import StaffService from '@/src/services/StaffService';
import { SuccessOverlay } from '../common/SuccessOverlay';
import { StatusAlert } from '../common/StatusAlert';
import FailedScreen from '../common/FailedScreen';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import HeaderSession from '../common/HeaderSession';
import { useAppToast } from '@/src/context/ToastContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const StaffRegistration = ({ navigation, route }: any) => {
    const { id, isEdit } = route.params || {};
    const { lookups } = useContext(LookupContext);
    const { showToast } = useAppToast();

    const [formData, setFormData] = useState({
        id: '',
        userid: '',
        firstName: '',
        lastName: '',
        staff_id: '',
        department: '',
        designation: '',
        church_id: '',
        mobileNo: '',
        email: '',
        address: '',
        role: '',
        joiningDate: new Date(),
        joiningDateLabel: '',
        altMobileNo: '',
        state: null,
        city: null,
        selected_pastor: '',
        selected_address: '',
        activeStatus: 'Active'
    });
    const [errors, setErrors] = useState<any>({});
    // State to prevent Android auto-reopen loop
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);
    const [filteredCities, setFilteredCities] = useState([]);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['45%'], []);
    // const handleConfirm = (date: Date) => {
    //     //const formattedDate = date.toISOString().split('T')[0]; // Result: 2026-02-05
    //     setFormData({ ...formData, joiningDate: date }); 
    //   };
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStateFocus, setIsStateFocus] = useState(false);
    const [isCityFocus, setIsCityFocus] = useState(false);
    const [isChurchFocus, setIsChurchFocus] = useState(false);
    const [isRoleFocus, setIsRoleFocus] = useState(false);
    const [isDesignationFocus, setIsDesignationFocus] = useState(false);
    const [churchBranches, setChurchBranches] = useState<any>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showFailed, setShowFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {
        if (isEdit) {
            fetchSingleStaffById();
        }
    }, [id]);
    const fetchSingleStaffById = async () => {
        const responses = await StaffService.fetchSingleStaffById(id);
        //console.log('response', responses);
        if (responses.success) {
            let response = cloneDeep(responses);
            response.data.joiningDate = new Date(response.data.joiningDate);
            response.data.joiningDateLabel = new Date(response.data.joiningDate).toISOString().split('T')[0];
            fetchCities(response?.data?.state ?? "");
            setFormData(response.data);
        }
    };
    useEffect(() => {
        getCurchBranches();
    }, [formData.city]);

    const getCurchBranches = async () => {
        //console.log('formData', formData.city)
        const branches = await ChruchService.getCurchBranches(formData.city ?? "")
        if (branches.success) {
            if (branches?.data?.length == 0) {
                showToast("No Available church details", "Please contact the admin", "error");
            }

            const transformedData = branches?.data?.map((item: any) => ({
                value: item.church_id.toString(),
                label: item.church_name,
                address: item.address,
                city: item.city,
                state: item.state,
                country: item.country,
                postal_code: item.postal_code,
                pastor_name: item.pastor_name
            }));

            setChurchBranches(transformedData);

            if (formData.church_id) {
                var indx = _.findIndex(transformedData, ["value", formData.church_id]);
                if (indx != -1) {
                    updateForm('selected_pastor', transformedData[indx].pastor_name);
                    updateForm('selected_address', transformedData[indx].address);
                    // console.log('selected_pastor', transformedData[indx].pastor_name);
                    // console.log('selected_address', transformedData[indx].address);

                }
            }

        } else {
            setChurchBranches([]);
        }
    };

    // 2. Helper function to update form state
    const updateForm = (key: string, value: any) => {
        // 1. Update the form data as usual
        setFormData((prev: any) => ({ ...prev, [key]: value }));

        // 2. Clear the error for this specific field if it exists
        if (errors[key]) {
            setErrors((prevErrors: any) => {
                const newErrors = { ...prevErrors };
                delete newErrors[key]; // Remove the specific error
                return newErrors;
            });
        }
    };

    // 3. Fetch cities based on State Code
    const fetchCities = async (stateCode: string) => {
        setIsLoading(true);
        try {
            // Replace this with your actual API call
            const response = await profileService.getCities(stateCode)
            setCities(response.data);

        } catch (error) {
            console.error("Error loading cities", error);
        } finally {
            setIsLoading(false);
        }
    };
    const validate = () => {
        let newErrors: any = {};

        // Official Identity
        if (!formData.staff_id) newErrors.staff_id = "Staff ID required";
        if (!formData.firstName) newErrors.firstName = "First name required";
        if (!formData.lastName) newErrors.lastName = "Last name required";

        // Work Details
        if (!formData.department) newErrors.department = "Department required";
        if (!formData.joiningDateLabel) newErrors.joiningDate = "Joining date required";

        // Communication
        if (!formData.mobileNo) {
            newErrors.mobileNo = "Mobile number required";
        } else if (!formData.mobileNo.match(/^[0-9]{10}$/)) {
            newErrors.mobileNo = "Must be a 10-digit number";
        }

        if (!formData.altMobileNo) {
            newErrors.altMobileNo = "Alternative number required";
        } else if (!formData.altMobileNo.match(/^[0-9]{10}$/)) {
            newErrors.altMobileNo = "Must be a 10-digit number";
        }

        if (!formData.email) {
            newErrors.email = "Email required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Location
        if (!formData.state) newErrors.state = "State selection required";
        if (!formData.city) newErrors.city = "City selection required";
        if (!formData.address || formData.address.trim().length < 5) {
            newErrors.address = "Full address required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const openDatePicker = () => {
        if (Platform.OS === 'android') {
            setShowAndroidPicker(true);
        } else {
            bottomSheetRef.current?.expand();
        }
    };

    const closeDatePicker = () => bottomSheetRef.current?.close();

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        []
    );

    const onDateChange = (event: any, selectedDate?: Date) => {
        // 1. Android logic: Hide picker immediately after selection
        if (Platform.OS === 'android') {
            setShowAndroidPicker(false);
        }

        if (selectedDate) {
            if (Platform.OS === 'android') {
                // 2. Android: Update label immediately since there's no "Confirm" button on a sheet
                const formatted = selectedDate.toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, joiningDate: selectedDate, joiningDateLabel: formatted }));
            } else {
                // 3. iOS: Just update the date object, let user press "Set Date" button
                setFormData(prev => ({ ...prev, joiningDate: selectedDate }));
            }
        }
    };

    const handleIOSDateConfirm = () => {
        const formatted = formData.joiningDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, joiningDateLabel: formatted }));
        closeDatePicker();
    };
    const handleDateConfirm = () => {
        const formatted = formData.joiningDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, joiningDateLabel: formatted }));
        closeDatePicker();
    };
    const [currentStep, setCurrentStep] = useState(1);
    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const handleNext = () => {
        let newErrors: any = {};

        // Validate only Step 1 fields

        if (!formData.firstName) newErrors.firstName = "First name required";
        if (!formData.lastName) newErrors.lastName = "Last name required";
        if (!formData.mobileNo) newErrors.mobileNo = "Mobile number required";
        if (!formData.mobileNo) {
            newErrors.mobileNo = "Mobile number required";
        } else if (!formData.mobileNo.match(/^[0-9]{10}$/)) {
            newErrors.mobileNo = "Must be a 10-digit number";
        }

        if (!formData.email) newErrors.email = "Email required";
        else if (!validateEmail(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.address) newErrors.address = "Address required";
        else if (!formData.address || formData.address.trim().length < 5) {
            newErrors.address = "Full address required";
        }
        if (!formData.state) newErrors.state = "State required";
        if (!formData.city) newErrors.city = "City required";

        if (!formData.mobileNo.match(/^[0-9]{10}$/)) {
            newErrors.mobileNo = "Must be a 10-digit number";
        }
        setErrors(newErrors);

        // If no errors for Step 1, move to Step 2
        if (Object.keys(newErrors).length === 0) {
            if (isEdit) {
                const index = churchBranches.findIndex((item: any) => item.church_id === formData.church_id);
                if (index !== -1) {
                    setFormData(prev => ({ ...prev, selected_pastor: churchBranches[index].pastor_name, selected_address: churchBranches[index].address }));
                }
            }
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        setErrors({});
        setCurrentStep(1);
    }
    const handleFinalSubmit = () => {
        let newErrors: any = {};

        if (!formData.designation) newErrors.designation = "Designation required";
        if (!formData.joiningDateLabel) newErrors.joiningDate = "Joining date required";
        if (!formData.role) newErrors.role = "Role required";
        if (!formData.church_id) newErrors.church_id = "Church Assign required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            isEdit ? handleUpdate() : handleSave(); // Your actual API call
        }
    };
    const handleSave = async () => {
        try {
            const data = {
                action: 'add',
                ...formData,
            }
            console.log(data);
            const response = await StaffService.addUpdateStaff(data);
            console.log(response);
            if (response?.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);

                    navigation.navigate('Main', { screen: 'StaffSummaryView' })

                }, 5000);
            } else {
                if (!response?.success) {
                    setShowError(true);
                    setErrorMessage(response.message || "Failed to add staff member");
                } else {
                    setShowFailed(true);
                    setErrorMessage("Failed to add staff member");

                }
            }
        } catch (error) {
            console.error("Error adding staff:", error);
            Alert.alert("Error", "An error occurred while adding staff member");
        }
    };

    const handleUpdate = async () => {
        try {
            const data = {
                action: 'update',
                ...formData,
            }
            const response = await StaffService.UpdateStaff(data);
            console.log(response);
            if (response?.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    navigation.navigate('StaffSummaryView');
                    //navigation.navigate('Main', { screen: 'StaffSummaryView' })

                }, 5000);
            } else {
                if (!response?.success) {
                    setShowError(true);
                    setErrorMessage(response.message || "Failed to update staff member");
                } else {
                    setShowFailed(true);
                    setErrorMessage("Failed to update staff member");

                }
            }
        } catch (error) {
            console.error("Error updating staff:", error);
            Alert.alert("Error", "An error occurred while updating staff member");
        }
    };


    return (
        <Box className="flex-1 bg-slate-50"  >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 1. Sticky Navigation Header */}
            <HeaderSession
                title="My Profile"
                theme="blue"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />

            {/* 2. Scrollable Form Payload Space */}
            <KeyboardAwareScrollView
                bottomOffset={20}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <VStack className="p-6 gap-6">

                    {/* --- Global Form Progress Track --- */}
                    <VStack space="xs" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                        <HStack className="justify-between items-center">
                            <Heading size="xl" className="text-slate-900 font-bold">Staff Registration</Heading>
                            <Box className="bg-cyan-50 px-3 py-1 rounded-full">
                                <Text className="text-cyan-700 text-xs font-bold">Step {currentStep} of 2</Text>
                            </Box>
                        </HStack>
                        <Text size="sm" className="text-slate-500 mt-1">
                            {currentStep === 1 ? "Enter official credentials." : "Enter contact and location details."}
                        </Text>
                        <HStack className="h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                            <VStack className={`h-full bg-cyan-600 rounded-full   duration-300 ${currentStep === 1 ? 'w-1/2' : 'w-full'}`} />
                        </HStack>
                    </VStack>

                    <VStack className="gap-6">
                        {currentStep === 1 ? (
                            <VStack className="gap-6 animate-in fade-in duration-500">

                                {/* --- Section 1: Official Identity Block --- */}
                                <VStack className="gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                                    <HStack className="items-center border-b border-slate-100 pb-3" space="sm">
                                        <Icon as={Hash} size="sm" className="text-cyan-600" />
                                        <Text className="font-bold text-slate-800 uppercase tracking-wider text-xs">Official Identity</Text>
                                    </HStack>

                                    <HStack space="md">
                                        <FormControl className="flex-1" isInvalid={!!errors.firstName}>
                                            <Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:border-cyan-600">
                                                <InputField
                                                    className="pl-4 text-base text-slate-900"
                                                    placeholder="First Name"
                                                    value={formData.firstName}
                                                    onChangeText={(v) => updateForm('firstName', v)}
                                                />
                                            </Input>
                                            <AnimateError isVisible={errors.firstName}>{errors.firstName}</AnimateError>
                                        </FormControl>
                                    </HStack>

                                    <HStack space="md">
                                        <FormControl className="flex-1" isInvalid={!!errors.lastName}>
                                            <Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:border-cyan-600">
                                                <InputField
                                                    className="pl-4 text-base text-slate-900"
                                                    placeholder="Last Name"
                                                    value={formData.lastName}
                                                    onChangeText={(v) => updateForm('lastName', v)}
                                                />
                                            </Input>
                                            <AnimateError isVisible={errors.lastName}>{errors.lastName}</AnimateError>
                                        </FormControl>
                                    </HStack>
                                </VStack>

                                {/* --- Section 2: Communication & Location Block --- */}
                                <VStack space="md" className="gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                                    <HStack className="items-center border-b border-slate-100 pb-3" space="sm">
                                        <Icon as={Phone} size="sm" className="text-cyan-600" />
                                        <Text className="font-bold text-slate-800 uppercase tracking-wider text-xs">Communication & Location</Text>
                                    </HStack>

                                    <FormControl isInvalid={!!errors.mobileNo}>
                                        <Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:border-cyan-600">
                                            <InputSlot className="pl-4"><Icon as={Phone} size="sm" className="text-slate-400" /></InputSlot>
                                            <InputField
                                                maxLength={10}
                                                className="text-base text-slate-900"
                                                placeholder="Mobile Number"
                                                keyboardType="phone-pad"
                                                value={formData.mobileNo}
                                                onChangeText={(v) => updateForm('mobileNo', v)}
                                            />
                                        </Input>
                                        <AnimateError isVisible={errors.mobileNo}>{errors.mobileNo}</AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.altMobileNo}>
                                        <Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:border-cyan-600">
                                            <InputSlot className="pl-4"><Icon as={Phone} size="sm" className="text-slate-400" /></InputSlot>
                                            <InputField
                                                maxLength={10}
                                                className="text-base text-slate-900"
                                                placeholder="Alternative Mobile Number"
                                                keyboardType="phone-pad"
                                                value={formData.altMobileNo}
                                                onChangeText={(v) => updateForm('altMobileNo', v)}
                                            />
                                        </Input>
                                        <AnimateError isVisible={errors.altMobileNo}>{errors.altMobileNo}</AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.email}>
                                        <Input className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus:border-cyan-600">
                                            <InputSlot className="pl-4"><Icon as={Phone} size="sm" className="text-slate-400" /></InputSlot>
                                            <InputField
                                                className="text-base text-slate-900"
                                                placeholder="Email Address"
                                                keyboardType="email-address"
                                                value={formData.email}
                                                onChangeText={(v) => updateForm('email', v)}
                                            />
                                        </Input>
                                        <AnimateError isVisible={errors.email}>{errors.email}</AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.address}>
                                        <Input className="h-28 rounded-2xl bg-slate-50/50 border-slate-200 focus:border-cyan-600 items-start py-2">
                                            <InputSlot className="pl-4 pt-2"><Icon as={MapPin} size="sm" className="text-slate-400" /></InputSlot>
                                            <InputField
                                                multiline={true}
                                                numberOfLines={4}
                                                placeholder="Complete Residential Address"
                                                value={formData.address}
                                                onChangeText={(v) => updateForm('address', v)}
                                                className="text-base flex-1 text-slate-900 pt-1"
                                                textAlignVertical="top"
                                            />
                                        </Input>
                                        <AnimateError isVisible={errors.address}>{errors.address}</AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.state}>
                                        <FuturisticDropdown
                                            data={lookups?.state}
                                            value={formData.state}
                                            onChange={(item: any) => {
                                                updateForm('state', item.value);
                                                updateForm('city', '');
                                                fetchCities(item.value);
                                            }}
                                            placeholder="Select State"
                                            icon={{ icon: MapPin, color: 'text-cyan-600' }}
                                            search={false}
                                            isInvalid={errors.state}
                                        />
                                        <AnimateError isVisible={errors.state}>{errors.state}</AnimateError>
                                    </FormControl>

                                    {formData.state && (
                                        <FormControl isInvalid={!!errors.city}>
                                            <FuturisticDropdown
                                                data={cities || []}
                                                value={formData.city}
                                                onChange={(item: any) => updateForm('city', item.value)}
                                                placeholder="Select City"
                                                icon={{ icon: Navigation, color: 'text-cyan-600' }}
                                                search={true}
                                                isInvalid={errors.city}
                                            />
                                            <AnimateError isVisible={errors.city}>{errors.city}</AnimateError>
                                        </FormControl>
                                    )}
                                </VStack>
                            </VStack>
                        ) : (
                            <VStack className="gap-6 animate-in fade-in duration-500">

                                {/* --- Section 3: Work Specifications Block --- */}
                                <VStack className="gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                                    <HStack className="items-center border-b border-slate-100 pb-3" space="sm">
                                        <Icon as={Briefcase} size="sm" className="text-cyan-600" />
                                        <Text className="font-bold text-slate-800 uppercase tracking-wider text-xs">Work Details</Text>
                                    </HStack>

                                    <FormControl isInvalid={!!errors.joiningDate}>
                                        <Pressable onPress={openDatePicker}>
                                            <HStack className={`h-14 px-4 items-center justify-between bg-slate-50/50 rounded-2xl border ${errors.joiningDate ? 'border-red-500' : 'border-slate-200'}`}>
                                                <HStack space="md" className="items-center">
                                                    <Icon as={Calendar} size="sm" className={formData.joiningDateLabel ? "text-cyan-600" : "text-slate-400"} />
                                                    <Text className={`text-base ${formData.joiningDateLabel ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                                                        {formData.joiningDateLabel || "Select Joining Date"}
                                                    </Text>
                                                </HStack>
                                                <Icon as={ChevronRight} size="xs" className="text-slate-400" />
                                            </HStack>
                                        </Pressable>
                                        <AnimateError isVisible={errors.joiningDate}>{errors.joiningDate}</AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.role}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Ministry Role
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <FuturisticDropdown
                                            data={_.filter(lookups.role, (item: any) => item.value !== 'member') || []}
                                            value={formData.role || ''}
                                            onChange={(item: any) => updateForm('role', item.value)}
                                            placeholder="Ministry Role"
                                            icon={{ icon: UserCheck, color: 'text-cyan-600' }}
                                            search={false}
                                            isInvalid={errors.role}
                                        />
                                        <AnimateError isVisible={errors.role}>{errors.role}</AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.designation}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Ministry Designation
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <FuturisticDropdown
                                            data={lookups.designation || []}
                                            value={formData.designation}
                                            onChange={(item: any) => updateForm('designation', item.value)}
                                            placeholder="Ministry Designation"
                                            icon={{ icon: UserCheck, color: 'text-cyan-600' }}
                                            search={false}
                                            isInvalid={errors.designation}
                                        />
                                        <AnimateError isVisible={errors.designation}>{errors.designation}</AnimateError>
                                    </FormControl>

                                    {/* --- Account Operational Status Toggles --- */}
                                    <VStack space="md" className="gap-2 mt-2">
                                        <HStack className="items-center border-b border-slate-100 pb-2" space="sm">
                                            <Icon as={ShieldCheck} size="sm" className="text-cyan-600" />
                                            <Text className="font-bold text-slate-800 uppercase tracking-wider text-xs">Account Status</Text>
                                        </HStack>

                                        <HStack className="items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                                            <VStack className="flex-1 pr-4">
                                                <Text className="font-bold text-slate-800 text-base">
                                                    {formData.activeStatus}
                                                </Text>
                                                <Text className="text-slate-400 text-xs mt-0.5">
                                                    Determines if this staff can access the system
                                                </Text>
                                            </VStack>
                                            <Switch
                                                size="lg"
                                                trackColor={{ false: '#e2e8f0', true: '#0891b2' }}
                                                thumbColor={'#ffffff'}
                                                value={formData.activeStatus === 'Active'}
                                                onValueChange={(value) =>
                                                    updateForm('activeStatus', value ? 'Active' : 'Inactive')
                                                }
                                            />
                                        </HStack>
                                    </VStack>

                                    {/* --- Core Affiliate Distribution Details --- */}
                                    <FormControl isInvalid={!!errors.church_id} className="mt-2">
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                Assigned Church / Branch
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <FuturisticDropdown
                                            data={churchBranches || []}
                                            value={formData?.church_id}
                                            onChange={(item: any) => {
                                                updateForm('church_id', item.value);
                                                updateForm('selected_pastor', item.pastor_name);
                                                updateForm('selected_address', item.address);
                                            }}
                                            placeholder="Assigned Church"
                                            icon={{ icon: Home, color: 'text-cyan-600' }}
                                            search={false}
                                            isInvalid={errors.church_id}
                                        />
                                        <AnimateError isVisible={errors.church_id}>{errors.church_id}</AnimateError>
                                    </FormControl>

                                    {formData?.church_id ? (
                                        <VStack space="md" className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                                            <HStack space="md" className="items-start">
                                                <Icon as={User} size="sm" className="text-slate-400 mt-0.5" />
                                                <VStack>
                                                    <Text className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Head Pastor</Text>
                                                    <Text className="text-sm text-slate-800 font-semibold mt-0.5">
                                                        {formData.selected_pastor || "N/A"}
                                                    </Text>
                                                </VStack>
                                            </HStack>

                                            <HStack space="md" className="items-start">
                                                <Icon as={MapPin} size="sm" className="text-slate-400 mt-0.5" />
                                                <VStack className="flex-1">
                                                    <Text className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Branch Address</Text>
                                                    <Text className="text-sm text-slate-600 italic mt-0.5 leading-relaxed">
                                                        {formData.selected_address || "No address provided"}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    ) : null}
                                </VStack>

                            </VStack>
                        )}
                    </VStack>
                </VStack>
            </KeyboardAwareScrollView>

            {/* 3. Sticky Action Bar Footer (Always explicitly anchored above system gesture zones) */}
            <Box className="bg-white border-t border-slate-100 p-6 shadow-xl shadow-slate-900/10">
                <SafeAreaView edges={['bottom']}>
                    <HStack space="md" className="justify-end">
                        {currentStep === 2 && (
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={prevStep}
                                className="h-14 rounded-2xl border-slate-200 "
                            >
                                <ButtonText className="text-slate-600 font-semibold">Back</ButtonText>
                            </Button>
                        )}

                        <Button
                            disabled={churchBranches?.length === 0}
                            onPress={currentStep === 1 ? handleNext : handleFinalSubmit}
                            className={`${currentStep === 1 ? 'w-full' : 'flex-1'} h-14 rounded-2xl bg-cyan-600  disabled:opacity-50`}
                        >
                            <ButtonText className="font-bold">
                                {currentStep === 1 ? "Next Step" : isEdit ? "Update Details" : "Submit Registration"}
                            </ButtonText>
                            <ButtonIcon as={ArrowRight} className="ml-2" />
                        </Button>
                    </HStack>
                </SafeAreaView>
            </Box>

            {/* --- Native Modals & Utility Overlays --- */}
            {showAndroidPicker && (
                <DateTimePicker
                    value={formData?.joiningDate || new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            {Platform.OS === 'ios' && (
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 40 }}
                >
                    <VStack className="flex-1 p-6 bg-white">
                        <Text className="text-xl font-bold text-slate-800 mb-4">Pick Date</Text>
                        <Box className="bg-slate-50 rounded-3xl py-2 mb-6 overflow-hidden">
                            <DateTimePicker
                                value={formData.joiningDate || new Date()}
                                mode="date"
                                display="spinner"
                                maximumDate={new Date()}
                                onChange={onDateChange}
                                style={{ height: 180 }}
                            />
                        </Box>
                        <Button onPress={handleIOSDateConfirm} className="h-14 rounded-2xl bg-cyan-600 ">
                            <ButtonText className="font-bold">Set Date</ButtonText>
                        </Button>
                    </VStack>
                </BottomSheet>
            )}

            <StatusAlert isOpen={showError} onClose={() => setShowError(false)} type="error" title="Error" message={errorMessage || "Failed to add staff member"} />
            <FailedScreen isVisible={showFailed} description={isEdit ? "Failed to update staff member" : "Failed to add staff member"} onClose={() => { setShowFailed(false); }} />
            <SuccessOverlay isVisible={showSuccess} message={isEdit ? "Staff updated successfully!" : "Staff added successfully!"} />
        </Box>
    );
}

export default StaffRegistration;

const styles = StyleSheet.create({
    dropdown: {
        height: 56,
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
        shadowColor: '#f1f5f9',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    placeholder: {
        fontSize: 12,
        color: '#94a3b8', // slate-400
    },
    selectedText: {
        fontSize: 14,
        color: '#0f172a', // slate-900
    },
});