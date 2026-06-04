import React, { useState } from 'react';
import { ScrollView, Platform, NativeScrollEvent, NativeSyntheticEvent, StatusBar } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    ButtonText
} from '@/src/components/GluestackUI';
import { CheckIcon, Eye, EyeOff, Icon } from '@/src/components/IconUI';
import { ArrowLeftIcon } from '@/components/ui/icon';
import { useRoute } from '@react-navigation/native';
import HeaderSession from '@/src/components/HeaderSession';

export default function TermsOfServiceScreen({ navigation }: any) {
    const [hasReadToBottom, setHasReadToBottom] = useState(false);

    // Inside your component:
    const route = useRoute();
    const { from } = route.params as { from?: string } || {};

    //console.log('from', from);
    // Checks if the user scrolled to the baseline before letting them accept
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
        if (isCloseToBottom) {
            setHasReadToBottom(true);
        }
    };

    return (
        <Box className="flex-1 bg-background-0">
            {/* Header Bar */}


            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Terms of Service"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={false}
                rightIconType="menu"  // If using React Navigation Drawer
            />


            {/* Policy Terms Block */}
            <ScrollView
                className="flex-1 px-5 py-4"
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                <VStack className="gap-6 pb-12">

                    <Box>
                        <Text className="text-2xl font-bold text-primary-700 mb-1">விதிமுறைகள் மற்றும் நிபந்தனைகள்</Text>
                        <Text className="text-sm text-typography-400">Last updated: May 2026</Text>
                    </Box>

                    <VStack className="gap-4">

                        {/* Rule 1 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">1. Account Accuracy / உண்மைத் தன்மை</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                By creating an account, you declare that all details given by you are correct and true.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                நான் கொடுத்துள்ள தகவல்கள் யாவும் உண்மை என உறுதியளிக்கிறேன்.
                            </Text>
                        </Box>

                        {/* Rule 2 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">2. Complete Registration / முழுமையான விபரங்கள்</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                Only fully completed application forms will be reviewed and accepted into our matrimony database registry. Incomplete entries will be automatically rejected.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                முழுமையாய் நிரப்பப்பட்ட விண்ணப்ப படிவங்கள் மட்டுமே பரிசீலனைக்கு ஏற்றுக்கொள்ளப்படும்.
                            </Text>
                        </Box>

                        {/* Rule 3 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">3. Pastor Recommendation Letter / சிபாரிசு கடிதம்</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                It is mandatory to upload a digital copy of your local Pastor's Recommendation Letter. Profiles will remain hidden until our staff panel verifies this file.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                இத்துடன் போதகரின் சிபாரிசு கடிதத்தை இணைப்பது கட்டாயமாகும்.
                            </Text>
                        </Box>

                        {/* Rule 4 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">4. Profile Deactivation / பதிவு நீக்கம்</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                Once a marriage alliance is confirmed or settled, members must instantly notify the administrator via the app or dynamic support channels to remove their profiles.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                திருமணம் ஒழுங்கானவுடன் கடிதத்தின் மூலம் அல்லது செயலி வழியாக உங்கள் பதில் வரத்து செய்து பதிவை நீக்க வேண்டும்.
                            </Text>
                        </Box>

                        {/* Rule 5 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">5. In-Person Meetings / நேரில் சந்திக்க</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                For complex profile corrections or specific verification meetings, members are expected to secure prior administrative authorization before visiting the office branches.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                விபரங்களுக்கு முன் அனுமதி பெற்று நேரில் சந்திக்கவும்.
                            </Text>
                        </Box>
                        {/* Rule 6 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">6. Code of Conduct / நடத்தை விதிகள்</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                All communications between members must remain respectful and in accordance with Christian values. Harassment or abuse will lead to permanent termination.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                உரையாடல்கள் மரியாதைக்குரியதாகவும், சபை ஒழுக்க நெறிமுறைகளுக்கு உட்பட்டதாகவும் இருக்க வேண்டும். தவறு செய்பவர்களின் கணக்கு உடனடியாக ரத்து செய்யப்படும்.
                            </Text>
                        </Box>

                        {/* Rule 7 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">7. Non-Commercial Use / வணிக நோக்கமற்றது</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                This platform is strictly for personal matrimonial matching. Sharing other members' contact numbers or profiles with external brokers is strictly prohibited.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                பிற உறுப்பினர்களின் விபரங்களை நகலெடுத்து வெளி நபர்களுக்கோ அல்லது மற்ற திருமண தரகர்களுக்கோ பகிர்வது முற்றிலுமாக தடைசெய்யப்பட்டுள்ளது.
                            </Text>
                        </Box>

                        {/* Rule 8 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">8. Family Verification / சுய சரிபார்ப்பு</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                While we verify structural files, the administration does not guarantee personal backgrounds. Families must conduct independent enquiries before finalizing marriages.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                நிர்வாகம் ஆவணங்களை சரிபார்த்தாலும், வரன்களின் சுயவிபரத்திற்கு சபை பொறுப்பாகாது. சம்பந்தப்பட்ட குடும்பத்தினரே முழுமையாக விசாரித்து உறுதிசெய்ய வேண்டும்.
                            </Text>
                        </Box>

                        {/* Rule 9 */}
                        <Box className="bg-background-50 p-4 rounded-xl border border-background-100">
                            <Text className="text-base font-bold text-typography-900 mb-1">9. Account Security / கணக்கு பாதுகாப்பு</Text>
                            <Text className="text-sm text-typography-600 leading-relaxed">
                                You are solely responsible for keeping your login access safe. Do not share your password or OTP tokens with other individuals.
                            </Text>
                            <Text className="text-sm font-semibold text-primary-800 mt-1 italic">
                                உங்கள் கணக்கின் கடவுச்சொல் பாதுகாப்பிற்கு நீங்களே பொறுப்பு. உங்கள் கணக்கு விபரங்களை மற்றவர்களுடன் பகிர்ந்து கொள்ளக் கூடாது.
                            </Text>
                        </Box>

                    </VStack>
                </VStack>
            </ScrollView>

            {/* Action CTA Block at bottom for Signup routing flow */}
            {from === 'signup' && (
                <Box className="p-5 border-t border-background-100 bg-background-0">
                    <Button
                        size="xl"
                        className={`h-14 rounded-xl ${hasReadToBottom ? 'bg-primary-700' : 'bg-background-200'}`}
                        disabled={!hasReadToBottom}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <ButtonText className={hasReadToBottom ? 'text-white font-semibold' : 'text-typography-400'}>
                            {hasReadToBottom ? 'I Understand & Agree' : 'Scroll Down to Accept'}
                        </ButtonText>
                    </Button>
                </Box>
            )}

            {/* Action CTA Block at bottom for general Login/Drawer review flow */}
            {from === 'login' && (
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
            )}
        </Box>
    );
}