import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Briefcase, Banknote, Building2, UserCircle2, X, ChevronRight } from 'lucide-react-native';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Heading, Text, VStack, HStack, Box,
    FormControl, FormControlLabel, FormControlLabelText, Button, ButtonText,
    Input, InputField
} from '@/src/components/GluestackUI';
import { Icon } from '@/components/ui/icon';

const { height } = Dimensions.get('window');

const EditCareerModal = ({
    isOpen,
    onClose,
    formData,
    updateForm,
    INCOME_RANGES,
    WORK_WITH,
    validationTriggered,
    handleSave,
    isSaving
}: any) => {
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
                        <VStack space="xl">
                            <VStack className="items-center mb-4">
                                <Box className="w-16 h-16 rounded-[22px] items-center justify-center bg-amber-50 border-b-4 border-amber-200">
                                    <Icon as={Briefcase} size='xl' className="text-amber-600" />
                                </Box>
                                <Heading size="xl" className="mt-4">Career & Income</Heading>
                            </VStack>

                            {/* SECTION: INCOME */}
                            <VStack space="md" className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                <HStack space="xs" items-center>
                                    <Icon as={Banknote} size="xs" className="text-amber-600" />
                                    <Text className="font-bold text-amber-800 text-xs uppercase tracking-wider">Earnings</Text>
                                </HStack>

                                <FormControl isInvalid={validationTriggered && !formData.income}>
                                    <Dropdown
                                        style={[styles.dropdown, (validationTriggered && !formData.income) && { borderColor: '#EF4444' }]}
                                        data={INCOME_RANGES}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Annual Income Range"
                                        value={formData.income}
                                        onChange={item => updateForm('income', item.value)}
                                    />
                                </FormControl>
                            </VStack>

                            {/* SECTION: WORK DETAILS */}
                            <VStack space="lg" className="mt-2">
                                <HStack space="xs" items-center className="px-1">
                                    <Icon as={Building2} size="xs" className="text-amber-600" />
                                    <Text className="font-bold text-amber-800 text-xs uppercase tracking-wider">Work Identity</Text>
                                </HStack>

                                {/* Works With */}
                                <FormControl isInvalid={validationTriggered && !formData.worksWith}>
                                    <FormControlLabel><FormControlLabelText size="sm">Sector</FormControlLabelText></FormControlLabel>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={WORK_WITH}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="e.g. Private Sector"
                                        value={formData.worksWith}
                                        onChange={item => updateForm('worksWith', item.value)}
                                    />
                                </FormControl>

                                {/* Designation */}
                                <FormControl isInvalid={validationTriggered && !formData.worksas}>
                                    <FormControlLabel><FormControlLabelText size="sm">Designation</FormControlLabelText></FormControlLabel>
                                    <Input className="h-14 rounded-2xl bg-white border-slate-200">
                                        <InputField
                                            placeholder="e.g. Product Manager"
                                            value={formData.worksas}
                                            onChangeText={(v) => updateForm('worksas', v)}
                                        />
                                    </Input>
                                </FormControl>

                                {/* Company */}
                                <FormControl isInvalid={validationTriggered && !formData.companyName}>
                                    <FormControlLabel><FormControlLabelText size="sm">Company Name</FormControlLabelText></FormControlLabel>
                                    <Input className="h-14 rounded-2xl bg-white border-slate-200">
                                        <InputField
                                            placeholder="Where do you work?"
                                            value={formData.companyName}
                                            onChangeText={(v) => updateForm('companyName', v)}
                                        />
                                    </Input>
                                </FormControl>
                            </VStack>
                        </VStack>
                    </ScrollView>
                </ModalBody>

                <ModalFooter className="p-6">
                    <Button onPress={handleSave} isDisabled={isSaving} className="w-full h-14 bg-amber-500 rounded-2xl shadow-lg shadow-amber-100">
                        {isSaving ? <ButtonText>Saving...</ButtonText> : <ButtonText className="font-bold">Update Career</ButtonText>}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const styles = {
    dropdown: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    }
};

export default EditCareerModal;