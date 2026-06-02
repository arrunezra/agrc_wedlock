import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

// 1. CREATE THE ANIMATED ROW COMPONENT
const AnimatedFormRow = ({ children, index, className }: any) => {
    const translateY = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {

                toValue: 0,
                duration: 450,
                delay: index * 100, // Stagger effect: 0ms, 100ms, 200ms...
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View className={className} style={{
            opacity,
            transform: [{ translateY }],
            // If using standard RN styles instead of Tailwind:
            flex: className?.includes('flex-1') ? 1 : undefined
        }}>
            {children}
        </Animated.View>
    );
};

export default AnimatedFormRow;