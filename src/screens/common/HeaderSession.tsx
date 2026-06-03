import React from 'react';
import { Platform, StatusBar, TouchableOpacity } from 'react-native';
import { Box, VStack, HStack, Heading, Text } from '@/src/components/common/GluestackUI';
import { Menu, Bell, ChevronLeft, Search, X } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from '@/src/components/common/IconUI';
import FastImage from '@d11/react-native-fast-image';

interface HeaderProps {
    title: string;
    theme?: 'midnight' | 'emerald' | 'slate' | 'blue' | 'sunset' | 'ocean' | "cyan" | 'forest' | 'bordeaux' | 'charcoal' | 'white' | 'glass' | 'mint';
    showBackButton?: boolean;
    onBackPress?: () => void;
    showRightIcon?: boolean;
    rightIconType?: 'menu' | 'bell' | 'search' | 'close';
    onRightPress?: () => void;
    showLogo?: boolean;
}

// Use this to get the height on Android/iOS
const getStatusBarHeight = () => {
    return Platform.select({
        ios: 44, // Standard iOS height, though useSafeAreaInsets is better for Dynamic Island
        android: StatusBar.currentHeight || 0,
        default: 0,
    });
};
const HeaderSession = ({
    title,
    theme = 'emerald',
    showBackButton = true,
    onBackPress,
    showRightIcon = true,
    rightIconType = 'menu', // Set default right icon to 'menu'
    onRightPress,
    showLogo = false
}: HeaderProps) => {

    const palettes = {
        // --- Your Original Dark & Deep Themes ---
        midnight: ['#1E1B4B', '#0F172A'], // Deep indigo to dark slate
        emerald: ['#064E3B', '#022C22'], // Deep church / organic green
        slate: ['#334155', '#0F172A'], // Muted professional steel gray
        blue: ['#0891B2', '#155E75'], // Rich teal cyan to deep sea blue

        // --- Premium & Vibrant Gradients (High Contrast for White Text) ---
        sunset: ['#8B5CF6', '#EC4899'], // Royal Purple to Vibrant Pink (Energetic)
        ocean: ['#0284C7', '#0369A1'], // Corporate / Trustworthy Bright Blue
        forest: ['#0F766E', '#115E59'], // Sleek Deep Teal/Mint Green
        bordeaux: ['#4C0519', '#881337'], // Luxury Crimson / Wine Red
        charcoal: ['#1E293B', '#0F172A'], // Ultra-clean, modern minimalist Dark Mode
        cyan: ['#0097b2', '#00bcd4'], // Corporate / Trustworthy Bright Blue

        // --- Soft Pastel / Elegant Light Themes ---
        // WARNING: If you use these, change your header text/icon color to black or dark slate!
        white: ['#FFFFFF', '#F8FAFC'], // Pure crisp white to off-white
        glass: ['#F1F5F9', '#E2E8F0'], // Soft metallic platinum gray
        mint: ['#E6F4EA', '#CEEAD6']  // Peaceful, ultra-light community green
    };

    // Right icon mapper based on type
    const getRightIcon = () => {
        switch (rightIconType) {
            case 'menu': return Menu;
            case 'bell': return Bell;
            case 'search': return Search;
            case 'close': return X;
            default: return Menu;
        }
    };

    const RightIcon = getRightIcon();
    const STATUS_BAR_HEIGHT = getStatusBarHeight();

    // Determine theme text color (dark text for white theme, white text for others)
    const isWhiteTheme = (theme === 'white' || theme === 'glass' || theme === 'mint');
    const textColor = isWhiteTheme ? 'text-slate-800' : 'text-white';
    const iconColor = isWhiteTheme ? '#1E293B' : 'white';
    const iconBg = isWhiteTheme ? 'bg-slate-900/5' : 'bg-white/10';
    const shadowColor = isWhiteTheme ? '#64748B' : palettes[theme][0];

    return (

        <LinearGradient
            colors={palettes[theme]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
                paddingTop: STATUS_BAR_HEIGHT + 10,
                paddingBottom: 20,
                elevation: 15,
                shadowColor: shadowColor,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: isWhiteTheme ? 0.08 : 0.3,
                shadowRadius: 15,
            }}
        >
            <HStack className="px-6 items-center justify-between gap-2">

                {/* LEFT SIDE SLOT: BACK BUTTON OR LOGO */}
                {showLogo ? (
                    <Box className="w-10 h-10 rounded-xl bg-white/90 items-center justify-center p-1 border border-white/20 mr-3">

                        <FastImage
                            source={require('../../assets/icons/without_name.png')}
                            style={{ width: 56, height: 56, borderRadius: 32 }}
                            resizeMode={FastImage.resizeMode.cover}
                        />


                    </Box>


                ) : (
                    <Box className="w-12">
                        {showBackButton && (
                            <TouchableOpacity
                                onPress={onBackPress}
                                className={`p-3 ${iconBg} rounded-2xl  `}
                            >
                                <Icon as={ChevronLeft} size="lg" color={iconColor} />
                            </TouchableOpacity>
                        )}
                    </Box>
                )}

                {/* TITLE ADJUSTMENT: Centers text normally, but left-aligns cleanly if logo is present */}
                <VStack className={`flex-1 mx-2 ${showLogo ? 'items-start' : 'items-center'}`}>
                    <Heading
                        numberOfLines={1}
                        className={`font-extrabold text-xl tracking-tight ${textColor} ${showLogo ? 'text-left' : 'text-center'}`}
                    >
                        {title}
                    </Heading>
                </VStack>

                {/* RIGHT SIDE SLOT */}
                <Box className="w-12 items-end">
                    {showRightIcon && (
                        <TouchableOpacity
                            onPress={onRightPress}
                            className={`p-3 ${iconBg} rounded-2xl   `}
                        >
                            <Box className="relative">
                                <Icon as={RightIcon} size="lg" color={iconColor} />
                                {rightIconType === 'bell' && (
                                    <Box
                                        className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-full border-2"
                                        style={{ borderColor: palettes[theme][0] }}
                                    />
                                )}
                            </Box>
                        </TouchableOpacity>
                    )}
                </Box>
            </HStack>
        </LinearGradient>

    );
};

export default HeaderSession;