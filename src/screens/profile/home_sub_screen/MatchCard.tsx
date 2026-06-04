import { CheckIcon, Icon, StarIcon } from "@/components/ui/icon";
import { Box, Heading, HStack, Text, VStack } from "@/src/components/GluestackUI";
import FastImage from "@d11/react-native-fast-image";
import { memo } from "react";
import { Pressable } from "react-native";

const MatchCard = memo(({ item, isPremium }: any) => {
    return (
        <Box className="w-48 mr-4 bg-white rounded-2xl border border-outline-100 shadow-sm overflow-hidden mb-1">
            {/* Profile Image with Overlay */}
            <Box className="h-56 w-full relative">
                <FastImage
                    source={{ uri: item.profile_pic }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {isPremium && (
                    <Box className="absolute top-2 right-2 bg-red-500/90 p-1.5 rounded-full shadow-sm">
                        <Icon as={StarIcon} size="xs" color="white" />
                    </Box>
                )}
            </Box>

            {/* Info Section */}
            <VStack className="p-3 gap-1">
                <Heading size="sm" numberOfLines={1}>
                    {item.first_name} {item.last_name?.charAt(0)}
                </Heading>
                <Text size="xs" className="text-typography-500 leading-4" numberOfLines={2}>
                    {item.age} yrs, {item.height}, {item.language},{"\n"}
                    {item.community}, {item.city}
                </Text>

                {/* Action Button */}
                <Pressable
                    className="mt-2 border border-cyan-500 py-1.5 rounded-full "
                    onPress={() => console.log('Connect', item.id)}
                >
                    <HStack className="justify-center items-center gap-1.5">
                        <Icon as={CheckIcon} size="xs" className="text-cyan-600" />
                        <Text className="text-cyan-600 font-bold text-xs">Connect Now</Text>
                    </HStack>
                </Pressable>
            </VStack>
        </Box>
    );
});

export default MatchCard;