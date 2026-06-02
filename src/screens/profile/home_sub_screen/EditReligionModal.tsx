import { CloseIcon, Icon } from '@/components/ui/icon';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import { Box, Button, ButtonText, FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText, Heading, HStack, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Spinner, Text, VStack } from '@/src/components/common/GluestackUI';
import { Check, Church, Languages, MapPin, MoonStar, Network, Users, Users2 } from '@/src/components/common/IconUI';
import _ from 'lodash';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Dimensions, View } from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import { AnimateError } from '../../common/AnimateError';
import { useAppToast } from '@/src/context/ToastContext';
import profileService from '@/src/services/profileService';

const { height } = Dimensions.get('window');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EditReligionModal = ({
    isOpen,
    onClose,
    content,
    onRefresh,
    lookups,
    showToast,
    user
}: any) => {
    console.log('content', content);
    const [formData, setFormData] = useState<any>(_.cloneDeep(content || []));
    const [validationTriggered, setValidationTriggered] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const updateForm = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };
    const validateForm = () => {
        // 1. Basic Field Validation
        const requiredFields = [
            'religion',
            'mother_tongue',
            'community',
            'sub_community',
            'is_caste_no_bar'
        ];

        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                return false;
            }
        }


        return true;
    };
    const handleSave = async () => {
        setValidationTriggered(true);
        let isvalid = !validateForm()
        if (isvalid) {
            showToast("Religion Details", "Validation failed! " + formData.religion, "error");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                id: user?.profile_id,
                action: 'religion&community',
                religion: formData.religion,
                mother_tongue: formData.mother_tongue,
                community: formData.community,
                sub_community: formData.sub_community,
                is_caste_no_bar: formData.is_caste_no_bar
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
                {/* Header with Close Button */}
                <ModalHeader className="px-6 pt-10 pb-0 justify-end border-0">
                    <ModalCloseButton className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200">
                        <Icon as={CloseIcon} size="md" className="text-typography-900" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="flex-1 p-0">
                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        <VStack space="xl">
                            {/* Futuristic Icon Section */}
                            <VStack className="items-center mb-8">
                                <Box className="relative w-20 h-20 items-center justify-center">
                                    <Box className="absolute w-16 h-16 rounded-full bg-indigo-500 blur-2xl opacity-20" />
                                    <Box
                                        className="w-16 h-16 rounded-[22px] items-center justify-center bg-indigo-50 border-b-4 border-indigo-200 shadow-sm"
                                        style={{ transform: [{ rotate: '-6deg' }] }}
                                    >
                                        <Icon
                                            as={MoonStar}
                                            size='lg'
                                            className="text-indigo-600"
                                            style={{ transform: [{ rotate: '6deg' }] }}
                                        />
                                    </Box>
                                </Box>

                                <Heading size="xl" className="mt-4 tracking-tight text-center text-typography-900">
                                    Religion Details
                                </Heading>
                                <Text size="xs" className="text-typography-500 text-center mt-1 px-10">
                                    Update your religious and community background to improve your matches.
                                </Text>
                            </VStack>

                            {/* 1. Religion Dropdown */}
                            <FormControl isInvalid={validationTriggered && !formData?.religion}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText size="sm" className="font-bold">Select Religion</FormControlLabelText>
                                </FormControlLabel>
                                <FuturisticDropdown
                                    data={lookups?.religion || []}
                                    value={formData.religion}
                                    onChange={(item: any) => updateForm('religion', item.value)}
                                    placeholder="Select religion"
                                    icon={{ icon: MoonStar, color: 'text-typography-400' }}
                                    isInvalid={validationTriggered && !formData?.religion}
                                />
                                <AnimateError isVisible={validationTriggered && (!formData?.religion)}>
                                    Please select a religion
                                </AnimateError>
                            </FormControl>

                            {/* 2. Mother Tongue Dropdown */}
                            <FormControl isInvalid={validationTriggered && !formData.mother_tongue}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText size="sm" className="font-bold">Mother Tongue</FormControlLabelText>
                                </FormControlLabel>
                                <FuturisticDropdown
                                    data={lookups?.mother_tongue || []}
                                    value={formData.mother_tongue}
                                    onChange={(item: any) => updateForm('mother_tongue', item.value)}
                                    placeholder="Select mother tongue"
                                    icon={{ icon: Network, color: 'text-typography-400' }}
                                    isInvalid={validationTriggered && !formData.mother_tongue}
                                />
                                <AnimateError isVisible={validationTriggered && (!formData.mother_tongue)}>
                                    Please select a mother tongue
                                </AnimateError>
                            </FormControl>

                            {/* 3. Community Dropdown */}
                            <FormControl isInvalid={validationTriggered && !formData.community}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText size="sm" className="font-bold">Community</FormControlLabelText>
                                </FormControlLabel>
                                <FuturisticDropdown
                                    data={lookups?.community || []}
                                    value={formData.community}
                                    onChange={(item: any) => updateForm('community', item.value)}
                                    placeholder="Select Community"
                                    icon={{ icon: Users2, color: 'text-typography-400' }}
                                    search={true}
                                    isInvalid={validationTriggered && !formData.community}
                                />
                                <AnimateError isVisible={validationTriggered && (!formData.community)}>
                                    Please select a community
                                </AnimateError>
                            </FormControl>

                            {/* 4. Sub Community Dropdown */}
                            <FormControl isInvalid={validationTriggered && !formData.sub_community}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText size="sm" className="font-bold">Sub Community</FormControlLabelText>
                                </FormControlLabel>
                                <FuturisticDropdown
                                    data={lookups?.sub_community || []}
                                    value={formData.sub_community}
                                    onChange={(item: any) => updateForm('sub_community', item.value)}
                                    placeholder="Select Sub Community"
                                    icon={{ icon: Network, color: 'text-typography-400' }}
                                    search={true}
                                    isInvalid={validationTriggered && !formData.sub_community}
                                />
                                <AnimateError isVisible={validationTriggered && (!formData.sub_community)}>
                                    Please select a sub community
                                </AnimateError>
                            </FormControl>

                            {/* CASTE NO BAR CHECKBOX CARD */}
                            {/* <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => updateForm('is_caste_no_bar', !formData.is_caste_no_bar)}
                                className={`mt-2 p-4 rounded-2xl border-2 flex-row items-center ${formData.is_caste_no_bar ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50'}`}
                            >
                                <Box className={`w-6 h-6 rounded-lg items-center justify-center border-2 mr-3 ${formData.is_caste_no_bar ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-200'}`}>
                                    {formData.is_caste_no_bar && <Icon as={Check} size='lg' className="text-white" />}
                                </Box>
                                <VStack className="flex-1">
                                    <Text className={`text-sm font-bold ${formData.is_caste_no_bar ? 'text-blue-700' : 'text-typography-900'}`}>
                                        Caste No Bar
                                    </Text>
                                    <Text size="xs" className="text-typography-500">
                                        Open to partner matches from all communities
                                    </Text>
                                </VStack>
                            </TouchableOpacity> */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => updateForm('is_caste_no_bar', !formData.is_caste_no_bar)}
                                className={`mt-2 p-4 rounded-2xl border-2 flex-row items-center ${formData.is_caste_no_bar ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50'}`}
                            >
                                <Box className={`w-6 h-6 rounded-lg items-center justify-center border-2 mr-3 ${formData.is_caste_no_bar ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-200'}`}>
                                    {formData.is_caste_no_bar ? (
                                        <Icon as={Check} size='lg' className="text-white" />
                                    ) : null}
                                </Box>

                                <VStack className="flex-1">
                                    <Text className={`text-sm font-bold ${formData.is_caste_no_bar ? 'text-blue-700' : 'text-typography-900'}`}>Caste No Bar</Text>
                                    <Text size="xs" className="text-typography-500">Open to partner matches from all communities</Text>
                                </VStack>
                            </TouchableOpacity>
                        </VStack>
                        <Box className="h-20" />
                    </ScrollView>
                </ModalBody>

                <ModalFooter className="p-6 border-t border-outline-100 bg-white">
                    <HStack className="w-full gap-3">
                        <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl h-14 border-outline-300">
                            <ButtonText className="text-typography-600 font-bold">Cancel</ButtonText>
                        </Button>
                        <Button onPress={handleSave} isDisabled={isSaving} className="flex-1 rounded-2xl h-14 bg-primary-600 shadow-lg shadow-primary-200">
                            {isSaving ? <Spinner color="white" /> : <ButtonText className="text-white font-bold text-lg">Update Details</ButtonText>}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },

    placeholderStyle: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    errorBorder: {
        borderColor: '#EF4444',
    },
    selectedTextStyle: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '500',
    },
    containerStyle: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: SCREEN_WIDTH * 0.85,
        marginHorizontal: (SCREEN_WIDTH * 0.15) / 2,
        maxHeight: '70%',
        justifyContent: 'center',
        padding: 8,
        overflow: 'hidden',
        marginTop: 'auto',
        marginBottom: 'auto'
    }
});

export default EditReligionModal;