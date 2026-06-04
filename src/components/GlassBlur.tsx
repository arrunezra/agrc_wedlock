import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
// ⚡ Imported 'Blur' alongside our canvas primitives
import { Canvas, BackdropFilter, Blur, Fill } from '@shopify/react-native-skia';

interface GlassBlurProps {
    blurAmount?: number;
    overlayColor?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    className?: string;
}

export default function GlassBlur({
    blurAmount = 10,
    overlayColor = 'rgba(255, 255, 255, 0.15)',
    children,
    style,
    className
}: GlassBlurProps) {
    return (
        <View
            className={className}
            style={[style, { position: 'relative', overflow: 'hidden' }]}
        >
            {/* 🔮 Skia Backdrop Canvas applies hardware-accelerated blur to everything underneath it */}
            <Canvas style={StyleSheet.absoluteFill}>
                <BackdropFilter
                    clip={{ x: 0, y: 0, width: 2000, height: 2000 }}
                    // 🎯 FIXED: The blur filter is now passed as an inline prop instantiation
                    filter={<Blur blur={blurAmount} mode="clamp" />}
                >
                    {/* 🎨 The overlay color fill remains inside to tint the blurred glass plane */}
                    <Fill color={overlayColor} />
                </BackdropFilter>
            </Canvas>

            {/* Content rendered on top of the blurred glass layer */}
            {children}
        </View>
    );
}