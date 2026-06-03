import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Platform } from 'react-native';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Text,
    VStack,
    HStack,
    Box,

    Textarea,
    TextareaInput,
    Button,
    ButtonText,
    Spinner,
} from '@/src/components/common/GluestackUI';
import {
    AlertCircle, Info, X, Icon,
    CloseIcon,
} from '@/src/components/common/IconUI';
import { ShieldAlert } from 'lucide-react-native';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import { useAppToast } from '@/src/context/ToastContext';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, remarks: string) => Promise<void>;
    targetMemberName?: string;
}

const ReportProfileModal = ({ isOpen, onClose, onSubmit, targetMemberName }: ReportModalProps) => {
    const [reason, setReason] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useAppToast();
    const MIN_CHARS = 50;
    const reportReasons = [
        { label: 'Fake Profile / Photos', value: 'fake' },
        { label: 'Inappropriate Content', value: 'inappropriate' },
        { label: 'Harassment or Abuse', value: 'harassment' },
        { label: 'Already Married / Wrong Info', value: 'misleading' },
        { label: 'Asking for Money / Scammer', value: 'scam' },
        { label: 'Other', value: 'other' },
    ];

    const handleInternalSubmit = async () => {
        if (remarks.length < MIN_CHARS) {
            showToast("Too short", "Please write at least 50 characters.", "error");
            return;
        } else {
            setIsSaving(true);
            await onSubmit(reason, remarks);
            setIsSaving(false);
            // Reset form after close
            setReason('');
            setRemarks('');
            onClose();
        }

    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalBackdrop />
            <ModalContent className="bg-white flex-1">
                {/* Header */}
                <ModalHeader className="px-6 pt-10 pb-0 justify-end border-0">
                    <ModalCloseButton className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 ">
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
                            {/* Visual Identity Section */}
                            <VStack className="items-center mb-6">
                                <Box className="relative w-20 h-20 items-center justify-center">
                                    <Box className="absolute w-16 h-16 rounded-full bg-red-500 blur-2xl opacity-20" />
                                    <Box
                                        className="w-16 h-16 rounded-[22px] items-center justify-center bg-red-50 border-b-4 border-red-200 shadow-sm"
                                        style={{ transform: [{ rotate: '-6deg' }] }}
                                    >
                                        <Icon as={ShieldAlert} size="xl" className="text-red-600" style={{ transform: [{ rotate: '6deg' }] }} />
                                    </Box>
                                </Box>
                                <Heading size="xl" className="mt-4 tracking-tight text-center text-typography-900">
                                    Report {targetMemberName || 'Member'}
                                </Heading>
                                <Text size="xs" className="text-typography-500 text-center mt-1 px-10">
                                    We take privacy seriously. Your report will be reviewed by our moderation team.
                                </Text>
                            </VStack>

                            {/* Dropdown Input */}
                            <VStack space="xs">
                                <Text size="sm" className="font-semibold text-typography-800 ml-1">Reason for reporting</Text>
                                <FuturisticDropdown
                                    data={reportReasons}
                                    value={reason}
                                    onChange={(item: any) => setReason(item.value)}
                                    placeholder="Select a reason"
                                    icon={{ icon: AlertCircle, color: 'text-red-400' }}
                                />
                            </VStack>

                            {/* Remarks Area */}
                            <VStack space="xs">
                                <Text size="sm" className="font-semibold text-typography-800 ml-1">Additional Remarks</Text>
                                <Box className="relative">
                                    <Textarea size="lg" className="h-40 p-4 rounded-3xl border-2 bg-white border-outline-100">
                                        <TextareaInput
                                            placeholder="Give us a bit more detail about the issue..."
                                            value={remarks}
                                            onChangeText={setRemarks}
                                            multiline
                                            textAlignVertical="top"
                                            className={`text-lg leading-6 text-typography-800  bg-white ${remarks.length >= MIN_CHARS
                                                ? 'border-outline-100'
                                                : 'border-error-100'
                                                }`}
                                        />
                                    </Textarea>
                                    {remarks.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setRemarks('')}
                                            className="absolute top-4 right-4 bg-slate-100 p-1.5 rounded-full"
                                        >
                                            <Icon as={X} size="xs" className="text-slate-500" />
                                        </TouchableOpacity>
                                    )}
                                </Box>
                            </VStack>

                            {/* Trust Badge */}
                            <Box className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <HStack space="sm" items-center className="mb-2">
                                    <Icon as={Info} size="sm" className="text-slate-500" />
                                    <Heading size="xs" className="text-slate-800">100% Confidential</Heading>
                                </HStack>
                                <Text size="xs" className="text-slate-600 leading-5">
                                    The member being reported will not know who filed this report. We appreciate your help in keeping our platform safe.
                                </Text>
                            </Box>
                        </VStack>
                    </ScrollView>
                </ModalBody>

                {/* Footer Actions */}
                <ModalFooter className="p-6 border-t border-outline-100 bg-white">
                    <HStack className="w-full gap-3">
                        <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl h-14 border-outline-300">
                            <ButtonText className="text-typography-600 font-bold">Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={handleInternalSubmit}
                            isDisabled={isSaving || !reason}
                            className={`flex-1 rounded-2xl h-14 shadow-lg ${isSaving || !reason ? 'bg-slate-200' : 'bg-red-600 shadow-red-100'}`}
                        >
                            {isSaving ? <Spinner color="white" /> : <ButtonText className="text-white font-bold text-lg">Submit Report</ButtonText>}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReportProfileModal;