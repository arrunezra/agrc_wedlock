import React, { useState } from 'react';
import { Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
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
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Button,
    ButtonText,
    Spinner,
    ScrollView,
} from '@/src/components/common/GluestackUI';
import { Icon } from '@/components/ui/icon';
import { Check, MapPin, Navigation, Users2, X } from '@/src/components/common/IconUI';

const { height } = Dimensions.get('window');

const EditLocationModal = ({
    isOpen,
    onClose,
    formData,
    updateForm,
    STATES,
    cities,
    isLoading,
    fetchCities,
    isCasteNoBar,
    setIsCasteNoBar,
    validationTriggered,
    handleSave,
    isSaving
}: any) => {
    const [isFocus, setIsFocus] = useState(false);
    fetchCities = fetchCities || [];
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalBackdrop />
            <ModalContent className="bg-white flex-1">

                {/* Header */}
                <ModalHeader className="px-6 pt-10 pb-0 justify-end border-0">
                    <ModalCloseButton className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Icon as={X} size="md" className="text-typography-900" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="flex-1 p-0">
                    <ScrollView
                        className="px-6 py-4"
                        contentContainerStyle={{ paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <VStack space="xl">

                            {/* Futuristic Icon Section */}
                            <VStack className="items-center mb-8">
                                <Box className="relative w-20 h-20 items-center justify-center">
                                    <Box className="absolute w-16 h-16 rounded-full bg-rose-500 blur-2xl opacity-20" />
                                    <Box
                                        className="w-16 h-16 rounded-[22px] items-center justify-center bg-rose-50 border-b-4 border-rose-200 shadow-sm"
                                        style={{ transform: [{ rotate: '-6deg' }] }}
                                    >
                                        <Icon
                                            as={MapPin}
                                            size='lg'
                                            className="text-rose-600"
                                            style={{ transform: [{ rotate: '6deg' }] }}
                                        />
                                    </Box>
                                </Box>
                                <Heading size="xl" className="mt-4 tracking-tight text-typography-900">Location</Heading>
                                <Text size="xs" className="text-typography-500 text-center mt-1 px-10">
                                    Update your current residence and community preferences.
                                </Text>
                            </VStack>

                            <VStack space="lg">
                                {/* STATE DROPDOWN */}
                                <FormControl isInvalid={validationTriggered && !formData.state}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText size="sm" className="font-bold">State</FormControlLabelText>
                                    </FormControlLabel>
                                    <Dropdown
                                        style={[
                                            styles.dropdown,
                                            isFocus && { borderColor: '#E11D48' },
                                            (validationTriggered && !formData.state) && { borderColor: '#EF4444' }
                                        ]}
                                        data={STATES || []}
                                        labelField="StateName"
                                        valueField="StateCode"
                                        placeholder="Select State"
                                        selectedTextStyle={styles.selectedText}
                                        placeholderStyle={styles.placeholder}
                                        value={formData.state}
                                        onFocus={() => setIsFocus(true)}
                                        onBlur={() => setIsFocus(false)}
                                        onChange={item => {
                                            updateForm('state', item.StateCode);
                                            updateForm('city', '');
                                            fetchCities(item.StateCode);
                                        }}
                                        renderLeftIcon={() => <Icon as={MapPin} size="sm" className="mr-2 text-rose-500" />}
                                    />
                                </FormControl>

                                {/* CITY DROPDOWN */}
                                {formData.state && (
                                    <FormControl isInvalid={validationTriggered && !formData.city}>
                                        <FormControlLabel className="mb-2">
                                            <FormControlLabelText size="sm" className="font-bold">City</FormControlLabelText>
                                        </FormControlLabel>
                                        <Dropdown
                                            style={styles.dropdown}
                                            mode="modal"
                                            data={cities || []}
                                            labelField="CityName"
                                            valueField="CityCode"
                                            placeholder={isLoading ? "Loading..." : "Select City"}
                                            selectedTextStyle={styles.selectedText}
                                            placeholderStyle={styles.placeholder}
                                            value={formData.city}
                                            onChange={item => updateForm('city', item.CityCode)}
                                            renderLeftIcon={() => isLoading
                                                ? <ActivityIndicator size="small" color="#E11D48" className="mr-2" />
                                                : <Icon as={Navigation} size="sm" className="mr-2 text-rose-500" />
                                            }
                                        />
                                    </FormControl>
                                )}

                                {/* SUB COMMUNITY DROPDOWN */}
                                <FormControl isInvalid={validationTriggered && !formData.sub_community}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText size="sm" className="font-bold">Sub Community</FormControlLabelText>
                                    </FormControlLabel>
                                    <Dropdown
                                        mode="modal"
                                        style={styles.dropdown}
                                        data={[]} // Replace with your SUB_COMMUNITIES constant
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Sub Community"
                                        selectedTextStyle={styles.selectedText}
                                        placeholderStyle={styles.placeholder}
                                        value={formData?.sub_community}
                                        onChange={item => updateForm('sub_community', item.value)}
                                        renderLeftIcon={() => <Icon as={Users2} size="sm" className="mr-2 text-rose-500" />}
                                    />
                                </FormControl>

                                {/* CASTE NO BAR CHECKBOX CARD */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setIsCasteNoBar(!isCasteNoBar)}
                                    className={`mt-2 p-4 rounded-2xl border-2 flex-row items-center ${isCasteNoBar ? 'border-rose-500 bg-rose-50/50' : 'border-slate-100 bg-slate-50/50'
                                        }`}
                                >
                                    <Box className={`w-6 h-6 rounded-lg items-center justify-center border-2 mr-3 ${isCasteNoBar ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-200'
                                        }`}>
                                        {isCasteNoBar && <Icon as={Check} size='lg' className="text-white" />}
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text className={`text-sm font-bold ${isCasteNoBar ? 'text-rose-700' : 'text-typography-900'}`}>
                                            Caste No Bar
                                        </Text>
                                        <Text size="xs" className="text-typography-500">
                                            Open to partner matches from all communities
                                        </Text>
                                    </VStack>
                                </TouchableOpacity>
                            </VStack>
                        </VStack>
                    </ScrollView>
                </ModalBody>

                <ModalFooter className="p-6 border-t border-outline-100 bg-white">
                    <HStack className="w-full gap-3">
                        <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl h-14 border-outline-300">
                            <ButtonText className="text-typography-600 font-bold">Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={handleSave}
                            isDisabled={isSaving}
                            className="flex-1 rounded-2xl h-14 bg-rose-600 shadow-lg shadow-rose-200"
                        >
                            {isSaving ? <Spinner color="white" /> : <ButtonText className="text-white font-bold">Save Changes</ButtonText>}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const styles = {
    dropdown: {
        height: 60,
        borderRadius: 20,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectedText: {
        fontSize: 15,
        color: '#1E293B',
    },
    placeholder: {
        fontSize: 15,
        color: '#94A3B8',
    }
};

export default EditLocationModal;