import React, { useEffect, useState } from 'react';
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Heading, Button, ButtonText, VStack, Text, Box,
    HStack,
    Checkbox,
    CheckboxIndicator,
    CheckboxLabel,
    CheckboxIcon,
    RadioGroup,
    RadioLabel,
    Input,
    InputSlot,
    InputField,
    ScrollView,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectContent,
    SelectBackdrop,
    SelectItem
} from "@/src/components/GluestackUI";
import { CheckIcon, ChevronDownIcon, CircleIcon, CloseIcon, Icon, SearchIcon } from '@/components/ui/icon';
import { Slider } from '@miblanchard/react-native-slider';
import { Check, ShieldCheckIcon } from 'lucide-react-native';
import { Radio, RadioIcon, RadioIndicator } from '@/components/ui/radio';

const EditPreferenceModal = ({ isOpen, onClose, fieldType, currentData, onSave, lookups }: any) => {
    //console.log('lookups', lookups)
    // 1. Declare ALL hooks at the top level
    const [tempValue, setTempValue] = useState<any>(null);
    const [search, setSearch] = useState(''); // Move search state here
    // 2. Synchronize the local state whenever the modal opens or the field changes
    useEffect(() => {
        if (isOpen) {
            setSearch(''); // Reset search when opening

            if (fieldType === 'age') {
                let min_age = currentData.min_age == 'all' ? 18 : currentData.min_age;
                let max_age = currentData.max_age == 'all' ? 50 : currentData.max_age;

                setTempValue([min_age, max_age]);
            }
            else if (fieldType === 'height') {
                let min_height = currentData.min_height == 'all' ? 130 : currentData.min_height;
                let max_height = currentData.max_height == 'all' ? 230 : currentData.max_height;

                setTempValue([parseFloat(min_height), parseFloat(max_height)]);
            }
            else if (fieldType === 'marital') {
                setTempValue(currentData.marital_status || []);
            }
            else if (fieldType === 'community') {
                setTempValue(currentData.communities || []);
            }
            else if (fieldType === 'children') {
                setTempValue(currentData.children || 'Open to All');
            }
            else if (fieldType === 'qualification') {
                setTempValue(Array.isArray(currentData?.qualifications) ? currentData.qualifications : []);
            }
            else if (fieldType === 'mother_tongues') {
                setTempValue(Array.isArray(currentData?.mother_tongues) ? currentData.mother_tongues : []);
            }

            else if (fieldType === 'income') {
                const initialMode = (currentData.min_income || currentData.max_income) ? 'specify' : 'all';
                setTempValue({
                    mode: initialMode,
                    min: currentData.min_income || 'below 1 lakh',
                    max: currentData.max_income || 'above 1 crore',
                    showHidden: currentData.show_hidden_income ?? true
                });
            }
            // FIX: Ensure country, state, and city are treated as arrays for the MultiSelect UI
            else if (['country', 'state', 'city'].includes(fieldType)) {
                const val = currentData[fieldType];
                setTempValue(Array.isArray(val) ? val : (val ? [val] : []));
            }
            else {
                // Safely default to an empty array instead of the whole currentData object
                setTempValue([]);
            }
        }
    }, [isOpen, fieldType, currentData]);

    const handleApply = () => {
        let updatedData = { ...currentData };

        switch (fieldType) {
            case 'age':
                updatedData.min_age = tempValue[0];
                updatedData.max_age = tempValue[1];
                break;

            case 'height':
                updatedData.min_height = tempValue[0].toString();
                updatedData.max_height = tempValue[1].toString();
                break;

            case 'marital':
                updatedData.marital_status = tempValue;
                break;

            case 'community':

                updatedData.communities = tempValue;
                break;

            case 'qualification':
                updatedData.qualifications = tempValue;
                break;

            case 'income':
                if (tempValue.mode === 'all') {
                    updatedData.min_income = '';
                    updatedData.max_income = '';
                } else {
                    updatedData.min_income = tempValue.min;
                    updatedData.max_income = tempValue.max;
                }
                updatedData.show_hidden_income = tempValue.showHidden;
                break;

            case 'country': updatedData[fieldType] = tempValue;
                break;
            case 'state': updatedData[fieldType] = tempValue; break;
            case 'city': updatedData[fieldType] = tempValue; break;
            case 'mother_tongues': updatedData[fieldType] = tempValue; break;

            case 'children':
                // tempValue is a single string
                console.log('children tempValue', tempValue)
                let convertText = '';
                if (tempValue === 'Yes, if they live separate') {
                    convertText = "Yes";
                } else if (tempValue === 'Open to All') {
                    convertText = "";
                } else convertText = tempValue;
                updatedData.children = convertText
                break;
        }
        // Call your parent save function
        onSave(updatedData);
        onClose();
    };
    // const handleCheckBoxToggle = (value: string) => {
    //     if (value === 'all') {
    //         setTempValue([]); // Empty array represents "Open to All"
    //         return;
    //     }

    //     let newList = [...tempValue];
    //     if (newList.includes(value)) {
    //         newList = newList.filter(i => i !== value);
    //     } else {
    //         newList.push(value);
    //     }
    //     setTempValue(newList);
    // };
    const handleCheckBoxToggle = (value: string) => {
        setTempValue((prev: any) => {
            const currentSelected = Array.isArray(prev) ? prev : [];

            // 1. User clicked "Open to All"
            if (value === 'all' || value === 'Open to All') {
                // Clear everything and only keep 'all' (or return [] for empty)
                return ['all'];
            }

            // 2. User clicked a specific item (e.g., 'vmt')
            let updatedList;
            if (currentSelected.includes(value)) {
                // Uncheck: Remove the item
                updatedList = currentSelected.filter((item: string) => item !== value);
            } else {
                // Check: Add the item AND remove 'all' if it was there
                updatedList = [...currentSelected.filter(item => item !== 'all'), value];
            }

            // 3. Final Check: If the list is now empty, default it back to 'all'
            return updatedList.length === 0 ? ['all'] : updatedList;
        });
    };
    // const handleCheckBoxToggle = (value: string) => {
    //     console.log('handleCheckBoxToggle', value)

    //     setTempValue((prev: any) => {
    //         // Ensure prev is an array to avoid .includes or .filter crashes
    //         const currentSelected = Array.isArray(prev) ? prev : [];
    //         if (value === 'all') {
    //             // If user clicks "Open to All", clear everything else
    //             return [];
    //         }

    //         // If user selects a specific item:
    //         if (currentSelected.includes(value)) {
    //             // 1. If it's already there, remove it (Uncheck)
    //             return currentSelected.filter((item: string) => item !== value);
    //         } else {
    //             return [...currentSelected, value];
    //         }
    //     });
    // };

    const renderAgeSlider = () => (
        <VStack space="xl" className="py-4">
            <Text size="md" className="text-slate-500 leading-6">
                Select a minimum age range of 3 years to get relevant matches
            </Text>

            <VStack space="xs">
                <Text size="xs" className="text-slate-400 font-medium uppercase">Selected age range</Text>
                <Heading size="xl" className="text-slate-900 font-bold">
                    {Math.floor(tempValue[0])} to {Math.floor(tempValue[1])}yrs
                </Heading>
            </VStack>

            <Box className="mt-10 px-2">
                <Slider
                    value={tempValue}
                    onValueChange={(val: any) => setTempValue(val)}
                    minimumValue={18}
                    maximumValue={50}
                    step={1}
                    minimumTrackTintColor="#008B9F"
                    maximumTrackTintColor="#E2E8F0"
                    thumbTintColor="#008B9F"
                    trackStyle={{ height: 4, borderRadius: 2 }}
                    thumbStyle={{ height: 26, width: 26, borderRadius: 13, backgroundColor: '#008B9F' }}
                    renderAboveThumbComponent={(index) => (
                        <Box className="bg-[#008B9F] px-2 py-1 rounded-md mb-2 items-center justify-center min-w-[35px]">
                            <Text className="text-white font-bold text-xs">
                                {Math.floor(tempValue[index])}
                            </Text>
                            {/* Downward Arrow */}
                            <Box
                                style={{
                                    position: 'absolute',
                                    bottom: -4,
                                    width: 8,
                                    height: 8,
                                    backgroundColor: '#008B9F',
                                    transform: [{ rotate: '45deg' }]
                                }}
                            />
                        </Box>
                    )}
                />
                <HStack className="justify-between mt-2">
                    <Text size="xs" className="text-slate-400 font-bold">18yrs</Text>
                    <Text size="xs" className="text-slate-400 font-bold">50yrs</Text>
                </HStack>
            </Box>
        </VStack>
    );
    const cmToFeetInch = (cm: number) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}' ${inches}"`;
    };

    const renderHeight = () => {

        return (
            <VStack space="xl" className="py-4">
                <Text size="md" className="text-slate-500 leading-6">
                    Select a minimum height range of 6 inches to get relevant matches
                </Text>

                <VStack space="xs">
                    <Text size="xs" className="text-slate-400 font-medium uppercase">
                        Selected height range (ft/inch)
                    </Text>
                    <Heading size="xl" className="text-slate-900 font-bold">
                        {cmToFeetInch(tempValue[0])} to {cmToFeetInch(tempValue[1])}
                    </Heading>
                </VStack>

                <Box className="mt-10 px-2">
                    <Slider
                        value={tempValue}
                        onValueChange={(val: any) => setTempValue(val)}
                        minimumValue={135} // approx 4' 5"
                        maximumValue={213} // approx 7' 0"
                        step={1}
                        minimumTrackTintColor="#008B9F"
                        maximumTrackTintColor="#E2E8F0"
                        thumbTintColor="#008B9F"
                        trackStyle={{ height: 4, borderRadius: 2 }}
                        thumbStyle={{ height: 26, width: 26, borderRadius: 13 }}
                        renderAboveThumbComponent={(index) => (
                            <Box className="bg-[#008B9F] px-2 py-1 rounded-md mb-2 items-center justify-center min-w-[45px]">
                                <Text className="text-white font-bold text-[10px]">
                                    {cmToFeetInch(tempValue[index])}
                                </Text>
                                <Box className="absolute -bottom-1 w-2 h-2 bg-[#008B9F] rotate-45" />
                            </Box>
                        )}
                    />
                    <HStack className="justify-between mt-2">
                        <Text size="xs" className="text-slate-400 font-bold">4' 5"</Text>
                        <Text size="xs" className="text-slate-400 font-bold">7' 0"</Text>
                    </HStack>
                </Box>
            </VStack>
        );
    }
    const renderMaritalStatus = () => {
        const isOpenToAll = !tempValue || tempValue.length === 0 || (tempValue.length === 1 && tempValue[0] === 'all');
        return (
            <VStack space="lg" className="py-2">
                {/* Top Badge/Selection Display */}
                <Box className="flex-row flex-wrap gap-2 mb-2">
                    <Box className={`px-4 py-1.5 rounded-full border ${isOpenToAll ? 'bg-cyan-50 border-cyan-500' : 'bg-slate-50 border-slate-200'}`}>
                        <Text size="xs" className={isOpenToAll ? 'text-cyan-600 font-bold' : 'text-slate-500'}>
                            Open to All
                        </Text>
                    </Box>
                </Box>

                <Text size="sm" className="text-slate-400 font-bold mb-2">Preferences</Text>

                <VStack space="xl">
                    {/* Open to All Checkbox */}
                    <Checkbox
                        value="all"
                        isChecked={isOpenToAll}
                        onChange={() => handleCheckBoxToggle('all')}
                        size="lg"
                        aria-label="all"
                    >
                        <CheckboxIndicator className="rounded-md border-slate-300 data-[checked=true]:bg-cyan-600 data-[checked=true]:border-cyan-600">
                            <CheckboxIcon as={Check} className="text-white" />
                        </CheckboxIndicator>
                        <CheckboxLabel className="ml-3 text-slate-700 font-medium">Open to All</CheckboxLabel>
                    </Checkbox>

                    {lookups?.marital_status.map((opt: any, index: number) => (
                        <Checkbox
                            key={index}
                            value={opt.value}
                            isChecked={tempValue?.includes(opt.value)}
                            onChange={() => handleCheckBoxToggle(opt.value)}
                            size="lg"
                            aria-label={opt.label}
                        >
                            <CheckboxIndicator className="rounded-md border-slate-300 data-[checked=true]:bg-cyan-600 data-[checked=true]:border-cyan-600">
                                <CheckboxIcon as={Check} className="text-white" />
                            </CheckboxIndicator>
                            <CheckboxLabel className="ml-3 text-slate-700 font-medium">{opt.label}</CheckboxLabel>
                        </Checkbox>
                    ))}
                </VStack>
            </VStack>
        );
    };

    const renderChildren = () => {
        return (
            <VStack space="3xl" className="py-4">
                <RadioGroup value={tempValue} onChange={setTempValue}>
                    <VStack space="2xl">
                        {['Open to All', 'Yes, if they live separate', 'No'].map((option) => (
                            <Radio key={option} value={option} size="md">
                                <RadioIndicator className="border-slate-300 data-[checked=true]:border-cyan-600">
                                    <RadioIcon as={CircleIcon} className="fill-cyan-600 text-cyan-600" />
                                </RadioIndicator>
                                <RadioLabel className="ml-3 text-slate-700">{option}</RadioLabel>
                            </Radio>
                        ))}
                    </VStack>
                </RadioGroup>
            </VStack>
        );
    };
    const renderCommunity = () => {
        const isOpenToAll = !tempValue || tempValue.length === 0 || (tempValue.length === 1 && tempValue[0] === 'all');

        return (
            <VStack space="md" className="flex-1">
                {/* Search Input remains the same */}

                <ScrollView className="max-h-[400px]">
                    <VStack space="lg" className="py-4">
                        {/* Updated Open to All Checkbox */}
                        <Checkbox
                            value="all"
                            isChecked={isOpenToAll}
                            onChange={() => handleCheckBoxToggle('all')}
                            size="lg"
                            aria-label="all"
                        >
                            <CheckboxIndicator className="rounded-md data-[checked=true]:bg-cyan-600 border-slate-300">
                                <CheckboxIcon as={Check} size="lg" />
                            </CheckboxIndicator>
                            <CheckboxLabel className="ml-3" size="lg">Open to All</CheckboxLabel>
                        </Checkbox>

                        {lookups?.sub_community
                            ?.filter((item: any) =>
                                item.label.toLowerCase().includes(search.toLowerCase())
                            )
                            .map((opt: any, index: number) => {
                                const showHeader = index === 0 && !search;

                                return (
                                    <VStack key={'Vs' + index} space="md">
                                        {showHeader && (
                                            <Text size="md" className="text-rose-600 font-bold uppercase mt-4">
                                                Christian
                                            </Text>
                                        )}

                                        <Checkbox
                                            key={index}
                                            value={opt.value}
                                            // Individual items are checked based on presence in array
                                            isChecked={tempValue?.includes(opt.value)}
                                            onChange={() => handleCheckBoxToggle(opt.value)}
                                            aria-label={opt.label}
                                            size="lg"
                                        >
                                            <CheckboxIndicator className="rounded-md border-slate-300 data-[checked=true]:bg-cyan-600 data-[checked=true]:border-cyan-600">
                                                <CheckboxIcon as={Check} size="lg" className="text-white" />
                                            </CheckboxIndicator>
                                            <CheckboxLabel className="ml-3 text-slate-700 font-medium" size="lg">
                                                {opt.label}
                                            </CheckboxLabel>
                                        </Checkbox>
                                    </VStack>
                                );
                            })
                        }
                    </VStack>
                </ScrollView>
            </VStack>
        );
    };

    const renderQualification = () => {


        // The main list of qualifications
        const qualifications = [
            { label: 'Doctorate', key: 'doctorate' },
            { label: 'Master', key: 'master' },
            { label: 'Bachelor / Undergraduate', key: 'bachelor' }, // Added as requested
            { label: 'High School and below', key: 'high_school' }
        ];
        return (
            <VStack space="xl" className="py-2">
                {/* Top "Open to All" Badge */}
                <HStack>
                    <Box className={`px-4 py-1.5 rounded-full border ${tempValue.length === 0 ? 'bg-cyan-50 border-cyan-500' : 'bg-white border-slate-200'}`}>
                        <Text size="xs" className={tempValue.length === 0 ? 'text-cyan-600 font-bold' : 'text-slate-500'}>
                            Open to All
                        </Text>
                    </Box>
                </HStack>

                <Text size="sm" className="text-slate-400 font-bold uppercase mt-2">Qualifications</Text>

                <ScrollView className="max-h-[300px]">
                    <VStack space="xl">
                        {/* Main Open to All Checkbox */}
                        <Checkbox isChecked={tempValue.length === 0} onChange={() => handleCheckBoxToggle('all')} value="all">
                            <CheckboxIndicator className="rounded-md data-[checked=true]:bg-cyan-600 border-slate-300">
                                <CheckboxIcon as={Check} />
                            </CheckboxIndicator>
                            <CheckboxLabel className="ml-3 text-slate-700 font-medium">Open to All</CheckboxLabel>
                        </Checkbox>

                        {qualifications.map((item) => (
                            <Checkbox
                                key={item.key}
                                isChecked={tempValue?.includes(item.key)}
                                onChange={() => handleCheckBoxToggle(item.key)}
                                value={item.key}
                            >
                                <CheckboxIndicator className="rounded-md data-[checked=true]:bg-cyan-600 border-slate-300">
                                    <CheckboxIcon as={Check} />
                                </CheckboxIndicator>
                                <CheckboxLabel className="ml-3 text-slate-700 font-medium">{item.label}</CheckboxLabel>
                            </Checkbox>
                        ))}
                    </VStack>
                </ScrollView>
            </VStack>
        );
    };

    const renderAnnualIncome = () => {
        const incomeOptions = [
            'below 1 lakh', '1 lakh', '2 lakh', '3 lakh', '5 lakh',
            '10 lakh', '20 lakh', '50 lakh', '75 lakh', '1 crore', 'above 1 crore'
        ];

        return (
            <VStack space="xl" className="py-4">
                <RadioGroup
                    value={tempValue.mode}
                    onChange={(val) => setTempValue({ ...tempValue, mode: val })}
                >
                    <VStack space="2xl">
                        {/* Open to All Option */}
                        <Radio value="all" size="md">
                            <RadioIndicator className="border-slate-300 data-[checked=true]:border-cyan-600">
                                <RadioIcon as={CircleIcon} className="fill-cyan-600 text-cyan-600" />
                            </RadioIndicator>
                            <RadioLabel className="ml-3 text-slate-700 font-medium">Open to All</RadioLabel>
                        </Radio>

                        {/* Specify Range Option */}
                        <Radio value="specify" size="md">
                            <RadioIndicator className="border-slate-300 data-[checked=true]:border-cyan-600">
                                <RadioIcon as={CircleIcon} className="fill-cyan-600 text-cyan-600" />
                            </RadioIndicator>
                            <RadioLabel className="ml-3 text-slate-700 font-medium">Specify an Income range</RadioLabel>
                        </Radio>
                    </VStack>
                </RadioGroup>

                {tempValue.mode === 'specify' && (
                    <VStack space="md" className="mt-4 px-1">
                        <Text size="sm" className="text-cyan-700 font-bold">Set Income Range</Text>

                        <HStack space="md" className='item-center'>
                            {/* Minimum Income Select */}
                            <Select
                                className="flex-1"
                                selectedValue={tempValue.min}
                                onValueChange={(val) => setTempValue({ ...tempValue, min: val })}
                            >
                                <SelectTrigger className="border-0 border-b border-slate-200 rounded-none px-0">
                                    <SelectInput placeholder="Min Income" />
                                    <SelectIcon as={ChevronDownIcon} className="mr-2" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        {incomeOptions.map(opt => <SelectItem key={opt} label={opt} value={opt} />)}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>

                            <Text size="sm" className="text-slate-400">to</Text>

                            {/* Maximum Income Select */}
                            <Select
                                className="flex-1"
                                selectedValue={tempValue.max}
                                onValueChange={(val) => setTempValue({ ...tempValue, max: val })}
                            >
                                <SelectTrigger className="border-0 border-b border-slate-200 rounded-none px-0">
                                    <SelectInput placeholder="Max Income" />
                                    <SelectIcon as={ChevronDownIcon} className="mr-2" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        {incomeOptions.map(opt => <SelectItem key={opt} label={opt} value={opt} />)}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </HStack>

                        {/* Hidden Income Toggle */}
                        <HStack space="md" className="mt-6 items-start">
                            <Checkbox
                                size="sm"
                                value="hidden"
                                isChecked={tempValue.showHidden}
                                onChange={() => setTempValue({ ...tempValue, showHidden: !tempValue.showHidden })}
                            >
                                <CheckboxIndicator className="rounded-md data-[checked=true]:bg-cyan-600 border-slate-300">
                                    <CheckboxIcon as={CheckIcon} />
                                </CheckboxIndicator>
                            </Checkbox>
                            <Text size="xs" className="text-slate-500 leading-4 flex-1">
                                Show profiles who fit in my range and have hidden their income
                            </Text>
                        </HStack>
                    </VStack>
                )}
            </VStack>
        );
    };

    const renderCountry = (type: string) => {
        //const isOpenToAll = tempValue?.length === 0;
        const isOpenToAll = !tempValue || tempValue.length === 0 || (tempValue.length === 1 && tempValue[0] === 'all');

        var colloction = [];
        if (type === 'country') colloction = lookups?.country;
        else if (type === 'state') colloction = lookups?.state;
        else if (type === 'city') colloction = lookups?.city;
        else if (type === 'mother_tongues') colloction = lookups?.mother_tongue;

        return (
            <VStack space="lg" className="py-2">
                {/* 1. Top Section - Keep these static */}
                <Box className="flex-row flex-wrap gap-2 mb-2">
                    <Box className={`px-4 py-1.5 rounded-full border ${isOpenToAll ? 'bg-cyan-50 border-cyan-500' : 'bg-slate-50 border-slate-200'}`}>
                        <Text size="xs" className={isOpenToAll ? 'text-cyan-600 font-bold' : 'text-slate-500'}>
                            Open to All
                        </Text>
                    </Box>
                </Box>

                <Text size="sm" className="text-slate-400 font-bold mb-2">Preferences</Text>

                {/* 2. Scrollable Section - Wrap the list here */}
                <ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
                    <VStack space="xl" className="pb-4">
                        {/* Open to All Checkbox */}
                        <Checkbox
                            value="Open to All"
                            isChecked={isOpenToAll}
                            onChange={() => handleCheckBoxToggle('all')}
                            size="lg"
                            aria-label="Open to All"
                        >
                            <CheckboxIndicator className="rounded-md border-slate-300 data-[checked=true]:bg-cyan-600 data-[checked=true]:border-cyan-600">
                                <CheckboxIcon as={Check} className="text-white" />
                            </CheckboxIndicator>
                            <CheckboxLabel className="ml-3 text-slate-700 font-medium">Open to All</CheckboxLabel>
                        </Checkbox>

                        {/* Dynamic Collection */}
                        {colloction?.map((opt: any, index: number) => (
                            <Checkbox
                                key={index}
                                value={opt.value}
                                isChecked={tempValue?.includes(opt?.value)}
                                onChange={() => handleCheckBoxToggle(opt?.value)}
                                size="lg"
                                aria-label={opt.label}
                            >
                                <CheckboxIndicator className="rounded-md border-slate-300 data-[checked=true]:bg-cyan-600 data-[checked=true]:border-cyan-600">
                                    <CheckboxIcon as={Check} className="text-white" />
                                </CheckboxIndicator>
                                <CheckboxLabel className="ml-3 text-slate-700 font-medium">{opt.label}</CheckboxLabel>
                            </Checkbox>
                        ))}
                    </VStack>
                </ScrollView>
            </VStack>
        );
    };


    // Logic to render different inputs based on the field clicked
    const renderFieldInput = () => {
        if (tempValue === null) return null;
        switch (fieldType) {
            case 'marital': return renderMaritalStatus();
            case 'age': return renderAgeSlider();
            case 'height': return renderHeight();
            case 'children': return renderChildren();
            case 'community': return renderCommunity();
            case 'qualification': return renderQualification();
            case 'income': return renderAnnualIncome();
            case 'country': return renderCountry('country');
            case 'state': return renderCountry('state');
            case 'city': return renderCountry('city');
            case 'mother_tongues': return renderCountry('mother_tongues');
            default: return <Text>Loading settings...</Text>;
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalBackdrop />
            <ModalContent className="rounded-t-3xl pb-6">
                <ModalHeader className="border-b border-slate-100 p-4">
                    <Heading size="md">Edit {fieldType?.charAt(0).toUpperCase() + fieldType?.slice(1)}</Heading>
                    <Button variant="link" onPress={onClose} className="p-0">
                        <Icon as={CloseIcon} />
                    </Button>
                </ModalHeader>

                <ModalBody className="py-6 px-4">
                    {renderFieldInput()}
                </ModalBody>

                <ModalFooter>
                    <Button
                        className="w-full bg-rose-600 rounded-xl h-12"
                        onPress={() => handleApply()}
                    >
                        <ButtonText>Submit </ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditPreferenceModal;