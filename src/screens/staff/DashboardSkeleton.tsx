import { Box, HStack, VStack } from '@/src/components/common/GluestackUI';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
const DashboardSkeleton = () => (
    <VStack space="md">
        {[1, 2, 3].map((i) => (
            <Box key={i} className="p-5 rounded-[32px] bg-white border border-slate-100 flex-row items-center">
                <Skeleton className="h-16 w-16 rounded-2xl bg-slate-200" />
                <VStack className="ml-5 flex-1" space="xs">
                    <HStack space="sm">
                        <Skeleton className="h-5 w-32 bg-slate-200 rounded-md" />
                        <Skeleton className="h-5 w-16 bg-slate-200 rounded-full" />
                    </HStack>
                    <Skeleton className="h-4 w-24 bg-slate-100 rounded-md" />
                    <Skeleton className="h-3 w-40 bg-slate-100 rounded-md" />
                </VStack>
            </Box>
        ))}
    </VStack>
);

export default DashboardSkeleton;

export const StaffSummarySkeleton = () => (
    <VStack space="md" className="px-4">
        {[1, 2, 3, 4, 5, 6, 7].map((key) => (
            <Box
                key={key}
                className="p-4 rounded-r-[28px] rounded-l-[10px] bg-white border border-slate-100 flex-row items-center overflow-hidden shadow-sm"
                style={{ borderLeftWidth: 6, borderLeftColor: '#f1f5f9' }}
            >
                {/* 1. The Shimmer Overlay */}
                <Shimmer />

                {/* 2. Avatar Placeholder */}
                <Box className="h-14 w-14 rounded-full bg-slate-100 border-2 border-white" />

                {/* 3. Text Placeholders */}
                <VStack className="ml-4 flex-1" space="sm">
                    <Box className="h-4 w-40 bg-slate-100 rounded-md" />
                    <Box className="h-3 w-24 bg-slate-50 rounded-md" />
                </VStack>

                {/* 4. Action Placeholder */}
                <Box className="h-10 w-10 bg-slate-100 rounded-full" />
            </Box>
        ))}
    </VStack>
);

const Shimmer = () => (
    <MotiView
        from={{ translateX: -300 }}
        animate={{ translateX: 300 }}
        transition={{
            loop: true,
            type: 'timing',
            duration: 1500,
            delay: 200,
        }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
    >
        <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
        />
    </MotiView>
);