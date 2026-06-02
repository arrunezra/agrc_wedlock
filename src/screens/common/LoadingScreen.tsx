import React from 'react';
import {
  Box,
  Center,
  Text,
  VStack
} from '@/src/components/common/GluestackUI';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { StyleSheet } from 'react-native';


export default function LoadingScreen() {
  return (
    // 2026 Look: Use backdrop blur instead of just a flat color
    <Box className="absolute inset-0 z-[200] flex-1 bg-white">
      <Center className="flex-1">

        {/* Animated Entrance for the Loader */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <Box className="absolute inset-0 z-[200] flex-1 bg-white/10 backdrop-blur-md">
            <Center className="flex-1">

              {/* Lottie Animation - No box, just centered focus */}
              <LottieView
                source={require('../../assets/lottieview/loading.json')}
                autoPlay
                loop={true}
                // Slightly larger for better visual weight since it's now alone
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />

            </Center>
          </Box>
        </MotiView>
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