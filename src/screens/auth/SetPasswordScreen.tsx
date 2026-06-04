import React, { useRef, useState } from 'react';
import { ScrollView, Image, Animated, KeyboardAvoidingView, Platform } from 'react-native';

import { Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Icon, ShieldCheck, Check } from '@/src/components/IconUI';
import { CommonActions } from '@react-navigation/native';
import { SuccessOverlay } from '@/src/components/SuccessOverlay';
import { useAuth } from '@/src/context/AuthContext';
import {
  Center, Box, VStack, Text,
  FormControl, FormControlLabel, FormControlLabelText,
  Input, InputField,
  Button, ButtonText, FormControlError, FormControlErrorText,
  InputSlot,
  HStack
} from '@/src/components/GluestackUI';

const SetPasswordScreen = ({ navigation, route }: any) => {
  const { userid, mobile, email: userEmail, name } = route.params;
  const { isLoading, isAuthenticated, userRole, user, logout } = useAuth();

  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  // 1. Setup Animation Ref
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  // 2. Shake Trigger Function
  const triggerShake = () => {
    // Sequences the movement: Center -> Right -> Left -> Right -> Left -> Center
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  // 1. Password Strength Logic
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // Max 5
  };

  const strengthConfig = [
    { label: 'Too Short', color: 'bg-slate-200', text: 'text-slate-400' },
    { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' },
    { label: 'Fair', color: 'bg-orange-400', text: 'text-orange-400' },
    { label: 'Good', color: 'bg-yellow-400', text: 'text-yellow-500' },
    { label: 'Strong', color: 'bg-green-500', text: 'text-green-500' },
    { label: 'Excellent', color: 'bg-emerald-600', text: 'text-emerald-600' },
  ];

  const strength = getStrength(password);

  const handleSignup = () => {
    // First check for empty fields to provide specific field-level errors
    if (!email || !password || !confirmPassword) {
      const errors = {
        email: '',
        password: '',
        confirmPassword: ''
      };
      if (!email) errors.email = "Please enter email!";
      if (!password) errors.password = "Please enter password!";
      if (!confirmPassword) errors.confirmPassword = "Please enter confirm password!";
      setErrors(errors);
      triggerShake();
      return;
    }

    // Then check for password length
    if (password.length < 8) {
      setErrors({
        email: '',
        password: "Password must be at least 8 characters long!",
        confirmPassword: ''
      });
      triggerShake();
      return;
    }

    // Finally check for password match
    if (password !== confirmPassword) {
      setErrors({
        email: '',
        password: '',
        confirmPassword: "Passwords do not match!"
      });
      triggerShake();
      return;
    }
    setErrors({
      email: '',
      password: '',
      confirmPassword: ''
    });
    setLoading(true);
    setTimeout(() => {
      setIsSuccess(true);
      setLoading(false);
      setTimeout(() => {
        console.log('isAuthenticated', isAuthenticated);
        setIsSuccess(false);
        //navigation.navigate('Login');
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

  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box className="flex-1 bg-white">
        {!isSuccess && (<ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
          <Center className="flex-1 px-6 py-12">
            <Box className="w-full max-w-[400px]">

              {/* Header Section */}
              <Box className="items-center mb-10">
                <Box className="relative mb-6">
                  <Box className="absolute -inset-4 bg-blue-100 rounded-full opacity-50 blur-xl" />
                  <Image
                    source={require('@/src/assets/images/aglogo.png')}
                    alt="App Logo"
                    className="h-24 w-24"
                    resizeMode="contain"
                  />
                </Box>
                <Text className="text-3xl font-bold text-typography-900 text-center">
                  Set Password
                </Text>
                <Text className="text-typography-500 text-center mt-2 px-4">
                  Secure your account with a strong password to get started.
                </Text>
              </Box>

              {/* Form Section */}
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

                  {/* Password Field */}
                  <FormControl isInvalid={!!errors.password}>
                    <FormControlLabel><FormControlLabelText>Create Password</FormControlLabelText></FormControlLabel>
                    <Input size="xl" className="rounded-2xl h-14 border-slate-200">
                      <InputSlot className="pl-4"><Icon as={Lock} className="text-slate-400" /></InputSlot>
                      <InputField
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min. 8 characters"
                      />
                      <InputSlot className="pr-4" onPress={() => setShowPassword(!showPassword)}>
                        <Icon as={showPassword ? Eye : EyeOff} className="text-slate-400" />
                      </InputSlot>
                    </Input>
                    {errors.password && (
                      <FormControlError><FormControlErrorText>{errors.password}</FormControlErrorText></FormControlError>
                    )}
                    {/* 2. Strength Meter UI */}
                    {password.length > 0 && (
                      <VStack className="mt-3" space="xs">
                        <HStack space="xs" className="h-1.5 w-full">
                          {[1, 2, 3, 4, 5].map((step) => (
                            <Box
                              key={step}
                              className={`flex-1 rounded-full ${step <= strength ? strengthConfig[strength].color : 'bg-slate-100'}`}
                            />
                          ))}
                        </HStack>
                        <HStack items-center space="xs">
                          <Icon as={ShieldCheck} size="xs" className={strengthConfig[strength].text} />
                          <Text size="xs" className={`font-bold ${strengthConfig[strength].text}`}>
                            {strengthConfig[strength].label}
                          </Text>
                        </HStack>
                      </VStack>
                    )}
                  </FormControl>

                  {/* Confirm Password Field */}
                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormControlLabel><FormControlLabelText>Confirm Password</FormControlLabelText></FormControlLabel>
                    <Input size="xl" className={`rounded-2xl h-14 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}>
                      <InputSlot className="pl-4"><Icon as={CheckCircle2} className="text-slate-400" /></InputSlot>
                      <InputField
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChangeText={(val) => { setConfirmPassword(val); setErrors({}); }}
                        placeholder="Repeat password"
                      />
                      <InputSlot className="pr-4" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon as={showConfirmPassword ? Eye : EyeOff} className="text-slate-400" />
                      </InputSlot>
                    </Input>
                    {errors.confirmPassword && (
                      <FormControlError><FormControlErrorText>{errors.confirmPassword}</FormControlErrorText></FormControlError>
                    )}
                  </FormControl>

                  <Button className="h-14 rounded-2xl bg-blue-600 mt-4" onPress={handleSignup}>
                    <ButtonText className="font-bold">Set Password & Continue</ButtonText>
                  </Button>

                </VStack>
              </Animated.View>
            </Box>
          </Center>
        </ScrollView>)}

        <SuccessOverlay isVisible={isSuccess} message="Setup is ready..." redirectMessage="Taking you back to login..." />
      </Box>
    </KeyboardAvoidingView>
  );
};

export default SetPasswordScreen;