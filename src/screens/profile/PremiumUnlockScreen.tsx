import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Crown, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PremiumUnlockScreen = ({ navigation, onPay, values }: any) => {
    const { totalAmount, customerName } = values; // Data passed from the list

    return (
        <View style={styles.mainContainer}>
            {/* 1. BACKGROUND LAYER */}
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient colors={['#e6fcf5', '#f8fafc']} style={StyleSheet.absoluteFill} />
                <View style={[{
                    width: width * 0.8,
                    height: width * 0.8,
                    borderRadius: (width * 0.8) / 2,
                }, styles.orb, styles.orbTop]} />
                <View style={[styles.orb, styles.orbBottom]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentContainer}>

                    {/* 2. GLASS CARD */}
                    <View style={styles.glassCard}>

                        {/* Crown Icon Plate */}
                        <View style={styles.iconPlate}>
                            <Crown size={38} color="#059669" strokeWidth={2.5} />
                        </View>

                        <Text style={styles.title}>Unlock Matches</Text>

                        {/* Change: Added paddingHorizontal for cleaner right/left spacing */}
                        <Text style={styles.description}>
                            You need an active subscription to view your matches and detailed insights.
                        </Text>

                        {/* Button and Security footer grouped for easier spacing */}
                        <View style={styles.actionArea}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={onPay}
                                style={styles.buttonWrapper}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    <Text style={styles.buttonText}>ACTIVATE NOW</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.securityFooter}>
                                <ShieldCheck size={14} color="#64748b" />
                                <Text style={styles.securityText}>SECURE 256-BIT PAYMENT</Text>
                            </View>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    // Glass Card Styling
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 40,
        paddingHorizontal: 24, // Keeps text away from side edges
        paddingTop: 40,
        paddingBottom: 32, // CRITICAL: Adds space at the very bottom of the card
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        width: '100%',
        zIndex: 10, // Ensures card sits ABOVE background orbs
        elevation: 10,
    },
    iconPlate: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        fontWeight: '500',
        // Change: Providing space so text doesn't touch edges
        paddingHorizontal: 20,
    },
    // change: group button and footer and provide separation
    actionArea: {
        width: '100%',
        alignItems: 'center',
        gap: 16, // Use gap for easy separation (requires RN 0.71+)
    },
    // Button Styling
    buttonWrapper: {
        width: '100%',
        marginBottom: 20,
        paddingEnd: 20,
        paddingStart: 20,

        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    gradientButton: {
        height: 64,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    // change: adjust security footer to be cleaner
    securityFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0, // removed redundant margin
        paddingBottom: 8, // slight padding for Android alignment
    },
    securityText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        marginLeft: 6,
        letterSpacing: 1.5,
    },
    // Background Orbs
    orb: {
        position: 'absolute',

    },
    orbTop: {
        top: -50,
        right: -100,
        backgroundColor: 'rgba(14, 165, 233, 0.15)', // Sky blue tint
    },
    orbBottom: {
        bottom: 50,
        left: -100,
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // Emerald tint
    },
});

export default PremiumUnlockScreen;