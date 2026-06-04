import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Platform, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import {
  VStack, HStack, Text, Input, InputField, InputSlot,
  Box, Button, ButtonText,
  Heading,
  FormControl
} from '@/src/components/GluestackUI';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker'; // Used as the engine
import { Calendar, ChevronRight, Check, Hash, Briefcase, Building2, Phone, Mail, MapPin, Save } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

const StaffDetailsScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    staffId: '',
    department: '',
    designation: '',
    mobileNo: '',
    email: '',
    address: '',
    joiningDate: new Date(),
    joiningDateLabel: '',
  });
  const [errors, setErrors] = useState<any>({});
  // State to prevent Android auto-reopen loop
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);
  // const handleConfirm = (date: Date) => {
  //     //const formattedDate = date.toISOString().split('T')[0]; // Result: 2026-02-05
  //     setFormData({ ...formData, joiningDate: date }); 
  //   };

  const validate = () => {
    let newErrors: any = {};
    if (!formData.firstName) newErrors.firstName = "First name required";
    if (!formData.staffId) newErrors.staffId = "Staff ID required";
    if (!formData.mobileNo.match(/^[0-9]{10}$/)) newErrors.mobileNo = "10-digit number required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(true);
    } else {
      bottomSheetRef.current?.expand();
    }
  };

  const closeDatePicker = () => bottomSheetRef.current?.close();

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const onDateChange = (event: any, selectedDate?: Date) => {
    // 1. Android logic: Hide picker immediately after selection
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'android') {
        // 2. Android: Update label immediately since there's no "Confirm" button on a sheet
        const formatted = selectedDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, joiningDate: selectedDate, joiningDateLabel: formatted }));
      } else {
        // 3. iOS: Just update the date object, let user press "Set Date" button
        setFormData(prev => ({ ...prev, joiningDate: selectedDate }));
      }
    }
  };

  const handleIOSDateConfirm = () => {
    const formatted = formData.joiningDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, joiningDateLabel: formatted }));
    closeDatePicker();
  };
  const handleDateConfirm = () => {
    const formatted = formData.joiningDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, joiningDateLabel: formatted }));
    closeDatePicker();
  };

  const handleSave = () => {
    // Validation Logic here
    console.log("Submit Data:", formData);
  };
  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <VStack className="p-6 gap-8 pb-12">
            <VStack space="xs">
              <Heading size="2xl" className="text-slate-900">Staff Registration</Heading>
              <Text size="sm" className="text-slate-500">Enter official credentials.</Text>
            </VStack>


            <VStack className="gap-6">

              {/* --- Section 1: Official Identity --- */}
              <VStack className="gap-4">
                <HStack className="items-center space-x-2 border-b border-slate-200 pb-2">
                  <Icon as={Hash} size="sm" className="text-cyan-600" />
                  <Text className="font-bold text-slate-700 uppercase tracking-wider text-xs">Official Identity</Text>
                </HStack>

                <FormControl isInvalid={!!errors.staffId}>
                  <Input className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm shadow-slate-100">
                    <InputSlot className="pl-4"><Icon as={Hash} size="sm" className="text-slate-400" /></InputSlot>
                    <InputField
                      placeholder="Staff ID / Employee Code"
                      value={formData.staffId}
                      onChangeText={(v) => setFormData({ ...formData, staffId: v })}
                    />
                  </Input>
                </FormControl>

                <HStack space="md">
                  <Input className="h-14 rounded-2xl flex-1 bg-white border-slate-200 shadow-sm shadow-slate-100">
                    <InputField placeholder="First Name" onChangeText={(v) => setFormData({ ...formData, firstName: v })} />
                  </Input>
                  <Input className="h-14 rounded-2xl flex-1 bg-white border-slate-200 shadow-sm shadow-slate-100">
                    <InputField placeholder="Last Name" onChangeText={(v) => setFormData({ ...formData, lastName: v })} />
                  </Input>
                </HStack>
              </VStack>

              {/* --- Section 2: Role & Department --- */}
              <VStack className="gap-4">
                <HStack className="items-center space-x-2 border-b border-slate-200 pb-2">
                  <Icon as={Briefcase} size="sm" className="text-cyan-600" />
                  <Text className="font-bold text-slate-700 uppercase tracking-wider text-xs">Work Details</Text>
                </HStack>

                <Input className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm shadow-slate-100">
                  <InputSlot className="pl-4"><Icon as={Building2} size="sm" className="text-slate-400" /></InputSlot>
                  <InputField placeholder="Department" />
                </Input>

                {/* --- 2026 DATE PICKER TRIGGER --- */}
                <Pressable onPress={openDatePicker}>
                  <HStack
                    className="h-14 px-4 items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-100"
                  >
                    <HStack space="md" className="items-center">
                      <Icon as={Calendar} size="sm" className={formData.joiningDateLabel ? "text-cyan-600" : "text-slate-400"} />
                      <Text className={formData.joiningDateLabel ? "text-slate-900 font-medium" : "text-slate-400"}>
                        {formData.joiningDateLabel || "Select Joining Date"}
                      </Text>
                    </HStack>
                    <Icon as={ChevronRight} size="xs" className="text-slate-300" />
                  </HStack>
                </Pressable>
              </VStack>

              {/* --- Section 3: Communication --- */}
              <VStack className="gap-4">
                <HStack className="items-center space-x-2 border-b border-slate-200 pb-2">
                  <Icon as={Phone} size="sm" className="text-cyan-600" />
                  <Text className="font-bold text-slate-700 uppercase tracking-wider text-xs">Communication</Text>
                </HStack>

                <Input className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm shadow-slate-100">
                  <InputSlot className="pl-4"><Icon as={Phone} size="sm" className="text-slate-400" /></InputSlot>
                  <InputField placeholder="Mobile Number" keyboardType="phone-pad" />
                </Input>

                <Input className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm shadow-slate-100">
                  <InputSlot className="pl-4"><Icon as={Mail} size="sm" className="text-slate-400" /></InputSlot>
                  <InputField placeholder="Official Email" keyboardType="email-address" />
                </Input>
              </VStack>

            </VStack>

            <Button size="lg" className="h-16 rounded-2xl bg-cyan-600 mt-4">
              <ButtonText className="font-bold text-white">Register Staff</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ANDROID NATIVE PICKER (Only shows when triggered) */}
      {showAndroidPicker && (
        <DateTimePicker
          value={formData.joiningDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* iOS BOTTOM SHEET PICKER */}
      {Platform.OS === 'ios' && (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 40 }}
        >
          <VStack className="flex-1 p-6">
            <Text className="text-xl font-bold text-slate-800 mb-6">Pick Date</Text>
            <Box className="bg-slate-50 rounded-3xl py-2 mb-6">
              <DateTimePicker
                value={formData.joiningDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={onDateChange}
                style={{ height: 180 }}
              />
            </Box>
            <Button onPress={handleIOSDateConfirm} className="h-14 rounded-2xl bg-cyan-600">
              <ButtonText className="font-bold">Set Date</ButtonText>
            </Button>
          </VStack>
        </BottomSheet>
      )}
    </View>
  );
};

export default StaffDetailsScreen;

