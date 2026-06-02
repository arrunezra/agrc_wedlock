import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Heading, Text, VStack, HStack, Box,
    FormControl, FormControlLabel, FormControlLabelText,
    Button, ButtonText, Spinner, Input, InputField
} from '@/src/components/common/GluestackUI';
import { Dropdown } from 'react-native-element-dropdown';
import { GraduationCap, School, Briefcase, Building2, Banknote, UserCog, Icon, ChevronLeftIcon, CloseIcon } from '@/src/components/common/IconUI';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import { AnimateError } from '../../common/AnimateError';
import profileService from '@/src/services/profileService';
import _ from 'lodash';

export const EducationDetailsModal = ({ isOpen, onClose, formData, updateForm, lookups, onRefresh, showToast, qualification, user }: any) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [validationTriggered, setValidationTriggered] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                'qualification',
                'college'
            ]
        } else {
            requiredFields = [
                'work_with',
                'income',
            ]

            if (formData?.work_with !== '' && formData?.work_with === 'OTH') requiredFields.push('others');
            if (formData?.work_with !== '' && formData.work_with !== 'NWK') {
                requiredFields.push('working_as');
                requiredFields.push('company_name');

            }
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
                action: 'education',
                qualification: formData.qualification,
                college: formData.college,
                work_with: formData.work_with,
                working_as: formData.working_as,
                company_name: formData.company_name,
                others: formData.others,
                income: formData.income
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    // For full-screen modals, sometimes you need keyboardVerticalOffset
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
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
                                        <Box className="w-16 h-16 rounded-[22px] bg-violet-50 items-center justify-center border-b-4 border-violet-200">
                                            <Icon as={GraduationCap} size='lg' className="text-violet-600" />
                                        </Box>
                                        <Heading size="xl" className="mt-4">Education</Heading>
                                        <Text size="xs" className="text-center text-slate-500">Step 1 of 2: Academic Background</Text>
                                    </VStack>

                                    <FormControl isInvalid={validationTriggered && !formData.qualification}>
                                        <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Highest Qualification</FormControlLabelText></FormControlLabel>
                                        <FuturisticDropdown
                                            data={qualification || []}
                                            value={formData.qualification}
                                            onChange={(item: any) => updateForm('qualification', item.value)}
                                            placeholder="Select "
                                            icon={{ icon: GraduationCap, color: 'text-violet-500' }}
                                            search={true}
                                            isInvalid={validationTriggered && !formData.qualification}
                                        />

                                        <AnimateError isVisible={validationTriggered && (!formData?.qualification)}>
                                            {"Qualification is required"}
                                        </AnimateError>
                                    </FormControl>

                                    <FormControl isInvalid={validationTriggered && !formData.college}>
                                        <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">College(s) Attended</FormControlLabelText></FormControlLabel>
                                        <Input style={styles.inputContainer}>
                                            <Box className="pl-4 justify-center"><Icon as={School} size="sm" className="text-violet-500" /></Box>
                                            <InputField
                                                placeholder="Enter college name"
                                                value={formData.college}
                                                onChangeText={(text) => updateForm('college', text)}
                                            />
                                        </Input>
                                        <AnimateError isVisible={validationTriggered && (!formData?.college)}>
                                            {"College name is required"}
                                        </AnimateError>
                                    </FormControl>
                                </VStack>
                            ) : (
                                <VStack space="xl">
                                    <VStack className="items-center mb-6">
                                        <Box className="w-16 h-16 rounded-[22px] bg-violet-50 items-center justify-center border-b-4 border-violet-200">
                                            <Icon as={Briefcase} size='lg' className="text-violet-600" />
                                        </Box>
                                        <Heading size="xl" className="mt-4">Career Details</Heading>
                                        <Text size="xs" className="text-center text-slate-500">Step 2 of 2: Professional Info</Text>
                                    </VStack>
                                    <FormControl isInvalid={validationTriggered && !formData.income}>
                                        <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Annual Income</FormControlLabelText></FormControlLabel>
                                        <FuturisticDropdown
                                            data={_.orderBy(lookups?.income_range, ['value'], ['asc']) || []}
                                            value={formData?.income}
                                            onChange={(item: any) => {
                                                updateForm('income', item.value)
                                            }
                                            }
                                            placeholder="Select Sector"
                                            icon={{ icon: Banknote, color: 'text-violet-500' }}
                                            search={false}
                                            isInvalid={validationTriggered && !formData.income}
                                        />
                                        <AnimateError isVisible={validationTriggered && (!formData?.income)}>
                                            {"Income is required"}
                                        </AnimateError>

                                    </FormControl>

                                    <FormControl isInvalid={validationTriggered && !formData.work_with}>
                                        <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Working With</FormControlLabelText></FormControlLabel>
                                        <FuturisticDropdown
                                            data={lookups?.employment_sector || []}
                                            value={formData?.work_with}
                                            onChange={(item: any) => {
                                                updateForm('work_with', item.value)
                                                if (item.value === 'NWK') {
                                                    updateForm('working_as', '')
                                                    updateForm('company_name', '')
                                                    updateForm('income', '')
                                                }
                                            }
                                            }
                                            placeholder="Select Sector"
                                            icon={{ icon: Building2, color: 'text-violet-500' }}
                                            search={false}
                                            isInvalid={validationTriggered && !formData.work_with}
                                        />
                                        <AnimateError isVisible={validationTriggered && (!formData?.work_with)}>
                                            {"working name is required"}
                                        </AnimateError>
                                    </FormControl>
                                    {formData?.work_with !== '' && formData?.work_with === 'OTH' && <FormControl isInvalid={validationTriggered && formData?.work_with === 'OTH' && !formData.others}>
                                        <Input style={styles.inputContainer}>
                                            <Box className="pl-4 justify-center"><Icon as={Briefcase} size="sm" className="text-violet-500" /></Box>
                                            <InputField placeholder="Spicetify the others" value={formData.others} onChangeText={(text) => updateForm('others', text)} />
                                        </Input>
                                        <AnimateError isVisible={validationTriggered && formData?.work_with === 'OTH' && !formData.others}>
                                            {"employer name is required"}
                                        </AnimateError>
                                    </FormControl>}

                                    {formData?.work_with !== '' && formData.work_with !== 'NWK' && (<><FormControl isInvalid={validationTriggered && !formData.working_as}>
                                        <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Working As</FormControlLabelText></FormControlLabel>
                                        <Input style={styles.inputContainer}>
                                            <Box className="pl-4 justify-center"><Icon as={Building2} size="sm" className="text-violet-500" /></Box>
                                            <InputField placeholder="E.g. Software Developer" value={formData.working_as} onChangeText={(text) => updateForm('working_as', text)} />
                                        </Input>
                                        <AnimateError isVisible={validationTriggered && (!formData?.working_as)}>
                                            {"working as is required"}
                                        </AnimateError>
                                    </FormControl>
                                        <FormControl isInvalid={validationTriggered && !formData.company_name}>
                                            <FormControlLabel className="mb-2"><FormControlLabelText className="font-bold">Employer Name</FormControlLabelText></FormControlLabel>
                                            <Input style={styles.inputContainer}>
                                                <Box className="pl-4 justify-center"><Icon as={Briefcase} size="sm" className="text-violet-500" /></Box>
                                                <InputField placeholder="Company name" value={formData.company_name} onChangeText={(text) => updateForm('company_name', text)} />
                                            </Input>
                                            <AnimateError isVisible={validationTriggered && (!formData?.company_name)}>
                                                {"employer name is required"}
                                            </AnimateError>
                                        </FormControl>

                                    </>)}
                                </VStack>
                            )}
                            <Box className="h-20" />
                        </ScrollView>
                    </ModalBody>

                    <ModalFooter className="p-6 border-t border-outline-100">
                        {currentStep === 1 ? (
                            <Button onPress={handleNext} className="w-full rounded-2xl h-14 bg-violet-600 shadow-lg shadow-violet-200">
                                <ButtonText className="text-white font-bold">Continue to Career Details</ButtonText>
                            </Button>
                        ) : (
                            <HStack className="w-full gap-3">
                                <Button variant="outline" onPress={handleBack} className="flex-1 rounded-2xl h-14 border-outline-300">
                                    <ButtonText className="text-typography-600 font-bold">Back</ButtonText>
                                </Button>
                                <Button onPress={handleSave} isDisabled={isSaving} className="flex-1 rounded-2xl h-14 bg-violet-600">
                                    {isSaving ? <Spinner color="white" /> : <ButtonText className="text-white font-bold">Update Profile</ButtonText>}
                                </Button>
                            </HStack>
                        )}
                    </ModalFooter>
                </KeyboardAvoidingView>
            </ModalContent>
        </Modal>
    );
};

const styles = StyleSheet.create({
    dropdown: { height: 56, borderRadius: 16, paddingHorizontal: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E7EB', width: '100%' },
    inputContainer: { height: 56, borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row' },
    placeholderStyle: { color: '#9CA3AF', fontSize: 14 },
});