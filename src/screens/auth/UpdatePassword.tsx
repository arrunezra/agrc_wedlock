import React, { useState, useRef } from 'react';
import { Animated, ScrollView, TouchableOpacity } from 'react-native';
import {
    Center, Box, VStack, Text, Heading,
    FormControl, FormControlLabel, FormControlLabelText,
    Input, InputField, InputSlot,
    Button, ButtonText,
    FormControlError, FormControlErrorText,
    HStack,
    Image,
} from '@/src/components/common/GluestackUI';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Icon, User } from '@/src/components/common/IconUI';
import { useAuth } from '@/src/context/AuthContext';

const UpdatePassword = ({ navigation, route }: any) => {
    // Assuming 'identifier' is passed via route params (e.g., "user@email.com")
    const identifier = route?.params?.identifier || "user@example.com";
    const { isLoading, isAuthenticated, userRole, user, logout } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]).start();
    };

    const handleUpdate = () => {
        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords must match" });
            triggerShake();
            return;
        }
        console.log('isAuthenticated', isAuthenticated);
        // Success logic...
        navigation.navigate('Login');
    };

    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
            <Center className="px-6 py-10">
                <Box className="w-full max-w-[400px]">

                    {/* Section 1: Logo & Header */}
                    <VStack className="items-center mb-8" space="md">
                        <Image
                            source={require('../../assets/images/aglogo.png')}
                            className="h-20 w-20"
                            alt="App Logo"
                            resizeMode="contain"
                        />
                        <VStack className="items-center">
                            <Heading size="xl" className="text-typography-900">New Password</Heading>
                            <Text className="text-typography-500 text-center mt-1">
                                Please create a secure password for
                            </Text>

                            {/* Account Identifier Badge */}
                            <HStack space="xs" className="bg-blue-50 px-3 py-1.5 rounded-full mt-2 items-center">
                                <Icon as={User} size="xs" className="text-blue-600" />
                                <Text size="sm" className="text-blue-700 font-semibold">{identifier}</Text>
                            </HStack>
                        </VStack>
                    </VStack>

                    <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                        <VStack space="xl">

                            {/* New Password Input */}
                            <FormControl>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="font-semibold">New Password</FormControlLabelText>
                                </FormControlLabel>
                                <Input size="xl" className="rounded-2xl h-14 border-slate-200 focus:border-blue-500">
                                    <InputSlot className="pl-4">
                                        <Icon as={Lock} size="sm" className="text-slate-400" />
                                    </InputSlot>
                                    <InputField
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Enter new password"
                                    />
                                    <InputSlot className="pr-4" onPress={() => setShowPassword(!showPassword)}>
                                        <Icon as={showPassword ? Eye : EyeOff} size="sm" className="text-slate-400" />
                                    </InputSlot>
                                </Input>
                            </FormControl>

                            {/* Confirm New Password Input */}
                            <FormControl isInvalid={!!errors.confirmPassword}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="font-semibold">Confirm Password</FormControlLabelText>
                                </FormControlLabel>
                                <Input size="xl" className={`rounded-2xl h-14 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}>
                                    <InputSlot className="pl-4">
                                        <Icon as={CheckCircle2} size="sm" className="text-slate-400" />
                                    </InputSlot>
                                    <InputField
                                        type="password"
                                        value={confirmPassword}
                                        onChangeText={(val) => { setConfirmPassword(val); setErrors({}); }}
                                        placeholder="Repeat new password"
                                    />
                                </Input>
                                {errors.confirmPassword && (
                                    <FormControlError>
                                        <FormControlErrorText className="text-red-500 font-medium">{errors.confirmPassword}</FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            {/* Action Button */}
                            <Button
                                className="h-14 rounded-2xl bg-blue-600 mt-4 shadow-lg shadow-blue-200 "
                                onPress={handleUpdate}
                            >
                                <ButtonText className="font-bold text-white">Reset Password</ButtonText>
                            </Button>

                            {/* Cancel / Back to Login */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login')}
                                className="items-center mt-2"
                            >
                                <Text className="text-typography-500 font-medium">Cancel and return to Login</Text>
                            </TouchableOpacity>

                        </VStack>
                    </Animated.View>
                </Box>
            </Center>
        </ScrollView>
    );
};

export default UpdatePassword;