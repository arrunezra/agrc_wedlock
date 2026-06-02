import React from 'react';
import { Box, Text } from '@/src/components/common/GluestackUI';
import { Pressable } from 'react-native';
import { BellIcon, Icon } from '@/components/ui/icon';

export const HeaderNotification = ({ count, onPress }: { count: number; onPress: () => void }) => {
    return (
        <Pressable onPress={onPress} className="mr-4 active:opacity-70">
            <Box className="relative p-1">
                <Icon as={BellIcon} size="xl" className="text-typography-50 " />

                {count > 0 && (
                    <Box className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 justify-center items-center border-2 border-white">
                        <Text className="text-white text-[10px] font-bold">
                            {count > 99 ? '99+' : count}
                        </Text>
                    </Box>
                )}
            </Box>
        </Pressable>
    );
};