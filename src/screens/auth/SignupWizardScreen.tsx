import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  Box, VStack, HStack, Button, ButtonText, Text, Progress, ProgressFilledTrack, Input, InputField,
  Heading, Select, SelectTrigger, SelectInput, SelectIcon, Spinner,
  CheckboxIcon, CheckboxIndicator, CheckboxLabel, Checkbox,
  SelectPortal, SelectBackdrop, SelectContent,
  SelectItem,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  InputSlot,
  Radio,
  RadioLabel,
  RadioIndicator,
  RadioGroup,
  Textarea,
  TextareaInput,
  Switch
} from '@/src/components/common/GluestackUI';
import { Icon, ChevronLeftIcon, ChevronDownIcon, CheckIcon, SearchIcon, CalendarDays, UserCheck, User, Globe, ChevronDown, Users, Church, ShieldCheck, Phone, Mail, CheckCircle2, Check, Fingerprint, Building2, MapPin, Trash2, Baby, Heart, Ruler, BookOpen, School, GraduationCap, UserRound, Briefcase, Banknote, Building, Sparkles, X, Lightbulb } from '@/src/components/common/IconUI';
import api from '@/src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SuccessScreen from '../common/SuccessScreen';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import profileService from '@/src/services/profileService';
import _ from 'lodash';
import { CloseIcon } from '@/components/ui/icon';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useAlert } from '@/src/context/AlertContext';
import { useAuth } from '@/src/context/AuthContext';
import { AnimateError } from '../common/AnimateError';
import { itemData } from '@/src/utils/qualification';
import { API_BASE_URL_DEV_Profiles_Images, API_BASE_URL_DEV_Profiles_Thumbs } from '@/src/utils/environment';
import { HEIGHT_DATA } from '@/src/utils/utils';
import { UploadProgressModal } from '../common/UploadProgressModal';
import FuturisticDropdown from '@/src/components/common/FuturisticDropdown';
import { LookupContext } from '@/src/context/LookupContext';
import { CameraIcon, CheckCircleIcon, ChurchIcon, CreditCardIcon, Droplets, Flame, User2, UserIcon, Wind, ZapIcon } from 'lucide-react-native';
import ChruchService from '@/src/services/ChruchService';
import { launchImageLibrary } from 'react-native-image-picker';

// --- DATA SOURCES ---

// const QUALIFICATIONS = [
//   { label: "Bachelors", value: "Bachelors" },
//   { label: "Masters", value: "Masters" },
//   { label: "PhD", value: "PhD" },
//   { label: "Diploma", value: "Diploma" },
//   { label: "High School", value: "High School" },
// ];
const QUALIFICATIONS = itemData

const SelectionPill = ({ label, isSelected, onSelect }: any) => (
  <Button size='lg'
    variant="outline"
    onPress={onSelect}
    className={`rounded-full px-5 py-2 border-outline-300 ${isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white'}`}
  >
    <ButtonText className={isSelected ? 'text-white' : 'text-typography-700 font-medium'}>
      {label}
    </ButtonText>
  </Button>
);

