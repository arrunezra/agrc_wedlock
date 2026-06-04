import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import { ScrollView, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Heading, VStack, HStack,
    Text, Input, InputField, Button, ButtonText, Spinner,
    FormControl, FormControlLabel, FormControlLabelText,
    Box,
    Select,
    SelectTrigger,
    SelectInput,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem
} from '@/src/components/GluestackUI';
import api from '@/src/api/api';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Accessibility, Briefcase, Calendar, Droplets, Heart, Info, Ruler, Trash2, User, Users, X } from '@/src/components/IconUI';
import { InputIcon, InputSlot } from '@/components/ui/input';
import { Dropdown } from 'react-native-element-dropdown';
import { BLOOD_GROUPS, HEIGHT_DATA, MARITAL_STATUS } from '@/src/utils/utils';
import { LookupContext } from '@/src/context/LookupContext';
import _ from 'lodash';
import profileService from '@/src/services/profileService';
import { useAppToast } from '@/src/context/ToastContext';
import FuturisticDropdown from '@/src/components/FuturisticDropdown';
import { AnimateError } from '@/src/components/AnimateError';


const EditBasicsModalScreen = ({ isOpen, onClose, user, content, lookups, onRefresh, showToast }: any) => {
    const [isSaving, setIsSaving] = useState(false);

    const [validationTriggered, setValidationTriggered] = useState(false);


    // console.log("content", content);
    const [formData, setFormData] = useState<any>([]);

    const lastNameRef = useRef<any>(null);
    const dayRef = useRef<any>(null);
    const monthRef = useRef<any>(null);
    const yearRef = useRef<any>(null);
    const updateForm = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
        if (validationTriggered) setValidationTriggered(false)

    };
    useEffect(() => {
        if (content?.dob) {
            const [year, month, day] = content?.dob?.split('-');
            const yyyy = year; // 1996
            const mm = String(month).padStart(2, '0'); // "06"
            const dd = String(day).padStart(2, '0'); // "12" 
            if (typeof content?.kids_details === 'string') {
                content.kids_details = JSON.parse(content.kids_details);
            }
            content.height = String(content.height);

            content.dobDay = dd;
            content.dobMonth = mm;
            content.dobYear = yyyy;
            setFormData(_.cloneDeep(content || []))
            //console.log('content', content)

            // updateForm('dobDay', dd)
            // updateForm('dobMonth', mm) 
            // updateForm('dobYear', yyyy)
        }


    }, [])

    // Logic to handle changing the number of children
    const handleChildrenCountChange = (val: string) => {
        const count = parseInt(val) || 0;
        updateForm('children_count', val);

        const currentKids = [...(formData.kids_details || [])];

        if (count > currentKids.length) {
            // Create an array of the NEW items only
            const additionalCount = count - currentKids.length;

            // Use Array.from or a loop to ensure UNIQUE objects
            const additional = Array.from({ length: additionalCount }, () => ({
                age: '',
                gender: '',
                livingTogether: 'Yes'
            }));

            updateForm('kids_details', [...currentKids, ...additional]);
        } else {
            // Trim the array if count decreased
            updateForm('kids_details', currentKids.slice(0, count));
        }
    };
    const updateKidDetail = (index: number, field: string, value: string) => {
        const updatedKids = [...(formData.kids_details || [])];
        updatedKids[index] = { ...updatedKids[index], [field]: value };
        updateForm('kids_details', updatedKids);
    };
    const removeChild = (indexToRemove: number) => {
        const updatedKids = formData.kids_details.filter((_: any, index: number) => index !== indexToRemove);

        setFormData((prev: any) => ({
            ...prev,
            kids_details: updatedKids,
            // Automatically update the count to match the new array length
            children_count: updatedKids.length.toString()
        }));
    };
    // Fix: Ensure this doesn't accidentally render as a raw string inside the JSX


    const isDateValid = () => {
        const day = parseInt(formData.dobDay || '0');
        const month = parseInt(formData.dobMonth || '0');
        const year = formData.dobYear || '0';

        if (!day || !month || year.length !== 4) return false;

        const isDayValid = day >= 1 && day <= 31;
        const isMonthValid = month >= 1 && month <= 12;

        return isDayValid && isMonthValid;
    };
    const getAge = () => {
        const day = parseInt(formData.dobDay);
        const month = parseInt(formData.dobMonth);
        const year = parseInt(formData.dobYear);
        if (!isDateValid()) return 0;
        const today = new Date(); // Current date in 2026
        const birthDate = new Date(year, month - 1, day);

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        // Adjust if birthday hasn't happened yet this year
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    const getValidYear = () => {
        const year = parseInt(formData.dobYear);
        const currentYear = new Date().getFullYear();
        const eightyYearsAgo = currentYear - 80;
        return year >= eightyYearsAgo && year <= currentYear;
    }
    //use memo
    const dateErrorMessage = useMemo(() => {
        if (!isDateValid()) return "Enter a valid DD (01-31), MM (01-12), and YYYY";
        if (!getValidYear()) return "Enter a valid year";
        if (getAge() < 18) return "Under age! You must be at least 18 years old.";
        return "";
    }, [formData.dobDay, formData.dobMonth, formData.dobYear]); // Recalculate only when date changes
    const validateForm = () => {
        // 1. Basic Field Validation
        const requiredFields = [
            'first_name',
            'last_name',
            'gender',
            'marital_status',
            'dobDay',
            'dobMonth',
            'dobYear',
            'height',
            'blood_group'
        ];

        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                return false;
            }
        }

        // 2. Conditional Kids Validation
        if (formData.marital_status !== 'NM' && formData.has_children === 'Yes') {
            if (!formData?.kids_details || formData?.kids_details?.length === 0) return false;
            // return formData.kids_details.every((kid: any) =>
            //     kid.age && kid.gender && kid.livingTogether
            // );
        }

        return !dateErrorMessage;
    };
    const handleSave = async () => {
        setValidationTriggered(true);
        let isvalid = !validateForm()
        if (isvalid) {
            // You can add a Toast message here if you use them
            console.log("Validation failed");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                id: user?.profile_id,
                action: 'basicdetails',
                first_name: formData.first_name,
                last_name: formData.last_name,
                // Format date if needed, e.g., "1996-06-12"
                dob: `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`,
                gender: formData.gender,
                marital_status: formData.marital_status,
                height: formData.height,
                weight: formData.weight || 0,
                blood_group: formData.blood_group,
                has_children: formData.has_children,
                children_count: formData.has_children === 'Yes' ? formData.children_count == "0" ? 1 : formData.children_count : 0,
                // We send the actual array; Axios handles the JSON conversion
                kids_details: formData.kids_details,
                disability: formData.disability
            };
            console.log('payload', payload)
            const res = await profileService.updateEditProfile(payload);
            if (res.success) {
                showToast("Basic Details", "Profile updated successfully!", "success");
                // Important: If you save this locally, you might need to JSON.parse kids_details
                if (onRefresh) await onRefresh();
                onClose();
            } else {
                showToast("Update Failed", res?.message || "Check your details", "error");
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (

        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalBackdrop />

            <ModalContent className="bg-white flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    // For full-screen modals, sometimes you need keyboardVerticalOffset
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <ModalHeader className="px-6 pt-10 pb-0 justify-end border-0">
                        <ModalCloseButton className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <Icon as={X} size="md" />
                        </ModalCloseButton>
                    </ModalHeader>

                    <ModalBody className="flex-1 p-0">
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 60 }}
                            className="px-6 py-4"
                            showsVerticalScrollIndicator={false}
                        >
                            <VStack space="xl">
                                {/* 1. 2026 Futuristic Icon Section */}
                                <VStack className="items-center mb-8">
                                    <Box className="relative w-20 h-20 items-center justify-center">
                                        <Box className="absolute w-16 h-16 rounded-full bg-blue-500 blur-2xl opacity-20" />
                                        <Box
                                            className="w-16 h-16 rounded-[22px] items-center justify-center bg-blue-50 border-b-4 border-blue-200 shadow-sm"
                                            style={{ transform: [{ rotate: '-6deg' }] }}
                                        >
                                            <Icon as={Users} size="xl" className="text-blue-600" style={{ transform: [{ rotate: '6deg' }] }} />
                                        </Box>
                                    </Box>
                                    <Heading size="xl" className="mt-4 tracking-tight text-center text-typography-900">
                                        Edit Basic Details
                                    </Heading>
                                    <Text size="sm" className="text-typography-500 text-center px-4">Update your core profile information</Text>
                                </VStack>

                                <VStack className="gap-6">

                                    {/* 2. NAME SECTION (Split into First and Last) */}
                                    <HStack space="md" className="w-full">
                                        <FormControl isInvalid={validationTriggered && !formData.first_name} className="flex-1">
                                            <FormControlLabel className="mb-2">
                                                <FormControlLabelText size="sm" className="font-bold">First Name</FormControlLabelText>
                                            </FormControlLabel>
                                            <Input size="lg" className="h-16 rounded-2xl border-outline-200 bg-white shadow-sm shadow-slate-100">
                                                <InputSlot className="pl-4"><InputIcon as={User} className="text-typography-400" /></InputSlot>
                                                <InputField
                                                    placeholder="First Name"
                                                    value={formData.first_name}
                                                    onChangeText={(v) => updateForm('first_name', v)}
                                                />
                                            </Input>
                                            <AnimateError isVisible={validationTriggered && (!formData.first_name)}>
                                                {"First name is required"}
                                            </AnimateError>
                                        </FormControl>

                                        <FormControl isInvalid={validationTriggered && !formData.last_name} className="flex-1">
                                            <FormControlLabel className="mb-2">
                                                <FormControlLabelText size="sm" className="font-bold">Last Name</FormControlLabelText>
                                            </FormControlLabel>
                                            <Input size="lg" className="h-16 rounded-2xl border-outline-200 bg-white shadow-sm shadow-slate-100">
                                                <InputField
                                                    placeholder="Last Name"
                                                    value={formData.last_name}
                                                    onChangeText={(v) => updateForm('last_name', v)}
                                                />
                                            </Input>
                                            <AnimateError isVisible={validationTriggered && (!formData.last_name)}>
                                                {"Last name is required"}
                                            </AnimateError>
                                        </FormControl>
                                    </HStack>

                                    {/* 3. Gender Selection */}
                                    <FormControl isInvalid={validationTriggered && !formData.gender}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText size="sm" className="font-bold">Gender</FormControlLabelText>
                                        </FormControlLabel>
                                        <HStack className="gap-3">
                                            {['Male', 'Female'].map((option, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => updateForm('gender', option)}
                                                    className={`flex-1 h-14 rounded-2xl border-2 items-center justify-center ${formData?.gender === option ? 'border-blue-600 bg-blue-50/50' : 'border-outline-100 bg-slate-50/50'}`}
                                                >
                                                    <Text className={formData?.gender === option ? 'text-blue-700 font-bold' : 'text-typography-500'}>
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </HStack>
                                        <AnimateError isVisible={validationTriggered && (!formData?.gender)}>
                                            {"Gender is required"}
                                        </AnimateError>
                                    </FormControl>

                                    {/* 5. Date of Birth Section */}
                                    <FormControl isInvalid={validationTriggered && (!!dateErrorMessage)}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText size="sm" className="font-bold">Date of Birth</FormControlLabelText>
                                        </FormControlLabel>
                                        <HStack className="gap-2">
                                            {[
                                                { key: 'dobDay', placeholder: 'DD', max: 2 },
                                                { key: 'dobMonth', placeholder: 'MM', max: 2 },
                                                { key: 'dobYear', placeholder: 'YYYY', flex: 1.5, max: 4 }
                                            ].map((item) => (
                                                <Input
                                                    key={item.key}
                                                    className="h-14 rounded-2xl border-outline-200 bg-white shadow-sm shadow-slate-100"
                                                    style={{ flex: item.flex || 1 }}
                                                >
                                                    <InputField
                                                        placeholder={item.placeholder}
                                                        keyboardType="numeric"
                                                        value={formData[item.key]}
                                                        onChangeText={(v) => updateForm(item.key, v)}
                                                        maxLength={item.max}
                                                        className="text-center"
                                                    />
                                                </Input>

                                            ))}

                                        </HStack>
                                        <AnimateError isVisible={validationTriggered && (!!dateErrorMessage)}>
                                            {dateErrorMessage}
                                        </AnimateError>
                                    </FormControl>

                                    {/* 6. Physical Attributes Section */}
                                    <HStack space="md">
                                        <FormControl isInvalid={validationTriggered && !formData.height} className="flex-1">
                                            <FormControlLabel><FormControlLabelText size="sm" className="font-bold">Height</FormControlLabelText></FormControlLabel>

                                            <FuturisticDropdown
                                                data={HEIGHT_DATA}
                                                value={formData.height}
                                                onChange={(item: any) => updateForm('height', item.value)}
                                                placeholder="Select "
                                                icon={{ icon: Ruler, color: 'text-cyan-500' }}
                                                search={false}
                                                isInvalid={validationTriggered && !formData.height}
                                            />
                                        </FormControl>

                                        <FormControl isInvalid={validationTriggered && !formData.blood_group} className="flex-1">
                                            <FormControlLabel><FormControlLabelText size="sm" className="font-bold">Blood Group</FormControlLabelText></FormControlLabel>

                                            <FuturisticDropdown
                                                data={BLOOD_GROUPS}
                                                value={formData.blood_group}
                                                onChange={(item: any) => updateForm('blood_group', item.value)}

                                                placeholder="Select"
                                                icon={{ icon: Droplets, color: 'text-red-500' }}
                                                search={false}
                                                isInvalid={validationTriggered && !formData.blood_group}
                                            />

                                            <AnimateError isVisible={validationTriggered && (!formData.blood_group)}>
                                                {"Blood group is required"}
                                            </AnimateError>
                                        </FormControl>
                                    </HStack>
                                    {/* 7. Disability Status Section */}
                                    <FormControl isInvalid={validationTriggered && !formData.disability}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText size="sm" className="font-bold">Disability / Specially Abled</FormControlLabelText>
                                        </FormControlLabel>
                                        <HStack className="gap-3">
                                            {['None', 'Yes'].map((option, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => updateForm('disability', option)}
                                                    className={`flex-1 h-14 rounded-2xl border-2 items-center justify-center ${formData?.disability === option
                                                        ? 'border-blue-600 bg-blue-50/50'
                                                        : 'border-outline-100 bg-slate-50/50'
                                                        }`}
                                                >
                                                    <HStack space="xs" className="items-center">
                                                        {option === 'Yes' && (
                                                            <Icon as={Accessibility} size="sm" className={formData?.disability === option ? 'text-blue-600' : 'text-slate-400'} />
                                                        )}
                                                        <Text className={formData?.disability === option ? 'text-blue-700 font-bold' : 'text-typography-500'}>
                                                            {option}
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            ))}
                                        </HStack>
                                    </FormControl>
                                    {/* 4. Marital Status Dropdown */}
                                    <FormControl isInvalid={validationTriggered && !formData.marital_status}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText size="sm" className="font-bold">Marital Status</FormControlLabelText>
                                        </FormControlLabel>
                                        <FuturisticDropdown
                                            data={lookups?.marital_status}
                                            value={formData.marital_status}
                                            onChange={(item: any) => {
                                                console.log('marital_status', item.value)
                                                updateForm('marital_status', item.value);

                                                if (item.value === 'NM') {
                                                    updateForm('has_children', 'No');
                                                    updateForm('kids_details', []);
                                                }

                                            }}
                                            placeholder="Select"
                                            icon={{ icon: Heart, color: 'text-rose-500' }}
                                            search={false}
                                            isInvalid={validationTriggered && !formData.marital_status}
                                        />
                                        <AnimateError isVisible={validationTriggered && (!formData.marital_status)}>
                                            {"Marital status is required"}
                                        </AnimateError>
                                    </FormControl>

                                    {/* 7. Kids Section (Conditional) */}
                                    {formData?.maritalStatus !== 'NM' && formData?.maritalStatus !== '' && (
                                        <VStack space="md" className="bg-blue-50/50 p-5 rounded-[28px] border border-blue-100/50 mt-2">
                                            <HStack className="justify-between items-center">
                                                <Heading size="xs" numberOfLines={1} className="text-blue-800 uppercase tracking-widest">Children</Heading>
                                                <HStack space="md">
                                                    {['No', 'Yes'].map((opt) => (
                                                        <TouchableOpacity
                                                            key={opt}
                                                            onPress={() => {
                                                                if (opt === "No") {
                                                                    updateForm('kids_details', [])
                                                                    updateForm('children_count', '')
                                                                } else {
                                                                    updateForm('children_count', 1);
                                                                    handleChildrenCountChange('1')
                                                                }
                                                                updateForm('has_children', opt)
                                                            }}
                                                            className={`px-4 py-1.5 rounded-full ${formData.has_children === opt ? 'bg-blue-600' : 'bg-white border border-blue-100'}`}
                                                        >
                                                            <Text size="xs" className={formData.has_children === opt ? 'text-white font-bold' : 'text-blue-600'}>{opt}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </HStack>
                                            </HStack>

                                            {formData.has_children === 'Yes' && (
                                                <VStack space="md" className="mt-3">
                                                    <FormControl isInvalid={validationTriggered && !formData.children_count} className="flex-1">

                                                        <Input className="h-12 bg-white rounded-xl border-blue-100">
                                                            <InputField
                                                                placeholder="Number of children"
                                                                keyboardType="numeric"
                                                                value={formData?.children_count === 0 ? "1" : formData?.children_count.toString()} // Updated to children_count from your new code
                                                                onChangeText={handleChildrenCountChange}
                                                            />
                                                        </Input>
                                                        <AnimateError isVisible={validationTriggered && (!formData?.children_count)}>
                                                            {"Children count is required"}
                                                        </AnimateError>
                                                    </FormControl>
                                                    {(formData?.kids_details ?? []).map((kid: any, index: number) => {
                                                        if (!kid) return null; // Safety check for null items
                                                        return (
                                                            <Box key={index} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-100 mb-2">
                                                                {/* Header with Child Number and Trash Icon */}
                                                                <HStack className="justify-between items-center mb-4">
                                                                    <HStack space="xs" className="items-center">
                                                                        <Box className="w-6 h-6 rounded-full bg-cyan-100 items-center justify-center">
                                                                            <Text className="text-[10px] font-bold text-cyan-700">{index + 1}</Text>
                                                                        </Box>
                                                                        <Text className="font-bold text-slate-700">Child Details</Text>
                                                                    </HStack>
                                                                    <TouchableOpacity onPress={() => removeChild(index)} className="p-2 bg-rose-50 rounded-full">
                                                                        <Icon as={Trash2} size='md' className="text-rose-500" />
                                                                    </TouchableOpacity>
                                                                </HStack>

                                                                {/* Input Row: Age and Gender */}
                                                                <HStack className="gap-3">
                                                                    <FormControl isInvalid={validationTriggered && !formData.blood_group} className="flex-1">
                                                                        <Input className="flex-1 h-12 rounded-xl border-slate-200">
                                                                            <InputSlot className="pl-3">
                                                                                <Icon as={User} size='md' className="text-slate-400" />
                                                                            </InputSlot>
                                                                            <InputField
                                                                                placeholder="Age"
                                                                                keyboardType="numeric"
                                                                                value={kid.age}
                                                                                onChangeText={(v) => updateKidDetail(index, 'age', v)}
                                                                            />
                                                                        </Input>
                                                                    </FormControl>
                                                                    <Box className="flex-1">
                                                                        <Select onValueChange={(v) => updateKidDetail(index, 'gender', v)} selectedValue={kid.gender}>
                                                                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                                                                <SelectInput placeholder="Gender" />
                                                                            </SelectTrigger>
                                                                            <SelectPortal>
                                                                                <SelectBackdrop />
                                                                                <SelectContent>
                                                                                    <SelectItem label="Boy" value="Boy" />
                                                                                    <SelectItem label="Girl" value="Girl" />
                                                                                </SelectContent>
                                                                            </SelectPortal>
                                                                        </Select>
                                                                    </Box>
                                                                </HStack>

                                                                {/* Living Together Section (The missing piece) */}
                                                                <HStack className="items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                                                    <Text className="text-xs font-semibold text-slate-500">Living with you?</Text>
                                                                    <HStack className="gap-4">
                                                                        {['Yes', 'No'].map(l => (
                                                                            <TouchableOpacity
                                                                                key={l}
                                                                                onPress={() => updateKidDetail(index, 'livingTogether', l)}
                                                                                className="flex-row items-center space-x-2 gap-2"
                                                                            >
                                                                                <Box className={`w-5 h-5 rounded-full border-2 items-center justify-center ${kid.livingTogether === l ? 'border-cyan-500' : 'border-slate-300'}`}>
                                                                                    {kid.livingTogether === l && <Box className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                                                                                </Box>
                                                                                <Text className="text-xs font-bold text-slate-600">{l}</Text>
                                                                            </TouchableOpacity>
                                                                        ))}
                                                                    </HStack>
                                                                </HStack>
                                                            </Box>
                                                        );
                                                    })}
                                                </VStack>
                                            )}
                                        </VStack>
                                    )}
                                </VStack>
                            </VStack>
                        </ScrollView>
                    </ModalBody>

                    <ModalFooter className="p-6">
                        <Button onPress={handleSave} isDisabled={isSaving} className="w-full h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
                            <ButtonText className="font-bold text-white">Update Basics</ButtonText>
                        </Button>
                    </ModalFooter>
                </KeyboardAvoidingView>
            </ModalContent>

        </Modal>
    );
};
const styles = {
    dropdown: {
        height: 60,
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#f1f5f9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    }
};
export default EditBasicsModalScreen;
