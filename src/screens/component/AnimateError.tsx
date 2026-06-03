import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { FormControlError, FormControlErrorText } from './GluestackUI';


export const AnimateError = ({ children, isVisible }: { children: React.ReactNode, isVisible: boolean }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-5)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: isVisible ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: isVisible ? 0 : -5,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isVisible]);

    // REMOVE: if (!isVisible) return null; 
    // Instead, let the opacity 0 handle the "hidden" state so Reanimated/Animated stays stable.

    return (
        <Animated.View style={{
            opacity,
            transform: [{ translateY }],
            height: isVisible ? 'auto' : 0, // Collapses the space when not visible
            overflow: 'hidden'
        }}>
            <FormControlError>
                <FormControlErrorText className="text-error-600">
                    {children}
                </FormControlErrorText>
            </FormControlError>
        </Animated.View>
    );
};