import React from 'react';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  LinearTransition,
  withTiming,
  withDelay // 🚀 Added to cleanly handle your delay timing chains safely
} from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

export type AnimationPreset = 'fade' | 'scale' | 'slideUp' | 'slideDown';

interface AnimateViewProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  preset?: AnimationPreset;
  duration?: number;
  delay?: number;
  disableAnimation?: boolean;
}

export default function AnimateView({
  children,
  className,
  style,
  preset = 'fade',
  duration = 350,
  delay = 0,
  disableAnimation = false,
}: AnimateViewProps) {

  if (disableAnimation) {
    return (
      <Animated.View className={className} style={style}>
        {children}
      </Animated.View>
    );
  }

  // ✅ Explicitly typing this as 'any' satisfies Reanimated's loose entering prop type matrix
  let configuredAnimation: any;

  switch (preset) {
    case 'scale':
      // Custom worklet handles delay inside its own configuration mapping tree
      configuredAnimation = () => {
        'worklet';
        return {
          initialValues: {
            opacity: 0,
            transform: [{ scale: 0.95 }],
          },
          animations: {
            opacity: withDelay(delay, withTiming(1, { duration })),
            transform: [{ scale: withDelay(delay, withTiming(1, { duration })) }],
          },
        };
      };
      break;

    case 'slideUp':
      configuredAnimation = FadeInDown.duration(duration);
      if (delay > 0) configuredAnimation = configuredAnimation.delay(delay);
      break;

    case 'slideDown':
      configuredAnimation = FadeInUp.duration(duration);
      if (delay > 0) configuredAnimation = configuredAnimation.delay(delay);
      break;

    case 'fade':
    default:
      configuredAnimation = FadeIn.duration(duration);
      if (delay > 0) configuredAnimation = configuredAnimation.delay(delay);
      break;
  }

  return (
    <Animated.View
      entering={configuredAnimation}
      layout={LinearTransition.duration(200)}
      className={className}
      style={style}
    >
      {children}
    </Animated.View>
  );
}