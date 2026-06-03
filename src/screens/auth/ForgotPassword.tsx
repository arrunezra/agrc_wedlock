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
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Icon, User, Mail } from '@/src/components/common/IconUI';
import { SuccessOverlay } from '../common/SuccessOverlay';
import FailedScreen from '../common/FailedScreen';
import authService from '@/src/services/authService';
import { CommonActions } from '@react-navigation/native';

const ForgotPassword = ({ navigation, route }: any) => {
    // Assuming 'identifier' is passed via route params (e.g., "user@email.com")
    const identifier = route?.params?.identifier || "user@example.com";
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [email, setEmail] = useState(identifier);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const successScale = useRef(new Animated.Value(0)).current;
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]).start();
    };
    const handleResetPassword = async () => {
        try {
            const res = await authService.forgotPassword({ email: email, new_password: password });
            if (res.status) {
                setIsSuccess(true)
                setTimeout(() => {
                    setStatus('error');

                    setTimeout(() => {
                        setIsSuccess(false)
                        setStatus('idle');

                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{
                                    name: 'Login'
                                }],
                            })
                        );
                    }, 3000);
                }, 1000);
                //navigation.navigate('Login');
            } else {
                setErrors({ confirmPassword: "Somthing went wrong" });
                triggerShake();
            }
        } catch (e) {

        }
    };

    const handleUpdate = () => {
        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords must match" });
            triggerShake();
            return;
        }
        handleResetPassword()
        // Success logic...

    };

    return (
        <Box className="flex-1 bg-white">
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
                                <Heading size="xl" className="text-typography-900">Forgot Password</Heading>
                                <Text className="text-typography-500 text-center mt-1">
                                    Please enter your email or phone number to reset your password
                                </Text>

                                {/* Account Identifier Badge */}
                                {/* <HStack space="xs" className="bg-blue-50 px-3 py-1.5 rounded-full mt-2 items-center">
                                <Icon as={User} size="xs" className="text-blue-600" />
                                <Text size="sm" className="text-blue-700 font-semibold">{identifier}</Text>
                            </HStack> */}
                            </VStack>
                        </VStack>

                        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                            <VStack space="xl">

                                {/* Email / Phone Input with Icon */}
                                <FormControl isInvalid={!!errors.email}>
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText className="font-semibold">Email / Phone Number</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input size="xl" className="rounded-2xl h-14 border-slate-200 focus:border-blue-500">
                                        <InputSlot className="pl-4">
                                            <Icon as={Mail} size="sm" className="text-slate-400" />
                                        </InputSlot>
                                        <InputField
                                            placeholder="name@example.com"
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            className="text-sm"
                                        />
                                    </Input>
                                    {errors.email && (
                                        <FormControlError>
                                            <FormControlErrorText>{errors.email}</FormControlErrorText>
                                        </FormControlError>
                                    )}
                                </FormControl>
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
            {status === 'error' && (
                <FailedScreen title="Your password has been reset successfully..." buttonText="Try Again" onPress={() => navigation.navigate('Login')} />
            )}
            <SuccessOverlay isVisible={isSuccess} message="Your password has been reset successfully..." redirectMessage="Taking you back to login..." />

        </Box>

    );
};

export default ForgotPassword;