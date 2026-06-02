import React, { useEffect, useState } from 'react';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, Box, Button, ButtonText, Center, Divider, Heading, HStack, Input, InputField, Select, SelectInput, SelectTrigger, Text, VStack } from '@/src/components/common/GluestackUI';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ChevronRight, Filter, Heart, Icon, MapPin, Search, Users2 } from '@/src/components/common/IconUI';
import { InputSlot } from '@/components/ui/input';

export const SearchActionsheet = ({ isOpen, onClose, initialFilters, onApply }: any) => {
    const [formData, setFormData] = useState({
        min_age: initialFilters?.min_age || 21,
        max_age: initialFilters?.max_age || 35,
        maritalStatus: initialFilters?.maritalStatus || 'Never Married',
        religion: initialFilters?.religion || 'Hindu',
        motherTongue: initialFilters?.motherTongue || 'Tamil',
        diet: initialFilters?.diet || 'Vegetarian',
        educationLevel: initialFilters?.educationLevel || 'Bachelors',
        employedWith: initialFilters?.employedWith || 'Private Sector',
        annualIncome: initialFilters?.annualIncome || 'Below 5 Lakhs',
        hasChildren: initialFilters?.hasChildren || false,
        wantsChildren: initialFilters?.wantsChildren || false,
        height: initialFilters?.height || 160,
        complexion: initialFilters?.complexion || 'Fair',
        bodyType: initialFilters?.bodyType || 'Average',
        drinkingHabits: initialFilters?.drinkingHabits || 'No',
        smokingHabits: initialFilters?.smokingHabits || 'No',
        country: initialFilters?.country || 'India',
        state: initialFilters?.state || 'Tamil Nadu',
        city: initialFilters?.city || 'Chennai',
        community: initialFilters?.community || 'BC',
        educationField: initialFilters?.educationField || 'Engineering',
        employedIn: initialFilters?.employedIn || 'Private Sector',
        employedAs: initialFilters?.employedAs || 'Engineer',
    });
    // 1. Use ONLY ONE state for the age range to keep things in sync
    const [ageRange, setAgeRange] = useState([
        initialFilters?.min_age || 21,
        initialFilters?.max_age || 35
    ]);

    // 2. Sync state if initialFilters changes (optional but good practice)
    useEffect(() => {
        if (isOpen) {
            setAgeRange([initialFilters.min_age, initialFilters.max_age]);
        }
    }, [isOpen]);
    const updateForm = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };
    // Handler for manual typing
    const handleManualInput = (val: string, index: number) => {
        const num = parseInt(val, 10);
        const newRange = [...ageRange];

        if (!isNaN(num)) {
            newRange[index] = num;
            setAgeRange(newRange);
        } else if (val === '') {
            newRange[index] = 0; // Allow clearing the input temporarily
            setAgeRange(newRange);
        }
    };
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    // Inside your component:
    const shakeOffset = useSharedValue(0);

    const triggerShake = () => {
        // Moves left and right quickly 5 times
        shakeOffset.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(10, { duration: 50 }), 5, true),
            withTiming(0, { duration: 50 })
        );
    };

    const animatedShakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeOffset.value }],
    }));

    return (
        <Actionsheet isOpen={isOpen} onClose={onClose}>
            <ActionsheetBackdrop />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ width: '100%' }}
            >
                <ActionsheetContent className="pb-8 bg-slate-50 border-t-0 rounded-t-[40px]">
                    <ActionsheetDragIndicatorWrapper className="mt-2">
                        <ActionsheetDragIndicator className="bg-slate-200 w-12" />
                    </ActionsheetDragIndicatorWrapper>

                    <ScrollView className="w-full" contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                        <VStack space="xl">

                            {/* Header Section */}
                            <HStack space="md" className="items-center mb-2">
                                <Box className="p-2.5 rounded-2xl bg-cyan-500 shadow-md shadow-cyan-200">
                                    <Icon as={Filter} size="sm" className="text-white" />
                                </Box>
                                <VStack>
                                    <Heading size="xl" className="tracking-tight text-typography-900">Search Filters</Heading>
                                    <Text size="xs" className="text-typography-500 font-medium italic">Finding your perfect match</Text>
                                </VStack>
                            </HStack>

                            {/* 1. Age Range Card */}
                            <Box className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
                                <HStack className="justify-between items-center mb-4">
                                    <HStack space="sm" items-center>
                                        <Icon as={Users2} size="sm" className="text-cyan-600" />
                                        <Text className="font-bold text-slate-800 text-base">Age Preference</Text>
                                    </HStack>

                                    {isKeyboardVisible && (
                                        <Pressable onPress={() => Keyboard.dismiss()} className="px-3 py-1 bg-cyan-50 rounded-lg">
                                            <Text className="text-cyan-600 font-bold text-xs uppercase">Done</Text>
                                        </Pressable>
                                    )}
                                </HStack>

                                <Animated.View style={animatedShakeStyle}>
                                    <HStack space="md" className="items-center justify-center">
                                        <VStack space="xs" className="items-center">
                                            <Text className="text-[10px] uppercase font-bold text-slate-400">Min</Text>
                                            <Input className={`w-24 h-14 rounded-2xl bg-slate-50 border-0 ${ageRange[0] < 18 ? 'border-2 border-red-400' : ''}`}>
                                                <InputField
                                                    className="text-center font-bold text-lg text-cyan-700"
                                                    keyboardType="number-pad"
                                                    value={ageRange[0].toString()}
                                                    onChangeText={(t) => {
                                                        const val = parseInt(t) || 0;
                                                        if (val > 0 && val < 18) triggerShake();
                                                        setAgeRange([val, ageRange[1]]);
                                                    }}
                                                />
                                            </Input>
                                        </VStack>

                                        <Box className="w-4 h-[2px] bg-slate-200 mt-5" />

                                        <VStack space="xs" className="items-center">
                                            <Text className="text-[10px] uppercase font-bold text-slate-400">Max</Text>
                                            <Input className="w-24 h-14 rounded-2xl bg-slate-50 border-0">
                                                <InputField
                                                    className="text-center font-bold text-lg text-cyan-700"
                                                    keyboardType="number-pad"
                                                    value={ageRange[1].toString()}
                                                    onChangeText={(t) => setAgeRange([ageRange[0], parseInt(t) || 0])}
                                                />
                                            </Input>
                                        </VStack>
                                    </HStack>
                                </Animated.View>
                            </Box>

                            {/* 2. Status & Children Card */}
                            <Box className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
                                <VStack space="lg">
                                    <HStack space="sm" items-center>
                                        <Icon as={Heart} size="sm" className="text-rose-500" />
                                        <Text className="font-bold text-slate-800 text-base">Status & Family</Text>
                                    </HStack>

                                    <HStack space="xs" className="flex-wrap">
                                        {['Never Married', 'Divorced', 'Widowed'].map((status) => {
                                            const isSelected = formData.maritalStatus === status;
                                            return (
                                                <Pressable
                                                    key={status}
                                                    onPress={() => updateForm('maritalStatus', status)}
                                                    className={`px-4 py-2.5 rounded-xl border ${isSelected ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-slate-50'}`}
                                                >
                                                    <Text size="sm" className={isSelected ? 'text-cyan-700 font-bold' : 'text-slate-500'}>{status}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </HStack>

                                    <HStack className="items-center justify-between bg-slate-50 p-2 pl-4 rounded-[20px] border border-slate-100">
                                        <Text size="sm" className="font-semibold text-slate-700">
                                            Include matches with children?
                                        </Text>

                                        <HStack className="bg-slate-200/50 rounded-[14px] p-1">
                                            {/* Option: YES */}
                                            <Pressable
                                                onPress={() => updateForm('hasChildren', true)}
                                                className={`px-5 py-2 rounded-[11px] ${formData.hasChildren === true
                                                        ? 'bg-white shadow-sm shadow-slate-400'
                                                        : 'bg-transparent'
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs font-bold ${formData.hasChildren === true ? 'text-cyan-600' : 'text-slate-500'
                                                        }`}
                                                >
                                                    Yes
                                                </Text>
                                            </Pressable>

                                            {/* Option: NO */}
                                            <Pressable
                                                onPress={() => updateForm('hasChildren', false)}
                                                className={`px-5 py-2 rounded-[11px] ${formData.hasChildren === false
                                                        ? 'bg-white shadow-sm shadow-slate-400'
                                                        : 'bg-transparent'
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs font-bold ${formData.hasChildren === false ? 'text-cyan-600' : 'text-slate-500'
                                                        }`}
                                                >
                                                    No
                                                </Text>
                                            </Pressable>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* 3. Location & Background Card */}
                            <Box className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100">
                                <VStack space="lg">
                                    <HStack space="sm" items-center>
                                        <Icon as={MapPin} size="sm" className="text-emerald-500" />
                                        <Text className="font-bold text-slate-800 text-base">Background</Text>
                                    </HStack>

                                    <HStack space="md">
                                        <VStack className="flex-1" space="xs">
                                            <Select>
                                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 px-4">
                                                    <SelectInput placeholder="Religion" className="font-bold text-slate-700" />
                                                </SelectTrigger>
                                            </Select>
                                        </VStack>
                                        <VStack className="flex-1" space="xs">
                                            <Select>
                                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 px-4">
                                                    <SelectInput placeholder="Language" className="font-bold text-slate-700" />
                                                </SelectTrigger>
                                            </Select>
                                        </VStack>
                                    </HStack>

                                    <Input className="h-14 rounded-2xl bg-slate-50 border-0 px-4">
                                        <InputSlot className="pr-3"><Icon as={Search} size="sm" className="text-slate-400" /></InputSlot>
                                        <InputField placeholder="Search Community" className="font-medium" />
                                    </Input>

                                    <Input className="h-14 rounded-2xl bg-slate-50 border-0 px-4">
                                        <InputSlot className="pr-3"><Icon as={MapPin} size="sm" className="text-slate-400" /></InputSlot>
                                        <InputField placeholder="Enter City" className="font-medium" />
                                    </Input>
                                </VStack>
                            </Box>

                            {/* Final CTA */}
                            <Button
                                className="w-full rounded-[24px] h-16 bg-cyan-500 shadow-xl shadow-cyan-200 mt-4 overflow-hidden"
                                onPress={() => onApply({ min_age: ageRange[0], max_age: ageRange[1] })}
                            >
                                <HStack space="md" items-center>
                                    <ButtonText className="text-white font-bold text-xl">Apply Filters</ButtonText>
                                    <Icon as={ChevronRight} size="sm" className="text-white" />
                                </HStack>
                            </Button>
                        </VStack>
                    </ScrollView>
                </ActionsheetContent>
            </KeyboardAvoidingView>
        </Actionsheet>
    );
};