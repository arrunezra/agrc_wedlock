import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles, X, Check } from 'lucide-react-native';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Heading, Text, VStack, HStack, Box,
    Button, ButtonText
} from '@/src/components/GluestackUI';
import { Icon } from '@/components/ui/icon';
import profileService from '@/src/services/profileService';

const EditHobbiesModal = ({
    isOpen,
    onClose,
    selectedHobbies,
    user,
    showToast,
    onRefresh,
    lookups
}: any) => {
    const [localSelected, setLocalSelected] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const MAX_HOBBIES = 5;

    // 1. Sync and sanitize initial data
    useEffect(() => {
        if (isOpen) {
            let initial: string[] = [];
            if (Array.isArray(selectedHobbies)) {
                // Ensure every item is a primitive string
                initial = selectedHobbies.map(h => String(typeof h === 'object' ? h.value : h));
            } else if (typeof selectedHobbies === 'string' && selectedHobbies.length > 0) {
                initial = selectedHobbies.split(',');
            }
            setLocalSelected(initial.filter(Boolean));
        }
    }, [isOpen, selectedHobbies]);

    // 2. Hardened toggle function
    const internalToggle = useCallback((hobbyValue: any) => {
        // Force value to be a string. This prevents [object Object] crashes
        const cleanVal = String(hobbyValue);

        setLocalSelected((prev) => {
            const isExist = prev.includes(cleanVal);
            if (isExist) {
                return prev.filter((v) => v !== cleanVal);
            } else {
                if (prev.length < MAX_HOBBIES) {
                    return [...prev, cleanVal];
                }
                return prev;
            }
        });
    }, [MAX_HOBBIES]);

    const onSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const payload = {
                id: user?.profile_id,
                action: 'hobbies',
                hobbies: localSelected.join(','),
            };

            const res = await profileService.updateEditProfile(payload);
            if (res.success) {
                showToast("Interests", "Updated successfully!", "success");
                if (onRefresh) await onRefresh();
                onClose();
            } else {
                showToast("Error", res?.message || "Update failed", "error");
            }
        } catch (e) {
            console.error("Save failed");
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Memoize categorized data to keep render clean
    const categories = useMemo(() =>
        (lookups?.hobbies || []).filter((h: any) => h.parent === null),
        [lookups]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalBackdrop />
            <ModalContent className="bg-white flex-1">
                <ModalHeader className="px-6 pt-10 pb-0 justify-end border-0">
                    <ModalCloseButton className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Icon as={X} size="md" className="text-slate-600" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="flex-1 p-0">
                    <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                        <VStack className="items-center mb-8">
                            <Box className="w-16 h-16 rounded-[22px] items-center justify-center bg-emerald-50 border-b-4 border-emerald-200">
                                <Icon as={Sparkles} size='xl' className="text-emerald-600" />
                            </Box>
                            <Heading size="xl" className="mt-4">Interests</Heading>
                            <Text size="sm" className="text-slate-500">
                                {localSelected.length} / {MAX_HOBBIES} selected
                            </Text>
                        </VStack>

                        <VStack space="xl" className="pb-10">
                            {categories.map((cat: any) => (
                                <VStack key={`cat-${cat.value}`} space="md" className="mb-6">
                                    {/* Category Label */}
                                    <HStack space="sm" className="mb-2 mt-4 px-1 item-center">
                                        {/* Small vertical accent line */}
                                        <Text className="text-[14px] font-extrabold text-emerald-700 uppercase  ">
                                            {cat.label}
                                        </Text>
                                    </HStack>

                                    {/* Hobbies in this Category */}
                                    <HStack className="flex-wrap gap-3">
                                        {(lookups?.hobbies || [])
                                            .filter((h: any) => h.parent === cat.value)
                                            .map((hobby: any) => {
                                                const hVal = String(hobby.value);
                                                const isSelected = localSelected.includes(hVal);
                                                const isMax = localSelected.length >= MAX_HOBBIES;

                                                return (
                                                    <TouchableOpacity
                                                        key={`hobby-${hVal}`}
                                                        activeOpacity={0.7}
                                                        onPress={() => internalToggle(hVal)}
                                                        // Keep structural styles in className
                                                        className="px-4 py-2.5 rounded-2xl border-2 flex-row items-center"
                                                        // Use standard style for all DYNAMIC properties
                                                        style={{
                                                            backgroundColor: isSelected ? '#059669' : (isMax ? '#f8fafc' : '#ffffff'),
                                                            borderColor: isSelected ? '#059669' : '#e2e8f0',
                                                            opacity: !isSelected && isMax ? 0.4 : 1,
                                                            elevation: isSelected ? 2 : 0, // Optional: Add subtle shadow for Android
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <Icon as={Check} size="xs" className="text-white mr-1.5" />
                                                        )}
                                                        <Text
                                                            className="text-sm font-semibold"
                                                            style={{
                                                                color: isSelected ? '#ffffff' : '#475569',
                                                            }}
                                                        >
                                                            {hobby.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                    </HStack>
                                </VStack>
                            ))}
                        </VStack>
                    </ScrollView>
                </ModalBody>

                <ModalFooter className="p-6 bg-white border-t border-slate-100">
                    <Button
                        onPress={onSave}
                        isDisabled={isSaving || localSelected.length === 0}
                        className={`w-full h-14 rounded-2xl ${localSelected.length === 0 ? 'bg-slate-300' : 'bg-emerald-600'
                            }`}
                    >
                        <ButtonText className="font-bold text-white uppercase">
                            {isSaving ? "Saving..." : "Save Selection"}
                        </ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditHobbiesModal;