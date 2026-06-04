import React from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Heading, Text, VStack, HStack, Box,
    FormControl, FormControlLabel, FormControlLabelText, Button, ButtonText,
    Input, InputField, ScrollView, Select, SelectTrigger, SelectInput,
    SelectPortal, SelectBackdrop, SelectContent, SelectItem
} from '@/src/components/GluestackUI';
import { TouchableOpacity } from 'react-native';
import { Icon, } from '@/components/ui/icon';
import { Heart, Ruler, Trash2, X } from '@/src/components/IconUI';

const EditFamilyModal = ({
    isOpen,
    onClose,
    formData,
    updateForm,
    HEIGHT_DATA,
    MARITAL_STATUS,
    handleChildrenCountChange,
    updateKidDetail,
    removeChild,
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
                        <Icon as={X} size="md" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="flex-1 p-0">
                    <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 40 }}>
                        <VStack space="xl">
                            <VStack className="items-center mb-6">
                                <Box className="w-16 h-16 rounded-[22px] items-center justify-center bg-cyan-50 border-b-4 border-cyan-200">
                                    <Icon as={Heart} size='lg' className="text-cyan-600" />
                                </Box>
                                <Heading size="xl" className="mt-4">Family Details</Heading>
                            </VStack>

                            <VStack space="lg">
                                {/* Height */}
                                <FormControl isInvalid={validationTriggered && !formData.height}>
                                    <FormControlLabel><FormControlLabelText size="sm" className="font-bold">Height</FormControlLabelText></FormControlLabel>
                                    <Dropdown
                                        style={[styles.dropdown, (validationTriggered && !formData.height) && { borderColor: '#EF4444' }]}
                                        data={HEIGHT_DATA}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Height"
                                        value={formData.height}
                                        onChange={item => updateForm('height', item.value)}
                                        renderLeftIcon={() => <Icon as={Ruler} size="sm" className="mr-2 text-cyan-500" />}
                                    />
                                </FormControl>

                                {/* Marital Status */}
                                <FormControl isInvalid={validationTriggered && !formData.maritalStatus}>
                                    <FormControlLabel><FormControlLabelText size="sm" className="font-bold">Marital Status</FormControlLabelText></FormControlLabel>
                                    <Dropdown
                                        style={[styles.dropdown, (validationTriggered && !formData.maritalStatus) && { borderColor: '#EF4444' }]}
                                        data={MARITAL_STATUS}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Marital Status"
                                        value={formData.maritalStatus}
                                        onChange={item => {
                                            updateForm('maritalStatus', item.value);
                                            if (item.value === 'Never Married') {
                                                updateForm('hasChildren', 'No');
                                                updateForm('kids', []);
                                            }
                                        }}
                                        renderLeftIcon={() => <Icon as={Heart} size="sm" className="mr-2 text-cyan-500" />}
                                    />
                                </FormControl>

                                {/* Kids Conditional Section */}
                                {formData.maritalStatus !== 'Never Married' && formData.maritalStatus !== '' && (
                                    <VStack space="md" className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                                        <Heading size="sm" className="text-cyan-800">Children Information</Heading>

                                        <HStack space="lg">
                                            {['No', 'Yes'].map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    onPress={() => updateForm('hasChildren', opt)}
                                                    className="flex-row items-center space-x-2"
                                                >
                                                    <Box className={`w-5 h-5 rounded-full border-2 items-center justify-center ${formData.hasChildren === opt ? 'border-cyan-600' : 'border-slate-300'}`}>
                                                        {formData.hasChildren === opt && <Box className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                                                    </Box>
                                                    <Text className="font-medium text-slate-700">{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </HStack>

                                        {formData.hasChildren === 'Yes' && (
                                            <VStack space="md" className="mt-2">
                                                <FormControl>
                                                    <Input className="h-12 bg-white rounded-xl">
                                                        <InputField
                                                            placeholder="How many children?"
                                                            keyboardType="numeric"
                                                            value={formData.childrenCount}
                                                            onChangeText={handleChildrenCountChange}
                                                        />
                                                    </Input>
                                                </FormControl>

                                                {formData.kids.map((kid: any, index: number) => (
                                                    <Box key={index} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                                        <HStack className="mb-3 justify-between center">
                                                            <Text className="font-bold text-cyan-600">Child {index + 1}</Text>
                                                            <TouchableOpacity onPress={() => removeChild(index)}>
                                                                <Icon as={Trash2} size="xs" className="text-red-400" />
                                                            </TouchableOpacity>
                                                        </HStack>

                                                        <HStack space="md">
                                                            <Input className="flex-1 h-10 bg-slate-50 border-0 rounded-lg">
                                                                <InputField
                                                                    placeholder="Age"
                                                                    keyboardType="numeric"
                                                                    value={kid.age}
                                                                    onChangeText={(v) => updateKidDetail(index, 'age', v)}
                                                                />
                                                            </Input>
                                                            <Box className="flex-1">
                                                                <Select onValueChange={(v) => updateKidDetail(index, 'gender', v)} selectedValue={kid.gender}>
                                                                    <SelectTrigger className="h-10 bg-slate-50 border-0 rounded-lg">
                                                                        <SelectInput placeholder="Gender" />
                                                                    </SelectTrigger>
                                                                    <SelectPortal><SelectBackdrop /><SelectContent>
                                                                        <SelectItem label="Boy" value="Boy" /><SelectItem label="Girl" value="Girl" />
                                                                    </SelectContent></SelectPortal>
                                                                </Select>
                                                            </Box>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        )}
                                    </VStack>
                                )}
                            </VStack>
                        </VStack>
                    </ScrollView>
                </ModalBody>

                <ModalFooter className="p-6">
                    <Button onPress={handleSave} isDisabled={isSaving} className="w-full h-14 bg-cyan-600 rounded-2xl">
                        <ButtonText className="font-bold">Save Family Details</ButtonText>
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
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    }
};

export default EditFamilyModal;