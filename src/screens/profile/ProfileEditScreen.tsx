import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Heading, Input, InputField, Button, ButtonText, Spinner, useToast, Toast, ToastTitle, Center, Avatar, AvatarImage, Text, HStack, VStack, Modal, ModalBackdrop, ModalContent, Progress, ProgressFilledTrack } from '@/src/components/common/GluestackUI';
import api from '@/src/api/api';
import { launchImageLibrary } from 'react-native-image-picker';
import { Accessibility, Activity, Baby, Banknote, Briefcase, Calendar, CameraIcon, Check, CheckCircle2, CheckIcon, ChevronDown, ChevronDownIcon, ChevronLeftIcon, ChevronUp, ChevronUpIcon, Coffee, Droplets, EditIcon, Globe, GraduationCap, Heart, Icon, Info, Languages, Mail, MapPin, MessageSquareQuote, MoonStar, Network, Phone, Ruler, Scale, School, ShieldCheck, Sparkles, User, UserRound, Users, Users2, UserSquare } from '@/src/components/common/IconUI';
import FastImage from '@d11/react-native-fast-image';
import { useAuth } from '@/src/context/AuthContext';
import LottieView from 'lottie-react-native';
import EditBasicsModalScreen from './home_sub_screen/EditBasicsModalScreen';
import EditReligionModal from './home_sub_screen/EditReligionModal';
import EditAboutModal from './home_sub_screen/EditAboutModal';
import ContactModal from './home_sub_screen/ContactModal';
import EditHobbiesModal from './home_sub_screen/EditHobbiesModal';
import { FamilyDetailsModal } from './home_sub_screen/FamilyDetailsModal';
import { EducationDetailsModal } from './home_sub_screen/EducationDetailsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_DEV_Profiles_Images } from '@/src/utils/environment';
import { compressWithSkia } from '@/src/utils/compressWithSkia';
import { BlurView } from '@react-native-community/blur';
import { UploadProgressModal } from '../common/UploadProgressModal';
import profileService from '@/src/services/profileService';
import { ProfileSkeleton } from '@/src/components/common/ProfileSkeleton';
import { LookupContext } from '@/src/context/LookupContext';
import { useAppToast } from '@/src/context/ToastContext';
import NoDataScreen from '../common/NoDataScreen';
import { Plus } from 'lucide-react-native';
import { getExtension } from '@/src/utils/common';
import HeaderSession from '../common/HeaderSession';
import GradientView from '../component/GradientView';


