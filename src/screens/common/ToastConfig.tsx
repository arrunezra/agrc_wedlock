import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
    useColorScheme,
    ViewStyle,
    TextStyle
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { CheckCircle2, AlertTriangle, XCircle, X, LucideIcon } from 'lucide-react-native';

// --- Types ---
interface CustomToastProps {
    text1?: string;
    text2?: string;
    colors: string[];
    Icon: LucideIcon;
}

// --- Component ---
const CustomToast = ({ text1, text2, colors, Icon }: CustomToastProps) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 2. Reset to exactly 0 every time this component mounts
        progress.setValue(0);

        // 3. Start the animation
        const animation = Animated.timing(progress, {
            toValue: 1,
            duration: 4000, // Matches your visibilityTime
            useNativeDriver: false, // Must be false for width animations
        });

        animation.start();

        // 4. Cleanup: If the toast is swiped or hidden early, stop the animation
        return () => {
            animation.stop();
            progress.setValue(0);
        };
    }, []); // Empty dependency array ensures it runs ONCE per mount

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['100%', '0%'],
    });

    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.commonToastStyle}
        >
            <Icon color="white" size={26} strokeWidth={2.5} style={{ marginRight: 12 }} />

            <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.titleStyle} numberOfLines={1}>{text1}</Text>
                {text2 && <Text style={styles.descStyle} numberOfLines={2}>{text2}</Text>}
            </View>

            <Pressable
                onPress={() => Toast.hide()}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, padding: 4 }]}
            >
                <X color="white" size={18} opacity={0.7} />
            </Pressable>

            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>
        </LinearGradient>
    );
};

// --- Config ---
export const toastConfig = {
    success: (props: any) => {
        const isDark = useColorScheme() === 'dark';
        const colors = isDark ? ['#064e3b', '#062d1c'] : ['#1e5f36', '#144d2b'];
        // Adding a Key based on the text makes every toast "New" to React
        return <CustomToast key={props.props.id} {...props} colors={colors} Icon={CheckCircle2} />;
    },
    error: (props: any) => {
        const isDark = useColorScheme() === 'dark';
        const colors = isDark ? ['#7f1d1d', '#450a0a'] : ['#b91c1c', '#7f1d1d'];
        return <CustomToast key={props.props.id} {...props} colors={colors} Icon={XCircle} />;
    },
    info: (props: any) => {
        const isDark = useColorScheme() === 'dark';
        const colors = isDark ? ['#92400e', '#451a03'] : ['#d97706', '#92400e'];
        return <CustomToast key={props.props.id} {...props} colors={colors} Icon={AlertTriangle} />;
    },
};

// --- Styles ---
const styles = StyleSheet.create({
    commonToastStyle: {
        width: '94%',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    } as ViewStyle,
    titleStyle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    descStyle: {
        color: 'white',
        fontSize: 13,
        opacity: 0.9,
        marginTop: 2,
    } as TextStyle,
    progressBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 3,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)',
    } as ViewStyle,
    progressBar: {
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.7)',
    } as ViewStyle,
});