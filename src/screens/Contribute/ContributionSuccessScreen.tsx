import React from 'react';
import { View, Share, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

// Gluestack UI Component Imports
import {
    Box,
    Card,
    VStack,
    HStack,
    Text,
    Button,
    ButtonText,
    Center
} from '@/src/components/common/GluestackUI';

// Custom Lucide/Icon Imports
import {
    CheckCircle,
    Copy,
    Share2
} from 'lucide-react-native'; // Swap with your project's IconUI wrapper if preferred

export default function ContributionSuccessScreen({ route, navigation }: any) {
    // Safe fallbacks if params aren't passed during navigation testing
    const { contribution = '0.00', contributionId = 'TXN_NOT_AVAILABLE' } = route?.params || {};

    // Function to handle copying transaction ID to clipboard
    const copyToClipboard = () => {
        Clipboard.setString(contributionId);

        // Replace with your global showToast helper if you have one
        Alert.alert("Copied!", "Transaction ID copied to clipboard.");
    };

    // Optional: Function to share receipt details
    const handleShare = async () => {
        try {
            await Share.share({
                message: `RC Wedlock Payment Success!\Contribution: ₹${contribution}\nTransaction ID: ${contributionId}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box className="flex-1 bg-background-50 justify-between px-6 py-12">

            {/* Top Content Area */}
            <Center className="flex-1 w-full">
                <VStack className="items-center w-full max-w-[400px] gap-6">

                    {/* Animated/Static Success Icon Badge */}
                    <Center className="bg-success-50 h-24 w-24 rounded-full border border-success-100 shadow-sm">
                        <CheckCircle size={52} color="#16a34a" /> {/* Tailwind success-600 */}
                    </Center>

                    {/* Heading Text */}
                    <VStack className="items-center gap-1">
                        <Text className="text-2xl font-bold text-typography-900 tracking-tight">
                            Contribution Successful
                        </Text>
                        <Text className="text-center text-typography-500 text-sm px-4">
                            Thank you for supporting RC Wedlock Matrimonial Services. Your contribution has been securely processed.
                        </Text>
                    </VStack>

                    {/* Main Transaction Card (Table Layout) */}
                    <Card className="w-full p-5 rounded-2xl bg-white border border-background-100 shadow-xs">
                        <VStack className="gap-4">

                            {/* Display Amount Row */}
                            <VStack className="items-center py-2 border-b border-background-100 mb-2">
                                <Text className="text-xs font-semibold text-typography-400 uppercase tracking-wider">
                                    Total Contribution Paid
                                </Text>
                                <Text className="text-4xl font-extrabold text-success-700 mt-1">
                                    ₹{contribution}
                                </Text>
                            </VStack>

                            {/* Transaction Details Header */}
                            <Text className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                                Contribution Details
                            </Text>

                            {/* Row 1: Platform/Service Target */}
                            <HStack className="justify-between items-center">
                                <Text className="text-sm font-medium text-typography-500">
                                    Contribution For
                                </Text>
                                <Text className="text-sm font-semibold text-typography-900">
                                    App Maintenance
                                </Text>
                            </HStack>

                            {/* Row 2: Status Tag */}
                            <HStack className="justify-between items-center">
                                <Text className="text-sm font-medium text-typography-500">
                                    Status
                                </Text>
                                <Box className="bg-success-50 px-2.5 py-1 rounded-md border border-success-200">
                                    <Text className="text-xs font-bold text-success-700 uppercase">
                                        Completed
                                    </Text>
                                </Box>
                            </HStack>

                            {/* Divider Line */}
                            <Box className="h-[1px] bg-background-100 w-full my-1" />

                            {/* Row 3: Transaction ID with copy button */}
                            <VStack className="gap-1.5">
                                <Text className="text-sm font-medium text-typography-500">
                                    Contribution ID
                                </Text>

                                <HStack className="w-full bg-background-50 border border-background-200 rounded-xl px-3.5 h-12 items-center justify-between">
                                    {/* Selectable enables users to manually highlight text if needed */}
                                    <Text
                                        selectable={true}
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                        className="flex-1 text-sm font-mono font-semibold text-typography-700 pr-2"
                                    >
                                        {contributionId}
                                    </Text>

                                    {/* Interactive Copy Button Icon */}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-1 h-8 w-8  rounded-md justify-center items-center"
                                        onPress={copyToClipboard}
                                    >
                                        <Copy size={18} color="#4b5563" /> {/* Neutral Gray 600 */}
                                    </Button>
                                </HStack>
                            </VStack>

                        </VStack>
                    </Card>

                </VStack>
            </Center>

            {/* Bottom Sticky Action Buttons */}
            <VStack className="w-full gap-3 mt-6">
                {/* Share Button */}
                <Button
                    variant="outline"
                    size="xl"
                    className="h-14 rounded-xl border-background-300   flex-row gap-2 justify-center"
                    onPress={handleShare}
                >
                    <Share2 size={20} color="#1f2937" />
                    <ButtonText className="font-semibold text-base text-typography-900">
                        Share Receipt
                    </ButtonText>
                </Button>

                {/* Back to Home Button */}
                <Button
                    size="xl"
                    className="h-14 rounded-xl bg-primary-700   shadow-sm"
                    onPress={() => navigation.popToTop()} // Sends them clean out of the stack back to App Home
                >
                    <ButtonText className="font-semibold text-base text-white">
                        Back to Dashboard
                    </ButtonText>
                </Button>
            </VStack>

        </Box>
    );
}