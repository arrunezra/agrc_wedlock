// import React, { useEffect, useRef, useState } from 'react';
// import { Dimensions, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
// import { Box, Heading, Input, InputField, Button, ButtonText, Spinner, useToast, Toast, ToastTitle, Center, Avatar, AvatarImage, Text, HStack, VStack } from '@/src/components/common/GluestackUI';
// import api from '@/src/api/api';
// import { launchImageLibrary } from 'react-native-image-picker';
// import { Baby, Banknote, Briefcase, Calendar, CameraIcon, CheckCircle2, CheckIcon, ChevronDown, ChevronDownIcon, ChevronLeftIcon, ChevronUp, ChevronUpIcon, Coffee, Droplets, EditIcon, Globe, GraduationCap, Heart, Icon, Info, Mail, MapPin, MessageSquareQuote, MoonStar, Phone, Ruler, Scale, School, ShieldCheck, Sparkles, User, Users, Users2 } from '@/src/components/common/IconUI';
// import FastImage from '@d11/react-native-fast-image';
// import LinearGradient from 'react-native-linear-gradient';
// import { calculateProfileStrength } from '@/src/utils/validators';
// import { COMMUNITIES, HEIGHT_DATA, HOBBIES, INCOME_RANGES, LIVINGIN, MARITAL_STATUS, RELIGION_DATA, WORK_WITH } from '@/src/utils/utils';
// import { useAuth } from '@/src/context/AuthContext';
// import LottieView from 'lottie-react-native';
 

// export default function ProfileEditScreen({ navigation, route }: any) {
//   const profile = route.params.profile;
//   const [showBasicsModal, setShowBasicsModal] = useState(false);
//   const { user } = useAuth(); // Assume refreshUser updates your context
//   const { totalStrength, checklist } = getProfileCompletionData(user);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const confettiRef = useRef<LottieView>(null);
//   const { width, height } = Dimensions.get('window');
//   //const { strength, checklist } = calculateProfileStrength(profile);
//   const [profileData, setProfileData] = useState({
//     work_sector: '',
//     income_range: '',
//     hobbies: [],
//     profile_thumb: '',
//   });
//   const [formData, setFormData] = useState({
//     religion: '',
//     community: '',
//     livingIn: '',
//     isCasteNoBar: false,
//     city: '',
//     state: '',
//     height: '',
//     maritalStatus: '',
//     hasChildren: '',
//     childrenCount: '',
//     kids: [],
//     qualification: '',
//     college: '',
//     worksas: '',
//     companyName: '',
//     income: '',
//     selectedHobbies: ['Traveling',
//       'Hiking',
//       'Painting',
//       'Dancing'],
//     age: '',
//     dob: '',
//     diet: '',
//     bloodGroup: '',
//     motherTongue: '',
//     isWillingToIntersubcaste: false,
//     prefAgeMin: '',
//     prefAgeMax: '',
//     prefHeightMin: '',
//     prefEducation: '',
//     prefIncome: '',
//   });
//   const hobbies = ['Cooking', 'Travelling', 'Music', 'Pets'];
//   const profileCompletion = 75; // This would be calculated dynamically
//   const toast = useToast();
//   const [showConfetti, setShowConfetti] = useState(false);
//   const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
//   const aboutText = profile?.about || "I am glad you chose to visit my profile...";
//   const [showReligionModal, setShowReligionModal] = useState(false);
//   const [showContactModal, setShowContactModal] = useState(false);
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [showFamilyModal, setShowFamilyModal] = useState(false);
//   const [showEducationModal, setShowEducationModal] = useState(false);
//   const [showCareerModal, setShowCareerModal] = useState(false);
//   const [showHobbiesModal, setShowHobbiesModal] = useState(false);
//   const [selectedHobbies, setSelectedHobbies] = useState(['Traveling',
//     'Hiking',
//     'Painting',
//     'Dancing']);

//   const [showPreferencesModal, setShowPreferencesModal] = useState(false);



//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const res = await api.get('/manage_profile.php');
//         if (res.data.success) {
//           const data = res.data.data;
//           setProfileData({
//             ...data,
//             hobbies: data.hobbies ? JSON.parse(data.hobbies) : []
//           });
//         }
//       } catch (e) { console.error(e); }
//       finally { setLoading(false); }
//     };
//     loadData();
//   }, []);

//   useEffect(() => {
//     // Trigger confetti when profile hits 100%
//     if (totalStrength === 100) {
//       setShowConfetti(true);
//       setTimeout(() => {
//         confettiRef.current?.play();
//       }, 100);

