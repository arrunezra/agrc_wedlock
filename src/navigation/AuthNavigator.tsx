import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import { ThemeSettings } from '../screens/auth/ThemeSettings';
import SignupWizardScreen from '../screens/auth/SignupWizardScreen';
import SetPasswordScreen from '../screens/auth/SetPasswordScreen';
import UpdatePassword from '../screens/auth/UpdatePassword';
import ForgotPassword from '../screens/auth/ForgotPassword';
import TermsOfServiceScreen from '../screens/Termsandcondition/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Termsandcondition/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupWizardScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="profilepwdupdate" component={SetPasswordScreen} />
      <Stack.Screen name="updatepwd" component={UpdatePassword} />
      <Stack.Screen name="forgotpwd" component={ForgotPassword} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettings} />

      {/* 2. Register the new legal screens here */}
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

    </Stack.Navigator>
  );
} ``