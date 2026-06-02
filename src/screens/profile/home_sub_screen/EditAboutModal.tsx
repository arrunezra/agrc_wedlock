import React, { useEffect, useState } from 'react';
import {
    VStack, Box, Heading, Text, Textarea, TextareaInput, Button, ButtonText, useToast, Toast, ToastTitle, HStack, Spinner,
    Modal, ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter
} from '@/src/components/common/GluestackUI';
import api from '@/src/api/api';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import { ToastDescription } from '@/components/ui/toast';
import { ArrowLeftIcon, CloseIcon, Icon } from '@/components/ui/icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lightbulb, Sparkles, X } from '@/src/components/common/IconUI';
import { useAppToast } from '@/src/context/ToastContext';
import profileService from '@/src/services/profileService';

const EditAboutModal = ({ isOpen, onClose, content, user, title = "Personality & Expectations" }: any) => {
    console.log('EditAboutModal', user)
    const [aboutText, setAboutText] = useState(content || '');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useAppToast();

    const MAX_CHARS = 1000;
    const MIN_CHARS = 50;
    // Inside your component:
    const DRAFT_KEY = `@about_me_draft_${user?.id || ''}`;

    // 1. Load draft on mount
    useEffect(() => {
        const loadDraft = async () => {
            const savedDraft = await AsyncStorage.getItem(DRAFT_KEY);
            if (savedDraft && !aboutText) {
                setAboutText(savedDraft);
            }
        };
        loadDraft();
    }, []);

    // 2. Save to draft whenever text changes
    useEffect(() => {
        if (aboutText) {
            AsyncStorage.setItem(DRAFT_KEY, aboutText);
        }
    }, [aboutText]);
    const handleSave = async () => {
        if (aboutText.length < MIN_CHARS) {
            showToast("Too short", "Please write at least 50 characters.", "error");
            return;
        }

        setIsSaving(true);
        try {
            const res = await profileService.updateEditProfile({ aboutus: aboutText, id: user?.profile_id, action: 'aboutus' });
            if (res.success) {
                showToast("About Us", "Updated successfully!", "success");
                AsyncStorage.removeItem(DRAFT_KEY);
                onClose();
            } else {
                showToast("About Us", res?.message, "error");

            }
        } catch (error) {
            console.error(error);
            showToast("About Us", "Internal server error!", "error");
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
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 40 }}
                        className="px-6 py-4"
                        showsVerticalScrollIndicator={false}
                    >
                        <VStack space="xl">

                            {/* 2026 Futuristic Icon Section */}
                            <VStack className="items-center mb-8">
                                <Box className="relative w-20 h-20 items-center justify-center">
                                    {/* Amber/Gold Glow for Creativity/Personality */}
                                    <Box className="absolute w-16 h-16 rounded-full bg-amber-500 blur-2xl opacity-20" />

                                    <Box
                                        className="w-16 h-16 rounded-[22px] items-center justify-center bg-amber-50 border-b-4 border-amber-200 shadow-sm"
                                        style={{ transform: [{ rotate: '-6deg' }] }}
                                    >
                                        <Icon
                                            as={Sparkles}
                                            size='xl'
                                            className="text-amber-600"
                                            style={{ transform: [{ rotate: '6deg' }] }}
                                        />
                                    </Box>
                                </Box>

                                <Heading size="xl" className="mt-4 tracking-tight text-center text-typography-900">
                                    Personality
                                </Heading>
                                <Text size="xs" className="text-typography-500 text-center mt-1 px-10">
                                    Share your story. Profiles with thoughtful bios get 70% more engagement.
                                </Text>
                            </VStack>

                            <VStack space="md">
                                <Box className="relative">
                                    <Textarea
                                        size="lg"
                                        className={`h-64 p-4 rounded-3xl border-2 transition-all bg-white ${aboutText.length >= MIN_CHARS
                                            ? 'border-outline-100'
                                            : 'border-error-100'
                                            }`}
                                    >
                                        <TextareaInput
                                            placeholder="Write something interesting about yourself..."
                                            value={aboutText}
                                            onChangeText={setAboutText}
                                            maxLength={MAX_CHARS}
                                            multiline
                                            textAlignVertical="top"

                                            className="text-lg leading-6 pr-8 text-typography-800"
                                        />
                                    </Textarea>

                                    {/* Floating Clear Button */}
                                    {aboutText.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setAboutText('')}
                                            className="absolute top-4 right-4 bg-slate-100 p-1.5 rounded-full"
                                        >
                                            <Icon as={X} size='lg' className="text-slate-500" />
                                        </TouchableOpacity>
                                    )}

                                    {/* Character Counter & Status */}
                                    <HStack className="justify-between mt-3 px-2">
                                        <HStack items-center space="xs">
                                            <Box className={`w-2 h-2 rounded-full ${aboutText.length < MIN_CHARS ? 'bg-error-500' : 'bg-emerald-500'}`} />
                                            <Text size="xs" className={aboutText.length < MIN_CHARS ? "text-error-600 font-medium" : "text-emerald-600 font-medium"}>
                                                {aboutText.length < MIN_CHARS
                                                    ? `${MIN_CHARS - aboutText.length} characters to go`
                                                    : "Bio length is perfect"}
                                            </Text>
                                        </HStack>
                                        <Text size="xs" className="text-typography-400 font-mono">
                                            {aboutText.length}/{MAX_CHARS}
                                        </Text>
                                    </HStack>
                                </Box>

                                {/* Tips Box */}
                                <Box className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mt-2">
                                    <HStack space="sm" items-center className="mb-3">
                                        <Icon as={Lightbulb} size="sm" className="text-amber-500" />
                                        <Heading size="xs" className="text-slate-800">Writing Tips</Heading>
                                    </HStack>
                                    <VStack space="xs">
                                        <Text size="xs" className="text-slate-600 leading-5">• Mention your career and future goals.</Text>
                                        <Text size="xs" className="text-slate-600 leading-5">• Talk about your favorite weekend hobbies.</Text>
                                        <Text size="xs" className="text-slate-600 leading-5">• Describe the qualities of your ideal partner.</Text>
                                    </VStack>
                                </Box>
                            </VStack>
                        </VStack>
                    </ScrollView>
                </ModalBody>

                {/* Footer */}
                <ModalFooter className="p-6 border-t border-outline-100 bg-white">
                    <HStack className="w-full gap-3">
                        <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl h-14 border-outline-300">
                            <ButtonText className="text-typography-600 font-bold">Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={handleSave}
                            isDisabled={isSaving || aboutText.length < MIN_CHARS}
                            className={`flex-1 rounded-2xl h-14 shadow-lg ${isSaving || aboutText.length < MIN_CHARS
                                ? 'bg-slate-200'
                                : 'bg-amber-500 shadow-amber-100'
                                }`}
                        >
                            {isSaving ? (
                                <Spinner color="white" />
                            ) : (
                                <ButtonText className="text-white font-bold text-lg">Submit</ButtonText>
                            )}
                            {/* <ButtonText className="text-white font-bold text-lg">Submit</ButtonText> */}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
export default EditAboutModal;