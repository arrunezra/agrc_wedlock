import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Heading, Text, VStack, HStack, Box,
    FormControl, FormControlLabel, FormControlLabelText,
    Button, ButtonText, Spinner,
    FormControlErrorText,
    FormControlError,
    InputField,
    Input,
    Textarea,
    TextareaInput,
} from '@/src/components/common/GluestackUI';
import { Users, UserRound, UserSquare, Users2, MapPin, Briefcase, Globe, Landmark, ChevronLeftIcon, CloseIcon, Icon } from '@/src/components/common/IconUI';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import _, { findIndex, } from 'lodash';
import profileService from '@/src/services/profileService';
import { AnimateError } from '../../common/AnimateError';

export const FamilyDetailsModal = ({ isOpen, onClose, lookups, content, onRefresh, showToast, user }: any) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>(_.cloneDeep(content));
    const [validationTriggered, setValidationTriggered] = useState(false)
    const [isSaving, setIsSaving] = useState(false);

    const [financialDetails, setFinancialDetails] = useState<any>([]);
    const updateForm = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        setValidationTriggered(true);
        let isvalid = !validateForm(1)
        if (isvalid) {
            // You can add a Toast message here if you use them
            showToast("Error", "Validation!", "error");

            return;
        }
        setValidationTriggered(false);
        setCurrentStep(2);

    }
    const handleBack = () => setCurrentStep(1);
    const validateForm = (step: number) => {
        // 1. Basic Field Validation
        var requiredFields: any = [];
        if (step == 1) {
            requiredFields = [
                'father_occupation',
                'mother_occupation',
                "brother_count",
                'sister_count'
            ]
        } else {
            requiredFields = [
                'country',
                'state',
                'city',
                'family_type',
                'address'
            ]
        }
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                return false;
            }
        }


        return true;
    };
    const handleSave = async () => {
        setValidationTriggered(true);

        let isvalid = !validateForm(2)
        if (isvalid) {
            showToast("Error", "Validation!", "error");
            console.log("Validation failed");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                id: user?.profile_id,
                action: 'familydetails',
                country: formData.country,
                state: formData.state,
                city: formData.city,
                family_type: formData.family_type,
                father_occupation: formData.father_occupation,
                mother_occupation: formData.mother_occupation,
                brother_count: formData.brother_count,
                sister_count: formData.sister_count,
                address: formData.address


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
        <Modal isOpen={isOpen} onClose={() => { onClose(); setCurrentStep(1); }} size="full">
            <ModalBackdrop />
            <ModalContent className="bg-white flex-1">

                {/* FIX: Aligned Header with proper spacing */}
                <ModalHeader className="px-6 pt-10 pb-0 flex-row items-center justify-between border-0">
                    <Box className="w-10">
                        {currentStep === 2 && (
                            <Button variant="link" onPress={handleBack} className="p-0 justify-start">
                                <Icon as={ChevronLeftIcon} size="xl" className="text-typography-900" />
                            </Button>
                        )}
                    </Box>

                    <ModalCloseButton className="h-10 w-10 rounded-full bg-slate-100 items-center justify-center">
                        <Icon as={CloseIcon} size="md" className="text-typography-900" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="flex-1 p-0">
                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        {currentStep === 1 ? (
                            <VStack space="xl">
                                <VStack className="items-center mb-6">
                                    <Box className="w-16 h-16 rounded-[22px] bg-blue-50 items-center justify-center border-b-4 border-blue-200">
                                        <Icon as={Users} size='lg' className="text-blue-600" />
                                    </Box>
                                    <Heading size="xl" className="mt-4">Family Members</Heading>
                                    <Text size="xs" className="text-center text-slate-500">Step 1 of 2: Parents & Siblings</Text>
                                </VStack>
                                <FormControl isInvalid={validationTriggered && !formData.father_occupation}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText className="font-bold">Father's Details</FormControlLabelText>
                                    </FormControlLabel>

                                    <FuturisticDropdown
                                        data={lookups?.occupation}
                                        value={formData.father_occupation}
                                        onChange={(item: any) => updateForm('father_occupation', item.value)}
                                        placeholder="Select father details "
                                        icon={{ icon: UserSquare, color: 'text-blue-500' }}
                                        search={false}
                                        isInvalid={validationTriggered && !formData.father_occupation}
                                    />
                                    <AnimateError isVisible={true}>
                                        {"Select mother's father_occupation"}
                                    </AnimateError>

                                </FormControl>
                                <FormControl isInvalid={validationTriggered && !formData.mother_occupation}>
                                    <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Mother's Details</FormControlLabelText></FormControlLabel>
                                    <FuturisticDropdown
                                        data={lookups?.occupation}
                                        value={formData.mother_occupation}
                                        onChange={(item: any) => updateForm('mother_occupation', item.value)}
                                        placeholder="Select mother details "
                                        icon={{ icon: UserRound, color: 'text-blue-500' }}
                                        search={false}
                                        isInvalid={validationTriggered && !formData.mother_occupation}
                                    />
                                    <AnimateError isVisible={validationTriggered && (!formData.mother_occupation)}>
                                        {"Select mother's occupation"}
                                    </AnimateError>
                                </FormControl>



                                {/* FIX: Sibling Grid with overflow/width handling */}
                                <HStack space="md" className="w-full">

                                    <VStack className="flex-1">
                                        <FormControl isInvalid={validationTriggered && !String(formData?.brother_count)}>
                                            <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Brother(s)</FormControlLabelText></FormControlLabel>
                                            <FuturisticDropdown
                                                data={lookups?.siblings}
                                                value={String(formData.brother_count)}
                                                onChange={(item: any) => updateForm('brother_count', item.value)}
                                                placeholder="Select"
                                                icon={{ icon: Users, color: 'text-blue-500' }}
                                                search={false}
                                                isInvalid={validationTriggered && !String(!formData.brother_count)}
                                            />
                                            <AnimateError isVisible={validationTriggered && (!String(formData.mother_occupation))}>
                                                {"Brother(s) count"}
                                            </AnimateError>
                                        </FormControl>

                                    </VStack>

                                    <VStack className="flex-1">
                                        <FormControl isInvalid={validationTriggered && !formData.sister_count}>
                                            <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Sister(s)</FormControlLabelText></FormControlLabel>
                                            <FuturisticDropdown
                                                data={lookups?.siblings}
                                                value={String(formData.sister_count)}
                                                onChange={(item: any) => updateForm('sister_count', item.value)}
                                                placeholder="Select"
                                                icon={{ icon: Users2, color: 'text-blue-500' }}
                                                search={false}
                                                isInvalid={validationTriggered && !formData.sister_count}
                                            />
                                            <AnimateError isVisible={validationTriggered && (!formData.sister_count)}>
                                                {"Sister(s) count"}
                                            </AnimateError>
                                        </FormControl>

                                    </VStack>

                                </HStack>
                            </VStack>
                        ) : (
                            <VStack space="xl">
                                <VStack className="items-center mb-6">
                                    <Box className="w-16 h-16 rounded-[22px] bg-blue-50 items-center justify-center border-b-4 border-blue-200">
                                        <Icon as={MapPin} size='lg' className="text-blue-600" />
                                    </Box>
                                    <Heading size="xl" className="mt-4">Location & Status</Heading>
                                    <Text size="xs" className="text-center text-slate-500">Step 2 of 2: Family Background</Text>
                                </VStack>

                                <VStack space="md">
                                    <FormControl isInvalid={validationTriggered && !formData.country}>
                                        <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Country</FormControlLabelText></FormControlLabel>
                                        <FuturisticDropdown
                                            data={lookups?.country}
                                            value={formData.country}
                                            onChange={(item: any) => updateForm('country', item.value)}
                                            placeholder="Select"
                                            icon={{ icon: Globe, color: 'text-blue-500' }}
                                            search={false}
                                            isInvalid={validationTriggered && !formData.country}
                                        />
                                        <AnimateError isVisible={validationTriggered && (!formData.country)}>
                                            {"Country is required"}
                                        </AnimateError>
                                    </FormControl>
                                    <FormControl isInvalid={validationTriggered && !formData.state}>
                                        <FuturisticDropdown
                                            data={lookups?.state}
                                            value={formData.state}
                                            onChange={(item: any) => updateForm('state', item.value)}
                                            placeholder="Select"
                                            icon={{ icon: MapPin, color: 'text-blue-500' }}
                                            search={false}
                                            isInvalid={validationTriggered && !formData.state}
                                        />
                                        <AnimateError isVisible={validationTriggered && (!formData.state)}>
                                            {"State is required"}
                                        </AnimateError>
                                    </FormControl>
                                    <FormControl isInvalid={validationTriggered && !formData.city}>
                                        <FuturisticDropdown
                                            data={lookups?.city}
                                            value={formData.city}
                                            onChange={(item: any) => updateForm('city', item.value)}
                                            placeholder="Select"
                                            icon={{ icon: Landmark, color: 'text-blue-500' }}
                                            search={false}
                                            isInvalid={validationTriggered && !formData.city}
                                        />
                                        <AnimateError isVisible={validationTriggered && (!formData.city)}>
                                            {"City is required"}
                                        </AnimateError>
                                    </FormControl>
                                    <FormControl isInvalid={validationTriggered && !formData.address}>
                                        <Textarea
                                            size="lg"
                                            // REMOVED transition-all to prevent Reanimated interference
                                            className="h-32 p-4 rounded-3xl border-2 bg-white border-outline-100"
                                        >
                                            <TextareaInput
                                                placeholder="Address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                value={formData.address}
                                                onChangeText={(text) => updateForm('address', text)}
                                                maxLength={200}
                                                multiline={true}
                                                textAlignVertical="top"
                                                className="text-lg leading-6 pr-8 text-typography-800"
                                            />
                                        </Textarea>

                                        <AnimateError isVisible={validationTriggered && !formData.address}>
                                            {"Address is required"}
                                        </AnimateError>
                                    </FormControl>


                                </VStack>

                                <FormControl isInvalid={validationTriggered && !formData.family_type}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText className="font-bold">Family Financial Status</FormControlLabelText></FormControlLabel>
                                    <FuturisticDropdown
                                        data={lookups?.financial_status}
                                        value={formData.family_type}
                                        onChange={(item: any) => {
                                            updateForm('family_type', item.value)
                                            var inDex = _.findIndex(lookups?.financial_details, (finds: any) => { return finds.value === item.value });

                                            if (inDex != -1) {
                                                setFinancialDetails(lookups?.financial_details[inDex].description?.split(','))
                                            }
                                        }}
                                        placeholder="Select"
                                        icon={{ icon: Briefcase, color: 'text-blue-500' }}
                                        search={false}
                                        isInvalid={validationTriggered && !formData.family_type}
                                    />

                                    <AnimateError isVisible={validationTriggered && (!formData.family_type)}>
                                        {"Family financial status is required"}
                                    </AnimateError>
                                </FormControl>

                                {formData.family_type && (
                                    <Box className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <Text size="sm" className="font-bold text-blue-600 mb-2">{formData.family_type} Status Details:</Text>
                                        {financialDetails?.map((note: any, i: number) => (
                                            <HStack key={i} space="xs" className="mb-1 items-start">
                                                <Text className="text-blue-500">•</Text>
                                                <Text size="xs" className="text-slate-600 flex-1">{note}</Text>
                                            </HStack>
                                        ))}
                                    </Box>
                                )}
                            </VStack>
                        )}
                        <Box className="h-20" />
                    </ScrollView>
                </ModalBody>

                <ModalFooter className="p-6 border-t border-outline-100">
                    {currentStep === 1 ? (
                        <Button onPress={handleNext} className="w-full rounded-2xl h-14 bg-blue-600 shadow-lg shadow-blue-200">
                            <ButtonText className="text-white font-bold">Continue to Step 2</ButtonText>
                        </Button>
                    ) : (
                        <HStack className="w-full gap-3">
                            <Button variant="outline" action="secondary" onPress={handleBack} className="flex-1 rounded-2xl h-14 border-outline-300">
                                <ButtonText className="text-typography-600 font-bold">Back</ButtonText>
                            </Button>
                            <Button onPress={handleSave} isDisabled={isSaving} className="flex-1 rounded-2xl h-14 bg-blue-600 shadow-lg shadow-blue-200">
                                {isSaving ? <Spinner color="white" /> : <ButtonText className="text-white font-bold">Update Details</ButtonText>}
                            </Button>
                        </HStack>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: '100%' // Ensures dropdown fills parent VStack
    },
    placeholderStyle: { color: '#9CA3AF', fontSize: 14 },
    selectedTextStyle: { color: '#111827', fontSize: 14, fontWeight: '500' },
});