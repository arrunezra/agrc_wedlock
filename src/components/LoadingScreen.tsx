import React from 'react';
import {
  Box,
  Center,
  Text,
  VStack
} from '@/src/components/GluestackUI';
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native';
import AnimatedMotiView from '@/src/components/AnimateView';


export default function LoadingScreen() {
  return (
    // 2026 Look: Use backdrop blur instead of just a flat color
    <Box className="absolute inset-0 z-[200] flex-1 bg-white">
      <Center className="flex-1">

        <AnimatedMotiView
          preset="springUp"
          animationType="timing"
          duration={300}
          damping={15}
          initialTranslateY={15}
          initialScale={0.9}
        >

          <Box className="absolute inset-0 z-[200] flex-1 bg-white/10 backdrop-blur-md">
            <Center className="flex-1">

              {/* Lottie Animation - No box, just centered focus */}
              <LottieView
                source={require('@/src/assets/lottieview/loading.json')}
                autoPlay
                loop={true}
                // Slightly larger for better visual weight since it's now alone
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />

            </Center>
          </Box>
        </AnimatedMotiView>
      </Center>
    </Box>
  );
}

const styles = StyleSheet.create({
  glassEffect: {
    // Standard 2026 glassmorphism palette
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 15,
  },
});