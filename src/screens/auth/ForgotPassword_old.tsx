import React, { useState } from 'react';
import { Alert } from 'react-native';
import api from '@/src/api/api';
import authService from '@/src/services/authService';
import { Box, VStack, Input, InputField, Button, ButtonText, Text, Center } from '@/src/components/common/GluestackUI'; 

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(2); // 1: Request Code, 2: Reset Password

  const handleRequestCode = async () => {
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        Alert.alert("Check Email", "Reset code sent!");
        setStep(2);
      }
    } catch (e) {
      Alert.alert("Error", "Could not send reset code");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await api.post('/reset_password.php', { email, token, new_password: newPassword });
      if (res.data.success) {
        Alert.alert("Success", "Password updated!");
        navigation.navigate('Login');
      }
    } catch (e) {
      Alert.alert("Error", "Invalid code or expired");
    }
  };

  return (
    <Center className="flex-1 bg-background-0 px-4">
      <Box className="w-full max-w-[384px]">
        <Text className="text-3xl font-bold mb-6 text-center">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </Text>

        <VStack className="gap-4">
          {step === 1 ? (
            <>
              <Input><InputField placeholder="Enter registered email" value={email} onChangeText={setEmail} /></Input>
              <Button onPress={handleRequestCode}><ButtonText>Send Reset Code</ButtonText></Button>
            </>
          ) : (
            <>
              <Input><InputField placeholder="6-digit Code" value={token} onChangeText={setToken} /></Input>
              <Input><InputField placeholder="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry /></Input>
              <Button onPress={handleResetPassword}><ButtonText>Update Password</ButtonText></Button>
            </>
          )}
        </VStack>
      </Box>
    </Center>
  );
}