import { CloseIcon, Icon } from '@/components/ui/icon';
import { InputIcon, InputSlot } from '@/components/ui/input';
import {
    Box, Button, ButtonText, FormControl, FormControlLabel, FormControlLabelText, Heading,
    HStack, Input, InputField, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Spinner, Text, VStack
} from '@/src/components/GluestackUI';
import { Mail, Phone, ShieldCheck } from '@/src/components/IconUI';
import React, { useRef } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AnimateError } from '@/src/components/AnimateError';




const ContactModal = ({
    isOpen,
    onClose,
    formData,
    updateForm,
    onSave,
    isSaving,
    validationTriggered,
    step = 2
}: any) => {
    const phoneRef = useRef<any>(null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalBackdrop />
            <ModalContent className="bg-white flex-1">

                {/* Header - Simplified to hold the Close Button */}
                <ModalHeader className="px-6 pt-10 pb-0 justify-end border-0">
                    <ModalCloseButton className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 ">
                        <Icon as={CloseIcon} size="md" className="text-typography-900" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="flex-1 p-0">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                    >
                        <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                            <VStack space="xl">

                                {/* 2026 Futuristic Shield Section */}
                                <VStack className="items-center mb-8">
                                    <Box className="relative w-20 h-20 items-center justify-center">
                                        {/* Glow Background */}
                                        <Box className="absolute w-16 h-16 rounded-full bg-emerald-500 blur-2xl opacity-20" />

                                        {/* Shield Icon Container */}
                                        <Box
                                            className="w-16 h-16 rounded-[22px] items-center justify-center bg-emerald-50 border-b-4 border-emerald-200 shadow-sm"
                                            style={{ transform: [{ rotate: '-6deg' }] }}
                                        >
                                            <Icon
                                                as={ShieldCheck}
                                                size='xl'
                                                className="text-emerald-600"
                                                style={{ transform: [{ rotate: '6deg' }] }}
                                            />
                                        </Box>
                                    </Box>

                                    <Heading size="xl" className="mt-4 tracking-tight text-center text-typography-900">
                                        Contact Info
                                    </Heading>
                                    <Text size="xs" className="text-typography-500 text-center mt-1 px-10">
                                        Please provide your verified details to secure your profile.
                                    </Text>
                                </VStack>

                                {/* Email Input */}
                                <FormControl isInvalid={validationTriggered && !formData.email}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText size="sm" className="font-bold">Email Address</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input size="lg" className="h-14 rounded-2xl border-outline-200 bg-white shadow-sm shadow-slate-100">
                                        <InputSlot className="pl-4">
                                            <InputIcon as={Mail} className="text-typography-400" />
                                        </InputSlot>
                                        <InputField
                                            placeholder="Email Address"
                                            value={formData.email}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            returnKeyType="next"
                                            onSubmitEditing={() => phoneRef.current?.focus()}
                                            onChangeText={(v) => updateForm('email', v)}
                                        />
                                    </Input>

                                    <AnimateError isVisible={validationTriggered && (!formData.email)}>
                                        {"Email is required"}
                                    </AnimateError>
                                </FormControl>

                                {/* Phone Number Input */}
                                <FormControl isInvalid={validationTriggered && !formData.phone}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText size="sm" className="font-bold">Phone Number</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input size="lg" className="h-14 rounded-2xl border-outline-200 bg-white shadow-sm shadow-slate-100">
                                        <InputSlot className="pl-4">
                                            <InputIcon as={Phone} className="text-typography-400" />
                                        </InputSlot>
                                        <InputField
                                            ref={phoneRef}
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            keyboardType="phone-pad"
                                            onChangeText={(v) => updateForm('phone', v)}
                                        />
                                    </Input>

                                    <AnimateError isVisible={validationTriggered && (!formData.phone)}>
                                        {"Phone is required"}
                                    </AnimateError>
                                </FormControl>

                            </VStack>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </ModalBody>

                {/* Footer remains same */}
                <ModalFooter className="p-6 border-t border-outline-100 bg-white">
                    <HStack className="w-full gap-3">
                        <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl h-14">
                            <ButtonText className="text-typography-600">Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={onSave}
                            isDisabled={isSaving}
                            className="flex-1 rounded-2xl h-14 bg-primary-600"
                        >
                            {isSaving ? <Spinner color="white" /> : <ButtonText className="text-white font-bold">Update Details</ButtonText>}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ContactModal;