//       // Auto-hide confetti after 4 seconds
//       const timer = setTimeout(() => setShowConfetti(false), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [totalStrength]);
//   const handleImagePick = async () => {
//     const result = await launchImageLibrary({
//       mediaType: 'photo',
//       quality: 0.8,
//       includeBase64: true, // Useful for smaller thumbnails
//     });

//     if (result.assets && result.assets[0]) {
//       uploadImage(result.assets[0]);
//     }
//   };
//   const uploadImage = async (asset: any) => {
//     setSaving(true);
//     try {
//       const formData = new FormData();
//       formData.append('profile_image', {
//         uri: asset.uri,
//         type: asset.type,
//         name: asset.fileName || 'profile.jpg',
//       } as any);

//       const res = await api.post('/update_photo.php', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       if (res.data.success) {
//         // Update local state to show new photo immediately
//         setProfileData({ ...profileData, profile_thumb: res.data.url });
//         toast.show({ render: () => <Toast><ToastTitle>Photo Updated!</ToastTitle></Toast> });
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUpdate = async () => {
//     setSaving(true);
//     try {
//       const res = await api.post('/manage_profile.php', profileData);
//       if (res.data.success) {
//         toast.show({
//           placement: "top",
//           render: ({ id }) => (
//             <Toast nativeID={id} action="success" variant="solid">
//               <ToastTitle>Profile Updated Successfully</ToastTitle>
//             </Toast>
//           ),
//         });
//       }
//     } catch (e) { console.error(e); }
//     finally { setSaving(false); }
//   };

//   if (loading) return <Box className="flex-1 justify-center"><Spinner size="large" /></Box>;



//   // 1. Profile Strength Component with Vibrant Gradient
//   const ProfileStrength = ({ percentage }: { percentage: number }) => {
//     // 1. Determine Color and Status based on percentage
//     const getStatusDetails = (pct: number) => {
//       if (pct <= 40) {
//         return {
//           colors: ['#FF4D4D', '#FF2424'], // Red
//           status: 'Weak',
//           textColor: 'text-red-500'
//         };
//       } else if (pct <= 70) {
//         return {
//           colors: ['#FFB84D', '#FF9D42'], // Yellow/Orange
//           status: 'Average',
//           textColor: 'text-orange-500'
//         };
//       } else {
//         return {
//           colors: ['#34D399', '#10B981'], // Green
//           status: 'Excellent',
//           textColor: 'text-green-500'
//         };
//       }
//     };

//     const { colors, status, textColor } = getStatusDetails(percentage);

//     return (
//       <Box className="mx-4 mt-6 p-5 rounded-[24px] bg-white border border-outline-50 shadow-sm">
//         <HStack className="justify-between items-center mb-3">
//           <Text size="sm" className="font-bold text-typography-900">
//             Profile Strength: {percentage}%
//           </Text>
//           <Text size="xs" className={`${textColor} font-bold uppercase`}>
//             {status}
//           </Text>
//         </HStack>

//         {/* Background Track */}
//         <Box className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
//           {/* Dynamic Gradient Progress */}
//           <LinearGradient
//             colors={colors}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={{ width: `${percentage}%`, height: '100%', borderRadius: 10 }}
//           />
//         </Box>

//         <Text size="xs" className="mt-2 text-typography-500 leading-5">
//           {percentage < 100
//             ? "Add more details to reach 100% and get 3x more interests."
//             : "Your profile is complete! You're seeing the best matches."}
//         </Text>
//       </Box>
//     );
//   };
//   const ProfileChecklist = ({ checklist, navigation }: any) => {
//     // Safety check to ensure checklist exists before mapping
//     if (!checklist || checklist.length === 0) return null;

//     return (
//       <Box className="mx-4 mt-4 p-5 rounded-[24px] bg-white border border-outline-50 shadow-sm">
//         <Heading size="sm" className="mb-4 text-typography-900">Complete your profile</Heading>
//         <VStack space="md">
//           {checklist.map((item: any, index: number) => (
//             <HStack key={`item-${index}`} className="justify-between items-center">
//               <HStack space="sm" className="items-center">
//                 {/* Checkbox Circle */}
//                 <Box
//                   className={`w-5 h-5 rounded-full items-center justify-center ${item.isDone ? 'bg-green-500' : 'bg-gray-200'
//                     }`}
//                 >
//                   {item.isDone ? (
//                     <Icon as={CheckIcon} size="2xs" className="text-white" />
//                   ) : (
//                     <Box className="w-1.5 h-1.5 rounded-full bg-gray-400" />
//                   )}
//                 </Box>

//                 {/* Label Text */}
//                 <Text
//                   size="sm"
//                   className={item.isDone ? 'text-typography-400 line-through' : 'text-typography-900 font-medium'}
//                 >
//                   {item.label}
//                 </Text>
//               </HStack>

//               {/* Action Link */}
//               {!item.isDone && (
//                 <TouchableOpacity
//                   onPress={() => {
//                     if (item.screen && navigation) {
//                       navigation.navigate(item.screen);
//                     }
//                   }}
//                   activeOpacity={0.7}
//                 >
//                   <Text size="xs" className="text-primary-600 font-bold uppercase tracking-wider">
//                     + Add
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </HStack>
//           ))}
//         </VStack>
//       </Box>
//     );
//   };
//   // Reusable Gradient Card Component
//   const GradientCard = ({ children, title, onEdit }: any) => (
//     <Box className="mx-4 mt-4 rounded-[24px] overflow-hidden border border-outline-50 shadow-sm">
//       <LinearGradient
//         colors={['#ffffff', '#fcfcfc', '#f7f9fc']} // Soft professional gradient
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <VStack className="p-5">
//           <HStack className="justify-between items-center mb-3">
//             <Heading size="sm" className="text-error-500 font-bold uppercase tracking-wider">
//               {title}
//             </Heading>
//             <TouchableOpacity onPress={onEdit} className="bg-white p-2 rounded-full shadow-sm border border-outline-50">
//               <Icon as={EditIcon} size="xs" className="text-gray-500" />
//             </TouchableOpacity>
//           </HStack>
//           {children}
//         </VStack>
//       </LinearGradient>
//     </Box>
//   );
//   const updateForm = (key: string, value: any) => {
//     setFormData((prev: any) => ({ ...prev, [key]: value }));

//   };
//   // Logic to handle changing the number of children
//   const handleChildrenCountChange = (val: string) => {
//     const count = parseInt(val) || 0;
//     updateForm('childrenCount', val);

//     // Sync the kids array length with the input count
//     const currentKids = [...(formData.kids || [])];
//     if (count > currentKids.length) {
//       // Add new empty kid objects
//       const additional = Array(count - currentKids.length).fill({
//         age: '',
//         gender: '',
//         livingTogether: 'Yes'
//       });
//       updateForm('kids', [...currentKids, ...additional]);
//     } else {
//       // Trim the array if count decreased
//       updateForm('kids', currentKids.slice(0, count));
//     }
//   };

//   // Logic to update a specific property of a specific child
//   const updateKidDetail = (index: number, field: string, value: string) => {
//     const updatedKids: any = [...formData.kids];
//     updatedKids[index] = { ...updatedKids[index], [field]: value };
//     updateForm('kids', updatedKids);
//   };

//   // Logic to remove a single child via the trash icon
//   const removeChild = (index: number) => {
//     const updatedKids = formData.kids.filter((_, i) => i !== index);
//     updateForm('kids', updatedKids);
//     updateForm('childrenCount', updatedKids.length.toString());
//   };
//   const toggleHobby = (hobby: string) => {
//     setSelectedHobbies((prev: any) =>
//       prev.includes(hobby)
//         ? prev.filter((h: any) => h !== hobby)
//         : [...prev, hobby]
//     );
//   };

//   return (
//     <Box className="flex-1 bg-[#F1F5F9]">

//       <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

//         {/* 1. HERO IMAGE SECTION (Matches ProfileDetailScreen) */}
//         <Box className="h-[350px] w-full bg-gray-900">
//           <Pressable onPress={handleImagePick} className="flex-1">
//             <FastImage
//               source={{
//                 uri: 'https://agrcdev.jeasuns.com/agrcdev/php/uploads/profiles/AG0126-94693_1769585743.jpg',
//                 priority: FastImage.priority.high
//               }}
//               style={StyleSheet.absoluteFill}
//               resizeMode="cover"
//             />

//             {/* Camera Icon moved to Top Right */}
//             <Box className="absolute top-12 right-6 z-20 bg-black/30 p-2 rounded-full border border-white/20">
//               <Icon as={CameraIcon} className="text-white" size="xl" />
//             </Box>
//           </Pressable>

//           {/* Custom Back Button */}
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             className="absolute top-12 left-6 z-20 bg-black/30 p-2 rounded-full border border-white/20"
//           >
//             <Icon as={ChevronLeftIcon} className="text-white" size="xl" />
//           </TouchableOpacity>

//           {/* Gradient to blend into the white card */}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.1)', 'white']}
//             style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
//           />
//         </Box>
//         {/* Progress Section */}
//         <ProfileStrength percentage={profileCompletion} />

//         {/* 2. Interactive Checklist */}
//         {/* {strength < 100 && <ProfileChecklist checklist={checklist} />} */}

//         {/* Checklist: Only shows items that are NOT done */}
//         {totalStrength < 100 && (
//           <ProfileChecklist
//             checklist={checklist}
//             navigation={navigation}
//           />
//         )}
//         {/* 3. About Section */}
//         <GradientCard
//           title="Personality & Expectations"
//           onEdit={() => setIsAboutModalVisible(true)}
//         >
//           <Box className="relative">
//             <Text
//               className="text-typography-600 leading-6 text-sm"
//               numberOfLines={isExpanded ? undefined : 3}
//             >
//               {profile?.about || "I am glad you chose to visit my profile. Currently, I am employed as a Writer. My dreams and aspirations constantly drive me toward success..."}
//             </Text>
//             {!isExpanded && (
//               <LinearGradient
//                 colors={['rgba(255,255,255,0)', 'rgba(247,249,252,0.9)', '#f7f9fc']}
//                 style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30 }}
//               />
//             )}
//           </Box>
//           <TouchableOpacity
//             onPress={() => setIsExpanded(!isExpanded)}
//             className="mt-2 self-center"
//           >
//             <HStack className="items-center">
//               <Text className="text-cyan-600 font-bold text-xs uppercase tracking-tighter">
//                 {isExpanded ? "Show Less" : "Read More"}
//               </Text>
//               <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} size="xs" className="text-cyan-600 ml-1" />
//             </HStack>
//           </TouchableOpacity>
//         </GradientCard>


//         <EditAboutModal
//           isOpen={isAboutModalVisible}
//           onClose={() => setIsAboutModalVisible(false)}
//           content={profile?.about || "I am glad you chose to visit my profile. Currently, I am employed as a Writer. My dreams and aspirations constantly drive me toward success..."}
//         />

//         {/* 2. Basics Details Card */}

//         <GradientCard
//           title="Basic Details"
//           icon={User}
//           onEdit={() => setShowBasicsModal(true)}
//           // Using the Blue-to-White gradient for the "Identity" section
//           gradientColors={['#eff6ff', '#ffffff']}
//         >
//           <VStack space="lg" className="mt-2">

//             {/* Row 1: Age & Date of Birth */}
//             <HStack items-center space="md">
//               <HStack items-center space="md" className="flex-1">
//                 <Box className="p-2.5 rounded-xl bg-blue-50">
//                   <Icon as={User} size='lg' className="text-blue-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Age</Text>
//                   <Text size="md" className="text-typography-900 font-bold">{formData.age || "28"} Years</Text>
//                 </VStack>
//               </HStack>

//               <HStack items-center space="md" className="flex-1">
//                 <Box className="p-2.5 rounded-xl bg-blue-50">
//                   <Icon as={Calendar} size='lg' className="text-blue-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">DOB</Text>
//                   <Text size="md" className="text-typography-900 font-bold">{formData.dob || "01 Jan 1996"}</Text>
//                 </VStack>
//               </HStack>
//             </HStack>

//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Row 2: Marital Status */}
//             <HStack items-center space="md">
//               <Box className="p-2.5 rounded-xl bg-blue-50">
//                 <Icon as={Heart} size='lg' className="text-blue-600" />
//               </Box>
//               <VStack className="flex-1">
//                 <Text size="xs" className="text-typography-500 font-medium">Marital Status</Text>
//                 <Text size="md" className="text-typography-900 font-bold">{formData.maritalStatus || "Never Married"}</Text>
//               </VStack>
//             </HStack>

//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Row 3: Diet & Blood Group */}
//             <HStack items-center space="md">
//               <HStack items-center space="md" className="flex-1">
//                 <Box className="p-2.5 rounded-xl bg-blue-50">
//                   <Icon as={Coffee} size='lg' className="text-blue-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Diet</Text>
//                   <Text size="md" className="text-typography-900 font-bold">{formData.diet || "Veg"}</Text>
//                 </VStack>
//               </HStack>

//               <HStack items-center space="md" className="flex-1">
//                 <Box className="p-2.5 rounded-xl bg-blue-50">
//                   <Icon as={Droplets} size='lg' className="text-blue-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Blood Group</Text>
//                   <Text size="md" className="text-typography-900 font-bold">{formData.bloodGroup || "O+"}</Text>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Verification Hint */}
//             <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
//               <Icon as={Info} size='sm' className="text-slate-400" />
//               <Text size="xs" className="text-slate-500 italic">
//                 Basic info like Age & DOB are verified via govt. ID.
//               </Text>
//             </HStack>

//           </VStack>
//         </GradientCard>

//         {/* The Modal Component */}
//         <EditBasicsModalScreen
//           isOpen={showBasicsModal}
//           onClose={() => setShowBasicsModal(false)}
//           user={user}
//         />

//         {/* End Basics Details Card */}


//         {/* 4. Community and Religious Details */}

//         <GradientCard
//           title="Religion & Community"
//           icon={MoonStar}
//           onEdit={() => setShowReligionModal(true)}
//           // A soft rose-to-white gradient to match the Location card style
//           gradientColors={['#fff1f2', '#ffffff']}
//         >
//           <VStack space="lg" className="mt-2">

//             {/* Religion & Mother Tongue Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-rose-50">
//                   <Icon as={MoonStar} size='lg' className="text-rose-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Religion</Text>
//                   <Text size="md" className="text-typography-900 font-bold">
//                     {formData.religion && formData.motherTongue
//                       ? `${formData.religion}, ${formData.motherTongue}`
//                       : formData.religion || "Religion Not Set"}
//                   </Text>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Divider */}
//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Community Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-rose-50">
//                   <Icon as={Users2} size='lg' className="text-rose-600" />
//                 </Box>
//                 <VStack className="flex-1">
//                   <Text size="xs" className="text-typography-500 font-medium">Community</Text>
//                   <HStack items-center space="xs">
//                     <Text size="md" className="text-typography-900 font-bold">
//                       {formData.community || "Not Specified"}
//                     </Text>
//                     {/* Conditional Badge for specific preferences */}
//                     {formData.isWillingToIntersubcaste && (
//                       <Box className="bg-rose-100 px-2 py-0.5 rounded-full">
//                         <Text className="text-[10px] text-rose-700 font-bold">Inter-community OK</Text>
//                       </Box>
//                     )}
//                   </HStack>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Community Match Hint */}
//             <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
//               <Icon as={Info} size='sm' className="text-slate-400" />
//               <Text size="xs" className="text-slate-500 italic">
//                 {formData.religion
//                   ? `Showing you active profiles from the ${formData.religion} community.`
//                   : "Update your religion to see community-specific matches."}
//               </Text>
//             </HStack>

//           </VStack>
//         </GradientCard>
//         <EditReligionModal
//           isOpen={showReligionModal}
//           onClose={() => setShowReligionModal(false)}
//           formData={formData}
//           // updateForm={updateForm}
//           // onSave={handleSaveReligion}
//           // isSaving={isSaving}
//           // validationTriggered={validationTriggered}
//           data={{ RELIGION_DATA, COMMUNITIES, LIVINGIN }}
//         />
//         {/* 4. End Community and Religious Details */}

//         {/*  4. Contact details */}

//         <GradientCard
//           title="Contact Details"
//           icon={Phone}
//           onEdit={() => setShowContactModal(true)}
//           // A clean Cyan-to-White gradient for a fresh communication feel
//           gradientColors={['#ecfeff', '#ffffff']}
//         >
//           <VStack space="lg" className="mt-2">

//             {/* Phone Number Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-cyan-50">
//                   <Icon as={Phone} size='lg' className="text-cyan-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Mobile Number</Text>
//                   <HStack items-center space="xs">
//                     <Text size="md" className="text-typography-900 font-bold">
//                       {user?.phone || "Not Specified"}
//                     </Text>
//                     {user?.phone && (
//                       <Icon as={CheckCircle2} size='lg' className="text-emerald-500" />
//                     )}
//                   </HStack>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Divider */}
//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Email Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-cyan-50">
//                   <Icon as={Mail} size='lg' className="text-cyan-600" />
//                 </Box>
//                 <VStack className="flex-1">
//                   <Text size="xs" className="text-typography-500 font-medium">Email Address</Text>
//                   <Text size="md" className="text-typography-900 font-bold">
//                     {user?.email || "Not Specified"}
//                   </Text>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Privacy Badge */}
//             <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
//               <Icon as={ShieldCheck} size='sm' className="text-emerald-600" />
//               <Text size="xs" className="text-slate-500 italic">
//                 Your contact details are only shared with accepted matches.
//               </Text>
//             </HStack>

//           </VStack>
//         </GradientCard>

//         <ContactModal
//           isOpen={showContactModal}
//           onClose={() => setShowContactModal(false)}
//           formData={formData}
//           // updateForm={updateForm}
//           // onSave={handleSaveContact}
//           // isSaving={isSaving}
//           validationTriggered={false} // Set to true if you want to show errors immediately
//         />

//         {/* 4. End Contact details */}

//         {/* 5. Location & Community */}

//         <GradientCard
//           title="Location & Community"
//           icon={MapPin}
//           onEdit={() => setShowLocationModal(true)}
//           // A soft rose-to-white gradient to represent social/location mapping
//           gradientColors={['#fff1f2', '#ffffff']}
//         >
//           <VStack space="lg" className="mt-2">

//             {/* State & City Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-rose-50">
//                   <Icon as={Globe} size='lg' className="text-rose-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Living In</Text>
//                   <Text size="md" className="text-typography-900 font-bold">
//                     {formData.city && formData.state
//                       ? `${formData.city}, ${formData.state}`
//                       : "Location Not Set"}
//                   </Text>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Divider */}
//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Community Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-rose-50">
//                   <Icon as={Users2} size='lg' className="text-rose-600" />
//                 </Box>
//                 <VStack className="flex-1">
//                   <Text size="xs" className="text-typography-500 font-medium">Community</Text>
//                   <HStack items-center space="xs">
//                     <Text size="md" className="text-typography-900 font-bold">
//                       {formData.community || "Not Specified"}
//                     </Text>
//                     {formData.isCasteNoBar && (
//                       <Box className="bg-rose-100 px-2 py-0.5 rounded-full">
//                         <Text className="text-[10px] text-rose-700 font-bold">Caste No Bar</Text>
//                       </Box>
//                     )}
//                   </HStack>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Search Radius Hint */}
//             <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
//               <Icon as={MapPin} size='lg' className="text-slate-400" />
//               <Text size="xs" className="text-slate-500 italic">
//                 We'll prioritize showing you matches within {formData.state}.
//               </Text>
//             </HStack>

//           </VStack>
//         </GradientCard>
//         <EditLocationModal
//           isOpen={showLocationModal}
//           onClose={() => setShowLocationModal(false)}
//           formData={formData}
//         // updateForm={updateForm}
//         // STATES={STATES}
//         // cities={cities}
//         // isLoading={isLoadingCities}
//         // fetchCities={fetchCities}
//         // isCasteNoBar={isCasteNoBar}
//         // setIsCasteNoBar={setIsCasteNoBar}
//         // validationTriggered={validationTriggered}
//         // handleSave={handleSaveLocation}
//         // isSaving={isSaving}
//         />
//         {/* End Location Modal */}

//         {/* 6. Personal & Family */}
//         <GradientCard
//           title="Personal & Family"
//           icon={Heart}
//           onEdit={() => setShowFamilyModal(true)}
//           gradientColors={['#ecfeff', '#ffffff']} // Cyan-50 to White
//         >
//           <VStack space="lg" className="mt-2">
//             {/* Height & Marital Status Row */}
//             <HStack space="md">
//               <DetailRow
//                 icon={Ruler}
//                 label="Height"
//                 value={formData.height || "Not Set"}
//                 className="flex-1"
//               />
//               <DetailRow
//                 icon={Heart}
//                 label="Status"
//                 value={formData.maritalStatus || "Not Set"}
//                 className="flex-1"
//               />
//             </HStack>

//             {/* Children Summary Row */}
//             {formData.maritalStatus !== 'Never Married' && (
//               <>
//                 <Box className="h-[1px] bg-slate-100 w-full" />
//                 <HStack items-center space="md" className="py-1">
//                   <Box className="p-2.5 rounded-xl bg-cyan-50">
//                     <Icon as={Baby} size='lg' className="text-cyan-600" />
//                   </Box>
//                   <VStack>
//                     <Text size="xs" className="text-typography-500 font-medium">Children</Text>
//                     <Text size="md" className="text-typography-900 font-bold">
//                       {formData.hasChildren === 'Yes'
//                         ? `${formData.childrenCount} Child(ren) ${formData.kids.length > 0 ? `(${formData.kids.map((k: any) => k.gender).join(', ')})` : ''}`
//                         : "No Children"}
//                     </Text>
//                   </VStack>
//                 </HStack>
//               </>
//             )}
//           </VStack>
//         </GradientCard>
//         <EditFamilyModal
//           isOpen={showFamilyModal}
//           onClose={() => setShowFamilyModal(false)}
//           formData={formData}
//           updateForm={updateForm}
//           HEIGHT_DATA={HEIGHT_DATA} // Your constant array
//           MARITAL_STATUS={MARITAL_STATUS} // Your constant array
//           handleChildrenCountChange={handleChildrenCountChange}
//           updateKidDetail={updateKidDetail}
//           removeChild={removeChild}
//         // validationTriggered={validationTriggered}
//         // handleSave={onSaveFamilyDetails} // Your API save function
//         // isSaving={isSaving}
//         />

//         {/* 7. Education and Career Section */}
//         {/* <GradientCard title="Education and Career" onEdit={() => { }}>
//           <VStack space="md">
//             <DetailRow label="Education" value={formData.education} />
//             <DetailRow label="Employed With" value={formData.employedWith} />
//             <DetailRow label="Occupation" value={formData.occupation} />
//             <DetailRow label="Annual Income" value={formData.annualIncome} />
//           </VStack>
//         </GradientCard> */}
//         <GradientCard
//           title="Education"
//           icon={GraduationCap}
//           onEdit={() => setShowEducationModal(true)}
//           gradientColors={['#f5f3ff', '#ffffff']} // Violet-50 to White
//         >
//           <VStack space="lg" className="mt-2">
//             {/* Qualification Row */}
//             <HStack items-center space="md">
//               <Box className="p-2.5 rounded-xl bg-violet-50">
//                 <Icon as={GraduationCap} size='xl' className="text-violet-600" />
//               </Box>
//               <VStack className="flex-1">
//                 <Text size="xs" className="text-typography-500 font-medium">Highest Degree</Text>
//                 <Text size="md" className="text-typography-900 font-bold">
//                   {formData.qualification || "Not Specified"}
//                 </Text>
//               </VStack>
//             </HStack>

//             {/* Divider */}
//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* College Row */}
//             <HStack items-center space="md">
//               <Box className="p-2.5 rounded-xl bg-violet-50">
//                 <Icon as={School} size='xl' className="text-violet-600" />
//               </Box>
//               <VStack className="flex-1">
//                 <Text size="xs" className="text-typography-500 font-medium">College / University</Text>
//                 <Text size="md" className="text-typography-900 font-bold" numberOfLines={1}>
//                   {formData.college || "Not Specified"}
//                 </Text>
//               </VStack>
//             </HStack>
//           </VStack>
//         </GradientCard>
//         {/* THE MODAL CALL */}
//         <EditEducationModal
//           isOpen={showEducationModal}
//           onClose={() => setShowEducationModal(false)}
//           formData={formData}
//           updateForm={updateForm} // Your global state update function
//           QUALIFICATIONS={itemData} // Your data array
//         // validationTriggered={validationTriggered}
//         // handleSave={handleSaveEducation}
//         // isSaving={isSaving}
//         />

//         {/* 8. Career & Income card */}
//         <GradientCard
//           title="Career & Income"
//           icon={Briefcase}
//           onEdit={() => setShowCareerModal(true)}
//           gradientColors={['#fffbeb', '#ffffff']} // Amber-50 to White
//         >
//           <VStack space="lg" className="mt-2">
//             {/* Profession & Company */}
//             <HStack items-center space="md">
//               <Box className="p-2.5 rounded-xl bg-amber-50">
//                 <Icon as={Briefcase} size='xl' className="text-amber-600" />
//               </Box>
//               <VStack className="flex-1">
//                 <Text size="xs" className="text-typography-500 font-medium">Profession</Text>
//                 <Text size="md" className="text-typography-900 font-bold">
//                   {formData.worksas || "Not Specified"}
//                 </Text>
//                 {formData.companyName && (
//                   <Text size="xs" className="text-amber-700 font-medium">{formData.companyName}</Text>
//                 )}
//               </VStack>
//             </HStack>

//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Income Row */}
//             <HStack items-center space="md">
//               <Box className="p-2.5 rounded-xl bg-amber-50">
//                 <Icon as={Banknote} size='xl' className="text-amber-600" />
//               </Box>
//               <VStack className="flex-1">
//                 <Text size="xs" className="text-typography-500 font-medium">Annual Income</Text>
//                 <Text size="md" className="text-typography-900 font-bold">
//                   {formData.income || "Not Specified"}
//                 </Text>
//               </VStack>
//             </HStack>
//           </VStack>
//         </GradientCard>

//         <EditCareerModal
//           isOpen={showCareerModal}
//           onClose={() => setShowCareerModal(false)}
//           formData={formData}
//           updateForm={updateForm}
//           INCOME_RANGES={INCOME_RANGES}
//           WORK_WITH={WORK_WITH}
//         // validationTriggered={validationTriggered}
//         // handleSave={handleSaveCareer}
//         // isSaving={isSaving}
//         />

//         {/* 9. Hobbiew */}

//         <GradientCard
//           title="Hobbies & Interests"
//           icon={Sparkles}
//           onEdit={() => setShowHobbiesModal(true)}
//           gradientColors={['#ecfdf5', '#ffffff']} // Emerald-50 to White
//         >
//           <HStack className="flex-wrap gap-2 mt-2">
//             {selectedHobbies.length > 0 ? (
//               selectedHobbies.map((hobby) => (
//                 <Box key={hobby} className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
//                   <Text size="xs" className="text-emerald-700 font-bold">{hobby}</Text>
//                 </Box>
//               ))
//             ) : (
//               <Text size="sm" className="text-typography-400 italic">No hobbies added yet</Text>
//             )}
//           </HStack>
//         </GradientCard>
//         <EditHobbiesModal
//           isOpen={showHobbiesModal}
//           onClose={() => setShowHobbiesModal(false)}
//           selectedHobbies={selectedHobbies}
//           toggleHobby={toggleHobby}
//         // handleSave={onSaveHobbies}
//         // isSaving={isSaving}
//         />

//         <GradientCard
//           title="Partner Preferences"
//           icon={Heart}
//           onEdit={() => setShowPreferencesModal(true)}
//           // Using the same Rose-to-White gradient for consistency with the Location/Community cards
//           gradientColors={['#fff1f2', '#ffffff']}
//         >
//           <VStack space="lg" className="mt-2">

//             {/* Age & Height Preference Row */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-rose-50">
//                   <Icon as={Scale} size='lg' className="text-rose-600" />
//                 </Box>
//                 <VStack>
//                   <Text size="xs" className="text-typography-500 font-medium">Age & Height</Text>
//                   <Text size="md" className="text-typography-900 font-bold">
//                     {formData.prefAgeMin && formData.prefAgeMax
//                       ? `${formData.prefAgeMin} - ${formData.prefAgeMax} Yrs`
//                       : "Not Set"}
//                     {formData.prefHeightMin && `, ${formData.prefHeightMin}+`}
//                   </Text>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Divider */}
//             <Box className="h-[1px] bg-slate-100 w-full" />

//             {/* Education & Income Preference */}
//             <HStack items-center justify-between className="py-2">
//               <HStack space="md" items-center>
//                 <Box className="p-2.5 rounded-xl bg-rose-50">
//                   <Icon as={GraduationCap} size='lg' className="text-rose-600" />
//                 </Box>
//                 <VStack className="flex-1">
//                   <Text size="xs" className="text-typography-500 font-medium">Professional Preference</Text>
//                   <HStack items-center space="xs" className="flex-wrap">
//                     <Text size="md" className="text-typography-900 font-bold">
//                       {formData.prefEducation || "Any Education"}
//                     </Text>
//                     {formData.prefIncome && (
//                       <Box className="bg-rose-100 px-2 py-0.5 rounded-full">
//                         <Text className="text-[10px] text-rose-700 font-bold">
//                           {formData.prefIncome}+ LPA
//                         </Text>
//                       </Box>
//                     )}
//                   </HStack>
//                 </VStack>
//               </HStack>
//             </HStack>

//             {/* Match Compatibility Hint */}
//             <HStack space="xs" items-center className="bg-slate-50 p-3 rounded-2xl mt-2 border border-slate-100">
//               <Icon as={Info} size='sm' className="text-slate-400" />
//               <Text size="xs" className="text-slate-500 italic">
//                 Matches are filtered based on these criteria to improve compatibility.
//               </Text>
//             </HStack>

//           </VStack>
//         </GradientCard>

//         <Box className="h-10" />
//       </ScrollView>


//     </Box>
//   );
// }
// // Reuse this Row component for the Basics section
// const DetailRow = ({ label, value }: any) => (
//   <HStack className="items-start">
//     <Text size="xs" className="text-typography-400 w-32 font-medium">{label}</Text>
//     <Text size="sm" className="text-typography-800 font-semibold flex-1">:  {value}</Text>
//   </HStack>
// );


