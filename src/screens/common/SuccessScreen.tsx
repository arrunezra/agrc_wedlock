import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import { Box, Center, HStack, Text, VStack } from '@/src/components/common/GluestackUI';

export default function SuccessScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;



  return (
    <Box className="absolute inset-0 z-[200] flex-1 bg-black/40">

      <Center className="flex-1">

        {/* Main Modal Container */}
        <Box
          className="bg-background-0 p-10 rounded-[40px] shadow-2xl border border-outline-100"
          style={styles.modalShadow}
        >
          <VStack className="items-center gap-6">

            {/* Lottie Animation Section */}
            <Box className="relative items-center justify-center">
              <Box className="bg-background-50 p-5 rounded-full shadow-sm border border-outline-50">
                <LottieView
                  source={require('../../assets/animations/success.json')}
                  autoPlay
                  loop={false}
                  style={{ width: 40, height: 40 }}
                />
              </Box>
            </Box>



          </VStack>
        </Box>
      </Center>

    </Box>
  );
}

const styles = {
  modalShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
};