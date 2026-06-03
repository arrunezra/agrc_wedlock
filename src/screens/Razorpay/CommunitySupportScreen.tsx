import React, { useContext, useEffect, useRef, useState } from 'react';
import { TouchableHighlight, Text, Alert, View, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import LoadingScreen from '../common/SuccessScreen';
import razorpayServices from '@/src/services/RazorpayServices';
import { BarChart3, CheckCircle2, ChevronLeft, CreditCard, Crown, Heart, Info, MessageSquare, ShieldCheck, Zap } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessOverlay } from '../common/SuccessOverlay';
import { Screen } from 'react-native-screens';
import { useAppToast } from '@/src/context/ToastContext';
import { rezor_test_key } from '@/src/utils/environment';
import { LookupContext } from '@/src/context/LookupContext';
import { Box, Card, HStack, VStack } from '../component/GluestackUI';
import { useAuth } from '@/src/context/AuthContext';
const CommunitySupportScreen = ({ route, navigation }: any) => {
    const { totalAmount, customerName, userid, email, phoneNo } = route.params;
    const { showToast } = useAppToast();
    const { lookups } = useContext(LookupContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [order_id, setOrder_id] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const isMounted = useRef(true);

    const { logout } = useAuth();

    useEffect(() => {
        isMounted.current = true;

        const prepareOrder = async () => {
            try {
                const response = await razorpayServices.getOrderId({
                    amount: totalAmount,
                    user_id: userid
                });
                console.log('response', response);
                if (isMounted.current) {
                    if (response.success) {
                        setOrder_id(response.order_id);
                    } else {
                        showToast("Connection Issue", `Could not initialize secure contribution.`, "error");
                        navigation.goBack();
                    }
                }
            } catch (err: any) {
                console.log('response err', err);

                if (isMounted.current) {
                    if (err.response?.status === 401) {
                        showToast("Session Expired", "Your session has timed out. Logging out...", "error");
                        await logout(); // Safe context fallback
                    } else {
                        showToast("Connection Issue", `Server is unreachable.`, "error");
                        navigation.goBack();
                    }
                }
            }
        };

        prepareOrder();
        return () => { isMounted.current = false; };
    }, [totalAmount]);

    const handleContribution = () => {
        if (!order_id) return;

        setIsProcessing(true);
        const options = {
            description: `Subscription for ${lookups.appName}`,
            image: lookups?.appLogo, // Use your actual brand logo
            currency: 'INR',
            key: rezor_test_key,
            amount: Math.round(totalAmount),
            name: lookups.appName,
            order_id: order_id,
            allow_rotation: false,
            prefill: {
                email: email,
                contact: phoneNo,
                name: customerName
            },
            theme: { color: '#10b981' } // Matching your emerald theme
        };

        RazorpayCheckout.open(options)
            .then(async (data: any) => {
                // Verify with backend
                const verify = await razorpayServices.verifyContributtion({
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature,
                    user_id: userid // Important for backend audit log
                });

                if (verify.success) {
                    console.log('verify', verify);
                    navigation.navigate('CommunitySupport', {
                        contribution: Math.round(totalAmount ?? 0),
                        contributionId: order_id
                    })

                    setShowSuccess(true);
                    setTimeout(() => {
                        setShowSuccess(false);
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'Main',
                                    state: {
                                        routes: [{ name: 'Matches' }],
                                    },
                                },
                            ],
                        });
                    }, 4000);
                } else {
                    showToast("Verification Failed", `Contribution was made but could not be verified.`, "error");
                }
            })
            .catch((error: any) => {
                console.log('Contribution Cancelled');
            })
            .finally(() => setIsProcessing(false));
    };

    return (
        <View style={styles.container}>
            {!showSuccess && !isProcessing && (
                <View style={styles.mainContainer}>
                    {/* Background Mesh */}
                    <LinearGradient colors={['#134e4a', '#0f172a']} style={StyleSheet.absoluteFill} />

                    <SafeAreaView style={styles.flex1}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <ChevronLeft size={20} color="white" />
                            </TouchableOpacity>
                            {/* Change: Safer Header title */}
                            <Text style={styles.headerTitle}>Support Upkeep</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {/* THE LAYERED GLASS CARD */}
                            <View style={styles.glassWrapper}>
                                <View style={styles.mainGlassCard}>
                                    <Text style={styles.premiumTitle}>Community Support</Text>
                                    <Text style={styles.premiumSubtitle}>Voluntary Maintenance Donation</Text>

                                    {/* Amount Header */}
                                    <View style={styles.amountContainer}>
                                        <View style={styles.zapIcon}>
                                            <Heart size={20} color="#2dd4bf" fill="#2dd4bf" />
                                        </View>
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={styles.amountLabel}>AMOUNT</Text>
                                            <Text style={styles.amountText}>₹{totalAmount}</Text>
                                        </View>
                                    </View>


                                    <Card className="p-5 rounded-2xl bg-white shadow-sm border border-background-100 m-4">
                                        <VStack className="gap-4">

                                            {/* Header */}
                                            <Text className="text-lg font-bold text-typography-900 mb-1">
                                                Contribution Summary
                                            </Text>

                                            {/* Table Row 1: App Maintenance */}
                                            <HStack className="justify-between items-center">
                                                <Text className="text-sm font-medium text-typography-600">
                                                    App Maintenance
                                                </Text>
                                                <Text className="text-sm font-semibold text-typography-900">
                                                    ₹{totalAmount}
                                                </Text>
                                            </HStack>

                                            {/* Table Row 2: Platform Fee */}
                                            <HStack className="justify-between items-center">
                                                <Text className="text-sm font-medium text-typography-600">
                                                    Platform Fee
                                                </Text>
                                                <Text className="text-sm font-semibold text-success-700">
                                                    ₹0
                                                </Text>
                                            </HStack>

                                            {/* Table Divider Line */}
                                            <Box className="h-[1px] bg-background-200 w-full my-1" />

                                            {/* Table Row 3: Total Footer */}
                                            <HStack className="justify-between items-center">
                                                <Text className="text-base font-bold text-typography-900">
                                                    Total Amount:
                                                </Text>
                                                <Text className="text-lg font-bold text-primary-700">
                                                    ₹{totalAmount}
                                                </Text>
                                            </HStack>

                                        </VStack>
                                    </Card>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Bottom Fixed Area */}
                        <View style={styles.bottomSection}>
                            <View style={styles.securityInfo}>
                                <ShieldCheck size={16} color="#10b981" />
                                <Text style={styles.securityText}>verified gateway</Text>
                                <View style={styles.badge100}><Text style={styles.badgeText}>100% SECURE</Text></View>
                            </View>

                            <TouchableOpacity
                                style={styles.payButton}
                                activeOpacity={0.8}
                                onPress={handleContribution}
                                disabled={!order_id || isProcessing}
                            >
                                {/* Change: Replaced CreditCard icon with Heart for donation context */}
                                <Heart size={20} color="white" style={{ marginRight: 10 }} />
                                {/* Change: Replaced PAY SECURELY with DONATE SECURELY */}
                                <Text style={styles.payButtonText}>DONATE SECURELY</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            )}
            <SuccessOverlay
                isVisible={showSuccess}
                message={"Thank You!"} // Change: Replaced commercial confirmation phrasing
                redirectMessage={`Thanks, ${customerName}! Your maintenance contribution was successfully recorded. We appreciate your support for the community.`}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    mainContainer: { flex: 1, backgroundColor: '#0f172a' },
    flex1: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
    scrollContent: { paddingBottom: 120 },

    // LAYERED GLASS
    glassWrapper: { paddingHorizontal: 20, marginTop: 10 },
    mainGlassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    premiumTitle: { color: 'white', fontSize: 26, fontWeight: '800' },
    premiumSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 25 },

    amountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    zapIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(45, 212, 191, 0.15)', alignItems: 'center', justifyContent: 'center' },
    amountLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    amountText: { color: 'white', fontSize: 36, fontWeight: '900' },

    // FEATURES GRID
    featuresGrid: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 25,
        overflow: 'hidden'
    },
    featureBox: { flexDirection: 'row', padding: 15, width: '50%', alignItems: 'flex-start' },
    featureBoxFull: { flexDirection: 'row', padding: 15, width: '100%', alignItems: 'center' },
    borderRight: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    featureTextCont: { marginLeft: 10, flex: 1 },
    featureTitle: { color: 'white', fontSize: 13, fontWeight: '700' },
    featureDesc: { color: '#94a3b8', fontSize: 11 },

    // INNER WHITE CARD
    summaryCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 24, padding: 20 },
    summaryHeader: { color: '#0f172a', fontSize: 16, fontWeight: '800', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { color: '#475569', fontSize: 14 },
    summaryValue: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
    summaryDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
    totalLabel: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
    totalValue: { color: '#0f172a', fontSize: 20, fontWeight: '900' },

    // BOTTOM AREA
    bottomSection: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 35 },
    securityInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    securityText: { color: '#64748b', fontSize: 12, marginHorizontal: 8, textTransform: 'lowercase' },
    badge100: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 8, fontWeight: '800', color: '#475569' },
    payButton: { backgroundColor: '#059669', height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    payButtonText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});

export default CommunitySupportScreen;