export default function ProfileEditScreen({ navigation, route }: any) {
  const { user, updateUser } = useAuth(); // Assume refreshUser updates your context
  const { lookups } = useContext(LookupContext);
  const { showToast } = useAppToast();
  //console.log('lookuos', lookups)
  //console.log('ProfileDetailScreen===', user);
  const userid = user?.userid;
  const [profileImage, setProfileImage] = useState(API_BASE_URL_DEV_Profiles_Images + '/' + user?.profilePic);
  const [showBasicsModal, setShowBasicsModal] = useState(false);
  const [totalStrength, setTotalStrength] = useState<any>();
  const [checklist, setChecklist] = useState<any>();
  const [profileCompletion, setProfileCompletion] = useState(75);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);


  const [isExpanded, setIsExpanded] = useState(false);
  const confettiRef = useRef<LottieView>(null);
  const { width, height } = Dimensions.get('window');
  //const { strength, checklist } = calculateProfileStrength(profile);

  const [profileData, setProfileData] = useState<any>({
    userid: userid,
    religion: '',
    community: '',
    livingIn: '',
    isCasteNoBar: false,
    city: '',
    state: '',
    height: '',
    maritalStatus: '',
    hasChildren: false,
    childrenCount: '',
    kids: [{ gender: 'Boy' }, { gender: 'Girl' }, { gender: 'Boy' }, { gender: 'Girl' }],
    qualification: '',
    college: '',
    worksas: '',
    companyName: '',
    income: '',
    selectedHobbies: [],
    age: '',
    dob: '',
    diet: '',
    bloodGroup: '',
    motherTongue: '',
    isWillingToIntersubcaste: false,
    prefAgeMin: '',
    prefAgeMax: '',
    prefHeightMin: '',
    prefEducation: '',
    prefIncome: '',
    healthInfo: '',
    disability: '',
    childrenGender: '',
    subCommunity: '',
    mother_occupation: '',
    father_occupation: '',
    noOfSisters: '',
    noOfBrothers: '',
    familyLocation: '',
    country: '',
    familyFinancialStatus: '',
    annualIncome: '',
    workingAs: '',
    employerName: '',
    highestQualification: ''
  });
  const toast = useToast();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [showReligionModal, setShowReligionModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showHobbiesModal, setShowHobbiesModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [isHardReload, setIsHardReload] = useState(false);

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [qualification, setQualification] = useState<any>([]);
  const [is_verified_profile, setIs_verified_profile] = useState(true)


  // 2. Standard useEffect for initial mount
  useEffect(() => {
    loadData();
    loadLookupData();
    getProfileDataFromToken()
  }, []);

  useEffect(() => {
    // Trigger confetti when profile hits 100%
    if (totalStrength === 100) {
      setShowConfetti(true);
      setTimeout(() => {
        confettiRef.current?.play();
      }, 100);

      // Auto-hide confetti after 4 seconds
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [totalStrength]);

  const getProfileDataFromToken = async () => {
    const userData: any = await AsyncStorage.getItem('userData');
    if (userData && !userData?.profilePic) {
      getProfileDetails();
    }
  }
  const getProfileDetails = async () => {
    setLoading(true); // Show loader while refreshing
    try {
      const res = await profileService.setDefaultOrDeleteProfileImage(
        user?.profile_id,
        '',
        'get_default'
      );
      if (res.success) {
        if (res?.data?.is_verified == 1) {
          const updatedProfile: any = {
            profileThumb: res.data.file_name,
            profilePic: res.data.file_name,
          };
          await updateUser({ ...user, ...updatedProfile });
        } else setIs_verified_profile(false)
      }
    } catch (e) {
      console.error("Fetch Profile Error:", e);
    } finally {

    }
  };

  const getProfileCompletionData = (user: any) => {

    const sections = [
      {
        label: 'Profile Photo',
        weight: 25,
        isDone: !!user?.file_name,
        screen: 'profile'
      },
      {
        label: 'Basics & Lifestyle',
        weight: 25,
        isDone: !!user?.marital_status,
        screen: 'basicdetails'
      },
      {
        label: 'Religion & Community',
        weight: 25,
        isDone: !!user?.income && !!user?.religion_name && !!user?.community_name,
        screen: 'religion'
      },
      {
        label: 'Educations & Career',
        weight: 25,
        isDone: !!user?.work_with,
        //isDone: !!user?.about && user.about.length > 10,
        screen: 'education'
      },

    ];

    const totalStrength = sections.reduce((acc, item) => (item.isDone ? acc + item.weight : acc), 0);

    return { totalStrength, checklist: sections };
  };

  // 1. Move loadData outside so the Modal can call it too
  const loadData = async () => {
    setLoading(true); // Show loader while refreshing
    try {
      const res = await profileService.fetchProfileDetailsByID(user?.profile_id, 'edit');

      if (res.success) {
        let data = res.data;
        console.log('fetchProfileDetailsByID=', res)
        // Handle kids_details parsing safely
        try {
          if (typeof data.kids_details === 'string') {
            data.kids_details = data.kids_details ? JSON.parse(data.kids_details) : [];

          } if (!data.kids_details) {
            data.kids_details = [];
          }
        } catch (parseError) {
          console.error("Error parsing kids_details:", parseError);
          data.kids_details = []; // Fallback to empty array on error
        }
        data.brother_count = String(data.brother_count)
        data.sister_count = String(data.sister_count)

        setProfileData({
          ...data,
          // Ensure hobbies is always an array for your UI
          hobbies: typeof data.hobbies === 'string' ? data.hobbies.split(',') : (data.hobbies || []),
          hobbies_name: typeof data.hobbies_name === 'string' ? data.hobbies_name.split(',') : (data.hobbies_name || [])

        });
        const { totalStrength, checklist } = getProfileCompletionData(data);
        setTotalStrength(totalStrength);
        setChecklist(checklist);
        setProfileCompletion(totalStrength)
        setLoading(false);
        setIsDataLoaded(true)
      }
    } catch (e) {
      console.error("Fetch Profile Error:", e);
    } finally {

    }
  };
  const loadLookupData = async () => {
    setLoading(true); // Show loader while refreshing
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
      setLoading(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  // <Box className="flex-1 justify-center"><Spinner size="large" /></Box>;



  // 1. Profile Strength Component with Vibrant Gradient
  const ProfileStrength = ({ percentage }: { percentage: number }) => {
    // 1. Determine Color and Status based on percentage
    const getStatusDetails = (pct: number) => {
      if (pct <= 40) {
        return {
          colors: ['#FF4D4D', '#FF2424'], // Red
          status: 'Weak',
          textColor: 'text-red-500'
        };
      } else if (pct <= 70) {
        return {
          colors: ['#FFB84D', '#FF9D42'], // Yellow/Orange
          status: 'Average',
          textColor: 'text-orange-500'
        };
      } else {
        return {
          colors: ['#34D399', '#10B981'], // Green
          status: 'Excellent',
          textColor: 'text-green-500'
        };
      }
    };

    const { colors, status, textColor } = getStatusDetails(percentage);

    return (
      <Box className="mx-4 mt-6 p-5 rounded-[24px] bg-white border border-outline-50 shadow-sm">
        <HStack className="justify-between items-center mb-3">
          <Text size="sm" className="font-bold text-typography-900">
            Profile Strength: {percentage}%
          </Text>
          <Text size="xs" className={`${textColor} font-bold uppercase`}>
            {status}
          </Text>
        </HStack>

        {/* Background Track */}
        <Box className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          {/* Dynamic Gradient Progress */}
          <GradientView
            colors={colors}
            style={{ width: `${percentage}%`, height: '100%', borderRadius: 10 }}
          />
        </Box>

        <Text size="xs" className="mt-2 text-typography-500 leading-5">
          {percentage < 100
            ? "Add more details to reach 100% and get 3x more interests."
            : "Your profile is complete! You're seeing the best matches."}
        </Text>
      </Box>
    );
  };
  const ProfileChecklist = ({ checklist, profileAction }: any) => {
    // Safety check to ensure checklist exists before mapping
    if (!checklist || checklist.length === 0) return null;

    return (
      <Box className="mx-4 mt-4 p-5 rounded-[24px] bg-white border border-outline-50 shadow-sm">
        <Heading size="sm" className="mb-4 text-typography-900">Complete your profile</Heading>
        <VStack space="md">
          {checklist.map((item: any, index: number) => (
            <HStack key={`item-${index}`} className="justify-between items-center">
              <HStack space="sm" className="items-center">
                {/* Checkbox Circle */}
                <Box
                  className={`w-5 h-5 rounded-full items-center justify-center ${item.isDone ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                >
                  {item.isDone ? (
                    <Icon as={CheckIcon} size="2xs" className="text-white" />
                  ) : (
                    <Box className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </Box>

                {/* Label Text */}
                <Text
                  size="sm"
                  className={item.isDone ? 'text-typography-400 line-through' : 'text-typography-900 font-medium'}
                >
                  {item.label}
                </Text>
              </HStack>

              {/* Action Link */}
              {!item.isDone && (
                <TouchableOpacity
                  onPress={() => {
                    if (item.screen && profileAction) {
                      profileAction(item.screen);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text size="xs" className="text-primary-600 font-bold uppercase tracking-wider">
                    + Add
                  </Text>
                </TouchableOpacity>
              )}
            </HStack>
          ))}
        </VStack>
      </Box>
    );
  };
  // Reusable Gradient Card Component
  const GradientCard = ({ children, title, onEdit }: any) => (
    <Box className="mx-4 mt-4 rounded-[24px] overflow-hidden border border-outline-50 shadow-sm">
      <GradientView
        colors={['#ffffff', '#fcfcfc', '#f7f9fc']}
      >
        <VStack className="p-5">
          <HStack className="justify-between items-center mb-3">
            <Heading size="sm" className="text-error-500 font-bold uppercase tracking-wider">
              {title}
            </Heading>
            {title !== 'Contact Details' && <TouchableOpacity onPress={onEdit} className="bg-white p-2 rounded-full shadow-sm border border-outline-50">
              <Icon as={EditIcon} size="xs" className="text-gray-500" />
            </TouchableOpacity>}
          </HStack>
          {children}
        </VStack>
      </GradientView>
    </Box>
  );
  const updateForm = (key: string, value: any) => {
    setProfileData((prev: any) => ({ ...prev, [key]: value }));

  };

  const getAboutUs = () => {
    if (profileData.work_with !== 'NWK' && profileData.working_as) {
      return `Thank you for stopping by my profile! As a ${profileData.working_as}, my dreams and aspirations are the heartbeat of my journey toward success. I hope to find a life partner who is lovable and deeply understanding—someone who walks beside me as a best friend and stands firm with me through all of life's ups and downs. I look forward to hearing from you soon.`
    } else return `I am glad you chose to visit my profile. While I am currently focusing on my personal growth and home life, my dreams and aspirations constantly drive me toward a successful future. I am looking for a life partner who would be a true friend—lovable, deeply understanding, and ready to stand by me in every phase of life. Please feel free to connect with me anytime.`
  }
  const completeProfile = (action: string) => {
    if (action === 'profile') { navigation.navigate('ShowProfileGallery') }
    else if (action === 'basicdetails') { setShowBasicsModal(true) }
    else if (action === 'religion') { setShowReligionModal(true) }
    else if (action === 'education') { setShowEducationModal(true) }
    else { }

  }
  const profilePicUrl = getExtension(user?.profilePic == 'boy.png' ? "fake" : user?.profilePic, 'url');

  return (
    <Box className="flex-1 bg-[#F1F5F9]">

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
      <HeaderSession
        title="Profile details"
        theme="mint"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showRightIcon={true}
        rightIconType="menu"
        onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}
        refreshControl={
          <RefreshControl refreshing={isHardReload} onRefresh={loadData} tintColor="#6366f1" />
        }      >
        {loading ? (
          <Center className="flex-1 h-screen">
            <Spinner size='large' color="$primary500" />
          </Center>
        ) : isDataLoaded ? (
          <>
            <Box>
              {/* 1. HERO IMAGE SECTION (Matches ProfileDetailScreen) handlePickImage */}
              <Box className="h-[400px] w-full bg-white-900 relative overflow-hidden">
                <Pressable
                  onPress={() => navigation.navigate('ShowProfileGallery')}
                  className="flex-1"
                >
                  {profilePicUrl && profilePicUrl != 'fake' ? (
                    // Case 1: Image exists
                    <FastImage
                      source={{
                        uri: profilePicUrl,
                        priority: FastImage.priority.high
                      }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  ) : (
                    // Case 2: No image / Verification Pending
                    <Box className="flex-1 justify-center items-center bg-white-800">
                      <LottieView
                        source={require('../../assets/animations/default_profile.json')}
                        autoPlay
                        loop
                        style={{ width: '60%', height: '60%' }}
                      />
                      {!is_verified_profile && <Box className="absolute bottom-32 bg-black/40 px-4 py-1 rounded-full border border-white/10">
                        <Text className="text-white font-medium text-sm">Verification Pending</Text>
                      </Box>
                      }
                    </Box>
                  )}

                  {/* Camera Icon - Floating Glass Effect */}
                  <Box className="absolute top-14 right-6 z-30 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
                    <Icon as={CameraIcon} className="text-white" size="xl" />
                  </Box>
                </Pressable>

                {/* Back Button - Floating Glass Effect */}
                {/* <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="absolute top-14 left-6 z-30 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl"
                >
                  <Icon as={ChevronLeftIcon} className="text-white" size="xl" />
                </TouchableOpacity> */}

                {/* Bottom Gradient - Deeper and smoother for 2026 aesthetics */}
                <GradientView
                  colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', '#000']}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }}
                />
              </Box>
              {/* End Hero Image Section */}

              {/* Progress Section */}
              <ProfileStrength percentage={profileCompletion} />

              {/* 2. Interactive Checklist */}
              {/* {strength < 100 && <ProfileChecklist checklist={checklist} />} */}

              {/* Checklist: Only shows items that are NOT done */}
              {totalStrength < 100 && (
                <ProfileChecklist
                  checklist={checklist}
                  profileAction={completeProfile}
                />
              )}

              {/* End Checklist */}

              {/* 3. About Section */}
              <GradientCard
                title="Personality & Expectations"
                onEdit={() => setIsAboutModalVisible(true)}
              >
                <Box className="relative">
                  <Text
                    className="text-typography-600 leading-6 text-sm"
                    numberOfLines={isExpanded ? undefined : 3}
                  >

                    {profileData?.aboutus || getAboutUs()}
                  </Text>
                  {!isExpanded && (
                    <GradientView
                      colors={['rgba(255,255,255,0)', 'rgba(247,249,252,0.9)', '#f7f9fc']}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30 }}
                    />
                  )}
                </Box>
                <TouchableOpacity
                  onPress={() => setIsExpanded(!isExpanded)}
                  className="mt-2 self-center"
                >
                  <HStack className="items-center">
                    <Text className="text-cyan-600 font-bold text-xs uppercase tracking-tighter">
                      {isExpanded ? "Show Less" : "Read More"}
                    </Text>
                    <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} size="xs" className="text-cyan-600 ml-1" />
                  </HStack>
                </TouchableOpacity>
              </GradientCard>


              {isAboutModalVisible && <EditAboutModal
                isOpen={isAboutModalVisible}
                user={user}
                onClose={() => setIsAboutModalVisible(false)}
                content={profileData?.aboutus || getAboutUs()}
              />
              }

              {/* 4. Basics Details Card */}

              <GradientCard
                title="Basic Details"
                icon={User}
                onEdit={() => setShowBasicsModal(true)}
                // Using the Blue-to-White gradient for the "Identity" section
                gradientColors={['#eff6ff', '#ffffff']}
              >
                <VStack space="lg" className="mt-2">

                  {/* Row 1: Age & Date of Birth */}
                  <HStack items-center space="md">
                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={User} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Age</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.age} Years</Text>
                      </VStack>
                    </HStack>

                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Calendar} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">DOB</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.dob}</Text>
                      </VStack>
                    </HStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 2: Marital Status */}
                  <HStack items-center space="md">
                    <Box className="p-2.5 rounded-xl bg-blue-50">
                      <Icon as={Heart} size='lg' className="text-blue-600" />
                    </Box>
                    <VStack className="flex-1">
                      <Text size="xs" className="text-typography-500 font-medium">Marital Status</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.marital_status_name}</Text>
                    </VStack>
                  </HStack>

                  {/* Children Section */}
                  {profileData?.marital_status !== 'NM' && <VStack space="md" className="mt-2">
                    {profileData?.has_children === 'Yes' ? (
                      <>
                        {/* Summary Header */}
                        <HStack items-center space="md">
                          <Box className="p-2.5 rounded-xl bg-blue-50">
                            <Icon as={Baby} size='lg' className="text-blue-600" />
                          </Box>
                          <VStack className="flex-1">
                            <Text size="xs" className="text-typography-500 font-medium">Children Count</Text>
                            <Text size="md" className="text-typography-900 font-bold">
                              {profileData?.children_count || "0"} Children
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Individual Child Details */}
                        {(profileData?.kids_details).map((kid: any, index: number) => (
                          <Box
                            key={index}
                            className="ml-12 p-3 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <HStack space="md" className="justify-between items-center">
                              <VStack>
                                <Text size="xs" className="text-slate-500 uppercase font-bold">Child {index + 1}</Text>
                                <Text size="sm" className="text-typography-900 font-bold">
                                  {kid.age} Yrs • {kid.gender}
                                </Text>
                              </VStack>

                              <Box className={`px-2 py-1 rounded-md ${kid.livingTogether === 'Yes' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                <Text className={`text-[10px] font-bold ${kid.livingTogether === 'Yes' ? 'text-green-700' : 'text-amber-700'}`}>
                                  {kid.livingTogether === 'Yes' ? "LIVING WITH ME" : "NOT LIVING WITH ME"}
                                </Text>
                              </Box>
                            </HStack>
                          </Box>
                        ))}
                      </>
                    ) : (
                      /* Case: No Children */
                      <HStack items-center space="md">
                        <Box className="p-2.5 rounded-xl bg-blue-50">
                          <Icon as={Baby} size='lg' className="text-blue-600" />
                        </Box>
                        <VStack>
                          <Text size="xs" className="text-typography-500 font-medium">Children</Text>
                          <Text size="md" className="text-typography-900 font-bold">No Children</Text>
                        </VStack>
                      </HStack>
                    )}
                  </VStack>}




                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 3: Diet & Blood Group */}
                  <HStack items-center space="md">
                    {/* <HStack items-center space="md" className="flex-1">
                    <Box className="p-2.5 rounded-xl bg-blue-50">
                      <Icon as={Coffee} size='lg' className="text-blue-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium">Diet</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.diet || "Veg"}</Text>
                    </VStack>
                  </HStack> */}

                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Droplets} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Blood Group</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.bloodGroup || "O+"}</Text>
                      </VStack>
                    </HStack>

                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Accessibility} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Disability</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.disability || "Not Specified"}</Text>
                      </VStack>
                    </HStack>
                  </HStack>

                  {/* Row 5: Health & Disability */}
                  {/* <HStack items-center space="md">
                  <HStack items-center space="md" className="flex-1">
                    <Box className="p-2.5 rounded-xl bg-blue-50">
                      <Icon as={Activity} size='lg' className="text-blue-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium">Health Info</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.healthInfo || "Fit / Healthy"}</Text>
                    </VStack>
                  </HStack>

                  <HStack items-center space="md" className="flex-1">
                    <Box className="p-2.5 rounded-xl bg-blue-50">
                      <Icon as={Accessibility} size='lg' className="text-blue-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium">Disability</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.disability || "None"}</Text>
                    </VStack>
                  </HStack>
                </HStack> */}


                  {/* Verification Hint */}
                  <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
                    <Icon as={Info} size='sm' className="text-slate-400" />
                    <Text size="xs" className="text-slate-500 italic">
                      Basic info like Age & DOB are verified via govt. ID.
                    </Text>
                  </HStack>

                </VStack>
              </GradientCard>

              {/* The Modal Component */}
              {showBasicsModal && <EditBasicsModalScreen
                isOpen={showBasicsModal}
                onClose={() => setShowBasicsModal(false)}
                content={profileData}
                user={user}
                onRefresh={loadData}
                lookups={lookups}
                showToast={showToast}
              />}

              {/* End Basics Details Card */}


              {/* 4. Religious & Community Details */}

              <GradientCard
                title="Religion & Community"
                icon={MoonStar}
                onEdit={() => setShowReligionModal(true)}
                gradientColors={['#f0f9ff', '#ffffff']} // Updated to Blue theme
              >
                <VStack space="lg" className="mt-2">
                  {/* Row 1: Religion */}
                  <HStack items-center space="md">
                    <Box className="p-2.5 rounded-xl bg-blue-50">
                      <Icon as={MoonStar} size='lg' className="text-blue-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Religion</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.religion_name || "Not Specified"}</Text>
                    </VStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 2: Mother Tongue */}
                  <HStack items-center space="md">
                    <Box className="p-2.5 rounded-xl bg-blue-50">
                      <Icon as={Languages} size='lg' className="text-blue-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Mother Tongue</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.mother_tongues_name || "Not Specified"}</Text>
                    </VStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 3: Community & Sub Community */}
                  <HStack items-center space="md">
                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Users2} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Community</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.community_name || "Not Specified"}</Text>
                      </VStack>
                    </HStack>
                    <VStack className="flex-1 border-l border-slate-100 pl-4">
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Sub Community</Text>
                      <Text size="md" className="text-typography-900 font-bold">{profileData?.sub_community_name || "None"}</Text>
                    </VStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 4: Caste No Bar Status */}
                  <HStack items-center space="md">
                    <Box className={`p-2.5 rounded-xl ${profileData?.isCasteNoBar ? 'bg-blue-600' : 'bg-slate-100'}`}>
                      <Icon as={Check} size='sm' className={profileData?.isCasteNoBar ? 'text-white' : 'text-slate-400'} />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Preference</Text>
                      <Text size="md" className={`font-bold ${profileData?.is_caste_no_bar === 1 ? 'text-blue-600' : 'text-typography-900'}`}>
                        {profileData?.is_caste_no_bar === 1 ? "Caste No Bar" : "Specific Community Only"}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Community Match Hint */}
                  <HStack space="xs" items-center className="bg-blue-50/50 p-3 rounded-2xl mt-2 border border-blue-100">
                    <Icon as={Info} size='sm' className="text-blue-400" />
                    <Text size="xs" className="text-blue-600 italic">
                      {profileData?.is_caste_no_bar === 1
                        ? "You'll see matches from all communities."
                        : `Showing active profiles from the ${profileData?.community || 'selected'} community.`}
                    </Text>
                  </HStack>
                </VStack>
              </GradientCard>

              {showReligionModal && <EditReligionModal
                isOpen={showReligionModal}
                onClose={() => setShowReligionModal(false)}
                content={profileData}
                lookups={lookups}
                onRefresh={loadData}
                showToast={showToast}
                user={user}
              />}
              {/* 4. End Religious & Community Details */}

              {/*  4. Contact details */}

              <GradientCard
                title="Contact Details"
                icon={Phone}
                onEdit={() =>
                  setShowContactModal(true)
                }
                // A clean Cyan-to-White gradient for a fresh communication feel
                gradientColors={['#ecfeff', '#ffffff']}
              >
                <VStack space="lg" className="mt-2">

                  {/* Phone Number Row */}
                  <HStack items-center justify-between className="py-2">
                    <HStack space="md" items-center>
                      <Box className="p-2.5 rounded-xl bg-cyan-50">
                        <Icon as={Phone} size='lg' className="text-cyan-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Mobile Number</Text>
                        <HStack items-center space="xs">
                          <Text size="md" className="text-typography-900 font-bold">
                            {user?.phone || "Not Specified"}
                          </Text>
                          {user?.phone && (
                            <Icon as={CheckCircle2} size='lg' className="text-emerald-500" />
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </HStack>

                  {/* Divider */}
                  <Box className="h-[1px] bg-slate-100 w-full" />


                  {/* Email Row */}
                  <HStack items-center justify-between className="py-2">
                    <HStack space="md" items-center>
                      <Box className="p-2.5 rounded-xl bg-cyan-50">
                        <Icon as={Mail} size='lg' className="text-cyan-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Email Address</Text>
                        <HStack items-center space="xs">
                          <Text size="md" className="text-typography-900 font-bold">
                            {user?.email || "Not Specified"}
                          </Text>
                          {user?.email && (
                            <Icon as={CheckCircle2} size='lg' className="text-emerald-500" />
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </HStack>

                  {/* Privacy Badge */}
                  <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
                    <Icon as={ShieldCheck} size='sm' className="text-emerald-600" />
                    <Text size="xs" className="text-slate-500 italic">
                      Your contact details are only shared with accepted matches.
                    </Text>
                  </HStack>

                </VStack>
              </GradientCard>

              <ContactModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                formData={profileData}
                // updateForm={updateForm}
                // onSave={handleSaveContact}
                // isSaving={isSaving}
                validationTriggered={false} // Set to true if you want to show errors immediately
              />
              {/* 4. End Contact details */}


              {/* 5. Family Details Section */}

              <GradientCard
                title="Family Details"
                icon={Users}
                onEdit={() => setShowFamilyModal(true)}
                gradientColors={['#f0f9ff', '#ffffff']} // Professional blue gradient
              >
                <VStack space="lg" className="mt-2">

                  {/* Row 1: Parents */}
                  <HStack items-center space="md">
                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={UserRound} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Mother</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.mother_occupation_name || "Not Specified"}</Text>
                      </VStack>
                    </HStack>

                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={UserSquare} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Father</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.father_occupation_name || "Not Specified"}</Text>
                      </VStack>
                    </HStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 2: Siblings */}
                  <HStack items-center space="md">
                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Users2} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Sisters</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.sister_count ?? "0"}</Text>
                      </VStack>
                    </HStack>

                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Users} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Brothers</Text>
                        <Text size="md" className="text-typography-900 font-bold">{profileData?.brother_count || "0"}</Text>
                      </VStack>
                    </HStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 3: Financial Status (New Field) */}
                  <HStack items-center space="md">
                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={Briefcase} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Financial Status</Text>
                        <HStack space="xs" items-center>
                          <Text size="md" className="text-typography-900 font-bold">{profileData?.family_type || "Not Specified"}</Text>
                          {profileData?.family_type === 'Elite' && <Box className="w-2 h-2 rounded-full bg-amber-400" />}
                        </HStack>
                      </VStack>
                    </HStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  {/* Row 4: Location */}
                  <HStack items-center space="md">
                    <HStack items-center space="md" className="flex-1">
                      <Box className="p-2.5 rounded-xl bg-blue-50">
                        <Icon as={MapPin} size='lg' className="text-blue-600" />
                      </Box>
                      <VStack className="flex-1">
                        <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Family Location</Text>
                        <Text size="md" className="text-typography-900 font-bold" numberOfLines={1} ellipsizeMode="tail">
                          {profileData?.city_name ? `${profileData?.city_name}, ${profileData?.state_name}` : "Location not set"}
                        </Text>
                      </VStack>
                    </HStack>
                  </HStack>

                </VStack>
              </GradientCard>
              {showFamilyModal && <FamilyDetailsModal
                isOpen={showFamilyModal}
                onClose={() => setShowFamilyModal(false)}
                updateForm={updateForm}
                content={profileData}
                lookups={lookups}
                onRefresh={loadData}
                showToast={showToast}
                user={user}
              />
              }
              {/* End Family Details Section*/}




              {/* 7. Education and Career Section */}

              <GradientCard
                title="Education & Career"
                icon={GraduationCap}
                onEdit={() => setShowEducationModal(true)}
                gradientColors={['#f5f3ff', '#ffffff']} // Violet-50 to White
              >
                <VStack space="lg" className="mt-2">
                  <HStack items-center space="md">
                    <Box className="p-2.5 rounded-xl bg-violet-50 justify-center">
                      <Icon as={GraduationCap} size='xl' className="text-violet-600" />
                    </Box>
                    <VStack className="flex-1">
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Highest Qualification</Text>
                      <Text size="md" className="text-typography-900 font-bold">
                        {profileData?.qualification_name || "Not specified"}
                      </Text>
                      <Text size="sm" className="text-typography-600 italic">
                        {profileData?.college || "Not specified"}
                      </Text>
                    </VStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  <HStack items-center space="md">
                    <Box className="p-2.5 rounded-xl bg-violet-50 justify-center">
                      <Icon as={Briefcase} size='xl' className="text-violet-600" />
                    </Box>
                    <VStack className="flex-1">
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Working As</Text>
                      <Text size="md" className="text-typography-900 font-bold">
                        {(() => {
                          const { work_with, work_with_name, others, working_as } = profileData || {};

                          // 1. Not working scenario
                          if (work_with === 'NWK') return work_with_name;

                          // 2. Others or standard working scenario
                          // Create an array of potential pieces, filter out anything empty/null
                          const parts = work_with === 'OTH'
                            ? [work_with_name, others, working_as]
                            : [work_with_name, working_as];

                          const displayString = parts.filter(Boolean).join(' - ');

                          return displayString || "Not specified";
                        })()}
                      </Text>
                      {profileData?.work_with && profileData?.work_with !== 'NWK' && <Text size="sm" className="text-typography-600">
                        {profileData?.company_name || "Not specified"}
                      </Text>
                      }
                    </VStack>
                  </HStack>

                  <Box className="h-[1px] bg-slate-100 w-full" />

                  <HStack items-center space="md">
                    <Box className="p-2.5 rounded-xl bg-violet-50">
                      <Icon as={Banknote} size='xl' className="text-violet-600" />
                    </Box>
                    <VStack className="flex-1">
                      <Text size="xs" className="text-typography-500 font-medium uppercase tracking-tight">Annual Income</Text>
                      <Text size="md" className="text-typography-900 font-bold">
                        {profileData?.income_name || "Dont want to specify"}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </GradientCard>

              {/* THE MODAL CALL */}
              <EducationDetailsModal
                isOpen={showEducationModal}
                onClose={() => setShowEducationModal(false)}
                formData={profileData} // Pass your state data
                updateForm={updateForm} // Pass your update function
                qualification={qualification}
                lookups={lookups}
                showToast={showToast}
                onRefresh={loadData}
                user={user}
              />



              {/* 9. Hobbies */}

              <GradientCard
                title="Hobbies & Interests"
                icon={Sparkles}
                onEdit={() => setShowHobbiesModal(true)}
                gradientColors={['#f0fdf4', '#ffffff']}
              >
                <Box className="mt-4">
                  {profileData?.hobbies_name?.length > 0 ? (
                    <HStack className="flex-wrap gap-3">
                      {profileData?.hobbies_name.map((hobby: any, index: number) => (
                        <Box key={hobby} className="relative">

                          {/* 1. The "Aura" Shadow Layer (Colored Glow) */}
                          <Box
                            className="absolute inset-0 bg-emerald-400/20 blur-md rounded-2xl"
                            style={{ transform: [{ translateY: 4 }] }}
                          />

                          {/* 2. The Glass Chip */}
                          <Box
                            className="flex-row items-center px-4 py-2 rounded-[18px] bg-white/70 border border-white"
                            style={{

                              shadowColor: '#3b3e3dff',
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                            }}
                          >
                            {/* Pulsing Detail */}
                            <Box className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-400" />

                            <Text className="text-emerald-900 font-black text-[11px] uppercase tracking-[1px]">
                              {hobby}
                            </Text>
                          </Box>
                        </Box>
                      ))}


                    </HStack>
                  ) : (
                    /* Empty State Effect */
                    <Box className="py-10 items-center bg-white/40 rounded-[32px] border border-white/60 border-dashed">
                      <Box className="p-4 bg-emerald-50 rounded-full mb-3">
                        <Icon as={Sparkles} size="xl" className="text-emerald-300" />
                      </Box>
                      <Text className="text-slate-400 font-black text-[10px] uppercase tracking-[2px]">
                        Discover your vibe
                      </Text>
                    </Box>
                  )}
                </Box>
              </GradientCard>
              {showHobbiesModal && <EditHobbiesModal
                isOpen={showHobbiesModal}
                onClose={() => setShowHobbiesModal(false)}
                selectedHobbies={profileData?.hobbies}
                user={user}
                showToast={showToast}
                onRefresh={loadData}
                lookups={lookups}
              />
              }
              {/* 9. ENd Hobbiew */}

              {/* 10. Partner Preferences */}

              {/* <GradientCard
                title="Partner Preferences"
                icon={Heart}
                onEdit={() => setShowPreferencesModal(true)}
                // Using the same Rose-to-White gradient for consistency with the Location/Community cards
                gradientColors={['#fff1f2', '#ffffff']}
              >
                <VStack space="lg" className="mt-2">

                   <HStack items-center justify-between className="py-2">
                    <HStack space="md" items-center>
                      <Box className="p-2.5 rounded-xl bg-rose-50">
                        <Icon as={Scale} size='lg' className="text-rose-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Age & Height</Text>
                        <Text size="md" className="text-typography-900 font-bold">
                          {profileData?.prefAgeMin && profileData?.prefAgeMax
                            ? `${profileData?.prefAgeMin} - ${profileData?.prefAgeMax} Yrs`
                            : "Not Set"}
                          {profileData?.prefHeightMin && `, ${profileData?.prefHeightMin}+`}
                        </Text>
                      </VStack>
                    </HStack>
                  </HStack>

                   <Box className="h-[1px] bg-slate-100 w-full" />

                   <HStack items-center justify-between className="py-2">
                    <HStack space="md" items-center>
                      <Box className="p-2.5 rounded-xl bg-rose-50">
                        <Icon as={GraduationCap} size='lg' className="text-rose-600" />
                      </Box>
                      <VStack className="flex-1">
                        <Text size="xs" className="text-typography-500 font-medium">Professional Preference</Text>
                        <HStack items-center space="xs" className="flex-wrap">
                          <Text size="md" className="text-typography-900 font-bold">
                            {profileData?.prefEducation || "Any Education"}
                          </Text>
                          {profileData?.prefIncome && (
                            <Box className="bg-rose-100 px-2 py-0.5 rounded-full">
                              <Text className="text-[10px] text-rose-700 font-bold">
                                {profileData?.prefIncome}+ LPA
                              </Text>
                            </Box>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </HStack>

                   <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
                    <Icon as={Info} size='sm' className="text-slate-400" />
                    <Text size="xs" className="text-slate-500 italic">
                      Matches are filtered based on these criteria to improve compatibility.
                    </Text>
                  </HStack>

                </VStack>
              </GradientCard> */}

              <Box className="h-10" />
            </Box>
          </>

        ) : <Center className="flex-1 h-screen"><NoDataScreen /></Center>


        }
        <UploadProgressModal
          isOpen={isUploading}
          uploadProgress={uploadProgress}
        />
      </ScrollView>


    </Box>
  );
}





//#region  Sample desing codes
{/* 5. Location & Community */ }

{/* <GradientCard
              title="Location & Community"
              icon={MapPin}
              onEdit={() => setShowLocationModal(true)}
              // A soft rose-to-white gradient to represent social/location mapping
              gradientColors={['#fff1f2', '#ffffff']}
            >
              <VStack space="lg" className="mt-2">

                 <HStack items-center justify-between className="py-2">
                  <HStack space="md" items-center>
                    <Box className="p-2.5 rounded-xl bg-rose-50">
                      <Icon as={MapPin} size='lg' className="text-rose-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium">Location</Text>
                      <HStack space="xs" items-center>
                        <Text size="md" className="text-typography-900 font-bold">
                          {profileData?.city || "Not Specified"}
                        </Text>
                        {profileData?.city && (
                          <Icon as={CheckCircle2} size='lg' className="text-emerald-500" />
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </HStack>

                <Box className="h-[1px] bg-slate-100 w-full" />

                 <HStack items-center justify-between className="py-2">
                  <HStack space="md" items-center>
                    <Box className="p-2.5 rounded-xl bg-rose-50">
                      <Icon as={Globe} size='lg' className="text-rose-600" />
                    </Box>
                    <VStack>
                      <Text size="xs" className="text-typography-500 font-medium">Country</Text>
                      <Text size="md" className="text-typography-900 font-bold">
                        {profileData?.country || "Not Specified"}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>

                 <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
                  <Icon as={Info} size='sm' className="text-slate-400" />
                  <Text size="xs" className="text-slate-500 italic">
                    {profileData?.city ? `Showing you active profiles from ${profileData?.city}.` : "Update your location to see nearby matches."}
                  </Text>
                </HStack>

              </VStack>
            </GradientCard> */}


{/* <EditLocationModal
              isOpen={showLocationModal}
              onClose={() => setShowLocationModal(false)}
              formData={profileData}
            updateForm={updateForm}
            STATES={STATES}
            cities={cities}
            isLoading={isLoadingCities}
            fetchCities={fetchCities}
            isCasteNoBar={isCasteNoBar}
            setIsCasteNoBar={setIsCasteNoBar}
            validationTriggered={validationTriggered}
            handleSave={handleSaveLocation}
            isSaving={isSaving}
            /> */}
{/* End Location Modal */ }

{/* 6. Personal & Family */ }
{/* <GradientCard
              title="Personal & Family"
              icon={Heart}
              onEdit={() => setShowFamilyModal(true)}
              gradientColors={['#ecfeff', '#ffffff']} // Cyan-50 to White
            >
              <VStack space="lg" className="mt-2">
                 <HStack space="md">
                  <DetailRow
                    icon={Ruler}
                    label="Height"
                    value={profileData?.height || "Not Set"}
                    className="flex-1"
                  />
                  <DetailRow
                    icon={Heart}
                    label="Status"
                    value={profileData?.maritalStatus || "Not Set"}
                    className="flex-1"
                  />
                </HStack>

                 {profileData?.maritalStatus !== 'Never Married' && (
                  <>
                    <Box className="h-[1px] bg-slate-100 w-full" />
                    <HStack items-center space="md" className="py-1">
                      <Box className="p-2.5 rounded-xl bg-cyan-50">
                        <Icon as={Baby} size='lg' className="text-cyan-600" />
                      </Box>
                      <VStack>
                        <Text size="xs" className="text-typography-500 font-medium">Children</Text>
                        <Text size="md" className="text-typography-900 font-bold">
                          {profileData?.hasChildren
                            ? `${profileData?.childrenCount} Child(ren) ${profileData?.kids.length > 0 ? `(${profileData?.kids.map((k: any) => k.gender).join(', ')})` : ''}`
                            : "No Children"}
                        </Text>
                      </VStack>
                    </HStack>
                  </>
                )}
              </VStack>
            </GradientCard> */}
{/* <EditFamilyModal
          isOpen={showFamilyModal}
          onClose={() => setShowFamilyModal(false)}
          formData={formData}
          updateForm={updateForm}
          HEIGHT_DATA={HEIGHT_DATA} // Your constant array
          MARITAL_STATUS={MARITAL_STATUS} // Your constant array
          handleChildrenCountChange={handleChildrenCountChange}
          updateKidDetail={updateKidDetail}
          removeChild={removeChild}
         validationTriggered={validationTriggered}
         handleSave={onSaveFamilyDetails} // Your API save function
         isSaving={isSaving}
        /> */}

{/* 8. Career & Income card */ }
{/* <GradientCard
              title="Career & Income"
              icon={Briefcase}
              onEdit={() => setShowCareerModal(true)}
              gradientColors={['#fffbeb', '#ffffff']} // Amber-50 to White
            >
              <VStack space="lg" className="mt-2">
                 <HStack items-center space="md">
                  <Box className="p-2.5 rounded-xl bg-amber-50">
                    <Icon as={Briefcase} size='xl' className="text-amber-600" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="xs" className="text-typography-500 font-medium">Profession</Text>
                    <Text size="md" className="text-typography-900 font-bold">
                      {profileData?.worksas || "Not Specified"}
                    </Text>
                    {profileData?.companyName && (
                      <Text size="xs" className="text-amber-700 font-medium">{profileData?.companyName}</Text>
                    )}
                  </VStack>
                </HStack>

                <Box className="h-[1px] bg-slate-100 w-full" />

                 <HStack items-center space="md">
                  <Box className="p-2.5 rounded-xl bg-amber-50">
                    <Icon as={Banknote} size='xl' className="text-amber-600" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="xs" className="text-typography-500 font-medium">Annual Income</Text>
                    <Text size="md" className="text-typography-900 font-bold">
                      {profileData?.income || "Not Specified"}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </GradientCard>

            <EditCareerModal
              isOpen={showCareerModal}
              onClose={() => setShowCareerModal(false)}
              formData={profileData}
              updateForm={updateForm}
              INCOME_RANGES={INCOME_RANGES}
              WORK_WITH={WORK_WITH}
           
            /> */}
//#endregion


