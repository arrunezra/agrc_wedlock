import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeyboardAnimation } from 'react-native-keyboard-controller';

// New Imports (Points to your local UI components) 
import { Image, Link, LinkText, ButtonSpinner, Center, ScrollView, Box, VStack, Input, InputField, Button, ButtonText, Text, FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText, HStack, Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel, InputSlot, InputIcon } from '@/src/components/common/GluestackUI';

import { useAuth } from '@/src/context/AuthContext';
import { CheckIcon, Eye, EyeOff } from '@/src/components/common/IconUI';
import { AnimateError } from '../common/AnimateError';
import GradientView from '../component/GradientView';

export default function LoginScreen({ navigation }: any) {
  const { progress } = useKeyboardAnimation();
  const { login } = useAuth(); // Get login from context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    // Clean up whitespace
    const inputTrimmed = email ? email.trim() : '';

    if (!inputTrimmed) {
      newErrors.email = 'Email or Phone number is required';
    } else {
      // Standard Email Regex
      const isEmail = /\S+@\S+\.\S+/.test(inputTrimmed);

      // Standard Phone Regex (Accepts 10 digits, optional country code like +91)
      const isPhone = /^\+?[0-9]{10,14}$/.test(inputTrimmed);

      if (!isEmail && !isPhone) {
        newErrors.email = 'Please enter a valid email or 10-digit phone number';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await login({
        phoneNumber: email,
        password: password,
        rememberMe: rememberMe
      });

      if (response.success) {
        console.log("Login successful");
        // navigation.replace('Home');
      } else {
        setErrors((pre: any) => ({
          ...pre,
          password: "Invalid phone number password"
        }));
      }
    } catch (error: any) {
      console.log(error);
      const errorMsg = error.response?.message || 'Network error.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >

      <GradientView
        colors={['#defbf1ff', '#ffffffff', '#1e473aff']}
        horizontal={false}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-transparent"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Box className="flex-1 justify-between px-6 py-12">

            {/* Top & Center Container: Logo + Form */}
            <Center className="w-full align-middle">
              <Box className="w-full max-w-[384px]">

                {/* Logo Section */}
                <Box className="items-center mb-8 mt-4">
                  <Image
                    source={require('../../assets/logo/logo_small_fullname.png')}
                    alt="Assemblies of God Logo"
                    className="mb-4 h-32 w-32"
                    resizeMode="contain"
                  />
                  <Text className="text-4xl font-bold mb-2 text-typography-900 tracking-tight">
                    Welcome Back
                  </Text>
                  <Text className="text-center text-typography-500 text-base">
                    Sign in to continue to your account
                  </Text>
                </Box>

                {/* Form Section */}
                <VStack className="gap-4">
                  {/* Email / Phone */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText size='md' className="font-medium text-typography-800">
                        Email / Phone Number
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="h-14 rounded-xl border-background-300" size='lg'>
                      <InputField
                        placeholder="Enter Email or Phone number"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="default"
                        className="text-typography-900 text-base px-3"
                        // FIX: Safeguards the focus cycle handler dynamically inside core.ts
                        onFocus={(e: any) => {
                          if (e && typeof e.persist === 'function') {
                            e.persist();
                          }
                        }}
                      />
                    </Input>
                    <AnimateError isVisible={errors.email}>{errors.email}</AnimateError>
                  </FormControl>

                  {/* Password */}
                  <FormControl isInvalid={!!errors.password}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText size='md' className="font-medium text-typography-800">
                        Password
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="h-14 rounded-xl border-background-300 flex-row items-center" size='lg'>
                      <InputField
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        className="flex-1 text-typography-900 text-base px-3"
                        // FIX: Safeguards the focus cycle handler dynamically inside core.ts
                        onFocus={(e: any) => {
                          if (e && typeof e.persist === 'function') {
                            e.persist();
                          }
                        }}
                      />
                      <InputSlot className="pr-4" onPress={handleState}>
                        <InputIcon as={showPassword ? Eye : EyeOff} className="text-typography-400" size="xl" />
                      </InputSlot>
                    </Input>
                    <AnimateError isVisible={errors.password}>{errors.password}</AnimateError>
                  </FormControl>

                  {/* Options Row */}
                  <HStack className="justify-between items-center mt-2 px-1">
                    <Checkbox
                      size="md"
                      value="remember"
                      isChecked={rememberMe}
                      onChange={(val) => setRememberMe(val)}
                      aria-label="Remember session options"
                    >
                      <CheckboxIndicator className="mr-2 rounded-md">
                        <CheckboxIcon as={CheckIcon} className="text-white" />
                      </CheckboxIndicator>
                      <CheckboxLabel className="text-sm font-medium text-typography-600">
                        Remember Me
                      </CheckboxLabel>
                    </Checkbox>

                    <Link onPress={() => navigation.navigate('forgotpwd', { identifier: email })}>
                      <LinkText size='sm' className="text-primary-600 font-semibold no-underline">
                        Forgot Password?
                      </LinkText>
                    </Link>
                  </HStack>

                  {/* Sign In Button */}
                  <Button
                    size='xl'
                    className="mt-6 h-14 rounded-xl bg-primary-700  shadow-sm"
                    onPress={handleLogin}
                    isDisabled={loading}
                  >
                    {loading && <ButtonSpinner className="mr-2 text-white" />}
                    <ButtonText className="font-semibold text-lg text-white">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </ButtonText>
                  </Button>

                  {/* Register Link */}
                  <Box className="flex-row justify-center mt-6">
                    <Text className="text-typography-800 font-bold mr-1 text-sm">Don't have an account?</Text>
                    <Link onPress={() => navigation.navigate('TermsOfService', { from: 'signup' })}>
                      <LinkText className="text-primary-600 font-bold text-sm no-underline">
                        Sign Up
                      </LinkText>
                    </Link>
                  </Box>
                </VStack>

              </Box>
            </Center>

            {/* --- NEW STICKY FOOTER SECTION --- */}
            <VStack className="items-center mt-8 gap-4">
              <HStack className='gap-4 items-center px-5 py-2.5'>
                <Pressable onPress={() => navigation.navigate('TermsOfService', { from: 'login' })}>
                  <Link onPress={() => navigation.navigate('TermsOfService', { from: 'login' })}>
                    <LinkText className="text-black-500 hover:text-black-700 text-sm font-medium no-underline">
                      Terms of Service
                    </LinkText>
                  </Link>
                </Pressable>

                <Text className="text-slate-300 text-xs">|</Text>
                <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
                  <Link onPress={() => navigation.navigate('PrivacyPolicy')}>
                    <LinkText className="text-black-500 hover:text-black-700 text-sm font-medium no-underline">
                      Privacy Policy
                    </LinkText>
                  </Link>
                </Pressable>
              </HStack>
            </VStack>
            {/* --- END FOOTER --- */}

          </Box>
        </ScrollView>
      </GradientView>
    </KeyboardAvoidingView>
  );
}