export default function SignupWizardScreen() {
  // Constants
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, logout } = useAuth();
  const { lookups } = useContext(LookupContext);

  const { showAlert, hideAlert } = useAlert();
  const { height: screenHeight } = useWindowDimensions();
  const { height } = Dimensions.get('window');
  // Refs Variables
  const lastNameRef = React.useRef<any>(null);
  const dayRef = React.useRef<any>(null);
  const monthRef = React.useRef<any>(null);
  const yearRef = React.useRef<any>(null);
  const phoneRef = React.useRef<any>(null);
  const cityRef = React.useRef<any>(null);
  // State Variables

  const [step, setStep] = useState(1);


  const totalSteps = 12;
  const progress = (step / totalSteps) * 100;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCasteNoBar, setIsCasteNoBar] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState(false);
  const [profileFor, setProfileFor] = useState('Myself');
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChurchData, setSelectedChurchData] = useState<any>({});
  const [churches, setChurches] = useState<any>([]);
  const [qualification, setQualification] = useState<any>([]);
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const MAX_HOBBIES = 5;

  const [userID, setUserID] = useState('');
  const [profileID, setProfileID] = useState('');
  const [aboutText, setAboutText] = useState('');

  const MAX_CHARS = 1000;
  const MIN_CHARS = 50;
  // Comprehensive Form State
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    religion: '',
    community: '',
    subCommunity: '',
    country: 'IN',
    email: '',
    phone: '',
    address: '',
    city: '',
    maritalStatus: '',
    children: '0',
    height: '',
    qualification: '',
    college: '',
    income: '',
    workDetails: '',
    companyName: '',
    profilePic: null,
    profileThumb: null,
    hasChildren: '',
    childrenCount: '',
    kids: [],
    kids_details: null,
    step: step,
    gender: 'Male',
    profileFor: profileFor,
    casteNoBar: isCasteNoBar,
    hobbies: '',
    sub_community: '',
    alt_phone: '',
    weight: '',
    userid: '',
    worksWith: '',
    worksas: '',
    others: '',
    church_id: '',
    born_again: 0,
    baptism_details: '',
    baptized: 0,
    spirit: 0,
  });


  // 2. Create a debounced version of the fetch
  // 1. Correct way to define the debounced function
  // 1. Correct structure: useCallback WRAPS the debounce
  const logicToFetch = useCallback(
    _.debounce(async (searchQuery: string) => {
      console.log("Debounce fired! Fetching for:", searchQuery);

      if (formData.state) {
        setIsLoading(true);
        try {
          // IMPORTANT: Pass 'searchQuery' to your fetch function 
          // so the PHP gets the actual search text
          await fetchCities(formData.state, searchQuery);
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCities([]);
      }
    }, 500),
    [formData.state] // Only re-create if the state changes
  );




  const prevStep = () => step > 1 && setStep(step - 1);

  const updateForm = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));

  };


  // Upload image

  const handlePickImage = async () => {
    try {
      // 1. Open the secure, policy-compliant Native Photo Picker
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8, // Built-in compression quality matching your old config
        selectionLimit: 1,
      });

      // Handle user cancellation gracefully
      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];

      if (!selectedImage.uri) {
        throw new Error('No image URI found');
      }

      // 2. Prepare FormData
      const uploadData = new FormData();

      // Clean URI processing for iOS and Android
      const cleanUri = Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri;

      uploadData.append('file', {
        uri: cleanUri,
        type: selectedImage.type || 'image/jpeg', // react-native-image-picker exposes 'type' natively
        name: selectedImage.fileName || `${formData.userid}_${Date.now()}.jpg`,
      } as any);

      uploadData.append('userid', formData.userid);
      uploadData.append('profile_id', profileID);
      uploadData.append('is_profile_pic', 1);

      // 3. Start Upload Process via Axios
      setIsUploading(true);
      setUploadProgress(0);

      const token = await AsyncStorage.getItem('accessToken');
      const response = await api.post('/files/profile_gallery_upload.php', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: ({ loaded, total }) => {
          if (total) setUploadProgress(Math.round((loaded * 100) / total));
        }
      });

      if (response.data.success) {
        updateForm('profilePic', API_BASE_URL_DEV_Profiles_Images + '/' + response.data.full_url);
        updateForm('profileThumb', API_BASE_URL_DEV_Profiles_Thumbs + '/' + response.data.thumb_url);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error("Upload process error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const validateMobileoremail = async () => {
    setValidationTriggered(true)
    if (!formData.email || !formData.phone) {
      return;
    }
    if (!validateEmail(formData.email) || !validatePhone(formData.phone)) {
      return;
    }

    const payload = { ...formData };
    try {
      const response = await profileService.validateMobileOrEmail(payload).catch((error: any) => {
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          const statusCode = error.response.status;
          if (statusCode === 409) {
            showAlert({
              type: 'error',
              title: 'Profile Info.',
              message: error.response.data.message || "Something went wrong. Please try again.",
              confirmText: "Login",
              onConfirm: async () => {
                setIsUploading(false);
                hideAlert();
                await logout();
              }
            });
          }
        }
      });

      if (response?.success) {
        setIsUploading(false);
        hideAlert();
        setIsFinished(true);
        setValidationTriggered(false);

        setStep(prev => prev + 1);
        // showAlert({
        //   type: 'success',
        //   title: 'Profile Info.',
        //   message: "Profile validated successfully.",
        //   confirmText: "OK",
        //   onConfirm: async () => {
        //     setIsUploading(false);
        //     hideAlert();
        //     setIsFinished(true);
        //     setStep(prev => prev + 1);
        //   }
        // });
      }
      else {
        console.log('response', response);
      }
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Profile Info.',
        message: "Could not validate profile. Please try again.",
      });
    } finally {
      setValidationTriggered(false)

    }
  }
  const handleParcialSubmit = async () => {
    setIsUploading(true);


    const payload = { ...formData, profileFor, casteNoBar: isCasteNoBar, step: 8, alt_phone: '', weight: '' };
    try {
      console.log('payload', payload);
      const response = await profileService.createProfile(payload).catch((error: any) => {
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          const statusCode = error.response.status;
          if (statusCode === 401) {
            showAlert({
              type: 'error',
              title: 'Profile Info.',
              message: "Unauthorized. Please log in again.",
            });
          }
          else if (statusCode === 409) {
            showAlert({
              type: 'error',
              title: 'Profile Info.',
              message: error.response.data.message || "Something went wrong. Please try again.",
              confirmText: "Login",
              onConfirm: async () => {
                setIsUploading(false);
                hideAlert();
                await logout();
              }
            });
          }
          else {
            if (!error.response.data.success) {
              showAlert({
                type: 'error',
                title: 'Profile Info.',
                message: error.response.data.message,
              });
            }
            console.log("Error", error.message);
          }
        }
      });

      if (response?.success) {
        //console.log("created file userid====", response);

        setIsFinished(true);
        updateForm('userid', response?.userid);
        setProfileID(response?.profile_id)
        setUserID(response?.userid);
        setStep(prev => prev + 1);
      } else {
        // Alert.alert("Error", response?.message);
      }
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Profile Info.',
        message: "Could not save profile. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleFinalSubmit = async () => {
    setIsUploading(true);
    const payload = {
      ...formData,
      hobbies: localSelected?.join(','), profileFor,
      step: 11,
      //userid: 'RCST0326-56496',
      profile_id: profileID,
      aboutus: aboutText
    };
    try {
      //console.log('payload', payload);
      const response = await profileService.createProfile(payload)
      if (response.success) {
        updateForm('userid', response.userid)
        setIsFinished(true);
        showAlert({
          type: 'success',
          title: 'Welcome!',
          message: 'Profile saved successfully.',
        });
        setTimeout(() => {
          hideAlert();

          // navigation.navigate('forgotpwd', {
          //         identifier: email
          //       })


          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{
                name: 'forgotpwd', params: {
                  identifier: formData.email || ""
                }
              }],
            })
          );

        }, 2000);
      } else {
        showAlert({
          type: 'error',
          title: 'Profile Info.',
          message: response.message,
        });

      }
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Profile Info.',
        message: "Could not save profile. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChildrenCountChange = (count: string) => {
    const num = parseInt(count) || 0;
    updateForm('childrenCount', count);

    // Sync the kids array length with the number entered
    setFormData((prev: any) => {
      let newKids = [...prev.kids];
      if (num > newKids.length) {
        // Add more child objects if count increased
        for (let i = newKids.length; i < num; i++) {
          newKids.push({ age: '', gender: '', livingTogether: 'Yes' });
        }
      } else {
        // Remove child objects if count decreased
        newKids = newKids.slice(0, num);
      }
      return { ...prev, kids: newKids };
    });
  };

  const updateKidDetail = (index: number, field: string, value: string) => {
    const updatedKids = [...formData.kids];
    updatedKids[index] = { ...updatedKids[index], [field]: value };
    updateForm('kids', updatedKids);
  };
  const removeChild = (indexToRemove: number) => {
    const updatedKids = formData.kids.filter((_: any, index: number) => index !== indexToRemove);

    setFormData((prev: any) => ({
      ...prev,
      kids: updatedKids,
      // Automatically update the count to match the new array length
      childrenCount: updatedKids.length.toString()
    }));
  };

  // 1. Check if the numbers entered are logically correct
  const isDateValid = () => {
    const day = parseInt(formData.dobDay || '0');
    const month = parseInt(formData.dobMonth || '0');
    const year = formData.dobYear || '0';

    if (!day || !month || year.length !== 4) return false;

    const isDayValid = day >= 1 && day <= 31;
    const isMonthValid = month >= 1 && month <= 12;

    return isDayValid && isMonthValid;
  };

  // 2. Calculate the age based on current year (2026)
  const getAge = () => {
    const day = parseInt(formData.dobDay);
    const month = parseInt(formData.dobMonth);
    const year = parseInt(formData.dobYear);
    if (!isDateValid()) return 0;
    const today = new Date(); // Current date in 2026
    const birthDate = new Date(year, month - 1, day);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't happened yet this year
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const getValidYear = () => {
    const year = parseInt(formData.dobYear);
    const currentYear = new Date().getFullYear();
    const eightyYearsAgo = currentYear - 80;
    return year >= eightyYearsAgo && year <= currentYear;
  }
  const fetchCities = async (stateId: string, searchQuery: string | null = null) => {
    setIsLoading(true); // Start loading
    try {
      const response = await profileService.getCities(stateId, searchQuery);
      console.log('cities', response.data)
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const loadLookupData = async () => {
    try {
      const res = await profileService.loadLookupData('qualification', 18);
      console.log('loadLookupData', res)
      if (res.success) {

        // Handle kids_details parsing safely
        try {
          setQualification(res.data)
        } catch (parseError) {
          console.error("Error parsing kids_details:", parseError);
        }


      }
    } catch (e) {
      console.error("Fetch Profile Error:", e);
    } finally {
    }
  };


  //use memo
  const dateErrorMessage = useMemo(() => {
    if (!isDateValid()) return "Enter a valid DD (01-31), MM (01-12), and YYYY";
    if (!getValidYear()) return "Enter a valid year";
    if (getAge() < 18) return "Under age! You must be at least 18 years old.";
    return "";
  }, [formData.dobDay, formData.dobMonth, formData.dobYear]); // Recalculate only when date changes

  const handleNextAction = () => {

    setValidationTriggered(true); // Show red errors if fields are empty

    if (step === 1) {
      if (!profileFor) return;
    }
    else if (step === 2) {
      if (!formData.firstName || !formData.lastName || !!dateErrorMessage) {
        return; // Stop here if invalid or under 18
      }
    }
    else if (step === 3) {
      if (!formData.religion || !formData.livingIn || !formData.community) {
        return;
      }
    }
    else if (step === 4) {
      if (!formData.email || !formData.phone) {
        return;
      }
    }
    else if (step === 5) {
      if (!formData.state || !formData.city) {
        return;
      }
    }
    else if (step === 6) {
      if (!formData.height || !formData.maritalStatus) {
        return;
      }
      loadLookupData()
    }
    else if (step === 7) {
      if (!formData.qualification || !formData.college) {
        return;
      }
    }
    else if (step === 8) {

      if (!formData.income || !formData.worksWith) {
        return;
      }
      else if (formData.worksWith !== 'NWK' && !formData.companyName) {
        return;
      } else {
        let aboutas = '';
        if (formData?.worksWith !== 'NWK' && formData?.worksas) {
          aboutas = `Thank you for stopping by my profile! As a ${formData?.worksas}, my dreams and aspirations are the heartbeat of my journey toward success. I hope to find a life partner who is lovable and deeply understanding—someone who walks beside me as a best friend and stands firm with me through all of life's ups and downs. I look forward to hearing from you soon.`
        } else aboutas = `I am glad you chose to visit my profile. While I am currently focusing on my personal growth and home life, my dreams and aspirations constantly drive me toward a successful future. I am looking for a life partner who would be a true friend—lovable, deeply understanding, and ready to stand by me in every phase of life. Please feel free to connect with me anytime.`

        setAboutText(aboutas);

      }
    } else if (step === 9) {
      if (!formData.church_id) {
        return;
      }

    }
    if (step === 4) {
      validateMobileoremail();
    }
    else if (step === 9) handleParcialSubmit();
    else if (step === totalSteps) handleFinalSubmit();
    else {
      setValidationTriggered(false);
      setStep(prev => prev + 1);
    }

  }
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Validates a standard 10-digit number; adjust regex based on your region
    return /^\d{10}$/.test(phone.replace(/\s/g, ''));
  };
  const categories = useMemo(() =>
    (lookups?.hobbies || []).filter((h: any) => h.parent === null),
    [lookups]);
  const internalToggle = useCallback((hobbyValue: any) => {
    // Force value to be a string. This prevents [object Object] crashes
    const cleanVal = String(hobbyValue);

    setLocalSelected((prev) => {
      const isExist = prev.includes(cleanVal);
      if (isExist) {
        return prev.filter((v) => v !== cleanVal);
      } else {
        if (prev.length < MAX_HOBBIES) {
          return [...prev, cleanVal];
        }
        return prev;
      }
    });
  }, [MAX_HOBBIES]);
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const res = await ChruchService.getChurchDetails({ action: 'all', id: '' });
        console.log('res', res);
        if (res.success) {
          setChurches(res.churches);
        } else {
          setChurches([]);
        }
      } catch (err) {
        console.error("Failed to load churches:", err);
      } finally {
      }
    };

    fetchChurches();
  }, []); // Empty array means this runs once on mount
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <Box className="flex-1 bg-white">
        <VStack className="pt-12">
          <HStack className="px-4 items-center mb-4">
            <Button variant="link" onPress={prevStep} isDisabled={step === 1}>
              <Icon as={ChevronLeftIcon} size="xl" className="text-typography-400" />
            </Button>
          </HStack>
          <Progress value={progress} size="xs" className="w-full h-1 rounded-none bg-background-50">
            <ProgressFilledTrack className="bg-emerald-500" />
          </Progress>
        </VStack>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <VStack className="mt-6 items-center">
            <Box className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${step % 2 === 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
              <Text size="3xl">{step === 1 ? '👤' : step == 9 ? '⛪' : step === 10 ? '📸' : '📝'}</Text>
            </Box>
          </VStack>

          {/* STEP 1: Profile Selection */}
          {step === 1 && (
            <VStack className="gap-8">
              {/* Section 1: Profile For */}
              <FormControl isInvalid={!profileFor && validationTriggered}>
                <Heading size="xl" className="mb-4">This Profile is for</Heading>
                <HStack className="flex-wrap gap-3 p-2">
                  {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'My Friend'].map((item) => (
                    <SelectionPill
                      key={item}
                      label={item}
                      isSelected={profileFor === item}
                      onSelect={() => {
                        setProfileFor(item);
                        setValidationTriggered(false);

                        // Logic to handle Gender based on selection
                        if (['My Son', 'My Brother'].includes(item)) updateForm('gender', 'Male');
                        else if (['My Daughter', 'My Sister'].includes(item)) updateForm('gender', 'Female');
                        else updateForm('gender', ''); // Reset for 'Myself' or 'My Friend' so they must choose
                      }}
                    />
                  ))}
                </HStack>
              </FormControl>

              {/* Section 2: Gender Selection (Visible only for Myself or My Friend) */}
              {['Myself', 'My Friend'].includes(profileFor) && (
                <VStack className="gap-4 animate-in fade-in duration-500">
                  <Heading size="md" className="text-typography-950 font-semibold">
                    Select Gender
                  </Heading>
                  <HStack className="gap-3 p-2">
                    {['Male', 'Female'].map((g) => (
                      <SelectionPill
                        key={g}
                        label={g}
                        isSelected={formData.gender === g}
                        onSelect={() => updateForm('gender', g)}
                      />
                    ))}
                  </HStack>
                  {validationTriggered && !formData.gender && (
                    <Text className="text-error-600 text-xs px-2">Please select your gender</Text>
                  )}
                </VStack>
              )}
            </VStack>
          )}

          {/* STEP 2: Name & DOB */}
          {step === 2 && (
            <VStack className="gap-6 animate-in fade-in duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Basic Details</Heading>
                <Text size="sm" className="text-typography-500">Please enter your legal name and birth date.</Text>
              </VStack>

              {/* First Name */}
              <FormControl isInvalid={validationTriggered && !formData.firstName}>
                <FormControlLabel className="mb-2">
                  <FormControlLabelText className="font-bold text-slate-700">First Name</FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                  <InputSlot className="pl-4">
                    <Icon as={User} className="text-blue-500" size="sm" />
                  </InputSlot>
                  <InputField
                    placeholder="e.g. Rahul"
                    value={formData.firstName}
                    onChangeText={(v) => updateForm('firstName', v)}
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    className="font-medium"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorText>First name is required</FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Last Name */}
              <FormControl isInvalid={validationTriggered && !formData.lastName}>
                <FormControlLabel className="mb-2">
                  <FormControlLabelText className="font-bold text-slate-700">Last Name</FormControlLabelText>
                </FormControlLabel>
                <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                  <InputSlot className="pl-4">
                    <Icon as={UserCheck} className="text-blue-500" size="sm" />
                  </InputSlot>
                  <InputField
                    ref={lastNameRef}
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChangeText={(v) => updateForm('lastName', v)}
                    returnKeyType="next"
                    onSubmitEditing={() => dayRef.current?.focus()}
                    className="font-medium"
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorText>Last name is required</FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Date of Birth Section */}
              <FormControl isInvalid={validationTriggered && (!!dateErrorMessage)}>
                <FormControlLabel className="mb-2">
                  <FormControlLabelText className="font-bold text-slate-700">Date of Birth</FormControlLabelText>
                </FormControlLabel>
                <HStack className="gap-3">
                  {/* We use a single shared Icon for the DOB group by wrapping them in a container if needed, 
            but for DD/MM/YYYY it's cleaner to keep the inputs lean */}
                  <Input className="flex-1 h-16 rounded-2xl bg-white shadow-sm shadow-slate-100" size="lg">
                    <InputField
                      placeholder="DD"
                      ref={dayRef}
                      keyboardType="numeric"
                      maxLength={2}
                      value={formData.dobDay}
                      className="text-center font-bold"
                      onChangeText={(v) => {
                        updateForm('dobDay', v);
                        if (v.length === 2) monthRef.current?.focus();
                      }}
                    />
                  </Input>

                  <Input className="flex-1 h-16 rounded-2xl bg-white shadow-sm shadow-slate-100" size="lg">
                    <InputField
                      placeholder="MM"
                      ref={monthRef}
                      keyboardType="numeric"
                      maxLength={2}
                      value={formData.dobMonth}
                      className="text-center font-bold"
                      onChangeText={(v) => {
                        updateForm('dobMonth', v);
                        if (v.length === 2) yearRef.current?.focus();
                      }}
                    />
                  </Input>

                  <Input className="flex-[1.5] h-16 rounded-2xl bg-white shadow-sm shadow-slate-100" size="lg">
                    <InputSlot className="pl-3">
                      <Icon as={CalendarDays} className="text-blue-500" size="xs" />
                    </InputSlot>
                    <InputField
                      placeholder="YYYY"
                      ref={yearRef}
                      keyboardType="numeric"
                      maxLength={4}
                      value={formData.dobYear}
                      className="font-bold"
                      onChangeText={(v) => updateForm('dobYear', v)}
                    />
                  </Input>
                </HStack>
                <FormControlError>
                  <FormControlErrorText>{dateErrorMessage}</FormControlErrorText>
                </FormControlError>
              </FormControl>
            </VStack>
          )}

          {/* STEP 3: Religion & Community */}
          {step === 3 && (
            <VStack className="gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Religion Details</Heading>
                <Text size="sm" className="text-typography-500">Help us understand your background better.</Text>
              </VStack>

              <Box className="gap-6 mt-2">
                {/* 1. Religion Dropdown */}
                <FormControl isInvalid={validationTriggered && (!formData.religion)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Select Religion</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={lookups?.religion || []}
                    value={formData.religion}
                    onChange={(item: any) => {
                      updateForm('religion', item.value)
                    }}
                    placeholder="Select Religion "
                    icon={{ icon: Church, color: 'text-blue-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.religion}
                  />
                  <FormControlError>
                    <FormControlErrorText>Religion is required</FormControlErrorText>
                  </FormControlError>
                </FormControl>

                {/* 2. Community Dropdown (Appears after Religion) */}
                {formData.religion && (
                  <FormControl isInvalid={validationTriggered && (!formData.community)} className="animate-in fade-in slide-in-from-top-2">
                    <FormControlLabel className="mb-2">
                      <FormControlLabelText className="font-bold text-slate-700">Select Community</FormControlLabelText>
                    </FormControlLabel>
                    <FuturisticDropdown
                      data={lookups?.community || []}
                      value={formData.community}
                      onChange={(item: any) => {
                        updateForm('community', item.value)
                      }}
                      placeholder="Select Community "
                      icon={{ icon: Users, color: 'text-blue-500' }}
                      search={false}
                      isInvalid={validationTriggered && !formData.community}
                    />


                    <FormControlError>
                      <FormControlErrorText>Community is required</FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}

                {/* 3. Living In Dropdown (Appears after Community) */}
                {formData.religion && formData.community && (
                  <FormControl isInvalid={validationTriggered && (!formData.livingIn)} className="animate-in fade-in slide-in-from-top-2">
                    <FormControlLabel className="mb-2">
                      <FormControlLabelText className="font-bold text-slate-700">Select Living In</FormControlLabelText>
                    </FormControlLabel>
                    <FuturisticDropdown
                      data={lookups?.country || []}
                      value={formData.livingIn}
                      onChange={(item: any) => {
                        setValidationTriggered(false);
                        updateForm('livingIn', item.value);
                      }}
                      placeholder="Select Country "
                      icon={{ icon: Globe, color: 'text-blue-500' }}
                      search={false}
                      isInvalid={validationTriggered && !formData.livingIn}
                    />

                    <FormControlError>
                      <FormControlErrorText>Living In is required</FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              </Box>
            </VStack>
          )}

          {/* STEP 4: Contact Details*/}
          {step === 4 && (
            <VStack className="gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Contact Info</Heading>
                <Text size="sm" className="text-typography-500">How should we verify your account?</Text>
              </VStack>

              <Box className="gap-6 mt-2">
                {/* Email Address */}
                <FormControl isInvalid={validationTriggered && !validateEmail(formData.email)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Email Address</FormControlLabelText>
                  </FormControlLabel>
                  <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                    <InputSlot className="pl-4">
                      <Icon
                        as={validateEmail(formData.email) ? CheckCircle2 : Mail}
                        className={validateEmail(formData.email) ? "text-emerald-500" : "text-blue-500"}
                        size="sm"
                      />
                    </InputSlot>
                    <InputField
                      placeholder="name@example.com"
                      value={formData.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={(v) => updateForm('email', v.trim())}
                      className="font-medium"
                    />
                  </Input>
                  <AnimateError isVisible={validationTriggered && !validateEmail(formData.email)}>
                    {"Please enter a valid email address (e.g., name@domain.com)"}
                  </AnimateError>
                </FormControl>

                {/* Phone Number */}
                <FormControl isInvalid={validationTriggered && !validatePhone(formData.phone)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Phone Number</FormControlLabelText>
                  </FormControlLabel>
                  <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                    <InputSlot className="pl-4">
                      <Icon
                        as={validatePhone(formData.phone) ? CheckCircle2 : Phone}
                        className={validatePhone(formData.phone) ? "text-emerald-500" : "text-blue-500"}
                        size="sm"
                      />
                    </InputSlot>
                    <InputField
                      placeholder="10-digit mobile number"
                      ref={phoneRef}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={formData.phone}
                      onChangeText={(v) => updateForm('phone', v.replace(/[^0-9]/g, ''))}
                      className="font-medium"
                    />
                  </Input>
                  <AnimateError isVisible={validationTriggered && !validatePhone(formData.phone)}>
                    {"Please enter a valid 10-digit phone number"}
                  </AnimateError>
                </FormControl>

                {/* Security Badge */}
                <HStack space="xs" className="bg-slate-100/50 p-4 rounded-2xl items-center border border-slate-200 mt-2">
                  <Icon as={ShieldCheck} size="sm" className="text-slate-500" />
                  <Text className="text-[11px] text-slate-500 font-medium flex-1 uppercase tracking-tight">
                    We use OTP verification to keep the community safe.
                  </Text>
                </HStack>
                {/* Privacy Guarantee Badge */}
                <HStack space="xs" className="bg-emerald-50 p-4 rounded-2xl items-center border border-emerald-100 mt-2">
                  <Icon as={ShieldCheck} size="sm" className="text-emerald-600" />
                  <Text className="text-[12px] text-emerald-700 font-medium flex-1">
                    Your contact details are encrypted and never shared with other users without your permission.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          )}

          {/* STEP 5: Location & Sub-Community */}
          {step === 5 && (
            <VStack className="gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Profile Details</Heading>
                <Text size="sm" className="text-typography-500">Let’s pinpoint your location and heritage.</Text>
              </VStack>

              <Box className="gap-6 mt-2">
                {/* STATE DROPDOWN */}
                <FormControl isInvalid={validationTriggered && (!formData.state)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Current State</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={lookups?.state}
                    value={formData.state}
                    onChange={(item: any) => {
                      updateForm('state', item.value);
                      updateForm('city', '');
                      fetchCities(item.value);
                    }}
                    placeholder="Select State "
                    icon={{ icon: MapPin, color: 'text-blue-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.fatherDetails}
                  />
                  <AnimateError isVisible={validationTriggered && (!formData.state)}>
                    {"Please select your state"}
                  </AnimateError>
                </FormControl>

                {/* CITY DROPDOWN (Conditional & Searchable) */}
                {formData.state && (
                  <FormControl isInvalid={validationTriggered && (!formData.city)} className="animate-in fade-in slide-in-from-top-2">
                    <FormControlLabel className="mb-2">
                      <FormControlLabelText className="font-bold text-slate-700">Select City</FormControlLabelText>
                    </FormControlLabel>
                    <FuturisticDropdown
                      data={cities || []}
                      value={formData.city}
                      onChange={(item: any) => {
                        updateForm('city', item.value)
                      }}
                      placeholder="Select State "
                      icon={{ icon: Building2, color: 'text-blue-500' }}
                      search={true}
                      isInvalid={validationTriggered && !formData.city}
                    />

                    {/* <Dropdown
                      style={[styles.dropdown, { height: 64, borderRadius: 16, paddingHorizontal: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' }]}
                      placeholderStyle={{ color: '#94a3b8', fontSize: 16 }}
                      selectedTextStyle={{ color: '#1e293b', fontWeight: '600', fontSize: 16 }}
                      data={cities}
                      mode="modal"
                      search
                      searchPlaceholder="Search your city..."
                      labelField="CityName"
                      valueField="CityCode"
                      placeholder={isLoading ? "Loading cities..." : "Search City"}
                      value={formData.city}
                      renderLeftIcon={() => isLoading ? <ActivityIndicator size="small" color="#0891b2" className="mr-3" /> : <Icon as={Building2} size="sm" className="mr-3 text-blue-500" />}
                      renderRightIcon={() => <Icon as={ChevronDown} size="xs" className="text-slate-400" />}
                      onChange={item => updateForm('city', item.CityCode)}
                    /> */}
                    <AnimateError isVisible={validationTriggered && (!formData.city)}>
                      {"City selection is required"}
                    </AnimateError>
                  </FormControl>
                )}

                {/* SUB COMMUNITY DROPDOWN */}
                <FormControl isInvalid={validationTriggered && (!formData.sub_community)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Sub Community / Gothra</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={lookups?.sub_community || []}
                    value={formData.sub_community}
                    onChange={(item: any) => {
                      updateForm('sub_community', item.value)
                    }}
                    placeholder="Select Community "
                    icon={{ icon: Fingerprint, color: 'text-blue-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.sub_community}
                  />
                  <AnimateError isVisible={validationTriggered && (!formData.sub_community)}>
                    {"Sub community details are required"}
                  </AnimateError>
                </FormControl>

                {/* CASTE NO BAR CHECKBOX (Modernized) */}
                <Pressable
                  onPress={() => setIsCasteNoBar(!isCasteNoBar)}
                  className={`flex-row items-start p-4 rounded-2xl border-2 mt-2 ${isCasteNoBar ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent'}`}
                >
                  <Box className={`w-6 h-6 rounded-lg items-center justify-center mr-3 ${isCasteNoBar ? 'bg-blue-600' : 'bg-white border border-slate-300'}`}>
                    {isCasteNoBar && <Icon as={Check} size='lg' className="text-white" />}
                  </Box>
                  <VStack className="flex-1">
                    <Text className={`font-bold text-sm ${isCasteNoBar ? 'text-blue-900' : 'text-slate-700'}`}>Caste No Bar</Text>
                    <Text className="text-xs text-slate-500 leading-4 mt-1">Open to matches from any community for this profile.</Text>
                  </VStack>
                </Pressable>
              </Box>
            </VStack>
          )}

          {/* STEP 6: Marital Status & Dynamic Kids */}
          {step === 6 && (
            <VStack className="gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Family Details</Heading>
                <Text size="sm" className="text-typography-500">These details help us find your perfect match.</Text>
              </VStack>
              <VStack className="gap-6">
                {/* 1. Height Dropdown */}
                <FormControl isInvalid={validationTriggered && (!formData.height)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Height</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={HEIGHT_DATA || []}
                    value={formData.height}
                    onChange={(item: any) => {
                      updateForm('height', item.value)
                    }}
                    placeholder="Select Height "
                    icon={{ icon: Ruler, color: 'text-rose-500' }}
                    search={true}
                    isInvalid={validationTriggered && !formData.height}
                  />


                  <AnimateError isVisible={validationTriggered && (!formData.height)}>
                    {"Height is required"}
                  </AnimateError>
                </FormControl>

                {/* 2. Marital Status Dropdown */}
                <FormControl isInvalid={validationTriggered && (!formData.maritalStatus)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Marital Status</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={lookups?.marital_status || []}
                    value={formData.maritalStatus}
                    onChange={(item: any) => {
                      updateForm('maritalStatus', item.value);
                      updateForm('hasChildren', 'No');
                      updateForm('kids', []);
                    }}
                    placeholder="Select Marital Status "
                    icon={{ icon: Heart, color: 'text-rose-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.maritalStatus}
                  />
                  <AnimateError isVisible={validationTriggered && (!formData.maritalStatus)}>
                    {"Marital status is required"}
                  </AnimateError>
                </FormControl>

                {/* Conditional Kids Section */}
                {formData.maritalStatus !== 'NM' && formData.maritalStatus !== '' && (
                  <VStack className="gap-4 p-5 rounded-[24px] bg-slate-50 border border-slate-100 animate-in zoom-in-95">
                    <HStack className="items-center space-x-2 gap-2">
                      <Icon as={Baby} size="sm" className="text-cyan-600" />
                      <Heading size="sm" className="text-slate-800">Do you have children?</Heading>
                    </HStack>
                    <HStack className="gap-4">
                      {['No', 'Yes'].map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => updateForm('hasChildren', opt)}
                          className="flex-row items-center gap-2"
                        >
                          <Box className={`w-5 h-5 rounded-full border-2 items-center justify-center ${formData.hasChildren === opt ? 'border-cyan-600' : 'border-outline-300'}`}>
                            {formData.hasChildren === opt && <Box className="w-2.5 h-2.5 rounded-full bg-cyan-600" />}
                          </Box>
                          <Text>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </HStack>

                    {formData.hasChildren === 'Yes' && (
                      <VStack className="gap-4 mt-2">
                        <FormControl>
                          <FormControlLabel>
                            <FormControlLabelText className="text-xs font-bold text-slate-500 uppercase">Number of Children</FormControlLabelText>
                          </FormControlLabel>
                          <Input className="h-14 rounded-xl bg-white border-slate-200">
                            <InputField
                              placeholder="e.g. 2"
                              keyboardType="numeric"
                              value={formData.childrenCount}
                              onChangeText={handleChildrenCountChange}
                            />
                          </Input>
                        </FormControl>

                        {/* Dynamic Child Detail Cards */}
                        {formData.kids.map((kid: any, index: number) => (
                          <Box key={index} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-100 mb-2">
                            <HStack className="justify-between items-center mb-4">
                              <HStack space="xs" className="items-center">
                                <Box className="w-6 h-6 rounded-full bg-cyan-100 items-center justify-center">
                                  <Text className="text-[10px] font-bold text-cyan-700">{index + 1}</Text>
                                </Box>
                                <Text className="font-bold text-slate-700">Child Details</Text>
                              </HStack>
                              <TouchableOpacity onPress={() => removeChild(index)} className="p-2 bg-rose-50 rounded-full">
                                <Icon as={Trash2} size='md' className="text-rose-500" />
                              </TouchableOpacity>
                            </HStack>

                            <HStack className="gap-3">
                              <Input className="flex-1 h-12 rounded-xl border-slate-200">
                                <InputSlot className="pl-3"><Icon as={User} size='md' className="text-slate-400" /></InputSlot>
                                <InputField
                                  placeholder="Age"
                                  keyboardType="numeric"
                                  value={kid.age}
                                  onChangeText={(v) => updateKidDetail(index, 'age', v)}
                                />
                              </Input>
                              <Box className="flex-1">
                                <Select onValueChange={(v) => updateKidDetail(index, 'gender', v)} selectedValue={kid.gender}>
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                    <SelectInput placeholder="Gender" />
                                  </SelectTrigger>
                                  <SelectPortal><SelectBackdrop /><SelectContent>
                                    <SelectItem label="Boy" value="Boy" /><SelectItem label="Girl" value="Girl" />
                                  </SelectContent></SelectPortal>
                                </Select>
                              </Box>
                            </HStack>

                            <HStack className="items-center justify-between mt-4 pt-4 border-t border-slate-50">
                              <Text className="text-xs font-semibold text-slate-500">Living with you?</Text>
                              <HStack className="gap-4">
                                {['Yes', 'No'].map(l => (
                                  <TouchableOpacity key={l} onPress={() => updateKidDetail(index, 'livingTogether', l)} className="flex-row items-center space-x-2">
                                    <Box className={`w-5 h-5 rounded-full border-2 items-center justify-center ${kid.livingTogether === l ? 'border-cyan-500' : 'border-slate-300'}`}>
                                      {kid.livingTogether === l && <Box className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                                    </Box>
                                    <Text className="text-xs font-bold text-slate-600">{l}</Text>
                                  </TouchableOpacity>
                                ))}
                              </HStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                )}
              </VStack>
            </VStack>
          )}

          {/* STEP 7: Education & Qualification */}
          {step === 7 && (
            <VStack className="gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Education</Heading>
                <Text size="sm" className="text-typography-500">Your academic background helps matches know you better.</Text>
              </VStack>

              <VStack className="gap-6">
                {/* 1. Highest Qualification Dropdown */}
                <FormControl isInvalid={validationTriggered && (!formData.qualification)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Highest Qualification</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={qualification || []}
                    value={formData.qualification}
                    onChange={(item: any) => {
                      updateForm('qualification', item.value);
                    }}
                    placeholder="Select Qualification"
                    icon={{ icon: GraduationCap, color: 'text-rose-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.maritalStatus}
                  />

                  <AnimateError isVisible={validationTriggered && (!formData.qualification)}>
                    {"Please select your highest qualification"}
                  </AnimateError>
                </FormControl>

                {/* 2. College / University Input */}
                <FormControl isInvalid={validationTriggered && (!formData.college)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">College / University</FormControlLabelText>
                  </FormControlLabel>
                  <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                    <InputSlot className="pl-4">
                      <Icon as={School} className="text-blue-500" size="sm" />
                    </InputSlot>
                    <InputField
                      placeholder="e.g. Stanford University"
                      value={formData.college}
                      onChangeText={(v) => updateForm('college', v)}
                      className="font-medium"
                    />
                  </Input>
                  <AnimateError isVisible={validationTriggered && (!formData.college)}>
                    {"College or University name is required"}
                  </AnimateError>
                </FormControl>

                {/* Educational Note */}
                <HStack space="xs" className="bg-blue-50/50 p-4 rounded-2xl items-center border border-blue-100 mt-2">
                  <Icon as={BookOpen} size="xs" className="text-blue-400" />
                  <Text className="text-[11px] text-blue-600 font-medium flex-1 uppercase tracking-wider">
                    Education is a key factor for many compatible matches.
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          )}

          {/* STEP 8: Work & Income */}
          {step === 8 && (
            <VStack className="gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <VStack space="xs">
                <Heading size="xl" className="text-typography-900 tracking-tight">Income & Work</Heading>
                <Text size="sm" className="text-typography-500">Financial stability and career are important for compatibility.</Text>
              </VStack>

              <VStack className="gap-6">
                <FormControl isInvalid={validationTriggered && (!formData.income)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Annual Income</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={_.orderBy(lookups?.income_range, ['value'], ['asc']) || []}
                    value={formData.income}
                    onChange={(item: any) => {
                      updateForm('income', item.value);
                    }}
                    placeholder="Select Annual Income "
                    icon={{ icon: Banknote, color: 'text-emerald-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.income}
                  />

                  <AnimateError isVisible={validationTriggered && (!formData.income)}>
                    {"Please select an income range"}
                  </AnimateError>
                </FormControl>

                <FormControl isInvalid={validationTriggered && (!formData.worksWith)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Working With</FormControlLabelText>
                  </FormControlLabel>
                  <FuturisticDropdown
                    data={lookups?.employment_sector || []}
                    value={formData.worksWith}
                    onChange={(item: any) => {
                      updateForm('worksWith', item.value);
                    }}
                    placeholder="Select Annual Income "
                    icon={{ icon: Banknote, color: 'text-blue-500' }}
                    search={false}
                    isInvalid={validationTriggered && !formData.worksWith}
                  />


                  <AnimateError isVisible={validationTriggered && (!formData.worksWith)}>
                    {"Work sector is required"}
                  </AnimateError>
                </FormControl>
                {formData.worksWith !== 'NWK' && formData.worksWith !== 'OTH' && (
                  <>
                    {/* Removed the raw '(' that was here */}
                    <FormControl isInvalid={validationTriggered && !formData.worksas}>
                      <FormControlLabel className="mb-2">
                        <FormControlLabelText className="font-bold text-slate-700">
                          Working As (Designation)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                        <InputSlot className="pl-4">
                          <Icon as={UserRound} className="text-blue-500" size="sm" />
                        </InputSlot>
                        <InputField
                          placeholder="e.g. Senior Product Manager"
                          value={formData.worksas}
                          onChangeText={(v) => updateForm('worksas', v)}
                          className="font-medium"
                        />
                      </Input>
                      <AnimateError isVisible={validationTriggered && !formData.worksas}>
                        {"Your designation is required"}
                      </AnimateError>
                    </FormControl>

                    <FormControl isInvalid={validationTriggered && !formData.companyName}>
                      <FormControlLabel className="mb-2">
                        <FormControlLabelText className="font-bold text-slate-700">
                          Employer / Company Name
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                        <InputSlot className="pl-4">
                          <Icon as={Building} className="text-blue-500" size="sm" />
                        </InputSlot>
                        <InputField
                          placeholder="e.g. Google / Self-Employed"
                          value={formData.companyName}
                          onChangeText={(v) => updateForm('companyName', v)}
                          className="font-medium"
                        />
                      </Input>
                      <AnimateError isVisible={validationTriggered && !formData.companyName}>
                        {"Company name is required"}
                      </AnimateError>
                    </FormControl>
                    {/* Removed the raw ')' that was here */}
                  </>
                )}
                {formData.worksWith === 'OTH' && <FormControl isInvalid={validationTriggered && (!formData.others)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Others</FormControlLabelText>
                  </FormControlLabel>
                  <Input size="lg" className="h-16 rounded-2xl bg-white border-outline-200 shadow-sm shadow-slate-100">
                    <InputSlot className="pl-4">
                      <Icon as={School} className="text-blue-500" size="sm" />
                    </InputSlot>
                    <InputField
                      placeholder="e.g. Full-time ministry"
                      value={formData.others}
                      onChangeText={(v) => updateForm('others', v)}
                      className="font-medium"
                    />
                  </Input>
                  <AnimateError isVisible={validationTriggered && (!formData.others)}>
                    {"Others is required"}
                  </AnimateError>
                </FormControl>
                }
              </VStack>
            </VStack>
          )}

          {/* STEP 9: Church details And Spirtual Details */}
          {step === 9 && selectedChurchData && (


            <Box className='flex-1'>
              <VStack
                space="lg"
                className="bg-blue-50/40 p-4 rounded-[32px] border border-blue-100/50 mt-2 shadow-sm shadow-blue-200/20"
              >
                <FormControl isInvalid={validationTriggered && (!formData.church_id)}>
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="font-bold text-slate-700">Church Details</FormControlLabelText>
                  </FormControlLabel>

                  <FuturisticDropdown
                    data={churches || []}
                    value={formData.church_id}
                    onChange={(item: any) => {
                      updateForm('church_id', item.value);
                      setSelectedChurchData(item);
                    }}
                    placeholder="Select Church "
                    icon={{ icon: ChurchIcon, color: 'text-blue-500' }}
                    search={true}
                    isInvalid={validationTriggered && !formData.church_id}
                  />

                  <AnimateError isVisible={validationTriggered && (!formData.church_id)}>
                    {"Church details are required"}
                  </AnimateError>
                </FormControl>

                {formData.church_id && (
                  <Box className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out mt-4 bg-blue-50/40 p-4 rounded-[28px] border border-blue-100/50">
                    <HStack space="sm" className="justify-between items-center mb-4">
                      <VStack>
                        <Text className="text-[10px] font-black text-blue-600 tracking-widest uppercase opacity-60">
                          Church Info
                        </Text>
                      </VStack>
                      <Box className="px-3 py-1 bg-white rounded-full border border-blue-100 shadow-sm shadow-blue-100">
                        <Text className="text-[10px] font-bold text-blue-500">OFFICIAL</Text>
                      </Box>
                    </HStack>

                    <VStack space="sm">
                      <InfoItem icon={User2} label="Pastor Name" value={selectedChurchData?.pastor_name} />

                      <Box className="h-[1px] bg-blue-100/50 w-full" />

                      <InfoItem icon={BookOpen} label="Denomination" value={selectedChurchData?.denomination} />
                      <InfoItem icon={MapPin} label="Address" value={selectedChurchData?.address} />

                      <HStack space="xl">
                        <Box className="flex-1">
                          <InfoItem icon={Building2} label="City" value={selectedChurchData?.city} />
                        </Box>
                        <Box className="flex-1">
                          <InfoItem icon={Phone} label="Contact" value={selectedChurchData?.church_phone} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                )}
              </VStack>

              <VStack space="md" className="mt-6">
                <Heading size="sm" className="text-slate-900 ml-1">Spiritual Status</Heading>

                <VStack space="sm">
                  {/* Saved Status */}
                  <StatusToggle
                    icon={Flame}
                    iconBg="bg-emerald-400"
                    iconColor="text-emerald-500"
                    title="Whether Saved (Born Again)"
                    desc="Personal commitment to Jesus"
                    value={formData.born_again}
                    onToggle={(v: any) => updateForm('born_again', v)}
                  />

                  {/* Water Baptism Section */}
                  <VStack
                    className={`rounded-[32px] transition-all duration-300 border ${formData.baptized ? 'bg-blue-50/30 border-blue-100 p-2' : 'bg-transparent border-transparent'
                      }`}
                  >
                    <StatusToggle
                      icon={Droplets}
                      iconBg={formData.baptized ? "bg-blue-500" : "bg-slate-100"}
                      iconColor={formData.baptized ? "text-white" : "text-slate-500"}
                      title="Whether Baptized?"
                      desc="Water baptism status"
                      value={formData.baptized}
                      onToggle={(v: any) => {
                        updateForm('baptized', v);
                        if (!v) {
                          updateForm('baptism_details', ''); // ✅ FIXED: Clears details text, not the boolean flag
                        }
                      }}
                    />

                    {/* Conditionally rendered inputs safely bound to boolean true */}
                    {Boolean(formData.baptized) && (
                      <Box className="px-4 pb-4 pt-2 animate-in fade-in zoom-in-95 duration-300">
                        <VStack space="xs">
                          <Text className="text-[10px] font-bold text-blue-600 uppercase ml-1 tracking-wider">
                            Baptism Date / Details
                          </Text>
                          <Input
                            variant="rounded"
                            className="bg-white border-blue-100 h-12 shadow-sm shadow-blue-200/20"
                          >
                            <InputSlot className="pl-3">
                              <Icon as={CalendarDays} className="text-blue-400" size="sm" />
                            </InputSlot>
                            <InputField
                              placeholder="e.g. June 2022 or 12/05/2021"
                              className="text-sm text-slate-700"
                              value={formData.baptism_details || ''}
                              onChangeText={(txt) => updateForm('baptism_details', txt)}
                            />
                          </Input>
                        </VStack>
                      </Box>
                    )}
                  </VStack>

                  {/* Holy Spirit Baptism Status */}
                  <StatusToggle
                    icon={Wind}
                    iconBg="bg-teal-100"
                    iconColor="text-teal-500"
                    title="Baptized in the Spirit?"
                    desc="Experience of Holy Spirit baptism"
                    value={formData.spirit}
                    onToggle={(v: any) => updateForm('spirit', v)}
                  />
                </VStack>
              </VStack>
            </Box>


          )}

          {/* STEP 9: Photo */}
          {step === 10 && (
            <VStack className="gap-6 items-center">
              <Heading size="xl">Add Profile Photo</Heading>
              <TouchableOpacity onPress={handlePickImage} disabled={isUploading}>
                <Box className="w-48 h-48 rounded-full border-2 border-dashed border-outline-300 overflow-hidden items-center justify-center bg-background-50">
                  {formData.profileThumb ? (
                    <Image source={{ uri: formData.profileThumb }} className="w-full h-full" />
                  ) : (
                    isUploading ? <Spinner size="large" /> : <Text className="text-typography-400">Tap to upload</Text>
                  )}
                </Box>
              </TouchableOpacity>
            </VStack>

          )}

          {/* STEP 10: Hobbies */}
          {step === 11 && (

            <ScrollView className="px-6 pb-10" showsVerticalScrollIndicator={false}>
              <VStack className="items-center mb-8">
                {/* <Box className="w-16 h-16 rounded-[22px] items-center justify-center bg-emerald-50 border-b-4 border-emerald-200">
                  <Icon as={Sparkles} size='xl' className="text-emerald-600" />
                </Box> */}
                <Heading size="xl" className="mt-4">Interests</Heading>
                <Text size="sm" className="text-slate-500">
                  {localSelected.length} / {MAX_HOBBIES} selected
                </Text>
              </VStack>

              <VStack space="xl" className="pb-10">
                {categories.map((cat: any) => (
                  <VStack key={`cat-${cat.value}`} space="md" className="mb-6">
                    {/* Category Label */}
                    <HStack space="sm" className="mb-2 mt-4 px-1 item-center">
                      {/* Small vertical accent line */}
                      <Text className="text-[14px] font-extrabold text-emerald-700 uppercase  ">
                        {cat.label}
                      </Text>
                    </HStack>

                    {/* Hobbies in this Category */}
                    <HStack className="flex-wrap gap-3">
                      {(lookups?.hobbies || [])
                        .filter((h: any) => h.parent === cat.value)
                        .map((hobby: any) => {
                          const hVal = String(hobby.value);
                          const isSelected = localSelected.includes(hVal);
                          const isMax = localSelected.length >= MAX_HOBBIES;

                          return (
                            <TouchableOpacity
                              key={`hobby-${hVal}`}
                              activeOpacity={0.7}
                              onPress={() => internalToggle(hVal)}
                              // Keep structural styles in className
                              className="px-4 py-2.5 rounded-2xl border-2 flex-row items-center"
                              // Use standard style for all DYNAMIC properties
                              style={{
                                backgroundColor: isSelected ? '#059669' : (isMax ? '#f8fafc' : '#ffffff'),
                                borderColor: isSelected ? '#059669' : '#e2e8f0',
                                opacity: !isSelected && isMax ? 0.4 : 1,
                                elevation: isSelected ? 2 : 0, // Optional: Add subtle shadow for Android
                              }}
                            >
                              {isSelected && (
                                <Icon as={Check} size="xs" className="text-white mr-1.5" />
                              )}
                              <Text
                                className="text-sm font-semibold"
                                style={{
                                  color: isSelected ? '#ffffff' : '#475569',
                                }}
                              >
                                {hobby.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </HStack>
                  </VStack>
                ))}
              </VStack>
            </ScrollView>
          )}


          {step === 12 &&
            <ScrollView
              contentContainerStyle={{ paddingBottom: 40 }}
              className="px-6 py-4"
              showsVerticalScrollIndicator={false}
            >
              <VStack space="xl">

                {/* 2026 Futuristic Icon Section */}
                <VStack className="items-center mb-8">


                  <Heading size="xl" className="mt-4 tracking-tight text-center text-typography-900">
                    Personality
                  </Heading>
                  <Text size="xs" className="text-typography-500 text-center mt-1 px-10">
                    Share your story. Profiles with thoughtful bios get 70% more engagement.
                  </Text>
                </VStack>

                <VStack space="md">
                  <Box className="relative">
                    <Textarea
                      size="lg"
                      className={`h-64 p-4 rounded-3xl border-2 transition-all bg-white ${aboutText.length >= MIN_CHARS
                        ? 'border-outline-100'
                        : 'border-error-100'
                        }`}
                    >
                      <TextareaInput
                        placeholder="Write something interesting about yourself..."
                        value={aboutText}
                        onChangeText={setAboutText}
                        maxLength={MAX_CHARS}
                        multiline
                        textAlignVertical="top"

                        className="text-lg leading-6 pr-8 text-typography-800"
                      />
                    </Textarea>

                    {/* Floating Clear Button */}
                    {aboutText.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setAboutText('')}
                        className="absolute top-4 right-4 bg-slate-100 p-1.5 rounded-full"
                      >
                        <Icon as={X} size='lg' className="text-slate-500" />
                      </TouchableOpacity>
                    )}

                    {/* Character Counter & Status */}
                    <HStack className="justify-between mt-3 px-2">
                      <HStack items-center space="xs">
                        <Box className={`w-2 h-2 rounded-full ${aboutText.length < MIN_CHARS ? 'bg-error-500' : 'bg-emerald-500'}`} />
                        <Text size="xs" className={aboutText.length < MIN_CHARS ? "text-error-600 font-medium" : "text-emerald-600 font-medium"}>
                          {aboutText.length < MIN_CHARS
                            ? `${MIN_CHARS - aboutText.length} characters to go`
                            : "Bio length is perfect"}
                        </Text>
                      </HStack>
                      <Text size="xs" className="text-typography-400 font-mono">
                        {aboutText.length}/{MAX_CHARS}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Tips Box */}
                  <Box className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mt-2">
                    <HStack space="sm" items-center className="mb-3">
                      <Icon as={Lightbulb} size="sm" className="text-amber-500" />
                      <Heading size="xs" className="text-slate-800">Writing Tips</Heading>
                    </HStack>
                    <VStack space="xs">
                      <Text size="xs" className="text-slate-600 leading-5">• Mention your career and future goals.</Text>
                      <Text size="xs" className="text-slate-600 leading-5">• Talk about your favorite weekend hobbies.</Text>
                      <Text size="xs" className="text-slate-600 leading-5">• Describe the qualities of your ideal partner.</Text>
                    </VStack>
                  </Box>
                </VStack>
                {/* <Box className="p-6 border-t border-outline-100 bg-white">
                    <HStack className="w-full gap-3">
                        <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl h-14 border-outline-300">
                            <ButtonText className="text-typography-600 font-bold">Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={handleSave}
                            isDisabled={isSaving || aboutText.length < MIN_CHARS}
                            className={`flex-1 rounded-2xl h-14 shadow-lg ${isSaving || aboutText.length < MIN_CHARS
                                ? 'bg-slate-200'
                                : 'bg-amber-500 shadow-amber-100'
                                }`}
                        >
                            {isSaving ? (
                                <Spinner color="white" />
                            ) : (
                                <ButtonText className="text-white font-bold text-lg">Submit</ButtonText>
                            )}
                         </Button>
                    </HStack>
                </Box> */}
              </VStack>
            </ScrollView>
          }


        </ScrollView>

        <Box className="p-6 bg-white border-t border-outline-50">
          <Button
            size="lg"
            className="bg-primary-600 rounded-full h-14"
            onPress={handleNextAction}
            isDisabled={isUploading}
          >
            {isUploading ? <Spinner color="$white" /> : <ButtonText className="text-white">{step === totalSteps ? 'Finish' : (step === 4 || step === 9) ? 'Submit' : 'Continue'}</ButtonText>}
          </Button>
        </Box>
      </Box>
      <UploadProgressModal
        isOpen={isUploading}
        uploadProgress={uploadProgress}
      />
    </KeyboardAvoidingView >
  );
}

// 2026 Modern Info Item
const InfoItem = ({ icon: IconComp, label, value }: any) => (
  <HStack space="lg" className="items-center py-2">
    {/* Squircle Icon Container */}
    <Box className="bg-blue-50/80 p-3 rounded-[18px]">
      <IconComp size={20} className="text-blue-600" strokeWidth={2.5} />
    </Box>
    <VStack className="flex-1">
      <Text className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</Text>
      <Text className="text-[15px] text-slate-800 font-semibold">{value || 'Not Provided'}</Text>
    </VStack>
  </HStack>
);

// 2026 Modern Toggle
const StatusToggle = ({ icon: IconComp, value, iconBg, iconColor, title, desc, onToggle }: any) => (
  <HStack
    className={`items-center justify-between p-4 rounded-[28px] border mb-3 transition-all bg-white border-emerald-100 shadow-md shadow-emerald-50 '
      }`}
  >
    <HStack space="md" className="items-center">


      {/* Icon glows when active */}
      <Box className={`p-3 rounded-2xl ${value ? iconBg + ' ' + iconColor : 'bg-slate-200'}`}>
        <IconComp size={20} className={value ? 'bg-emerald-500' : 'bg-emerald-500'} />
      </Box>
      <VStack>
        <Text className={`text-md font-bold ${value ? 'text-emerald-900' : 'text-slate-900'}`}>{title}</Text>
        <Text className="text-[12px] text-slate-500">{desc}</Text>
      </VStack>
    </HStack>
    <Switch
      size='lg'
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#e2e8f0", true: "#10b981" }}
      thumbColor="#ffffff"
    />
  </HStack>
);

const styles = StyleSheet.create({
  container: {},
  dropdown: {
    height: 60,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    // marginBottom: 20,
    overflow: 'hidden'
  },
});