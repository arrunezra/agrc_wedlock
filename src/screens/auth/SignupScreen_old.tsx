import  { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Link, LinkText } from '@/components/ui/link';
import { FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ScrollView } from '@/components/ui/scroll-view';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Alert } from 'react-native';
import api from '@/src/api/api';
import authService from '@/src/services/authService';
 
export default function SignupScreen({ navigation }:any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors:any = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await authService.signup( {
        phoneNumber:name,
        email,
        password,
      });

      // const response = await api.post('/register.php', {
      //   name,
      //   email,
      //   password,
      // });
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Account created successfully! Please login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error:any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-0">
      <Center className="flex-1 px-4 py-8">
        <Box className="w-full max-w-[384px]">
          
          {/* Header */}
          <Box className="items-center mb-10">
            <Image
              source={require('../../assets/images/aglogo.png')}
              alt="App Logo"
              className="h-32 w-32 mb-4" // Use tailwind for sizing
            />
            <Text className="text-4xl font-bold mb-2 text-center">
              Create Account
            </Text>
            <Text className="text-typography-500 text-center">
              Sign up to get started
            </Text>
          </Box>

          {/* Signup Form */}
          {/* space="lg" -> className="gap-4" */}
          <VStack className="gap-4">
            
            {/* Name Input */}
            <FormControl isInvalid={!!errors.name}>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Full Name</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.name}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Email Input */}
            <FormControl isInvalid={!!errors.email}>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.email}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Password Input */}
            <FormControl isInvalid={!!errors.password}>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.password}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Confirm Password Input */}
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Confirm Password</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>{errors.confirmPassword}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Sign Up Button */}
            <Button
              size="lg"
              className="mt-4"
              onPress={handleSignup}
              isDisabled={loading}
            >
              {loading && <ButtonSpinner className="mr-2" />}
              <ButtonText>{loading ? 'Creating Account...' : 'Sign Up'}</ButtonText>
            </Button>

            {/* Login Link */}
            <Box className="flex-row justify-center mt-6">
              <Text className="text-typography-500 mr-2">
                Already have an account?
              </Text>
              <Link onPress={() => navigation.navigate('Login')}>
                <LinkText className="text-primary-500 font-semibold no-underline">
                  Sign In
                </LinkText>
              </Link>
            </Box>
          </VStack>
        </Box>
      </Center>
    </ScrollView>
  );
}