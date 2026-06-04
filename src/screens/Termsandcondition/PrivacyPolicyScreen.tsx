import React from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    ButtonText,
} from '@/src/components/GluestackUI';
import { CheckIcon, Eye, EyeOff, Icon } from '@/src/components/IconUI';
import { ArrowLeftIcon } from '@/components/ui/icon';
import HeaderSession from '@/src/components/HeaderSession';

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation();

    return (
        <Box className="flex-1 bg-background-0">
            {/* Header Bar */}


            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Privacy Policy"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={false}
                rightIconType="menu"  // If using React Navigation Drawer
            />


            {/* Policy Content */}
            <ScrollView className="flex-1 px-5 py-4">
                <VStack className="gap-6 pb-12">

                    <Box>
                        <Text className="text-2xl font-bold text-primary-700 mb-1">தனியுரிமைக் கொள்கை</Text>
                        <Text className="text-sm text-typography-400">Assemblies of God Matrimony System • May 2026</Text>
                    </Box>

                    <VStack className="gap-4">

                        {/* Section 1 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">1. Data Collection / தகவல் சேகரிப்பு</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                We collect personal details including names, contact numbers, baptism status, and official church documents (such as your Pastor's Recommendation Letter) to verify your membership standing.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                உங்களின் சபை உறுப்பினர் நிலையை உறுதிப்படுத்த உங்கள் பெயர், தொடர்பு எண், ஞானஸ்நான விபரம் மற்றும் போதகரின் சிபாரிசு கடிதம் உள்ளிட்ட தனிப்பட்ட விபரங்களை நாங்கள் சேகரிக்கிறோம்.
                            </Text>
                        </Box>

                        {/* Section 2 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">2. Profile Visibility / விபரங்களின் தெரிவுநிலை</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                Your matchmaking profile details are only visible to other verified members within the application. Sensitive documents like recommendation letters are strictly confidential and can only be accessed by authorized Church Staff or Admins.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                உங்கள் வரன் விபரங்கள் இந்த செயலியில் பதிவு செய்யப்பட்ட மற்ற சரிபார்க்கப்பட்ட உறுப்பினர்களுக்கு மட்டுமே தெரியும். சிபாரிசு கடிதங்கள் போன்ற ரகசிய ஆவணங்களை சபை நிர்வாகிகள் மட்டுமே பார்க்க முடியும்.
                            </Text>
                        </Box>

                        {/* Section 3 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">3. Photo & Screenshot Protection / புகைப்பட பாதுகாப்பு மற்றும் ஸ்கிரீன்ஷாட் தடுப்பு</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                Profile images are stored securely on our encrypted storage paths. We implement application parameters to restrict unauthorized screenshot capture or photo downloads. Duplicating or sharing members' profile data will result in a permanent ban.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                உங்கள் சுயவிவர புகைப்படங்கள் பாதுகாப்பாக சேமிக்கப்படும். புகைப்படங்களை தவறாக பயன்படுத்துவதை தடுக்க, செயலியில் ஸ்கிரீன்ஷாட் (Screenshot) மற்றும் பதிவிறக்கம் செய்ய முடியாத பாதுகாப்பு அம்சங்கள் உள்ளன. பிறரின் விபரங்களை நகலெடுப்பவர்கள் செயலியிலிருந்து நிரந்தரமாக நீக்கப்படுவார்கள்.
                            </Text>
                        </Box>

                        {/* Section 4 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">4. Administrative Verification / நிர்வாக சரிபார்ப்பு</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                To maintain community safety, all accounts undergo a manual vetting process by authorized church panels. We reserve the right to cross-verify your credentials and church standing directly with your local pastors.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                வரன்களின் நம்பகத்தன்மையை உறுதிப்படுத்த, அனைத்து பதிவுகளும் சபை நிர்வாகிகளால் கைமுறையாக சரிபார்க்கப்படும். உங்கள் சபை உறுப்பினர் விபரங்களை உள்ளூர் போதகர்கள் மூலம் நேரடியாக உறுதிப்படுத்த எங்களுக்கு முழு உரிமை உண்டு.
                            </Text>
                        </Box>

                        {/* Section 5 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">5. Zero Commercial Data Sharing / விளம்பர பகிர்வு இல்லாமை</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                Your personal metrics and documents are strictly utilized for matrimonial matching inside the Assemblies of God network platform. We never sell, rent, trade, or share your structural identity data with third-party advertising entities.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                உங்களின் விபரங்கள் Assemblies of God சபை வரன் தேடலுக்கு மட்டுமே பயன்படுத்தப்படும். விளம்பர நிறுவனங்களுக்கோ அல்லது பிற வெளி நபர்களுக்கோ உங்களின் விபரங்கள் எக்காரணம் கொண்டும் விற்கப்படவோ, பகிரப்படவோ மாட்டாது.
                            </Text>
                        </Box>

                        {/* Section 6 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">6. Device Logs & Tokens / சாதனத் தகவல் மற்றும் அறிவிப்புகள்</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                The application securely handles operational device push tokens and active encryption logs to dispatch instantaneous match updates, push notifications, and runtime security checkpoints.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                புதிய வரன் தகவல்கள் மற்றும் பாதுகாப்பு அறிவிப்புகளை உங்களுக்கு உடனுக்குடன் அனுப்ப, உங்களின் மொபைல் சாதன டோக்கன் (Device Token) குறியீடுகள் பாதுகாப்பாக பயன்படுத்தப்படும். இவை முற்றிலும் என்க்ரிப்ட் செய்யப்பட்டு பாதுகாக்கப்படுகிறது.
                            </Text>
                        </Box>

                        {/* Section 7 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">7. Data Deletion / கணக்கு நீக்கம்</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed mb-2">
                                You have the right to remove your details at any time. Once your marriage is fixed or you delete your account, all corresponding images, document attachments, and user records are permanently erased from our active databases.
                            </Text>
                            <Text className="text-sm font-medium text-primary-800 italic border-t border-background-200 pt-2">
                                உங்கள் கணக்கை எப்போது வேண்டுமானாலும் நீக்க உங்களுக்கு உரிமை உண்டு. உங்கள் திருமணம் நிச்சயிக்கப்பட்டவுடன் அல்லது கணக்கை நீக்கியவுடன், அனைத்து புகைப்படங்கள் மற்றும் விபரங்கள் தரவுத்தளத்திலிருந்து நிரந்தரமாக அழிக்கப்படும்.
                            </Text>
                        </Box>

                    </VStack>
                </VStack>
            </ScrollView>

            {/* Bottom Dismiss Button */}
            <Box className="p-5 border-t border-background-100 bg-background-0">
                <Button
                    size="xl"
                    className="h-14 rounded-xl bg-primary-700  shadow-sm"
                    onPress={() => navigation.goBack()}
                >
                    <ButtonText className="text-white font-semibold text-lg">
                        Close
                    </ButtonText>
                </Button>
            </Box>
        </Box>
    );
}